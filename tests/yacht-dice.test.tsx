import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRpgJourneyGame,enterJourneyNode} from '../lib/rpg-game';
import {settle,type Game,type Tile} from '../lib/game';
import {chooseRpgStageReward} from '../lib/rpg-phase-one';
import {journeyNodeState,returnJourneyMap,startDiceDuel,playDiceDen,validateJourneySave} from '../lib/rpg-journey';
import {reworkRewardOffers,beginReworkRound,RPG_REWORK_RELICS} from '../lib/rpg-rework';
import {DICE_DEN_STAKE,DICE_RELIC_ID} from '../lib/rpg-dice-den';
import {YACHT_CATEGORIES,allowedCategories,seatTotal,newYachtMatch,yachtScore,yachtTotal,yachtBonus,scoreYacht,rollYacht,toggleYachtHold,yachtAiStep,bestYachtHold,bestYachtBox,validYachtMatch,type YachtMatch} from '../lib/yacht-dice';
import {RpgPreviewSession} from '../lib/rpg-preview';
import YachtDiceTable,{flashFor} from '../app/components/YachtDiceTable';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
function finish(game:Game,counts:number[]){game.players.forEach((p,i)=>p.hand=Array.from({length:counts[i]},(_,j)=>tile(j%15+1,i)));game.phase='ended';game.winner=counts.indexOf(0);game.result=null;return settle(game);}
/** Clears ST1..cleared and leaves the run ready on the map. */
function readyAfter(cleared:number){
 const game=createRpgJourneyGame('주사위 검증','',0);enterJourneyNode(game,'battle-1',0);
 for(let stage=1;stage<=cleared;stage++){if(stage>1)enterJourneyNode(game,`battle-${stage}` as never,stage*1000);game.rpgRun!.hp=[game.rpgRun!.hp[0],1,40];finish(game,[0,6,3]);game.rpgRun=chooseRpgStageReward(game.rpgRun!,'relic',undefined,false,game.rpgRun!.phaseOne!.clear!.relicOffers?.[0]);}
 return game;
}
const seq=(values:number[])=>{let i=0;return ()=>values[i++%values.length];};

test('yacht scoring follows the 12-box rule set with the 63→35 bonus',()=>{
 assert.equal(yachtScore('threes',[3,3,1,3,6]),9);
 assert.equal(yachtScore('choice',[6,6,5,4,1]),22);
 assert.equal(yachtScore('four-kind',[2,2,2,2,5]),13);assert.equal(yachtScore('four-kind',[2,2,2,5,5]),0);assert.equal(yachtScore('four-kind',[4,4,4,4,4]),20);
 assert.equal(yachtScore('full-house',[2,2,5,5,5]),19);assert.equal(yachtScore('full-house',[2,2,5,5,6]),0);
 assert.equal(yachtScore('small-straight',[1,2,3,4,6]),15);assert.equal(yachtScore('small-straight',[3,4,5,6,6]),15);assert.equal(yachtScore('small-straight',[1,2,3,5,6]),0);
 assert.equal(yachtScore('large-straight',[2,3,4,5,6]),30);assert.equal(yachtScore('large-straight',[1,2,3,4,6]),0);
 assert.equal(yachtScore('yacht',[6,6,6,6,6]),50);assert.equal(yachtScore('yacht',[6,6,6,6,5]),0);
 const sheet={ones:3,twos:6,threes:9,fours:12,fives:15,sixes:18};assert.equal(yachtBonus(sheet),35);assert.equal(yachtTotal(sheet),63+35);
 assert.equal(yachtBonus({...sheet,sixes:12}),0);
});

test('turn flow: three rolls, holds survive rerolls, scoring passes the turn, 12 rounds end the match',()=>{
 let m=newYachtMatch();
 assert.throws(()=>toggleYachtHold(m,0,0),/굴려/);assert.throws(()=>scoreYacht(m,0,'choice'),/굴려/);assert.throws(()=>rollYacht(m,1));
 m=rollYacht(m,0,seq([1,2,3,4,5]));assert.deepEqual(m.dice,[1,2,3,4,5]);assert.equal(m.rollsLeft,2);
 m=toggleYachtHold(m,0,0);m=toggleYachtHold(m,0,4);m=rollYacht(m,0,()=>6);assert.deepEqual(m.dice,[1,6,6,6,5]);
 m=rollYacht(m,0,()=>2);assert.equal(m.rollsLeft,0);assert.throws(()=>rollYacht(m,0));
 m=scoreYacht(m,0,'choice');assert.equal(m.sheets[0].choice,1+2+2+2+5);assert.equal(m.turn,1);assert.equal(m.rollsLeft,3);
 assert.throws(()=>scoreYacht(m,1,'choice'),/굴려/);
 // Play the rest out with the AI on both seats' boxes (player picks the first open box).
 const random=seq([3,1,4,1,5,9%6+1,2,6,5,3,5,8%6+1,9%6+1,7%6+1,9%6+1,3,2,3,8%6+1,4,6,2,6,4,3,3]);
 let guard=0;while(m.status==='playing'&&guard++<500){if(m.turn===1)m=yachtAiStep(m,random);else{m=rollYacht(m,0,random);m=scoreYacht(m,0,YACHT_CATEGORIES.find(cat=>m.sheets[0][cat]===undefined)!);}}
 assert.equal(m.status,'ended');assert.ok(m.sheets.every(sheet=>Object.keys(sheet).length===12));assert.equal(m.round,12);
 assert.throws(()=>scoreYacht(m,0,'ones'));assert.ok(validYachtMatch(structuredClone(m)));
});

test('joker rule: +100 after a scored yacht, forced 1~6 box, then lower boxes in full',()=>{
 const at=(sheet:Record<string,number>,dice:number[]):YachtMatch=>({...newYachtMatch(),rollsLeft:1,dice,sheets:[sheet,{}]});
 // Yacht box 50, matching 4s box open → must use fours, +100.
 let m=at({yacht:50},[4,4,4,4,4]);
 assert.deepEqual(allowedCategories(m.sheets[0],m.dice),['fours']);assert.throws(()=>scoreYacht(m,0,'choice'),/조커/);
 m=scoreYacht(m,0,'fours');assert.equal(m.sheets[0].fours,20);assert.deepEqual(m.yachtBonuses,[1,0]);assert.equal(m.last?.bonus,100);assert.equal(seatTotal(m,0),50+20+100);
 // Fours filled → any open lower box, straights score in full.
 m=at({yacht:50,fours:12},[4,4,4,4,4]);
 assert.ok(!allowedCategories(m.sheets[0],m.dice).includes('ones'));
 assert.equal(scoreYacht(m,0,'large-straight').sheets[0]['large-straight'],30);assert.equal(scoreYacht(m,0,'small-straight').sheets[0]['small-straight'],15);assert.equal(scoreYacht(m,0,'full-house').sheets[0]['full-house'],20);
 // Yacht box scratched (0): joker placement still applies but no bonus.
 m=scoreYacht(at({yacht:0},[2,2,2,2,2]),0,'twos');assert.deepEqual(m.yachtBonuses,[0,0]);assert.equal(m.last?.joker,true);
 // Lower section full → any open 1~6 box, scoring 0 when it is not the face.
 const lowerFull=Object.fromEntries(YACHT_CATEGORIES.slice(6).map(cat=>[cat,cat==='yacht'?50:10])) as Record<string,number>;lowerFull.sixes=18;
 m=at(lowerFull,[6,6,6,6,6]);assert.deepEqual(allowedCategories(m.sheets[0],m.dice),['ones','twos','threes','fours','fives']);assert.equal(scoreYacht(m,0,'ones').sheets[0].ones,0);
 // First yacht is not a joker.
 assert.deepEqual(allowedCategories({},[3,3,3,3,3]),YACHT_CATEGORIES.slice());
 // The AI follows the same rule.
 const ai:YachtMatch={...newYachtMatch(),turn:1,rollsLeft:0,dice:[5,5,5,5,5],sheets:[{},{yacht:50}]};assert.equal(yachtAiStep(ai).sheets[1].fives,25);
});

test('the AI only uses the open table and makes sensible keeps',()=>{
 assert.equal(bestYachtBox({},[6,6,6,6,6]).category,'yacht');
 assert.equal(bestYachtBox({},[2,3,4,5,6]).category,'large-straight');
 assert.deepEqual(bestYachtHold({},[5,5,5,5,2]).held,[true,true,true,true,false]);
 assert.equal(bestYachtHold({},[1,2,3,4,5]).keepAll,true);
 // Full sheet except ones: everything goes to ones.
 const sheet=Object.fromEntries(YACHT_CATEGORIES.slice(1).map(cat=>[cat,0]));assert.equal(bestYachtBox(sheet,[1,1,4,4,6]).category,'ones');
 // Over many games the AI clearly beats "always take the first open box".
 let ai=0,naive=0;const rng=(()=>{let s=12345;return ()=>{s=Math.imul(s,1103515245)+12345>>>0;return 1+(s>>>16)%6;};})();
 for(let g=0;g<6;g++){let m:YachtMatch=newYachtMatch();while(m.status==='playing'){if(m.turn===1)m=yachtAiStep(m,rng);else{m=rollYacht(m,0,rng);m=scoreYacht(m,0,YACHT_CATEGORIES.find(cat=>m.sheets[0][cat]===undefined)!);}}ai+=yachtTotal(m.sheets[1]);naive+=yachtTotal(m.sheets[0]);}
 assert.ok(ai/6>naive/6+40,`AI average ${ai/6} vs naive ${naive/6}`);
 assert.ok(ai/6>=150&&ai/6<=260,`AI average in a fair range: ${ai/6}`);
});

test('dice den opens after ST4 and before ST6, and closes when the region moves on',()=>{
 assert.equal(journeyNodeState(readyAfter(3).rpgRun!,'dice-den'),'locked');
 const four=readyAfter(4);assert.equal(journeyNodeState(four.rpgRun!,'dice-den'),'available');
 assert.equal(journeyNodeState(readyAfter(5).rpgRun!,'dice-den'),'available');
 assert.equal(journeyNodeState(readyAfter(6).rpgRun!,'dice-den'),'closed');
 enterJourneyNode(four,'battle-5' as never,9000);assert.equal(journeyNodeState(four.rpgRun!,'dice-den'),'locked','not during a battle');
});

test('HP stake on a loss, draw returns the stake, a win grants the relic once',()=>{
 const game=readyAfter(4);enterJourneyNode(game,'dice-den');assert.equal(game.rpgRun!.journey!.location,'dice-den');
 const hp=game.rpgRun!.hp[0];
 let run=startDiceDuel(game.rpgRun!);assert.throws(()=>startDiceDuel(run),/진행 중/);
 game.rpgRun=run;assert.throws(()=>returnJourneyMap(game),/기권/);
 // Forfeit = loss.
 run=playDiceDen(run,{kind:'forfeit'});assert.equal(run.hp[0],hp-DICE_DEN_STAKE);assert.equal(run.journey!.diceDen!.result,'forfeit');assert.equal(run.journey!.diceDen!.losses,1);
 assert.ok(!run.relics.includes(DICE_RELIC_ID));
 // A finished game decided by the sheets: force the last AI box.
 const nearEnd=(mine:number,theirs:number):YachtMatch=>{const full=(v:number)=>Object.fromEntries(YACHT_CATEGORIES.map(cat=>[cat,0])) as Record<string,number>;const a=full(0),b=full(0);a.choice=mine;b.choice=theirs;delete b.ones;return {...newYachtMatch(),round:12,turn:1,rollsLeft:0,dice:[2,3,3,5,6],sheets:[a,b]} as YachtMatch;};
 const withMatch=(r:typeof run,m:YachtMatch)=>({...r,journey:{...r.journey!,diceDen:{...r.journey!.diceDen!,match:m,result:undefined}}});
 let lost=playDiceDen(withMatch(run,nearEnd(10,20)),{kind:'ai'});assert.equal(lost.journey!.diceDen!.result,'lose');assert.equal(lost.hp[0],hp-2*DICE_DEN_STAKE);
 const draw=playDiceDen(withMatch(run,nearEnd(20,20)),{kind:'ai'});assert.equal(draw.journey!.diceDen!.result,'draw');assert.equal(draw.hp[0],run.hp[0]);
 const won=playDiceDen(withMatch(run,nearEnd(30,20)),{kind:'ai'});assert.equal(won.journey!.diceDen!.result,'win');assert.equal(won.hp[0],run.hp[0]);
 assert.ok(won.relics.includes(DICE_RELIC_ID));assert.ok(won.discovered.includes(DICE_RELIC_ID));assert.equal(won.equipped.includes(DICE_RELIC_ID),run.equipped.length<3);
 assert.ok(won.journey!.completedNodes.includes('dice-den'));
 game.rpgRun=won;returnJourneyMap(game);assert.equal(game.rpgRun!.journey!.diceDen!.match,undefined);assert.equal(journeyNodeState(game.rpgRun!,'dice-den'),'completed');
 // Saves round-trip and corrupt dice data is rejected.
 const saved=structuredClone(game);validateJourneySave(saved);
 const bad=structuredClone(game);bad.rpgRun!.journey!.diceDen={losses:-1};assert.throws(()=>validateJourneySave(bad));
 const badMatch=structuredClone(game);badMatch.rpgRun!.journey!.diceDen={losses:0,match:{...newYachtMatch(),dice:[7,1,1,1,1]}};assert.throws(()=>validateJourneySave(badMatch));
 // HP 10 or lower cannot cover the stake.
 lost.journey!.diceDen!.match=undefined;lost={...lost,hp:[DICE_DEN_STAKE,...lost.hp.slice(1)]};assert.throws(()=>startDiceDuel(lost),/HP/);
});

test('ivory die: +2 HP at round start at 50 HP or less, never in stage reward offers',()=>{
 assert.ok(RPG_REWORK_RELICS.some(relic=>relic.id===DICE_RELIC_ID));
 for(let stage=1;stage<=9;stage++){const run=readyAfter(1).rpgRun!;run.stage=stage;run.relics=[];assert.ok(!reworkRewardOffers(run).includes(DICE_RELIC_ID));}
 const game=readyAfter(4);game.rpgRun!.relics=[...game.rpgRun!.relics,DICE_RELIC_ID];game.rpgRun!.equipped=[DICE_RELIC_ID];
 enterJourneyNode(game,'battle-5' as never,9000);
 game.rpgRun!.hp=[40,50,50];beginReworkRound(game);assert.equal(game.rpgRun!.hp[0],42);assert.equal(game.rpgRun!.roundHealth!.before[0],42);assert.equal(game.rpgRun!.relicActivations?.at(-1)?.relicId,DICE_RELIC_ID);
 game.rpgRun!.hp=[60,50,50];beginReworkRound(game);assert.equal(game.rpgRun!.hp[0],60);
 game.rpgRun!.equipped=[];game.rpgRun!.hp=[30,50,50];beginReworkRound(game);assert.equal(game.rpgRun!.hp[0],30,'only while equipped');
});

test('banners: combos, yacht, joker bonus and the 63 bonus; plain boxes stay quiet',()=>{
 const rolled=(dice:number[],sheet:Record<string,number>={}):YachtMatch=>({...newYachtMatch(),rollsLeft:1,dice,sheets:[sheet,{}]});
 let before=rolled([2,2,5,5,5]);assert.equal(flashFor(before,scoreYacht(before,0,'full-house'))?.tier,'combo');
 assert.equal(flashFor(before,scoreYacht(before,0,'choice')),null);
 before=rolled([6,6,6,6,6]);assert.equal(flashFor(before,scoreYacht(before,0,'yacht'))?.title,'요트!');
 before=rolled([3,3,3,3,3],{yacht:50});assert.equal(flashFor(before,scoreYacht(before,0,'threes'))?.score,'+100');
 before=rolled([6,6,6,6,1],{ones:3,twos:6,threes:9,fours:12,fives:15});assert.equal(flashFor(before,scoreYacht(before,0,'sixes'))?.tier,'bonus');
 assert.equal(flashFor(null,before),null);
});

test('screen test shortcut and the table render without saving',()=>{
 const base=createRpgJourneyGame('화면','',0);const session=new RpgPreviewSession(base,'screens');const shot=session.screen(base,'dice-den');
 assert.equal(shot.rpgRun!.journey!.location,'dice-den');assert.equal(shot.rpgRun!.stage,4);
 const run=startDiceDuel(shot.rpgRun!),den=run.journey!.diceDen!;
 const html=renderToStaticMarkup(<YachtDiceTable den={den} match={rollYacht(den.match!,0,seq([6,6,6,2,1]))} hp={run.hp[0]} equipped={run.equipped} busy={false} playerName="방랑자" play={()=>{}} retry={()=>{}} leave={()=>{}}/>);
 assert.match(html,/요트다이스/);assert.match(html,/풀하우스/);
 // Fixed-score combos carry their score in the box hint.
 for(const hint of ['4연속 · 15점','5연속 · 30점','모두 같음 · 50점'])assert.ok(html.includes(hint),hint);
 // Shared in-game chrome: topbar, seat card, hand panel and action buttons.
 for(const cls of ['table-v211','topbar','seat-card','hand-panel','own-status-card','action-buttons'])assert.match(html,new RegExp(`class="[^"]*${cls}`));assert.match(html,/초이스에 21점 기록/);assert.match(html,/다시 굴리기 \(2회\)/);
});
