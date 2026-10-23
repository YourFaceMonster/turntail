import assert from 'node:assert/strict';
import {planShuffle,frameShuffle,overviewScale,sampleShufflePose,shuffleDepth,shuffleFrameIndices,shuffleKeyframes,sweptDistance} from '../lib/shuffle-motion.ts';
function plan(seed:number,width:number,height:number,w:number,h:number){const iterator=planShuffle(seed,width,height,Array.from({length:60},()=>({width:w,height:h})));let result=iterator.next();while(!result.done)result=iterator.next();return result.value;}
for(const [width,height] of [[320,568],[390,844],[844,390],[1280,720]])for(const [w,h] of [[42,56],[64,84],[78,104]])for(const seed of [0,1,27381,0xffffffff]){
 const scene=plan(seed,width,height,w,h),scale=frameShuffle(scene,width,height),overview=overviewScale(scene,width,height),tracks=scene.tracks;
 assert.equal(scale,1,'the close view never shrinks the measured live tiles');
 assert.equal(tracks.length,60);assert.equal(tracks[0].poses.length,145);
 assert.equal(new Set(tracks.map(m=>m.poses.at(-1)!.x)).size,60,'no grid columns');
 assert.equal(new Set(tracks.map(m=>m.poses.at(-1)!.y)).size,60,'no grid rows');
 assert.ok(tracks.filter(m=>Math.abs(m.poses.at(-1)!.angle)>10).length>35,'loose rotations persist until dealing');
 assert.ok(tracks.filter(m=>Math.hypot(m.poses[0].x-m.poses.at(-1)!.x,m.poses[0].y-m.poses.at(-1)!.y)>10).length>45,'most tiles actually move');
 const pathLengths=tracks.map(t=>t.poses.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-t.poses[i].x,p.y-t.poses[i].y),0));
 assert.ok(pathLengths.reduce((a,b)=>a+b)/60>w*8,'a broad wash, not local vibration');
 assert.ok(pathLengths.filter(d=>d>w*2).length>=50,'at least 50 tiles travel more than two tile widths');
 const nearest=(i:number,at:number)=>tracks.map((t,j)=>({j,d:Math.hypot(t.poses[at].x-tracks[i].poses[at].x,t.poses[at].y-tracks[i].poses[at].y)})).filter(x=>x.j!==i).sort((a,b)=>a.d-b.d)[0].j;
 assert.ok(tracks.filter((_,i)=>nearest(i,0)!==nearest(i,144)).length>=30,'neighbours change: the pile does not just rotate as one rigid object');
 const indices=shuffleFrameIndices(scene);
 assert.equal(indices[0],0);assert.equal(indices.at(-1),144,'deal still begins at the exact old shuffle endpoint');
 assert.ok(indices.length>=49&&indices.length<73,'the same 60-body motion uses substantially fewer browser keyframes');
 for(let step=1;step<indices.length;step++){
  const a=indices[step-1],b=indices[step];
  for(let i=0;i<60;i++){
   const track=tracks[i];
   for(let frame=a+1;frame<b;frame++){
    const t=(frame-a)/(b-a),p=track.poses[frame];
    assert.ok(Math.hypot(p.x-track.poses[a].x-(track.poses[b].x-track.poses[a].x)*t,p.y-track.poses[a].y-(track.poses[b].y-track.poses[a].y)*t)<=Math.min(6,track.radius*.12)+1e-7,'simplification stays visually close to the original path');
   }
   for(let j=0;j<i;j++){
    const other=tracks[j];
    assert.ok(sweptDistance(track.poses[a],track.poses[b],other.poses[a],other.poses[b])>=track.radius+other.radius+.4999,'solid backs remain apart between reduced browser frames');
   }
  }
 }
 for(let frame=1;frame<145;frame++)for(let i=0;i<60;i++){
  const a=tracks[i],p=a.poses[frame];
  assert.ok((Math.abs(p.x)+a.radius)*overview<width/2&&(Math.abs(p.y)+a.radius)*overview<height/2,'the establishing shot frames all 60 tiles');
  assert.ok(Math.hypot(p.x,p.y)+a.radius<scene.width/2,'physical bodies stay on the fixed round tabletop');
  for(let j=0;j<i;j++){
   const b=tracks[j];
   assert.ok(sweptDistance(a.poses[frame-1],p,b.poses[frame-1],b.poses[frame])>=a.radius+b.radius+.4999,'no rotating corners can intersect, including BETWEEN browser keyframes');
  }
 }
}
const scene=plan(41,390,844,42,56),again=plan(41,390,844,42,56),next=plan(42,390,844,42,56);
assert.deepEqual(scene,again,'one launch does not reroll on rerender');assert.notDeepEqual(scene,next,'fresh launches vary');
const p=scene.tracks[0].poses,scale=frameShuffle(scene,390,844),depth=shuffleDepth(56),frames=shuffleKeyframes(p,42,56,depth,scale,195,422);
const indices=shuffleFrameIndices(scene),compact=shuffleKeyframes(p,42,56,depth,scale,195,422,indices);
assert.deepEqual(sampleShufflePose(p,0),p[0]);assert.deepEqual(sampleShufflePose(p,1),p.at(-1));
assert.equal(frames.length,145);assert.equal(frames[0].offset,0);assert.equal(frames.at(-1)!.offset,1);
assert.equal(compact.length,indices.length);assert.equal(compact[0].transform,frames[0].transform);assert.equal(compact.at(-1)!.transform,frames.at(-1)!.transform);
assert.ok(frames.at(-1)!.transform.includes(`${depth*scale}px`),'tile does not sink through its white body during shuffle');
for(const h of [40,56,84,104])assert.ok(shuffleDepth(h)>=18&&shuffleDepth(h)<=26);
console.log('PASS: 48 seeded 60-body scenes, continuous swept clearance at every interval, irregular placement, fixed table bounds, substantial travel and neighbour changes, overview/close camera scales, native sizes and solid 18–26px bodies.');
