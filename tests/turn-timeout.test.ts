import assert from 'node:assert/strict';
import {room,player,start,act,advanceRoom,scheduleTurn,view,hostSeat,TURN_MS,FINAL_TURN_MS,PLAY_REVIEW_MS,DEAL_REVIEW_MS,DRAW_TRAVEL_MS,type Game} from '../lib/game.ts';
const create=(n=3)=>{const g=room('ABCDEF',player('방장'),false,n);for(let i=1;i<n;i++)g.players.push(player(`친구${i}`));start(g,1000);return g;};
for(const n of [2,3,4]){const g=create(n);assert.equal(g.players.length,n);assert.equal(g.turnDeadline,1000+DEAL_REVIEW_MS+TURN_MS);assert.equal(advanceRoom(g,33999),false);assert.equal(advanceRoom(g,34000),true);assert.equal(g.players.reduce((s,p)=>s+(p.timeouts||0),0),1);const event=g.lastEvent?.id;assert.equal(advanceRoom(g,34000),false);assert.equal(g.lastEvent?.id,event,'poll twice must not advance twice');assert.ok(g.turnDeadline!>=34000+PLAY_REVIEW_MS+TURN_MS);}
let g=create();const idle=g.turn;g.players[idle].hand=[3,6,8,10,13,2].map((n,i)=>({id:(n-1)*4+i%4,n,s:i%4}));
for(let misses=0;misses<3;misses++){
 g.turn=idle;g.trick=[];g.lastBy=null;g.turnReadyAt=0;scheduleTurn(g,100000+misses*100000);
 const duration=misses===2?FINAL_TURN_MS:TURN_MS;assert.equal(g.turnDeadline!-g.turnStartedAt!,duration);
 assert.equal(advanceRoom(g,g.turnDeadline!-1),false);const deadline=g.turnDeadline!;assert.equal(advanceRoom(g,deadline),true);assert.equal(g.players[idle].timeouts,misses+1);assert.equal(!!g.players[idle].replaced,misses===2);
}
assert.notEqual(g.turn,idle);g.turn=idle;g.trick=[];g.lastBy=null;g.turnReadyAt=0;g.turnStartedAt=0;const before=g.players[idle].hand.length;assert.throws(()=>act(g,idle,'play',[g.players[idle].hand[0].id]),/AI/);assert.equal(advanceRoom(g,999999),true);assert.ok(g.players[idle].hand.length<before,'replacement continues playing online');
assert.equal(view(g,g.players[idle].token).players[idle].replaced,true);assert.equal(view(g,g.players[idle].token).players[idle].bot,false,'keep original human identity for records');
g=create();g.players[0].replaced=true;assert.equal(hostSeat(g),1);start(g,2000);assert.equal(g.players[0].replaced,true,'replacement cannot reclaim seat by restarting');
g=create();g.turn=0;g.trick=[{id:0,n:1,s:0}];g.lastBy=2;g.players[0].timeouts=2;act(g,0,'draw',[],0,10000);assert.equal(g.players[0].timeouts,0,'manual completion resets consecutive misses');assert.equal(g.turnDeadline,10000+DRAW_TRAVEL_MS+TURN_MS,'clock begins after draw review');
g=create();g.practice=true;scheduleTurn(g,0);assert.equal(g.turnDeadline,0);assert.equal(advanceRoom(g,999999),false,'local practice keeps its untimed flow');
g=create();delete g.turnDeadline;const old=g.lastEvent?.id;assert.equal(advanceRoom(g,800000),true);assert.equal(g.turnDeadline,830000);assert.equal(g.lastEvent?.id,old,'legacy room starts a fresh clock without punishing a player');
// Upper draws never disclose tile identity to another seat or AI, even after collection.
g=create();g.turn=0;g.trick=[{id:0,n:1,s:0}];g.lastBy=2;const upper=g.stacks[0][1]!;act(g,0,'draw',[],0,10000);const mine=view(g,g.players[0].token),op=view(g,g.players[1].token);assert.deepEqual(mine.lastEvent?.tiles,[upper]);assert.equal(op.lastEvent?.tiles,undefined);assert.equal(op.lastEvent?.concealed,true);assert.deepEqual(op.players[0].known,[]);assert.equal(op.players[0].hand,undefined);assert.ok(mine.players[0].hand?.some(t=>t.id===upper.id));
// Revealed lower draws stay public, preserving the one-second review affordance.
g.turn=1;g.trick=[{id:0,n:1,s:0}];g.lastBy=2;const lower=g.stacks[0][0]!;act(g,1,'draw',[],0,20000);for(const p of g.players){const v=view(g,p.token);assert.deepEqual(v.lastEvent?.tiles,[lower]);assert.equal(v.lastEvent?.concealed,false);assert.deepEqual(v.players[1].known,[lower]);}
const stressRounds=Number(process.env.BOT_STRESS_ROUNDS||2);
for(const size of [2,3,4])for(let match=0;match<stressRounds;match++){const game=create(size);let now=1000,steps=0;while(game.phase==='playing'&&steps++<1500){now=Math.max(now+1,game.turnDeadline||Math.max(game.turnReadyAt||0,game.turnStartedAt||0)+450);assert.equal(advanceRoom(game,now),true);}assert.equal(game.phase,'ended',`AFK takeover game ${size}/${match} stalled`);assert.equal(game.result!.voided,true);assert.ok(game.players.every(p=>!p.games&&!p.wins&&!p.points));assert.equal(game.result!.players.reduce((n,p)=>n+p.delta,0),0);}
console.log('PASS: 2/3/4 online seats; authoritative 30/30/60-second deadlines; review exclusion; duplicate polling; consecutive reset; permanent AI takeover and continued turns; host handoff; legacy clocks; upper-draw privacy and public lower draws.');
