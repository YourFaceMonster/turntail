import {seededGame} from './fixtures/strategy-positions.ts';
import assert from 'node:assert/strict';
import {act,accessible,beats,botMove,combo,player,room,start,view,type Tile} from '../lib/game.ts';
const t=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const fresh=()=>{const g=room('ABC123',player('A'));g.players.push(player('B'),player('C'));start(g);return g;};
let g=fresh();assert.deepEqual(g.players.map(p=>p.hand.length),[10,10,10]);assert.equal(g.stacks.flat().length,30);assert.equal(new Set([...g.players.flatMap(p=>p.hand),...g.stacks.flat()].map(x=>x!.id)).size,60);
assert.equal(accessible(g,6),false);assert.equal(accessible(g,7),false);assert.equal(accessible(g,0),true);g.stacks[1][1]=null;assert.equal(accessible(g,6),true);g.stacks[6][1]=null;assert.equal(accessible(g,6),false);g.stacks[1][0]=null;assert.equal(accessible(g,6),true);
g=fresh();const v=view(g,g.players[0].token);assert.ok(v.players[0].hand);assert.equal(v.players[1].hand,undefined);assert.ok(v.stacks.every(s=>typeof s.upper==='boolean'));assert.equal(JSON.stringify(v).includes(g.players[1].token),false);
act(g,g.turn,'play',[g.players[g.turn].hand[0].id]);const old=g.turn,count=g.players[old].hand.length;act(g,old,'draw',[],0);assert.equal(g.players[old].hand.length,count+1);assert.equal(g.turn,(old+1)%3);assert.throws(()=>act(g,old,'play',[g.players[old].hand[0].id]));
assert.throws(()=>act(g,g.turn,'draw',[],6));assert.throws(()=>act(g,g.turn,'pass'));
assert.equal(combo([t(3),t(3,1)])?.label,'페어');assert.equal(combo([t(3),t(4)]),null);assert.equal(combo([t(5),t(5,1),t(5,2),t(5,3)]),null);
assert.equal(beats([t(2)],[t(1,3)]),true);assert.equal(beats([t(3,3)],[t(3,2)]),true);
const straight=(ns:number[])=>ns.map((n,i)=>t(n,i%4));assert.equal(beats(straight([1,2,3,4,5]),straight([2,3,4,5,6])),true);assert.equal(beats(straight([2,3,4,5,6]),straight([12,13,14,15,1])),true);assert.equal(combo(straight([13,14,15,1,2])),null);
g=fresh();g.turn=0;g.players[0].hand=[t(3),t(7)];g.players[1].hand=[t(5)];g.players[2].hand=[t(6)];act(g,0,'play',[t(3).id]);act(g,1,'draw',[],0);act(g,2,'draw',[],1);assert.equal(g.turn,0);assert.equal(g.trick.length,0);act(g,0,'play',[t(7).id]);assert.equal(g.phase,'ended');assert.equal(g.winner,0);assert.ok(g.stacks.flat().some(Boolean));
g=fresh();g.stacks=g.stacks.map(()=>[null,null]);g.turn=0;g.players[0].hand=[t(3),t(7)];act(g,0,'play',[t(3).id]);act(g,1,'pass');act(g,2,'pass');assert.equal(g.phase,'playing');assert.equal(g.turn,0);assert.equal(g.trick.length,0);
for(const size of [2,3,4])for(let seed=1;seed<=4;seed++){g=seededGame(seed*3911,size);let n=0;while(g.phase==='playing'&&n++<1000)botMove(g);assert.equal(g.phase,'ended');assert.equal(g.players[g.winner!].hand.length,0);assert.equal(g.players.reduce((n,p)=>n+p.wins,0),1);}
console.log('PASS: dealing, layered access, concealed hands, strategic draws, turn completion, legal combinations, empty-floor passes, immediate victory, 12 seeded complete games across 2/3/4 players.');
