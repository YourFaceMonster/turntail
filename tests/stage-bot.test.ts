import assert from 'node:assert/strict';
import {analyzeBotDecision,stageBotProfile} from '../lib/bot.ts';
import {act,view,chooseBotAction} from '../lib/game.ts';
import {createStageGame} from '../lib/stage-game.ts';
const base=createStageGame('난이도 점검');base.turn=1;
const p=view(base,base.players[1].token),before=JSON.stringify(p),samples:number[]=[];
for(let level=1;level<=10;level++){
 const profile=stageBotProfile(level);assert.equal(profile.level,level);samples.push(profile.samples);
 const input=structuredClone(p);input.stageRun!.stage=level;
 const analysis=analyzeBotDecision(input,level);assert.deepEqual(chooseBotAction(input),analysis.action,'the stage level actually selects the policy');
 const tampered=structuredClone(input);tampered.players.forEach((player,i)=>{if(i!==input.me)player.hand=[{id:59,n:15,s:3}];});tampered.stacks.forEach(s=>{if(s.upper)s.lower={id:59,n:15,s:3};});
 assert.deepEqual(analyzeBotDecision(tampered,level),analysis,'every difficulty ignores hidden hands and hidden floor tiles');
 const next=structuredClone(base);next.stageRun!.stage=level;const a=analysis.action;assert.doesNotThrow(()=>act(next,next.turn,a.type,a.type==='play'?a.tiles.map(t=>t.id):[],a.type==='draw'?a.index:-1,10000,true));
 assert.deepEqual(analyzeBotDecision(JSON.parse(JSON.stringify(input)),level),analysis,'restoring a saved position does not reroll the AI choice');
}
assert.equal(JSON.stringify(p),before);assert.deepEqual(samples,[0,0,0,2,3,4,5,6,8,10]);assert.equal(stageBotProfile(6).exact,false);assert.equal(stageBotProfile(7).exact,true);assert.equal(stageBotProfile(10).scoreRisk,3);
console.log('PASS: all 10 stage policies select legal deterministic actions, honor the stage selector, ignore concealed information and survive exact JSON recovery; increasing combination/response/lookahead/score-risk capabilities.');
