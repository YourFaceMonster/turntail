import assert from 'node:assert/strict';
import {room,player,start,act,settle,view,restartMatch,matchRules,chooseBotAction,advanceRoom,TURN_MS,FINAL_TURN_MS,DEAL_REVIEW_MS,type Tile} from '../lib/game.ts';
const t=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const make=(mode:'target'|'unlimited'='target',target=10)=>{const g=room('ABCD12',player('방장'),false,3,{matchMode:mode,targetScore:target});g.players.push(player('친구1'),player('친구2'));start(g,1000);return g;};
assert.equal(TURN_MS,30000);assert.equal(FINAL_TURN_MS,60000);assert.equal(DEAL_REVIEW_MS,3000);
for(const mode of ['bad',null,{},1])assert.throws(()=>matchRules(mode));
for(const goal of [0,-1,1.5,10001,'oops',null])assert.throws(()=>matchRules('target',goal));
assert.deepEqual(matchRules(),{matchMode:'unlimited',targetScore:0});assert.equal(matchRules('target',10000).targetScore,10000);
let g=make();g.turn=0;const original=JSON.stringify(g);assert.throws(()=>act(g,0,'draw',[],0),/반드시/);assert.equal(JSON.stringify(g),original);assert.ok(view(g,g.players[0].token).stacks.every(s=>!s.available));assert.equal(chooseBotAction(view(g,g.players[0].token)).type,'play');
g.players[0].hand=[t(3),t(4)];act(g,0,'play',[t(3).id]);assert.ok(view(g,g.players[1].token).stacks.some(s=>s.available));assert.doesNotThrow(()=>act(g,1,'draw',[],0));act(g,2,'draw',[],1);assert.equal(g.trick.length,0);assert.throws(()=>act(g,0,'draw',[],0),/반드시/);
g=make();delete g.turnRuleVersion;g.turnDeadline=1;const event=g.lastEvent?.id;assert.equal(advanceRoom(g,90000),true);assert.equal(g.turnDeadline,120000);assert.equal(g.lastEvent?.id,event);assert.equal(g.players[g.turn].timeouts||0,0);
function finish(game:ReturnType<typeof make>,counts=[0,4,7]){game.players.forEach((p,i)=>p.hand=Array.from({length:counts[i]},(_,j)=>t(j+3,i)));game.phase='ended';game.winner=0;return settle(game);}
g=make();const first=finish(g);assert.equal(g.matchWinner,0);assert.equal(g.players[0].points,11);assert.throws(()=>start(g),/목표/);restartMatch(g,5000);assert.equal(g.round,2);assert.equal(view(g,g.players[0].token).displayRound,1);assert.equal(g.matchNo,2);assert.equal(g.targetScore,10);assert.equal(g.matchWinner,null);assert.ok(g.players.every(p=>p.points===0&&p.games===0));const second=finish(g);assert.notEqual(first.id,second.id);assert.equal(g.matchWinner,0);
g=make('unlimited');finish(g);assert.equal(g.matchWinner,null);assert.doesNotThrow(()=>start(g));assert.throws(()=>restartMatch(g));
g=make();g.aiAssisted=true;finish(g);assert.equal(g.matchWinner,null);assert.equal(g.result?.voided,true);assert.ok(g.players.every(p=>p.points===0));
g=make();g.players[0].points=1;g.players[1].points=20;finish(g);assert.equal(g.matchWinner,1,'highest final total wins if multiple players cross together');
g=make();g.players[0].points=1;g.players[1].points=13;finish(g);assert.equal(g.matchWinner,0,'equal final totals favor the lower remaining hand');
g=make('target',100);finish(g);assert.equal(g.matchWinner,null);assert.doesNotThrow(()=>start(g));assert.equal(g.players[0].points,11);
console.log('PASS: 30/30/60 timers, 3-second opening, legacy-clock migration, mandatory lead play, responsive strategic draw, target validation and settlement, simultaneous crossings, unlimited rounds, void exclusion, rematch with unique record IDs.');
