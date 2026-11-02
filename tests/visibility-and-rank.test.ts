import assert from 'node:assert/strict';
import {act,beats,botMove,player,room,sorted,start,view,type Tile} from '../lib/game.ts';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const make=(size:number)=>{
 const g=room('HIDDEN',player('나'),true,size);
 for(let i=1;i<size;i++)g.players.push(player('AI'+i,true));
 start(g);return g;
};

for(const size of [2,3,4]){
 const g=make(size),total=size===3?30:size===4?24:36,lower=g.stacks[0][0];
 for(const p of g.players){
  const projected=view(g,p.token);
  assert.ok(projected.stacks.every(s=>s.upper&&s.lowerPresent&&s.lower===null));
  assert.equal(projected.stacks.reduce((n,s)=>n+Number(s.upper)+Number(s.lowerPresent),0),total);
 }
 g.trick=[tile(3)];g.lastBy=g.turn;act(g,g.turn,'draw',[],0);
 for(const p of g.players){
  const projected=view(g,p.token);
  assert.deepEqual(projected.stacks[0].lower,lower);
  assert.equal(projected.stacks[0].upper,false);
  assert.equal(projected.stacks[0].available,true);
  assert.ok(projected.stacks.slice(1).every(s=>s.lower===null));
  assert.equal(projected.stacks.reduce((n,s)=>n+Number(s.upper)+Number(s.lowerPresent),0),total-1);
 }
 g.trick=[tile(3)];g.lastBy=g.turn;act(g,g.turn,'draw',[],0);
 const empty=view(g,g.players[0].token).stacks[0];
 assert.equal(empty.lowerPresent,false);assert.equal(empty.lower,null);assert.equal(empty.available,false);
}

// Swapping concealed lower tiles cannot change the AI's draw decision.
const original=make(3);original.turn=0;original.players[0].bot=true;
original.players[0].hand=[tile(3),tile(4)];original.trick=[tile(2,3)];original.lastBy=2;
const swapped=structuredClone(original);
[swapped.stacks[0][0],swapped.stacks[1][0]]=[swapped.stacks[1][0],swapped.stacks[0][0]];
botMove(original,original.turnReadyAt);botMove(swapped,swapped.turnReadyAt);
assert.equal(original.lastEvent?.type,'draw');
assert.equal(original.lastEvent?.index,swapped.lastEvent?.index);

// Color strength: red sun > green star > yellow moon > black cloud.
for(const [higher,lower] of [[3,1],[1,2],[2,0]]){
 assert.equal(beats([tile(6,higher)],[tile(6,lower)]),true);
 assert.equal(beats([tile(6,lower)],[tile(6,higher)]),false);
 const flush=(s:number)=>[3,5,8,10,12].map(n=>tile(n,s));
 assert.equal(beats(flush(higher),flush(lower)),true);
}
assert.deepEqual(sorted([tile(6,3),tile(6,2),tile(6,0),tile(6,1)]).map(t=>t.s),[0,2,1,3]);
assert.equal(beats([tile(6,0),tile(6,1)],[tile(6,0),tile(6,2)]),true);
const straight=(s:number)=>[tile(3),tile(4,3),tile(5),tile(6,3),tile(7,s)];
assert.equal(beats(straight(1),straight(2)),true);
assert.equal(beats([tile(7,0)],[tile(6,3)]),true);
assert.equal(beats([tile(1,0)],[tile(15,3)]),true);
assert.equal(beats([tile(2,0)],[tile(1,3)]),true);
console.log('PASS: covered lower tiles hidden for every seat in 2/3/4-player games, reveal on draw, floor counts, AI concealment, color order across singles/pairs/straights/flushes, special number ranks.');
