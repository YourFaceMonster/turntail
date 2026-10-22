import assert from 'node:assert/strict';
import {act,accessible,botMove,capacity,dimensions,player,room,settle,start,view,type Game,type Tile} from '../lib/game.ts';
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
function make(n:number){const g=room('SIZE'+n,player('나'),true,n);for(let i=1;i<n;i++)g.players.push(player('AI'+i,true));start(g);return g;}
for(const n of [2,3,4]){
 const g=make(n),floor=n===3?30:60-n*12;assert.equal(capacity(g),n);assert.equal(g.stacks.length*2,floor);assert.equal(dimensions(g).cols,n===2?6:n===3?5:3);assert.equal(g.players.flatMap(p=>p.hand).length,n*(n===3?10:12));
 assert.equal(new Set([...g.players.flatMap(p=>p.hand),...g.stacks.flat()].map(t=>t!.id)).size,60);
 g.turn=n-1;act(g,n-1,'draw',[],0);assert.equal(g.turn,0);
 const projected=view(g,g.players[0].token);assert.equal(projected.capacity,n);assert.equal(projected.players.filter(p=>p.hand!==undefined).length,1);assert.equal(JSON.stringify(projected).includes(g.players[1].token),false);
 const d=dimensions(g);for(let i=0;i<g.stacks.length;i++){const y=Math.floor(i/d.cols),x=i%d.cols;if(y===0||x===0||y===d.rows-1||x===d.cols-1)assert.equal(accessible(g,i),true);}
}
function score(counts:number[]){const g=make(counts.length);g.players.forEach((p,i)=>p.hand=Array.from({length:counts[i]},(_,j)=>tile(j+3,i)));g.phase='ended';g.winner=0;const r=settle(g);assert.equal(r.players.reduce((a,p)=>a+p.delta,0),0);const points=g.players.map(p=>p.points);settle(g);assert.deepEqual(g.players.map(p=>p.points),points);assert.equal(g.players[0].wins,1);assert.ok(g.players.every(p=>p.games===1));return r.players.map(p=>p.delta);}
assert.deepEqual(score([0,4,7]),[11,-1,-10]);assert.deepEqual(score([0,5]),[5,-5]);assert.deepEqual(score([0,2,5,8]),[15,7,-5,-17]);assert.deepEqual(score([0,4,4]),[8,-4,-4]);
for(const n of [2,3,4])for(let round=0;round<70;round++){
 const g=make(n);g.players[0].bot=true;let moves=0;while(g.phase==='playing'&&moves++<1200)botMove(g);assert.equal(g.phase,'ended');assert.equal(g.players[g.winner!].hand.length,0);assert.equal(g.result!.players.reduce((a,p)=>a+p.delta,0),0);
 const count=g.players.reduce((a,p)=>a+(p.games||0),0);assert.equal(count,n);start(g);assert.equal(g.result,null);assert.ok(g.players.every(p=>p.games===1));
}
// An older stored 3-player room keeps working without new optional fields.
const legacy=make(3);legacy.stacks=legacy.stacks.slice(0,12);delete legacy.capacity;delete legacy.cols;delete legacy.rows;assert.equal(capacity(legacy),3);assert.equal(view(legacy,legacy.players[0].token).cols,4);
console.log('PASS: 2/3/4 player layouts, all 60 tiles, wrapping turns, privacy, zero-sum scoring, ties, idempotent settlement, legacy rooms, 210 full games.');
