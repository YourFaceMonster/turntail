import assert from 'node:assert/strict';
import {accessible,act,player,room,view,type Tile} from '../lib/game';
const tile=(id:number):Tile=>({id,n:Math.floor(id/4)+1,s:id%4});
function board(){const g=room('WALL',player('나'),true,3);g.players.push(player('좌'),player('우'));g.phase='playing';g.cols=3;g.rows=3;g.turn=0;g.trick=[tile(58)];g.players[0].hand=[tile(59)];g.stacks=Array.from({length:9},(_,i)=>[tile(i),tile(i+9)]);return g;}
for(const layer of [0,1]){
 const g=board();if(layer===0)g.stacks[4][1]=null;
 assert.equal(accessible(g,4),false,`layer ${layer+1}: blocked on all four sides`);
 assert.equal(view(g,g.players[0].token).stacks[4].available,false);
 assert.throws(()=>act(g,0,'draw',[],4),/외곽/);
 for(const gap of [1,3,5,7]){
  const open=structuredClone(g);open.stacks[gap][1]=null;if(layer===0)open.stacks[gap][0]=null;
  assert.equal(accessible(open,4),true,`layer ${layer+1}: opening side ${gap}`);
  assert.equal(view(open,open.players[0].token).stacks[4].available,true);
  const before=open.players[0].hand.length;act(open,0,'draw',[],4);assert.equal(open.players[0].hand.length,before+1);assert.equal(open.stacks[4][layer],null);
 }
 const diagonal=structuredClone(g);diagonal.stacks[0]=[null,null];assert.equal(accessible(diagonal,4),false,'a diagonal gap never opens a side');
}
const g=board();g.stacks[1][1]=null;act(g,0,'draw',[],4);assert.equal(g.stacks[4][1],null);assert.ok(g.stacks[4][0]);assert.equal(view(g,g.players[0].token).stacks[4].available,false,'revealing the lower face does not unlock its four blocked sides');
console.log('PASS: both layers reject enclosed draws, all four side openings permit draws, diagonals stay blocked, and a revealed first-layer face remains locked until its own side opens.');
