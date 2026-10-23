import assert from 'node:assert/strict';
import {room,player,start,view,startingHandSize} from '../lib/game.ts';
import {dealPlan,dealTarget,shuffleTileSize,measureDealLayout} from '../lib/deal-animation.ts';
for(const size of [2,3,4]){
 const g=room('DEAL',player('나'),true,size);for(let i=1;i<size;i++)g.players.push(player('상대'+i,true));start(g);
 for(let me=0;me<size;me++){
  const v=view(g,g.players[me].token),plan=dealPlan(v),handCount=startingHandSize(size);
  assert.equal(plan.length,60);assert.equal(new Set(plan.map(p=>p.key)).size,60);
  assert.equal(plan.filter(p=>p.kind==='own').length,handCount);
  assert.equal(plan.filter(p=>p.kind==='opponent').length,(size-1)*handCount);
  assert.equal(plan.filter(p=>p.kind==='lower').length,(60-size*handCount)/2);
  assert.equal(plan.filter(p=>p.kind==='upper').length,(60-size*handCount)/2);
  assert.deepEqual(plan.filter(p=>p.tile).map(p=>p.tile!.id).sort((a,b)=>a-b),g.players[me].hand.map(t=>t.id).sort((a,b)=>a-b));
  assert.ok(plan.every(p=>p.kind==='own'||!('tile' in p)),'no hidden floor/opponent identities reach the animation');
  const changed=structuredClone(v);changed.players.forEach((p,i)=>{if(i!==me)p.hand=[{id:999,n:1,s:0}];});
  assert.deepEqual(dealPlan(changed),plan,'even an injected hidden hand is ignored');
 }
}
assert.throws(()=>dealPlan({me:0,players:[{count:1,hand:[]},{count:1}],stacks:[]}));
for(const angle of [0,90,-90]){
 const rect={left:30,top:80,width:42,height:56},t=dealTarget(rect,angle);
 assert.equal(t.x,51);assert.equal(t.y,108);
 const projectedWidth=Math.abs(angle)===90?t.height:t.width,projectedHeight=Math.abs(angle)===90?t.width:t.height;
 assert.equal(projectedWidth,rect.width);assert.equal(projectedHeight,rect.height);
 assert.equal(t.x-projectedWidth/2,rect.left);assert.equal(t.y-projectedHeight/2,rect.top);
}
console.log('PASS: all 60 tiles partitioned for every seat in 2/3/4-player games, unique endpoints, private-face isolation, rotated viewport alignment.');

// Reproduce real CSS: lower tiles under an upper tile have display:none (zero bounds).
for(const size of [2,3,4]){
 const g=room('HIDDEN',player('나'),true,size);for(let i=1;i<size;i++)g.players.push(player('상대'+i,true));start(g);
 const v=view(g,g.players[0].token),plan=dealPlan(v),finish={'--finish-bg':'white'};
 for(const rotation of [0,90,-90]){
  const read=(selector:string)=>({rect:selector.includes('.lower-tile')?{left:0,top:0,width:0,height:0}:{left:80,top:120,width:40,height:52},finish});
  const rows=measureDealLayout(v,rotation,read);
  assert.equal(rows.length,60,'hidden lower layers must not skip the deal phase');
  for(const row of rows){assert.equal(row.target.x,100);assert.equal(row.target.y,146);assert.equal(row.finish,finish);}
  assert.ok(plan.filter(p=>p.kind==='lower').every(p=>p.boundsSelector));
  assert.ok(plan.filter(p=>p.kind!=='lower').every(p=>!p.boundsSelector),'only a covered floor tile has a geometry substitute');
 }
 assert.throws(()=>measureDealLayout(v,0,()=>({rect:{left:0,top:0,width:0,height:0},finish})),/Layout pending/,'a missing board still waits for layout');
 assert.throws(()=>measureDealLayout(v,0,()=>null),/Layout pending/,'unmounted tiles cannot produce false success');
}
console.log('PASS: zero-size hidden lower tiles resolve all 60 destinations in 2/3/4 seats and all rotations; genuinely missing layouts still wait.');

for(const [w,h] of [[42,56],[64,84],[78,104]]){
 const target={x:100,y:200,width:w,height:h,angle:0};
 for(const kind of ['own','lower','upper'] as const)assert.deepEqual(shuffleTileSize(kind,target,{...target,width:40,height:52}),{width:w,height:h},'physical tile size equals its live slot throughout the shuffle');
 assert.deepEqual(shuffleTileSize('opponent',{...target,width:34,height:28},target),{width:w,height:h},'count badge cannot shrink a shuffled opponent tile');
}
console.log('PASS: native-size shuffle for phone/tablet/desktop slots; opponent badges do not set tile size.');
