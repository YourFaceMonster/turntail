import assert from 'node:assert/strict';
import {act,view} from '../lib/game';
import {createGuidedMatch,guidedBotMove,guidedSteps,isGuidedMatch,GUIDED_TILES as T,GUIDED_DRAW_STACK,type GuidedContext} from '../lib/guided-match';

const g=createGuidedMatch('나','',{name:'피오',avatar:''},0);
assert.ok(isGuidedMatch(g));assert.equal(g.turn,0,'the player leads first');assert.equal(g.practice,true);
const me=g.players[0].token;
const ctx=(selected:number[]=[],pick:number|null=null):GuidedContext=>{const v=view(g,me);return {view:{phase:v.phase,turn:v.turn,me:v.me,trick:v.trick,handIds:(v.players[0].hand||[]).map(t=>t.id),opponent:'피오',lastEvent:v.lastEvent},selected,pick,myTurnReady:v.turn===0&&v.phase==='playing'};};
const steps=guidedSteps(),step=(id:string)=>steps.find(s=>s.id===id)!;
const bot=()=>{assert.equal(g.turn,1,'opponent to move');guidedBotMove(g,0);};

// Every step's text renders (particles, names).
for(const s of steps)assert.ok(s.text(ctx()).length>0);
assert.match(step('hello').text(ctx()),/피오와/);

assert.ok(step('pick-pair').until!(ctx([T.sevenA.id,T.sevenB.id])));
act(g,0,'play',[T.sevenA.id,T.sevenB.id],-1,0);assert.ok(step('play-pair').until!(ctx()));
bot();assert.deepEqual(g.trick.map(t=>t.n),[10,10],'opponent answers with pair 10');assert.ok(step('answer').waitFor!(ctx()));
act(g,0,'draw',[],GUIDED_DRAW_STACK,0);assert.ok(step('draw').until!(ctx()),'the 13 is in hand');
bot();assert.deepEqual(g.trick.map(t=>t.n),[4],'opponent leads single 4');assert.ok(step('single').waitFor!(ctx()));
act(g,0,'play',[T.nine.id],-1,0);assert.ok(step('play-nine').until!(ctx()));
bot();assert.equal(g.trick.length,0,'opponent drew, the player leads again');assert.equal(g.turn,0);assert.ok(step('lead-again').waitFor!(ctx()));
assert.equal(g.stacks[GUIDED_DRAW_STACK][0],null,'only the player took the 13');
act(g,0,'play',[T.thirteenA.id,T.thirteenB.id],-1,0);
bot();assert.equal(g.turn,0);assert.ok(step('last').waitFor!(ctx()),'one tile left and the lead');
act(g,0,'play',[T.three.id],-1,0);
assert.equal(g.phase,'ended');assert.equal(g.winner,0);assert.ok(step('done').waitFor!(ctx()));
console.log('PASS: guided practice duel — fixed deal plays through every step to a win.');
