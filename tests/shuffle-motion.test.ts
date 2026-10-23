import assert from 'node:assert/strict';
import {planShuffle,frameShuffle,sampleShufflePose,shuffleDepth,shuffleKeyframes,sweptDistance,type ShuffleScene} from '../lib/shuffle-motion.ts';
function plan(seed:number,width:number,height:number,w:number,h:number){const iterator=planShuffle(seed,width,height,Array.from({length:60},()=>({width:w,height:h})));let result=iterator.next();while(!result.done)result=iterator.next();return result.value;}
for(const [width,height] of [[320,568],[390,844],[844,390],[1280,720]])for(const [w,h] of [[42,56],[64,84],[78,104]])for(const seed of [0,1,27381,0xffffffff]){
 const scene=plan(seed,width,height,w,h),scale=frameShuffle(scene,width,height),tracks=scene.tracks;
 assert.equal(tracks.length,60);assert.equal(tracks[0].poses.length,97);
 assert.equal(new Set(tracks.map(m=>m.poses.at(-1)!.x)).size,60,'no grid columns');
 assert.equal(new Set(tracks.map(m=>m.poses.at(-1)!.y)).size,60,'no grid rows');
 assert.ok(tracks.filter(m=>Math.abs(m.poses.at(-1)!.angle)>10).length>35,'loose rotations persist until dealing');
 assert.ok(tracks.filter(m=>Math.hypot(m.poses[0].x-m.poses.at(-1)!.x,m.poses[0].y-m.poses.at(-1)!.y)>10).length>45,'most tiles actually move');
 for(let frame=1;frame<97;frame++)for(let i=0;i<60;i++){
  const a=tracks[i],p=a.poses[frame];
  assert.ok((Math.abs(p.x)+a.radius)*scale<width/2&&(Math.abs(p.y)+a.radius)*scale<height/2,'all native-size bodies are framed by the camera');
  for(let j=0;j<i;j++){
   const b=tracks[j];
   assert.ok(sweptDistance(a.poses[frame-1],p,b.poses[frame-1],b.poses[frame])>=a.radius+b.radius+3.9999,'no rotating corners can intersect, including BETWEEN browser keyframes');
  }
 }
}
const scene=plan(41,390,844,42,56),again=plan(41,390,844,42,56),next=plan(42,390,844,42,56);
assert.deepEqual(scene,again,'one launch does not reroll on rerender');assert.notDeepEqual(scene,next,'fresh launches vary');
const p=scene.tracks[0].poses,scale=frameShuffle(scene,390,844),depth=shuffleDepth(56),frames=shuffleKeyframes(p,42,56,depth,scale,195,422);
assert.deepEqual(sampleShufflePose(p,0),p[0]);assert.deepEqual(sampleShufflePose(p,1),p.at(-1));
assert.equal(frames.length,97);assert.equal(frames[0].offset,0);assert.equal(frames.at(-1)!.offset,1);
assert.ok(frames.at(-1)!.transform.includes(`${depth*scale}px`),'tile does not sink through its white body during shuffle');
for(const h of [40,56,84,104])assert.ok(shuffleDepth(h)>=18&&shuffleDepth(h)<=26);
console.log('PASS: 48 seeded 60-body scenes, continuous swept clearance at every interval, irregular placement, camera bounds, fresh-launch variation, native sizes and solid 18–26px bodies.');
