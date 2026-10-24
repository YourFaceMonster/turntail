import assert from 'node:assert/strict';
import {entranceTileMesh,projectEntrancePoint,entranceCameraEase,GPU_TILE_STRIDE} from '../lib/entrance-gpu.ts';
import {entranceFrameCamera,writeEntranceFrame,type EntranceRenderTile} from '../lib/entrance-frame.ts';
import {planDealFlights} from '../lib/deal-motion.ts';
import {observerCamera,environmentCameraFrames,seatedScale,SEATED_TILT} from '../lib/entrance-camera.ts';
import {tileBodyDepth} from '../lib/tile-body.ts';
import {ENTRANCE_MS,type EntrancePhase,nextEntrance} from '../lib/atmosphere.ts';
const mesh=entranceTileMesh();assert.equal(mesh.length%27,0);assert.ok([...mesh].every(Number.isFinite));
for(let i=0;i<mesh.length;i+=9){assert.ok(Math.abs(mesh[i])<=.50001&&Math.abs(mesh[i+1])<=.50001);assert.ok(mesh[i+2]<=0&&mesh[i+2]>=-1);}
for(let i=6*9;i<mesh.length;i+=9)assert.ok(!(mesh[i+2]<0&&mesh[i+2]>-.02&&mesh[i+8]===0&&mesh[i+5]===0&&mesh[i+6]===0&&mesh[i+7]===1));
assert.equal(entranceCameraEase(0),0);assert.equal(entranceCameraEase(1),1);
for(const overview of [.22,.4,.7]){
 const close=seatedScale(overview);assert.deepEqual(entranceFrameCamera('shuffle',0,overview),{tilt:SEATED_TILT,scale:close});
 for(let i=0;i<=100;i++){assert.equal(observerCamera(i/100,overview).scale,1);assert.equal(entranceFrameCamera('focus',ENTRANCE_MS.focus*i/100,overview).tilt,SEATED_TILT);}
 let phase:EntrancePhase='approach';
 for(let i=0;i<12&&phase!=='idle';i++){
  const next=nextEntrance(phase);
  assert.deepEqual(entranceFrameCamera(phase,ENTRANCE_MS[phase],overview),entranceFrameCamera(next,0,overview),`camera seam ${phase}/${next}`);phase=next;
 }
 assert.deepEqual(entranceFrameCamera('game-in',0,overview,true),{tilt:0,scale:1});
}
for(const [width,height] of [[390,844],[844,390],[1280,720]]){
 const tiles:EntranceRenderTile[]=Array.from({length:60},(_,i)=>({kind:i<15?'own':i<30?'upper':i<45?'lower':'opponent',width:48,height:64,depth:tileBodyDepth(64),faceSlot:i<15?i+2:1,poses:[{x:(i%10-5)*100,y:(Math.floor(i/10)-3)*100,angle:i*17},{x:(i%10-5)*100+20,y:(Math.floor(i/10)-3)*100-10,angle:i*17+60}],target:{x:30+i%10*60,y:50+Math.floor(i/10)*85,width:48,height:64,angle:0}}));
 const routes=planDealFlights(tiles.map((tile,i)=>({...tile,key:`${tile.kind}-${i}`,scale:1,source:{...tile.poses.at(-1)!,x:width/2+tile.poses.at(-1)!.x,y:height/2+tile.poses.at(-1)!.y},target:tile.target})));
 const frame=(phase:EntrancePhase,t:number)=>new Float32Array(writeEntranceFrame(new Float32Array(60*GPU_TILE_STRIDE),tiles,routes,phase,t,width/2,height/2));
 const washed=frame('shuffle',ENTRANCE_MS.shuffle),dealing=frame('deal',0);
 for(let i=0;i<60;i++)for(const c of [0,1,2,3,4,5,6])assert.ok(Math.abs(washed[i*GPU_TILE_STRIDE+c]-dealing[i*GPU_TILE_STRIDE+c])<1e-5,'shuffle/deal continuity');
 const landed=frame('deal',ENTRANCE_MS.deal),focused=frame('focus',0);
 for(let i=0;i<60;i++)if(tiles[i].kind!=='opponent')for(const c of [0,1,2,4,5,6,7])assert.ok(Math.abs(landed[i*GPU_TILE_STRIDE+c]-focused[i*GPU_TILE_STRIDE+c])<1e-5,`deal/focus component ${c}`);
 assert.equal(frame('rise',ENTRANCE_MS.rise*.88)[6],Math.fround(tileBodyDepth(64)),'full thickness remains until the final focus handoff');
 for(const phase of ['rise','settle','game-in'] as const){const data=frame(phase,phase==='rise'?ENTRANCE_MS.rise:0);for(let i=0;i<60;i++){const at=i*GPU_TILE_STRIDE;assert.equal(data[at],tiles[i].target.x);assert.equal(data[at+1],tiles[i].target.y);assert.equal(data[at+6],0);assert.equal(data[at+9],0);assert.equal(data[at+10],tiles[i].kind==='own'||tiles[i].kind==='upper'?1:0);}}
 for(const elapsed of [0,ENTRANCE_MS.rise/2,ENTRANCE_MS.rise]){
  const camera={width,height,...entranceFrameCamera('rise',elapsed,.3)},point=projectEntrancePoint(width/2+70,height/2+40,24,camera),distance=1000/camera.scale;
  const factor=1000/(distance-40*Math.sin(camera.tilt)-24*Math.cos(camera.tilt));
  assert.ok(Math.abs(point.x-(width/2+70*factor))<1e-8);assert.ok(Math.abs(point.y-(height/2+(40*Math.cos(camera.tilt)-24*Math.sin(camera.tilt))*factor))<1e-8);
 }
}
console.log('PASS: seated shuffling and deal, seated focus followed by constant-distance rise, seamless camera/tile boundaries, threefold bodies through focus, no hidden faces, and GPU/CSS projection agreement across viewport shapes.');
