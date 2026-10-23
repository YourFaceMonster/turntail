import assert from 'node:assert/strict';
import {planShuffle,frameShuffle,shuffleDepth,shuffleKeyframes} from '../lib/shuffle-motion.ts';
import {matchShuffleTracks,planDealFlights,sampleDealRoute,dealKeyframes,routeDistance,type DealRoute} from '../lib/deal-motion.ts';
import {dealPlan,shuffleTileSize} from '../lib/deal-animation.ts';
import {room,player,start,view} from '../lib/game.ts';
function intersects(a:DealRoute,b:DealRoute,t:number){
 const p=sampleDealRoute(a,t),q=sampleDealRoute(b,t);
 if(p.opacity<.001||q.opacity<.001)return false;
 if(p.z-a.depth*Math.min(p.sx,p.sy)>=q.z-1e-6||q.z-b.depth*Math.min(q.sx,q.sy)>=p.z-1e-6)return false;
 const aa=p.angle*Math.PI/180,bb=q.angle*Math.PI/180,pa=[Math.cos(aa),Math.sin(aa)],pb=[-pa[1],pa[0]],qa=[Math.cos(bb),Math.sin(bb)],qb=[-qa[1],qa[0]];
 for(const axis of [pa,pb,qa,qb]){
  const r=(a.width*p.sx*Math.abs(axis[0]*pa[0]+axis[1]*pa[1])+a.height*p.sy*Math.abs(axis[0]*pb[0]+axis[1]*pb[1]))/2;
  const s=(b.width*q.sx*Math.abs(axis[0]*qa[0]+axis[1]*qa[1])+b.height*q.sy*Math.abs(axis[0]*qb[0]+axis[1]*qb[1]))/2;
  if(Math.abs((p.x-q.x)*axis[0]+(p.y-q.y)*axis[1])>=r+s-1e-6)return false;
 }
 return true;
}
for(const capacity of [2,3,4])for(const [width,height] of [[390,844],[844,390]])for(const rotation of [0,90,-90]){
 const g=room('PHYSICAL',player('나'),true,capacity);for(let i=1;i<capacity;i++)g.players.push(player('상대',true));start(g);
 const items=dealPlan(view(g,g.players[0].token)),counts=new Map<string,number>();
 const destinations=items.map(item=>{
  if(item.kind==='opponent'){
   const seat=Number(item.key.split('-')[1]);return {x:width*seat/capacity,y:height*.12,width:48,height:48,angle:rotation};
  }
  const layer=item.kind==='upper'?'lower':item.kind,n=counts.get(layer)||0;counts.set(layer,n+1);
  if(item.kind==='own')return {x:width*.18+(n%6)*width*.12,y:height*.81+Math.floor(n/6)*height*.09,width:Math.min(38,width*.08),height:Math.min(50,height*.075),angle:rotation};
  const stack=Number(item.key.split('-')[1]);return {x:width*.17+(stack%6)*width*.13,y:height*.32+Math.floor(stack/6)*height*.12,width:Math.min(36,width*.08),height:Math.min(48,height*.08),angle:rotation};
 });
 // At ±90° give the cells enough room in both axes, as the actual measured app does.
 destinations.forEach(t=>{const side=Math.min(t.width,t.height);t.width=side*.76;t.height=side;});
 const own=destinations[items.findIndex(i=>i.kind==='own')],sizes=items.map((item,i)=>shuffleTileSize(item.kind,destinations[i],own));
 const planner=planShuffle(capacity*997+rotation,width,height,sizes);let result=planner.next();while(!result.done)result=planner.next();const scene=result.value,scale=frameShuffle(scene,width,height);
 const sources=scene.tracks.map(track=>{const p=track.poses.at(-1)!;return {...p,x:width/2+p.x*scale,y:height/2+p.y*scale};});
 const assignment=matchShuffleTracks(sources,destinations);
 assert.equal(new Set(assignment).size,60,'each back is dealt exactly once');
 const routes=planDealFlights(items.map((item,i)=>({...sizes[i],key:item.key,kind:item.kind,depth:shuffleDepth(sizes[i].height),scale,source:sources[assignment[i]],target:destinations[i]})));
 for(let i=0;i<60;i++){
  const route=routes[i],frames=dealKeyframes(route),track=scene.tracks[assignment[i]],size=sizes[i];
  assert.equal(frames[0].transform,shuffleKeyframes(track.poses,size.width,size.height,route.depth,scale,width/2,height/2).at(-1)!.transform,'no shuffle/deal pose snap');
  const end=sampleDealRoute(route,1);assert.ok(Math.abs(end.angle-route.source.angle)<=180.000001,'deal turns take the shortest route even after multiple shuffle spins');assert.equal(end.x,route.target.x);assert.equal(end.y,route.target.y);
  assert.ok(Math.abs(size.width*end.sx-route.target.width)<1e-9);assert.ok(Math.abs(size.height*end.sy-route.target.height)<1e-9);
  assert.ok(frames.some(f=>f.offset===.18)&&frames.some(f=>f.offset===.82),'browser interpolation never straddles movement stages');
  for(let j=0;j<i;j++){
   const other=routes[j],r=Math.max(Math.hypot(route.width,route.height),Math.hypot(route.target.width,route.target.height))/2+2,s=Math.max(Math.hypot(other.width,other.height),Math.hypot(other.target.width,other.target.height))/2+2;
   if(routeDistance(route.source,route.target,other.source,other.target)<r+s)assert.notEqual(route.tier,other.tier,'crossing swept footprints reserve different solid height bands');
  }
 }
 for(let frame=0;frame<=120;frame++)for(let i=0;i<60;i++)for(let j=0;j<i;j++)assert.equal(intersects(routes[i],routes[j],frame/120),false,`solid dealing bodies intersect: ${capacity}p ${width}×${height} ${rotation}° ${items[i].key}/${items[j].key} t=${frame/120}`);
 for(const route of routes.filter(r=>r.kind==='upper')){
  const lower=routes.find(r=>r.key===route.key.replace('upper-','lower-'))!;
  assert.ok(route.tier>lower.tier);assert.ok(route.ground-lower.ground>=route.body+4,'upper floor body rests above the lower body');
 }
}
// Matching really minimises travel rather than using round-robin DOM order.
const p=(x:number,y:number)=>({x,y,angle:0});
assert.deepEqual(matchShuffleTracks([p(0,0),p(100,100)],[p(99,99),p(1,1)]),[1,0]);
assert.equal(routeDistance(p(0,0),p(10,10),p(0,10),p(10,0)),0);
console.log('PASS: all 60 backs conserved, shortest matching, exact native-size handoff, analytic crossing-route separation, sampled 3D body clearance and upper/lower stacking for 2–4 players at 0/±90° in both orientations.');
