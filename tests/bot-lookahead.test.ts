import assert from 'node:assert/strict';
import {act,view,legalOptions,chooseBotAction,type Game,type BotAction} from '../lib/game.ts';
import {analyzeBotDecision} from '../lib/bot.ts';
import {chooseLegacyAction} from './fixtures/bot-v036.ts';
import {tile as t,positionGame,seededGame} from './fixtures/strategy-positions.ts';
const hand=[t(3),t(3,1),t(3,2),t(8),t(8,1),t(10)],other=[t(8,2),t(2,2),t(2,1),t(12,1)];
const dilemma=(known=false)=>positionGame([hand,other],[t(9)],[t(2,3)],known);
function decide(g:Game){return chooseBotAction(view(g,g.players[g.turn].token));}
function apply(g:Game,a:BotAction){act(g,g.turn,a.type,a.type==='play'?a.tiles.map(t=>t.id):[],a.type==='draw'?a.index:-1,10000,true);}
function choices(g:Game):BotAction[]{const p=view(g,g.players[g.turn].token),out:BotAction[]=legalOptions(g.players[g.turn].hand,g.trick).map(o=>({type:'play',tiles:o.tiles}));if(g.trick.length){p.stacks.forEach((s,index)=>{if(s.available)out.push({type:'draw',index});});if(!g.stacks.some(s=>s[0]||s[1]))out.push({type:'pass'});}return out;}
// Independent exhaustive winner oracle uses the real act() transitions, not the
// bot's simulator or evaluation function. Opponent always selects a refutation.
function canForceWin(g:Game,memo=new Map<string,boolean>()):boolean{
 if(g.phase==='ended')return g.winner===0;
 const key=JSON.stringify([g.turn,g.lastBy,g.trick.map(t=>t.id),g.players.map(p=>p.hand.map(t=>t.id).sort((a,b)=>a-b)),g.stacks]);const hit=memo.get(key);if(hit!==undefined)return hit;
 for(const a of choices(g)){const next=structuredClone(g);apply(next,a);const win=canForceWin(next,memo);if(win===(g.turn===0)){memo.set(key,win);return win;}}
 const win=g.turn!==0;memo.set(key,win);return win;
}
let g=dilemma(true),p=view(g,g.players[0].token),old=chooseLegacyAction(p),analysis=analyzeBotDecision(p);
assert.deepEqual(old,{type:'play',tiles:[t(10)]});assert.deepEqual(analysis.action,{type:'draw',index:0});assert.equal(analysis.method,'exact');
const loses=structuredClone(g),wins=structuredClone(g);apply(loses,old);apply(wins,analysis.action);assert.equal(canForceWin(loses),false);assert.equal(canForceWin(wins),true);
g=dilemma();assert.deepEqual(decide(g),{type:'draw',index:0},'also values the visible stopper without access to opponent hands');
g=positionGame([[t(10)],[t(12),t(13)]],[t(9)],[t(2,3)]);assert.deepEqual(decide(g),{type:'play',tiles:[t(10)]},'win now instead of taking the strongest tile');
g=positionGame([[t(1,3),t(3)],[t(12)]],[t(9)],[t(2,3)],true);assert.deepEqual(decide(g),{type:'play',tiles:[t(1,3)]},'do not give a one-tile opponent the lead to acquire red two');
g=positionGame([[t(8),t(9,1),t(10,2),t(11,3),t(2,3)],[t(4),t(6,1),t(7,2),t(13,3)]],[t(1,3)],[t(12)]);assert.deepEqual(decide(g),{type:'draw',index:0},'complete straight while preserving the red-two entry');
g=positionGame([[t(3),t(3,1),t(3,2),t(8),t(8,1),t(2,3)],[t(4),t(5),t(6)]],[],[t(12)]);assert.deepEqual(decide(g),{type:'play',tiles:[t(2,3)]},'secure lead then finish the intact full house');
g=positionGame([[t(4),t(4,2),t(1),t(1,3)],[t(9),t(9,1)]],[],[],true);assert.deepEqual(decide(g),{type:'play',tiles:[t(1),t(1,3)]},'higher pair is required when the lower pair lets the opponent finish');
// Infer an opponent only when the entire remaining deck is accounted for.
g=dilemma();const held=new Set([...g.players.flatMap(p=>p.hand),...g.stacks.flat().filter(Boolean)].map(t=>t!.id));g.playedTiles=Array.from({length:60},(_,id)=>t(Math.floor(id/4)+1,id%4)).filter(t=>!held.has(t.id));analysis=analyzeBotDecision(view(g,g.players[0].token));assert.equal(analysis.method,'exact');assert.deepEqual(analysis.action,{type:'draw',index:0});
// Hidden information and input order cannot influence the decision or seed.
g=seededGame(9981,3);p=view(g,g.players[g.turn].token);const snapshot=JSON.stringify(p),first=analyzeBotDecision(p),tampered=structuredClone(p);
for(let i=0;i<tampered.players.length;i++)if(i!==p.me)tampered.players[i].hand=[t(2,3)];
for(const s of tampered.stacks)if(s.upper)s.lower=t(2,3);
assert.deepEqual(analyzeBotDecision(tampered),first);assert.equal(JSON.stringify(p),snapshot);assert.deepEqual(analyzeBotDecision(p),first);
const reversed=structuredClone(p);reversed.players[p.me].hand!.reverse();assert.deepEqual(analyzeBotDecision(reversed).action,first.action);
assert.ok(first.nodes<=3000,'normal lookahead uses a bounded number of simulated turns');
// Cross-check small public endgames against an independent full search.
let checked=0;for(let seed=1;seed<=24;seed++){
 const dealt=seededGame(seed*173,2),h0=dealt.players[0].hand.slice(0,3+seed%2),h1=dealt.players[1].hand.slice(0,3+(seed+1)%2),tr=seed%2?[dealt.players[1].hand[8]]:[],floor=seed%3===0?[dealt.stacks[0][0]!]:[];
 const game=positionGame([h0,h1],tr,floor,true),optimal=canForceWin(game),decision=decide(game),after=structuredClone(game);apply(after,decision);assert.equal(canForceWin(after),optimal,`public endgame ${seed} must preserve a forced win when one exists`);checked++;
}
console.log(`PASS: red-two acquisition beats losing legacy move; exact proof via real rules; hidden-info invariance; immediate win; no gifting finish; intact combos; ${checked} oracle endgames; deterministic bounded lookahead.`);
