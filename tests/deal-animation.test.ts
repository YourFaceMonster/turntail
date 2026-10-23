import assert from 'node:assert/strict';
import {room,player,start,view,startingHandSize} from '../lib/game.ts';
import {dealPlan,dealTarget,shufflePoint} from '../lib/deal-animation.ts';
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
for(const [width,height] of [[320,568],[390,844],[844,390],[1280,720]]){
 const positions=Array.from({length:60},(_,i)=>shufflePoint(i,width,height));
 assert.equal(new Set(positions.map(p=>`${p.x},${p.y}`)).size,60);
 assert.ok(positions.every(p=>p.x>=17&&p.x<=width-17&&p.y>=22.5&&p.y<=height-22.5),'all 60 shuffled tiles fit the viewport');
}
console.log('PASS: all 60 tiles partitioned for every seat in 2/3/4-player games, unique endpoints, private-face isolation, rotated viewport alignment, narrow/wide shuffle bounds.');
