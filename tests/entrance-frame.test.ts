import assert from 'node:assert/strict';
import {entranceTileMesh,projectEntrancePoint,entranceCameraEase,GPU_TILE_STRIDE} from '../lib/entrance-gpu.ts';
import {entranceFrameCamera,writeEntranceFrame,type EntranceRenderTile} from '../lib/entrance-frame.ts';
import {planDealFlights} from '../lib/deal-motion.ts';
import {ENTRANCE_MS} from '../lib/atmosphere.ts';
const mesh=entranceTileMesh();
assert.equal(mesh.length%27,0,'the shared prism contains complete triangles');
assert.ok([...mesh].every(Number.isFinite));
for(let i=0;i<mesh.length;i+=9){assert.ok(Math.abs(mesh[i])<=.50001&&Math.abs(mesh[i+1])<=.50001);assert.ok(mesh[i+2]<=0&&mesh[i+2]>=-1);}
assert.ok([...mesh].filter((_,i)=>i%9===8&&mesh[i]===1).length>20,'a real rounded top cap is textured');
assert.ok([...mesh].filter((_,i)=>i%9===8&&mesh[i]===0).length>200,'the ivory body has solid beveled sides');
assert.equal(entranceCameraEase(0),0);assert.equal(entranceCameraEase(1),1);
for(let i=1;i<=100;i++)assert.ok(entranceCameraEase(i/100)>=entranceCameraEase((i-1)/100));
const overview=.22;
assert.deepEqual(entranceFrameCamera('deal',0,overview),{tilt:0,scale:1});
assert.deepEqual(entranceFrameCamera('shuffle',0,overview),entranceFrameCamera('approach',ENTRANCE_MS.approach,overview),'camera does not restart when shuffling starts');
assert.deepEqual(entranceFrameCamera('shuffle',ENTRANCE_MS.shuffle,overview),{tilt:0,scale:1});
for(const [width,height] of [[390,844],[844,390],[1280,720]]){
 const tiles:EntranceRenderTile[]=Array.from({length:60},(_,i)=>({kind:i<15?'own':i<30?'upper':i<45?'lower':'opponent',width:48,height:64,depth:24,faceSlot:i<15?i+2:1,poses:[{x:(i%10-5)*100,y:(Math.floor(i/10)-3)*100,angle:i*17},{x:(i%10-5)*100+20,y:(Math.floor(i/10)-3)*100-10,angle:i*17+60}],target:{x:30+i%10*60,y:50+Math.floor(i/10)*85,width:48,height:64,angle:0}}));
 const routes=planDealFlights(tiles.map((tile,i)=>({...tile,key:`${tile.kind}-${i}`,scale:1,source:{...tile.poses.at(-1)!,x:width/2+tile.poses.at(-1)!.x,y:height/2+tile.poses.at(-1)!.y},target:tile.target})));
 const data=new Float32Array(60*GPU_TILE_STRIDE),shuffle=new Float32Array(writeEntranceFrame(data,tiles,routes,'shuffle',ENTRANCE_MS.shuffle,width/2,height/2));
 writeEntranceFrame(data,tiles,routes,'deal',0,width/2,height/2);
 for(let i=0;i<60;i++)for(const component of [0,1,2,3,4,5,6])assert.ok(Math.abs(data[i*GPU_TILE_STRIDE+component]-shuffle[i*GPU_TILE_STRIDE+component])<.0001,'shuffle/deal handoff keeps the exact pose');
 for(const phase of ['deal','settle','game-in'] as const){
  writeEntranceFrame(data,tiles,routes,phase,phase==='deal'?ENTRANCE_MS.deal:0,width/2,height/2);
  for(let i=0;i<60;i++){
   const at=i*GPU_TILE_STRIDE,tile=tiles[i];assert.equal(data[at],tile.target.x);assert.equal(data[at+1],tile.target.y);assert.equal(data[at+4],tile.target.width);assert.equal(data[at+5],tile.target.height);
   assert.equal(data[at+9],0,'body fades out before the original flat game tiles take over');
   if(phase!=='deal')assert.equal(data[at+10],tile.kind==='own'||tile.kind==='upper'?1:0,'no opponent count badge or lower tile suddenly appears');
  }
 }
 for(const elapsed of [0,ENTRANCE_MS.approach/2,ENTRANCE_MS.approach]){
  const camera={width,height,...entranceFrameCamera('approach',elapsed,overview)},point=projectEntrancePoint(width/2+70,height/2+40,24,camera);
  const eased=entranceCameraEase(elapsed/ENTRANCE_MS.approach),distance=1000*(1+(1/overview-1)*(1-eased)),angle=58*Math.PI/180*(1-eased);
  const factor=1000/(distance-40*Math.sin(angle)-24*Math.cos(angle));
  assert.ok(Math.abs(point.x-(width/2+70*factor))<1e-8);
  assert.ok(Math.abs(point.y-(height/2+(40*Math.cos(angle)-24*Math.sin(angle))*factor))<1e-8,'GPU projection matches the CSS camera distance, tilt and perspective');

 }
}
console.log('PASS: one rounded solid mesh; 60 native-size tiles, exact shuffle/deal/game handoffs, hidden lower/opponent slots and perspective travel towards a stationary world across phone/landscape/desktop.');
