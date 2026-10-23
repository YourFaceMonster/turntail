import assert from 'node:assert/strict';
import {shuffleMotion,sampleShufflePose,shuffleDepth,shuffleKeyframes} from '../lib/shuffle-motion.ts';
import {ENTRANCE_MS} from '../lib/atmosphere.ts';
for(const [width,height] of [[320,568],[390,844],[844,390],[1280,720]])for(const [w,h] of [[42,56],[64,84],[78,104]])for(const seed of [0,1,27381,0xffffffff]){
 const motions=Array.from({length:60},(_,i)=>shuffleMotion(seed,i,width,height,w,h));
 assert.deepEqual(motions[0],shuffleMotion(seed,0,width,height,w,h),'rerenders must not reroll the motion');
 assert.notDeepEqual(motions[0],shuffleMotion(seed+1,0,width,height,w,h),'a fresh launch changes the shuffle');
 assert.equal(new Set(motions.map(m=>m.poses[4].x)).size,60,'no final grid columns');
 assert.equal(new Set(motions.map(m=>m.poses[4].y)).size,60,'no final grid rows');
 assert.ok(new Set(motions.map(m=>m.delay)).size>20,'individual tiles do not move in lockstep');
 assert.ok(motions.filter(m=>Math.abs(m.poses[4].angle)>10).length>35,'tiles remain scattered and rotated until dealing');
 for(const m of motions){
  assert.ok(m.delay>=0&&m.delay<ENTRANCE_MS.shuffle,'each shuffle completes within its phase');
  for(const p of [...m.poses,...Array.from({length:49},(_,i)=>sampleShufflePose(m.poses,i/48))]){
   const a=p.angle*Math.PI/180,bw=Math.abs(Math.cos(a))*w+Math.abs(Math.sin(a))*h,bh=Math.abs(Math.sin(a))*w+Math.abs(Math.cos(a))*h;
   assert.ok(p.x-bw/2>=8&&p.x+bw/2<=width-8&&p.y-bh/2>=8&&p.y+bh/2<=height-8,'rotated native-size tile plus body stays inside the overhead view');
  }
 }
}
console.log('PASS: 60 independent paths, fresh-launch variation, rerender stability, irregular final pile, staggered timing and rotated full-size bounds.');

const controls=[{x:10,y:20,angle:0},{x:45,y:70,angle:20},{x:90,y:30,angle:40},{x:150,y:90,angle:60},{x:220,y:20,angle:80}];
assert.deepEqual(sampleShufflePose(controls,0),controls[0]);
assert.deepEqual(sampleShufflePose(controls,1),controls[4]);
for(const t of [.28,.55,.8]){
 const e=.00001,l=sampleShufflePose(controls,t-e),c=sampleShufflePose(controls,t),r=sampleShufflePose(controls,t+e);
 const left=(c.x-l.x)/e,right=(r.x-c.x)/e;
 assert.ok(left>30&&right>30,'former waypoints must not stop the motion');
 assert.ok(Math.abs(left-right)<.05,'velocity is continuous through former keyframe boundaries');
}
const frames=shuffleKeyframes(controls,42,56,shuffleDepth(56));
assert.equal(frames.length,49);assert.equal(frames[0].offset,0);assert.equal(frames.at(-1)!.offset,1);
assert.equal(frames.at(-1)!.transform,'translate3d(199px,-8px,0px) rotate(80deg)','shuffle ends at exactly the scattered deal origin with no height/angle snap');
for(const h of [40,56,84,104])assert.ok(shuffleDepth(h)>=18&&shuffleDepth(h)<=26,'intro bodies are thicker and bounded');
console.log('PASS: smooth path velocity, sampled bounds, exact deal handoff and 18–26px animation-only depth.');
