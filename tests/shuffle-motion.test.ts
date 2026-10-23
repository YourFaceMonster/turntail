import assert from 'node:assert/strict';
import {SHUFFLE_HZ,SHUFFLE_FRAMES,planShuffle,frameShuffle,overviewScale,sampleShufflePose,shuffleDepth,shuffleFrameIndices,shuffleKeyframes} from '../lib/shuffle-motion.ts';
import {tileContact,collideTiles,type RigidTile} from '../lib/shuffle-contacts.ts';
assert.equal(SHUFFLE_HZ,120);assert.equal(SHUFFLE_FRAMES,360);
function plan(seed:number,width:number,height:number,w:number,h:number){const iterator=planShuffle(seed,width,height,Array.from({length:60},()=>({width:w,height:h})));let result=iterator.next();while(!result.done)result=iterator.next();return result.value;}
for(const [width,height] of [[390,844],[844,390],[1280,720]])for(const [w,h] of [[42,56],[64,84]])for(const seed of [1,27381]){
 const scene=plan(seed,width,height,w,h),tracks=scene.tracks,overview=overviewScale(scene,width,height);
 assert.equal(tracks.length,60);assert.equal(frameShuffle(scene,width,height),1);assert.equal(tracks[0].poses.length,SHUFFLE_FRAMES+1);
 assert.ok(scene.contacts!>100,'actual touching edges transfer momentum repeatedly during the wash');
 assert.ok(tracks.filter(t=>t.contacts!.length>0).length>=40,'most tiles take part in physical contacts');
 const nearest=(i:number,k:number)=>tracks.map((t,j)=>({j,d:Math.hypot(t.poses[k].x-tracks[i].poses[k].x,t.poses[k].y-tracks[i].poses[k].y)})).filter(t=>t.j!==i).sort((a,b)=>a.d-b.d)[0].j;
 assert.ok(tracks.filter((_,i)=>nearest(i,0)!==nearest(i,SHUFFLE_FRAMES)).length>=25,'neighbour mixing is independent of common table motion');
 assert.equal(shuffleFrameIndices(scene).length,SHUFFLE_FRAMES+1,'contact frames are retained for GPU and compositor playback');
 for(let frame=1;frame<=SHUFFLE_FRAMES;frame++){
  for(let i=0;i<60;i++){
   const a=tracks[i],p=a.poses[frame];assert.ok(Object.values(p).every(Number.isFinite));
   assert.ok(Math.hypot(p.x,p.y)+a.radius<scene.width/2,'tiles stay on the circular fixed table');
   for(let j=0;j<i;j++)for(const fraction of [0,.5]){
    const b=tracks[j],pa=sampleShufflePose(a.poses,(frame-fraction)/SHUFFLE_FRAMES),pb=sampleShufflePose(b.poses,(frame-fraction)/SHUFFLE_FRAMES);
    const hit=tileContact({...pa,width:a.width!,height:a.height!},{...pb,width:b.width!,height:b.height!});
    assert.ok(!hit||hit.depth<Math.max(.9,w*.025),`contact solver avoids visible interpenetration, including interpolated frames: ${hit?.depth}`);
   }
  }
 }
 assert.ok(overview>0&&overview<=1);
}
const tile=(x:number,y:number,vx:number):RigidTile=>({x,y,vx,vy:0,spin:0,angle:0,width:40,height:60});
const a=tile(0,0,4),b=tile(39,16,0);assert.ok(collideTiles(a,b));assert.ok(b.vx>0&&a.vx<4,'struck tile receives linear momentum');assert.ok(Math.abs(a.spin)+Math.abs(b.spin)>0,'off-centre strikes rotate the bodies');
const scene=plan(41,390,844,42,56),again=plan(41,390,844,42,56),next=plan(42,390,844,42,56);assert.deepEqual(scene,again);assert.notDeepEqual(scene,next);
const p=scene.tracks[0].poses,depth=shuffleDepth(56),frames=shuffleKeyframes(p,42,56,depth,1,195,422,shuffleFrameIndices(scene));
assert.deepEqual(sampleShufflePose(p,0),p[0]);assert.deepEqual(sampleShufflePose(p,1),p.at(-1));assert.equal(frames.length,SHUFFLE_FRAMES+1);assert.equal(frames[0].offset,0);assert.equal(frames.at(-1)!.offset,1);
console.log('PASS: 12 physical 60-tile scenes, rectangular edge contacts, impulse/spin transfer, bounded penetration at sampled and interpolated frames, neighbour mixing, circular bounds, repeatable planning and exact playback endpoints.');
