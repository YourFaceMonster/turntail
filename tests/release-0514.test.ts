import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {furnitureGeometry,projectedFurniture} from '../lib/entrance-furniture';
import {entranceCameraState} from '../lib/entrance-camera';
import {overviewScale} from '../lib/shuffle-motion';
import {writeEntranceFrame,type EntranceRenderTile} from '../lib/entrance-frame';
import {GPU_TILE_STRIDE} from '../lib/entrance-gpu';
import {ENTRANCE_MS,type EntrancePhase} from '../lib/atmosphere';
import {effectOutput,setEffectVolume,readVolume} from '../lib/audio-mixer';
import {playTileSound} from '../lib/tile-audio';
const tiles:EntranceRenderTile[]=['lower','upper','own','opponent'].map((kind,i)=>({kind:kind as EntranceRenderTile['kind'],width:40,height:54,depth:12,poses:[{x:i*100,y:0,angle:0}],faceSlot:i,target:{x:100+i*100,y:200,width:40,height:54,angle:0}}));
for(const phase of ['focus','rise','opponent-out','settle','game-in'] as EntrancePhase[]){
 for(let i=0;i<=120;i++){
  const data=writeEntranceFrame(new Float32Array(tiles.length*GPU_TILE_STRIDE),tiles,[],phase,ENTRANCE_MS[phase]*i/120,600,400);
  for(let t=0;t<tiles.length;t++){const at=t*GPU_TILE_STRIDE;assert.ok(data[at+6]>=7.5,'never collapse a prism');assert.equal(data[at+9],1,'retain stable body');if(t===3&&phase==='opponent-out')assert.ok(Math.abs(data[at+10]-(1-(i/120)**2*(3-2*i/120)))<1e-6);}
  assert.ok(data[GPU_TILE_STRIDE+2]>data[2]+data[6]*.95,'upper face stays above lower face throughout fade');
 }
}
for(const [width,height,D] of [[1363,936,1900],[390,844,1700],[844,390,1900]]){
 const cx=width/2,cy=height/2,overview=overviewScale({width:D-32,height:D-32},width,height),camera={width,height,...entranceCameraState('shuffle',0,overview)},g=furnitureGeometry(D,cx,cy);
 assert.equal(new Set(g.faces.filter(f=>f.part.startsWith('leg-')).map(f=>f.part)).size,4);assert.ok(g.depth>=75);
 assert.ok(g.faces.every(f=>f.points.every(p=>p.z<0)),'all solids live below the tabletop');
 const projected=projectedFurniture(D,cx,cy,0,camera);assert.ok(projected.faces.some(f=>f.part.startsWith('leg-')&&f.points.some(p=>p.y>height*.55&&p.y<height)),'legs are in the starting viewport');
 assert.ok(projected.faces.every(f=>f.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))));
}
class Param{value=0;target=-1;cancelScheduledValues(){}setTargetAtTime(n:number){this.target=n;}setValueAtTime(){}exponentialRampToValueAtTime(){}}
class Node{gain=new Param();frequency=new Param();Q=new Param();onended:(()=>void)|null=null;connect(){}disconnect(){}start(){}stop(){this.onended?.();}}
let made=0;const create=()=>{made++;return new Node();};
const ctx={state:'running',currentTime:1,sampleRate:8000,destination:{},createGain:create,createBufferSource:create,createOscillator:create,createBiquadFilter:create,createBuffer:(_:number,n:number)=>({getChannelData:()=>new Float32Array(n)})} as unknown as AudioContext;
const bus=effectOutput(ctx);assert.equal(effectOutput(ctx),bus);assert.equal(made,1,'one stable effect bus');
setEffectVolume(ctx,55,true);assert.equal((bus.gain as unknown as Param).target,.55);
playTileSound(ctx,'play');setEffectVolume(ctx,55,false);assert.equal((bus.gain as unknown as Param).target,0,'mute affects already scheduled sound');assert.equal(effectOutput(ctx),bus);
setEffectVolume(ctx,55,true);assert.equal((bus.gain as unknown as Param).target,.55);assert.equal(readVolume(null,40),40);assert.equal(readVolume('0',40),0);assert.equal(readVolume('120',40),100);assert.equal(readVolume('bad',40),40);
const page=readFileSync('app/page.tsx','utf8'),gpu=readFileSync('lib/entrance-gpu.ts','utf8');assert.ok(!page.includes('screenOpen')&&!page.includes('sound-btn'));assert.ok(page.includes('remaining-word')&&!page.includes('장 남음'));assert.ok(gpu.includes('v_faceBlend')&&!gpu.includes('p=vec3(p.x*c,p.y,-p.x*s)'),'art dissolves without cutting through the body');
console.log('PASS: stable solid tiles across all phase boundaries/fade samples, visible four-leg furniture, shared persistent effects gain/mute, settings migration and non-intersecting face reveal.');
// The no-WebGL renderer consumes identical public frame data, without mounting CSS tile planes.
const {EntranceCanvas}=await import('../lib/entrance-canvas');
let images=0,transforms=0;
const paint={imageSmoothingEnabled:true,imageSmoothingQuality:'high',globalAlpha:1,fillStyle:'',setTransform(...args:number[]){assert.ok(args.every(Number.isFinite));},clearRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},save(){},restore(){},clip(){},transform(...args:number[]){assert.ok(args.every(Number.isFinite));transforms++;},drawImage(){images++;}};
const previousWindow=(globalThis as any).window;(globalThis as any).window={devicePixelRatio:1};
try{const renderer=new EntranceCanvas({width:0,height:0,getContext:()=>paint} as unknown as HTMLCanvasElement,{} as HTMLCanvasElement,1200,800);
 for(const phase of ['focus','rise','opponent-out'] as const)for(const t of [0,.5,1]){const data=writeEntranceFrame(new Float32Array(tiles.length*GPU_TILE_STRIDE),tiles,[],phase,t*ENTRANCE_MS[phase],600,400);renderer.draw(data,{width:1200,height:800,...entranceCameraState(phase,t,.35)});}
 assert.ok(images>20&&transforms===images);renderer.destroy();
}finally{(globalThis as any).window=previousWindow;}
console.log('PASS: projected canvas fallback renders solid bodies/faces through focus, rise and fade with finite transforms.');
