import assert from 'node:assert/strict';
import {shuffleMotion} from '../lib/shuffle-motion.ts';
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
  for(const p of m.poses){
   const a=p.angle*Math.PI/180,bw=Math.abs(Math.cos(a))*w+Math.abs(Math.sin(a))*h,bh=Math.abs(Math.sin(a))*w+Math.abs(Math.cos(a))*h;
   assert.ok(p.x-bw/2>=8&&p.x+bw/2<=width-8&&p.y-bh/2>=8&&p.y+bh/2<=height-8,'rotated native-size tile plus body stays inside the overhead view');
  }
 }
}
console.log('PASS: 60 independent paths, fresh-launch variation, rerender stability, irregular final pile, staggered timing and rotated full-size bounds.');
