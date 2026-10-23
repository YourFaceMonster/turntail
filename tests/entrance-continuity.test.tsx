import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {tableCircle,opponentSeats} from '../lib/table-world';
import {savedTablePlan} from '../lib/saved-table';
import EntranceSavedTile from '../app/components/EntranceSavedTile';
import EntranceSeats from '../app/components/EntranceSeats';
import EntranceEnvironment from '../app/components/EntranceEnvironment';
for(const [width,height] of [[390,844],[1440,900],[844,390]]){
 const bounds={left:20,top:80,width:width-40,height:height-120};
 const intro=tableCircle(bounds,width,height),live=tableCircle(bounds,width,height);
 assert.deepEqual(intro,live);assert.ok(intro.diameter>Math.hypot(bounds.width,bounds.height));
 assert.equal(intro.cx,bounds.left+bounds.width/2);
}
for(const opponents of [1,2,3]){
 const seats=opponentSeats(opponents);assert.equal(seats.length,opponents);
 assert.equal(new Set(seats.map(s=>`${s.x}:${s.y}`)).size,opponents);
 const company=Array.from({length:opponents},(_,i)=>({name:`Seat ${i}`,points:10,count:12}));
 const html=renderToStaticMarkup(<EntranceSeats company={company} diameter={1000} cx={400} cy={500}/>);
 assert.equal((html.match(/data-world-seat=/g)||[]).length,opponents);
 assert.ok(html.includes(`data-player-count="${opponents+1}"`));
}
const own={id:1,n:3,s:1},secret={id:42,n:13,s:2};
const game={me:0,players:[{hand:[own]},{hand:[secret]}],stacks:[{upper:true,lowerPresent:true,lower:secret},{upper:true,lowerPresent:false},{upper:false,lowerPresent:true,lower:own}]};
const plan=savedTablePlan(game);assert.deepEqual(plan.slice(0,3).map(r=>r.level),[2,1,1]);
for(const item of plan){
 const html=renderToStaticMarkup(<EntranceSavedTile item={item} target={{x:100,y:200,width:40,height:53,angle:0}}/>);
 assert.ok(html.includes('saved-side-bottom')&&html.includes('saved-top'));
 assert.ok(!html.includes('data-tile-id="42"'),'a covered double stack has height without exposing its lower face');
 assert.ok(html.includes(`data-stack-level="${item.level||1}"`));
}
const scenes=new Set();for(let stage=1;stage<=10;stage++){
 const html=renderToStaticMarkup(<EntranceEnvironment stage={stage}/>);assert.ok(html.includes(`data-location="${stage}"`)&&!html.includes('stage-map'));scenes.add(html);
}
assert.equal(scenes.size,10);
console.log('PASS: shared circle in three viewport shapes, opponent counts 2/3/4, physical saved-stack height without hidden faces, and ten destination environments.');
