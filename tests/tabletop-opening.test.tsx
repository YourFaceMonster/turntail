import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {tableCircle,opponentTableTarget} from '../lib/table-world.ts';
import {planTableDealFlights,sampleDealRoute} from '../lib/deal-motion.ts';
import {tileBodyDepth} from '../lib/tile-body.ts';
import {SEAT_ACCENTS,seatAccent} from '../lib/seat-presentation.ts';
import EntranceWorld from '../app/components/EntranceWorld';
import EntranceSeats from '../app/components/EntranceSeats';
for(const [width,height] of [[320,568],[390,844],[844,390],[1363,936]]){
 const c=tableCircle({left:width*.1,top:70,width:width*.8,height:height-100},width,height);
 for(const x of [0,width])for(const y of [0,height])assert.ok(Math.hypot(x-c.cx,y-c.cy)<c.diameter*.45,'all viewport corners lie inside every platform silhouette');
 for(const count of [1,2,3]){
  const handCount=count===1?12:count===2?10:9,tile={width:42,height:56},targets=[];
  for(let seat=0;seat<count;seat++)for(let i=0;i<handCount;i++){
   const t=opponentTableTarget(seat,count,i,handCount,c,tile);targets.push(t);
   assert.ok(Math.hypot(t.x-c.cx,t.y-c.cy)+Math.hypot(t.width,t.height)/2<c.diameter*.45,'opponent backs land on the table, never beyond its edge');
  }
  for(let i=0;i<targets.length;i++)for(let j=0;j<i;j++)assert.ok(Math.abs(targets[i].x-targets[j].x)>=(targets[i].width+targets[j].width)/2+4||Math.abs(targets[i].y-targets[j].y)>=(targets[i].height+targets[j].height)/2+4,'landed rows never overlap');
  const routes=planTableDealFlights(targets.map((target,i)=>({key:`opponent-${i}`,kind:'opponent' as const,width:42,height:56,depth:tileBodyDepth(56),scale:1,source:{x:c.cx+(i%5)*70,y:c.cy+Math.floor(i/5)*65,angle:i*17},target})));
  for(const r of routes){assert.ok(r.ceiling<=Math.max(r.depth,r.ground)+24);const end=sampleDealRoute(r,1);assert.equal(end.x,r.target.x);assert.equal(end.y,r.target.y);assert.equal(end.z,tileBodyDepth(r.target.height));for(let t=0;t<=100;t++)assert.ok(sampleDealRoute(r,t/100).z<=r.ceiling,'dealing stays close to the surface');}
 }
 const supports=renderToStaticMarkup(<EntranceWorld diameter={c.diameter} cx={c.cx} cy={c.cy} supportsOnly/>);
 assert.equal((supports.match(/data-support=/g)||[]).length,4);assert.ok(!supports.includes('world-ground-traces'),'restored supports omit the extra floor scenery');
 const seats=renderToStaticMarkup(<EntranceSeats diameter={c.diameter} cx={c.cx} cy={c.cy} company={[{name:'김복례',avatar:'korean-portrait:0',count:10,points:0},{name:'강태오',avatar:'korean-portrait:4',count:10,points:0}]}/>);
 assert.equal((seats.match(/data-world-seat=/g)||[]).length,2);assert.ok(!seats.includes('world-held-tiles'),'backs are dealt onto the tabletop instead of duplicated in the air');
}
assert.deepEqual([0,1,2,3].map(seatAccent),SEAT_ACCENTS);assert.equal(seatAccent(null),'#a99c82');
console.log('PASS: full viewport coverage, nonoverlapping opponent tabletop rows, low deal height and exact landings, restored supports and portraits, and matching turn accents.');
