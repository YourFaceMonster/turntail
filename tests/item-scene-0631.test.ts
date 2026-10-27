import assert from 'node:assert/strict';
import {ITEM_SCENE_IMAGES,prepareItemSceneAssets} from '../lib/item-scene-assets.ts';
import {itemProjectileFrames,itemScenePoints} from '../lib/rpg-item-motion.ts';
const loaded:string[]=[],decoded:string[]=[],failed='/rpg-items-v1/consumables/ember-bomb-v2.webp';let failOnce=true;
const old=globalThis.Image;
class TestImage{
 onload:(()=>void)|null=null;onerror:(()=>void)|null=null;decoding='';fetchPriority='';private path='';
 set src(value:string){this.path=value;loaded.push(value);queueMicrotask(()=>{if(value===failed&&failOnce){failOnce=false;this.onerror?.();}else this.onload?.();});}
 async decode(){decoded.push(this.path);await Promise.resolve();}
}
globalThis.Image=TestImage as unknown as typeof Image;
try{
 await assert.rejects(prepareItemSceneAssets(),/다시 시도/);
 await Promise.all([prepareItemSceneAssets(),prepareItemSceneAssets()]);
 assert.equal(loaded.filter(path=>path===failed).length,2,'a failed image can be retried');
 for(const path of ITEM_SCENE_IMAGES){assert.ok(decoded.includes(path),'all art is decoded before consumption');if(path!==failed)assert.equal(loaded.filter(entry=>entry===path).length,1,'concurrent requests share decoded resources');}
 const calls=loaded.length;await prepareItemSceneAssets();assert.equal(loaded.length,calls,'resume and later actions reuse retained decoded images');
}finally{globalThis.Image=old;}
const points=itemScenePoints(390,700,{left:12,top:75,width:160,height:45},{left:50,top:500,width:150,height:44},{left:20,top:150,width:350,height:200});
const frames=itemProjectileFrames(points,false,false,{reduced:true});
assert.ok(String(frames[0].transform).includes(`${points.from.x}px,${points.from.y}px`),'reduced motion starts at the actual user, not an impact-only teleport');
assert.ok(String(frames.find(frame=>frame.offset===.68)!.transform).includes(`${points.to.x}px,${points.to.y}px`));
assert.ok(frames.every(frame=>String(frame.transform).includes('scale(0.6) rotate(0deg)')),'the accessible path has no growth or spinning');
console.log('PASS: image failures/retries, concurrent decode cache, resume preparation and visible reduced-motion flight to the same contact.');
