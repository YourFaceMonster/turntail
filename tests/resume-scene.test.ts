import assert from 'node:assert/strict';
import {resumeRenderPlan,writeResumeFrame,resumeHandoffProgress} from '../lib/resume-scene.ts';
import {GPU_TILE_STRIDE} from '../lib/entrance-gpu.ts';
import {shuffleDepth} from '../lib/shuffle-motion.ts';
import {entranceDuration} from '../lib/atmosphere.ts';
const upper={x:120,y:250,width:40,height:53,angle:90},base={...upper,x:123,y:254};
const plan=resumeRenderPlan([{item:{key:'upper-0',selector:'upper',back:true,level:2},target:upper,baseTarget:base},{item:{key:'own-8',selector:'own',back:false,tile:{id:8,n:9,s:0}},target:{...upper,x:300}}]);
assert.equal(plan.length,3);assert.deepEqual(plan.map(p=>p.slot),[1,0,2]);assert.ok(plan[0].coveredBase&&!plan[1].coveredBase);assert.equal(plan[1].z,plan[0].z*2);
assert.equal(plan[1].depth,shuffleDepth(upper.height),'resume preserves the approved new-game physical body size');
const duration=entranceDuration('rise',true);
assert.equal(resumeHandoffProgress('rise',duration*.88),0);
let previous=0;
for(let i=0;i<=100;i++){
 const progress=resumeHandoffProgress('rise',duration*i/100);
 assert.ok(progress>=previous&&progress<=1);previous=progress;
}
for(const phase of ['settle','game-in'] as const){
 const data=writeResumeFrame(new Float32Array(plan.length*GPU_TILE_STRIDE),plan,resumeHandoffProgress(phase,0));
 for(let i=0;i<plan.length;i++)assert.equal(data[i*GPU_TILE_STRIDE+6],0,'both opening paths reach the live board without a last-frame thickness jump');
}
for(const settling of [0,.5,1]){
 const frame=writeResumeFrame(new Float32Array(plan.length*GPU_TILE_STRIDE),plan,settling);
 assert.equal(frame[0],123);assert.equal(frame[1],254);assert.equal(frame[GPU_TILE_STRIDE],120);assert.equal(frame[GPU_TILE_STRIDE+1],250);
 assert.equal(frame[GPU_TILE_STRIDE+7],0,'upper covered tile shows its back');assert.ok(Math.abs(frame[GPU_TILE_STRIDE*2+7]-Math.PI)<1e-6,'visible hand/floor faces never use the back atlas slot');
 assert.equal(frame[GPU_TILE_STRIDE+10],1,'upper artwork remains intact through the UI handoff');assert.equal(frame[GPU_TILE_STRIDE*2+10],1);
}
console.log('PASS: distinct lower/upper solids, public-only texture slots, correct face/back orientation, preserved stack positions and an unchanged visible face through the handoff.');
