import assert from 'node:assert/strict';
import {sceneImage,prepareStageScene,warmStageScenes} from '../lib/scene-assets';
import {shouldShowPlayNotice} from '../lib/play-notices';
const created=new Map<string,FakeImage[]>();
class FakeImage{
 onload:(()=>void)|null=null;onerror:(()=>void)|null=null;naturalWidth=100;naturalHeight=100;srcValue='';
 set src(value:string){this.srcValue=value;created.set(value,[...(created.get(value)||[]),this]);}
 get src(){return this.srcValue;}
 async decode(){}
}
Object.assign(globalThis,{Image:FakeImage});
const one=sceneImage('/test.webp'),two=sceneImage('/test.webp');assert.equal(one,two);assert.equal(created.get('/test.webp')?.length,1);created.get('/test.webp')![0].onload!();await one;
const bad=sceneImage('/retry.webp');created.get('/retry.webp')![0].onerror!();await assert.rejects(bad);const retry=sceneImage('/retry.webp');assert.notEqual(bad,retry);created.get('/retry.webp')![1].onload!();await retry;
const ready=prepareStageScene(4);let switched=false;void ready.then(()=>switched=true);await Promise.resolve();assert.equal(switched,false,'scene must wait for all images');
for(const [src,instances] of created)if(src.includes('stage-4')||src.includes('0516')||src.includes('0518')||src.includes('v2'))instances[0].onload!();await ready;assert.equal(switched,true);
let stopped=true;await warmStageScenes(1,()=>stopped);assert.equal(created.has('/environments/stage-1-0520.webp'),false);
const seen=new Set<number>();assert.equal(shouldShowPlayNotice(seen,1),true);assert.equal(shouldShowPlayNotice(seen,1),false);assert.equal(shouldShowPlayNotice(seen,2),true);assert.equal(shouldShowPlayNotice(seen,2),false);assert.equal(shouldShowPlayNotice(seen,3),true);assert.equal(shouldShowPlayNotice(seen,3),false);assert.equal(shouldShowPlayNotice(seen,5),true);assert.equal(shouldShowPlayNotice(seen,5),true);assert.equal(shouldShowPlayNotice(new Set(),1),true);
console.log('PASS: shared decoded-image promises, retry after failure, atomic scene readiness, cancelled prefetch, and first-only single/pair notices.');
