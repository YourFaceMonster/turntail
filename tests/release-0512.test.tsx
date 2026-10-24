import {effectOutput} from '../lib/audio-mixer';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {KOREAN_OPPONENTS,restoreMonsterOpponents} from '../lib/korean-opponents.ts';
import MonsterModel from '../app/components/MonsterModel';
import MonsterPortrait from '../app/components/MonsterPortrait';
import {entranceCameraState,environmentTransform,seatedScale} from '../lib/entrance-camera.ts';
import {opponentTableOpacity} from '../lib/entrance-fade.ts';
import {tileBodyHandoff} from '../lib/tile-body.ts';
import {tileSoundPlan,playTileSound,type TileSoundKind} from '../lib/tile-audio.ts';
for(const p of KOREAN_OPPONENTS){assert.ok(existsSync(`public${p.src}`));const model=renderToStaticMarkup(<MonsterModel index={p.portrait}/>),portrait=renderToStaticMarkup(<MonsterPortrait index={p.portrait}/>);assert.ok(model.includes(p.src)&&portrait.includes(p.src),'avatar is cropped from the exact full-body asset');assert.ok(p.crop.x+p.crop.size<=p.width&&p.crop.y+p.crop.size<=p.height);}
const legacy=[{name:'김복례',avatar:'korean-portrait:0',hand:[3,7],points:42},{name:'돌해',avatar:'korean-monster:2',hand:[8],points:-11}],copy=structuredClone(legacy),cast=restoreMonsterOpponents(legacy);assert.deepEqual(legacy,copy);assert.equal(cast[1].avatar,'korean-monster:2');assert.equal(new Set(cast.map(p=>p.avatar)).size,2);
for(const overview of [.2,.4,.7]){
 const s=seatedScale(overview),scale=(phase:'shuffle'|'focus',t:number)=>Number(environmentTransform(entranceCameraState(phase,t,overview),overview).match(/scale\(([^)]+)\)/)?.[1]);
 assert.equal(scale('shuffle',0),1);assert.ok(Math.abs(scale('focus',1)-1/s)<1e-9,'background and table share the same zoom ratio');assert.ok(scale('focus',.5)>1&&scale('focus',.5)<1/s);
 assert.deepEqual(entranceCameraState('rise',1,overview),entranceCameraState('opponent-out',0,overview));
}
for(let i=0;i<=100;i++)assert.equal(opponentTableOpacity('rise',i/100),1,'opponent backs remain present until the top view is complete');
assert.equal(opponentTableOpacity('opponent-out',0),1);assert.ok(opponentTableOpacity('opponent-out',.5)>.1&&opponentTableOpacity('opponent-out',.5)<.9);assert.equal(opponentTableOpacity('opponent-out',1),0);assert.equal(tileBodyHandoff('opponent-out',0),1,'flat bodies never pop back up after the camera lift');
for(const kind of ['tap','submit','play','slam','draw'] as TileSoundKind[]){const variants=[0,1,2,3,4].map(v=>tileSoundPlan(kind,v,{count:3,concealed:true}));assert.equal(new Set(variants.map(v=>JSON.stringify(v))).size,5);for(const plan of variants)for(const v of plan){assert.ok(v.gain>0&&v.gain<.2);assert.ok(v.frequency>0&&v.endFrequency>0&&v.duration>0&&v.at>=0);}}
assert.ok(tileSoundPlan('play',0,{count:5}).length>tileSoundPlan('play',0,{count:1}).length);assert.ok(tileSoundPlan('draw',0).some(v=>v.source==='noise'));
class Param{value=0;setValueAtTime(n:number){assert.ok(Number.isFinite(n));}exponentialRampToValueAtTime(n:number){assert.ok(n>0);}}
class Node{gain=new Param();frequency=new Param();Q=new Param();onended:(()=>void)|null=null;disconnected=false;connect(){}disconnect(){this.disconnected=true;}start(){}stop(){this.onended?.();}}
const nodes:Node[]=[],make=()=>{const n=new Node();nodes.push(n);return n;};let buffers=0;
const fake={state:'running',currentTime:1,sampleRate:8000,destination:{},createGain:make,createBiquadFilter:make,createOscillator:make,createBufferSource:make,createBuffer:(_c:number,length:number)=>{buffers++;return {getChannelData:()=>new Float32Array(length)};}},ctx=fake as unknown as AudioContext;
playTileSound(ctx,'play',{seed:'a'});playTileSound(ctx,'draw',{seed:'a'});assert.equal(buffers,1,'the scrape buffer is reused');assert.ok(nodes.filter(n=>(n as unknown)!==effectOutput(ctx)).every(n=>n.disconnected),'finished audio disconnects all graph nodes');const before=nodes.length;fake.state='suspended';playTileSound(ctx,'slam');assert.equal(nodes.length,before);
console.log('PASS: coherent three-monster assets/avatars, non-destructive roster restoration, shared environment zoom, fade only after top view, varied action audio and clean graph lifecycle.');
