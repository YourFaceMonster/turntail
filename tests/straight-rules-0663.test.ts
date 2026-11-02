import assert from 'node:assert/strict';
import {test} from 'node:test';
import {act,beats,combo,legalOptions,player,room,start,type Tile} from '../lib/game.ts';
const tile=(n:number,s:number):Tile=>({id:(n-1)*4+s,n,s});
const run=(first:number,suit?:number)=>Array.from({length:5},(_,i)=>tile(first+i,suit??i%4));
const order=[1,2,11,10,9,8,7,6,5,4,3];
test('all eleven non-wrapping straights follow the requested complete ranking',()=>{
 for(const suit of [undefined,0,1,2,3]){
  for(const first of order)for(const tiles of [run(first,suit),run(first,suit).reverse()])assert.equal(combo(tiles)?.label,suit===undefined?'스트레이트':'스트레이트 플러시');
  for(let i=0;i<order.length;i++)for(let j=0;j<order.length;j++)assert.equal(beats(run(order[i],suit),run(order[j],suit)),i<j,`${order[i]} vs ${order[j]} / suit ${suit}`);
 }
});
test('15-to-1 wrap is rejected by recognition, suggestions and actual submission',()=>{
 for(let first=12;first<=15;first++){
  const wrap=Array.from({length:5},(_,i)=>tile((first+i-1)%15+1,i%4));
  assert.equal(combo(wrap),null);
  assert.equal(legalOptions(wrap,[]).some(o=>o.tiles.length===5),false);
  const game=room('WRAP',player('A'));game.players.push(player('B'),player('C'));start(game);game.turn=0;game.trick=[];game.opening=undefined;game.players[0].hand=wrap;
  assert.throws(()=>act(game,0,'play',wrap.map(t=>t.id),-1,Date.now()+10000));
  assert.equal(game.players[0].hand.length,5);
 }
 // Same-suit non-consecutive cards retain the separate flush rule.
 assert.equal(combo([12,13,14,15,1].map(n=>tile(n,3)))?.label,'플러시');
});
test('suggestions include exactly the eleven legal runs and obey follow-up strength',()=>{
 const hand=Array.from({length:15},(_,i)=>tile(i+1,i%4));
 const runs=legalOptions(hand,[]).filter(o=>o.label==='스트레이트');
 assert.equal(runs.length,11);
 for(const first of order)assert.ok(runs.some(o=>o.tiles.map(t=>t.n).sort((a,b)=>a-b).join(',')===Array.from({length:5},(_,i)=>first+i).join(',')));
 const target=run(11);target[4]=tile(15,3);
 const counters=legalOptions(hand,target).filter(o=>o.label==='스트레이트');
 assert.deepEqual(counters.map(o=>Math.min(...o.tiles.map(t=>t.n))).sort(),[1,2]);
});
