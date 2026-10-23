import assert from 'node:assert/strict';
import {resumeRenderPlan,writeResumeFrame} from '../lib/resume-scene.ts';
import {GPU_TILE_STRIDE} from '../lib/entrance-gpu.ts';
const upper={x:120,y:250,width:40,height:53,angle:90},base={...upper,x:123,y:254};
const plan=resumeRenderPlan([{item:{key:'upper-0',selector:'upper',back:true,level:2},target:upper,baseTarget:base},{item:{key:'own-8',selector:'own',back:false,tile:{id:8,n:9,s:0}},target:{...upper,x:300}}]);
assert.equal(plan.length,3);assert.deepEqual(plan.map(p=>p.slot),[1,0,2]);assert.ok(plan[0].coveredBase&&!plan[1].coveredBase);assert.equal(plan[1].z,plan[0].z*2);
for(const settling of [0,.5,1]){
 const frame=writeResumeFrame(new Float32Array(plan.length*GPU_TILE_STRIDE),plan,settling);
 assert.equal(frame[0],123);assert.equal(frame[1],254);assert.equal(frame[GPU_TILE_STRIDE],120);assert.equal(frame[GPU_TILE_STRIDE+1],250);
 assert.equal(frame[GPU_TILE_STRIDE+7],0,'upper covered tile shows its back');assert.ok(Math.abs(frame[GPU_TILE_STRIDE*2+7]-Math.PI)<1e-6,'visible hand/floor faces never use the back atlas slot');
 assert.equal(frame[GPU_TILE_STRIDE+10],1,'upper artwork remains intact through the UI handoff');assert.equal(frame[GPU_TILE_STRIDE*2+10],1);
}
console.log('PASS: distinct lower/upper solids, public-only texture slots, correct face/back orientation, preserved stack positions and an unchanged visible face through the handoff.');
