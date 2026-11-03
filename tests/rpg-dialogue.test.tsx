import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {act,view,type Game,type Tile} from '../lib/game';
import {createRpgJourneyGame,enterJourneyNode} from '../lib/rpg-game';
import {reconcileRpgEliminations,chooseRpgStageReward} from '../lib/rpg-phase-one';
import {startLetterQuest,startLetterDuel,startJourneyMini,activeJourneyMini,settleJourneyMini,nextJourneyMiniRound,leaveJourneyMini,returnLetterToMor,returnJourneyMap,journeyNodeState} from '../lib/rpg-journey';
import {saveRpgGame,readRpgArchive} from '../lib/rpg-storage';
import {THIEF_RESULTS,SERIN_RESULTS,QUEST_DIALOGUE,PIO_DIALOGUE,morDialogue} from '../lib/rpg-dialogue';
import {RpgMiniResult} from '../app/components/RpgJourneyScene';
import {FIRST_PROLOGUE,SECOND_PROLOGUE} from '../lib/rpg-prologue';
import {RPG_CONNECTION_SCENES} from '../lib/rpg-connection-scenes';
const noop=()=>{};
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
function ready(){const g=createRpgJourneyGame('대사 검증','',0,'cleric');enterJourneyNode(g,'battle-1');g.rpgRun!.hp=[60,0,0];reconcileRpgEliminations(g);g.rpgRun=chooseRpgStageReward(g.rpgRun!,'coins');enterJourneyNode(g,'tavern');return g;}
function round(g:Game,scores?:number[]){const c=activeJourneyMini(g)!;c.turn=0;c.trick=[];c.lastBy=null;c.turnReadyAt=0;c.players[0].hand=[tile(2,3)];c.players[1].hand=[tile(3),tile(4)];c.players[2].hand=[tile(5,1),tile(6,1),tile(7,1)];act(c,0,'play',[tile(2,3).id],-1,100);if(scores)c.players.forEach((p,i)=>{p.points=scores[i];});settleJourneyMini(g,101);}
function finish(g:Game,scores:number[]){for(let i=0;i<3;i++){if(i)nextJourneyMiniRound(g);round(g,i===2?scores:undefined);}}
function restore(g:Game){const data=new Map<string,string>(),store={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);}};saveRpgGame(store,g);return readRpgArchive(store).active!;}
function markup(g:Game){const c=activeJourneyMini(g)!;return renderToStaticMarkup(h(RpgMiniResult,{game:view(c,c.players[0].token),busy:false,next:noop,back:noop,exit:noop}));}
for(const [scores,outcome] of [[[30,20,10],'win'],[[20,30,10],'second'],[[10,30,20],'third'],[[30,30,10],'second'],[[30,30,30],'second']] as const){
 test(`letter duel ${scores.join('/')} reacts as ${outcome}, survives save and preserves parent resources`,()=>{
  let g=ready();g.rpgRun=startLetterQuest(g.rpgRun!);enterJourneyNode(g,'letter-alley');startLetterDuel(g);
  const before={coins:g.rpgRun!.coins,hp:[...g.rpgRun!.hp],items:[...g.rpgRun!.consumables],relics:[...g.rpgRun!.relics]};
  finish(g,[...scores]);assert.ok(markup(g).includes(THIEF_RESULTS[outcome]));
  assert.equal(g.rpgRun!.coins,before.coins);assert.deepEqual(g.rpgRun!.hp,before.hp);assert.deepEqual(g.rpgRun!.consumables,before.items);assert.deepEqual(g.rpgRun!.relics,before.relics);
  assert.equal(activeJourneyMini(g)!.rpgMini!.won,outcome==='win');g=restore(g);assert.ok(markup(g).includes(THIEF_RESULTS[outcome]));leaveJourneyMini(g);
  if(outcome==='win'){
   g.rpgRun=returnLetterToMor(g.rpgRun!);assert.equal(g.rpgRun!.coins,before.coins+10);assert.equal(g.rpgRun!.journey!.letterQuest!.step,'complete');assert.ok(g.rpgRun!.journey!.rumors.includes('sealed-letter-relic'));assert.throws(()=>returnLetterToMor(g.rpgRun!));assert.deepEqual(morDialogue(g.rpgRun!.journey!.letterQuest),QUEST_DIALOGUE.morComplete);
  }else if(outcome==='third'){
   assert.equal(g.rpgRun!.journey!.location,'tavern');assert.equal(g.rpgRun!.journey!.letterQuest!.step,'failed');assert.deepEqual(morDialogue(g.rpgRun!.journey!.letterQuest),QUEST_DIALOGUE.morFailed);assert.throws(()=>returnLetterToMor(g.rpgRun!));assert.throws(()=>startLetterQuest(g.rpgRun!));
   g.rpgRun!.journey!.location='market-alley';assert.throws(()=>startLetterDuel(g));g.rpgRun!.journey!.location='tavern';returnJourneyMap(g);assert.equal(journeyNodeState(g.rpgRun!,'letter-alley'),'completed');enterJourneyNode(g,'battle-2');assert.equal(g.rpgRun!.stage,2);
  }else{
   assert.equal(g.rpgRun!.journey!.location,'market-alley');assert.equal(g.rpgRun!.journey!.letterQuest!.step,'alley');assert.deepEqual(morDialogue(view(g,g.players[0].token).rpgRun!.journey!.letterQuest),QUEST_DIALOGUE.morDefeated);startLetterDuel(g);assert.equal(activeJourneyMini(g)!.rpgMini!.roundIndex,1);g=restore(g);assert.deepEqual(morDialogue(g.rpgRun!.journey!.letterQuest),QUEST_DIALOGUE.morDefeated);
  }
 });
}
for(const [scores,reward,reaction] of [[[30,20,10],12,SERIN_RESULTS.win],[[20,30,10],8,SERIN_RESULTS.loss],[[10,30,20],4,SERIN_RESULTS.loss],[[30,30,10],12,undefined]] as const){
 test(`tavern ${scores.join('/')} keeps reward ${reward}, reaction and unrestricted replay`,()=>{
  const g=ready(),coins=g.rpgRun!.coins;startJourneyMini(g);round(g);assert.ok(!markup(g).includes(SERIN_RESULTS.win));nextJourneyMiniRound(g);round(g);nextJourneyMiniRound(g);round(g,[...scores]);
  const text=markup(g);if(reaction)assert.ok(text.includes(reaction));else {assert.ok(!text.includes(SERIN_RESULTS.win));assert.ok(!text.includes(SERIN_RESULTS.loss));}
  assert.equal(g.rpgRun!.coins,coins+reward);settleJourneyMini(g);assert.equal(g.rpgRun!.coins,coins+reward);leaveJourneyMini(g);startJourneyMini(g);finish(g,[30,20,10]);assert.equal(g.rpgRun!.coins,coins+reward);
 });
}
test('legacy losses derive failure or encouragement without exposing nested opponents',()=>{
 for(const [scores,step] of [[[10,30,20],'failed'],[[20,30,10],'alley']] as const){
  const g=ready();g.rpgRun=startLetterQuest(g.rpgRun!);enterJourneyNode(g,'letter-alley');startLetterDuel(g);finish(g,[...scores]);g.rpgRun!.journey!.letterQuest={step:'alley'};
  const restored=restore(g),publicJ=view(restored,restored.players[0].token).rpgRun!.journey!;assert.equal(publicJ.letterQuest!.step,step);assert.equal(publicJ.letterMini,undefined);assert.equal(publicJ.letterQuest!.defeated,true);
  leaveJourneyMini(restored);if(step==='failed'){restored.rpgRun!.journey!.location='market-alley';assert.throws(()=>startLetterDuel(restored));}else {startLetterDuel(restored);assert.equal(restored.rpgRun!.journey!.letterQuest!.defeated,true);}
 }
});
test('dialogue preserves prologue opening, follow-up prologue, speaker order and next-region narration',()=>{
 assert.deepEqual(FIRST_PROLOGUE.slice(0,4).map(c=>c.line),['모든 길에는, 시작이 있다.','북쪽 고갯길을 지나던\n한 승부사가 있었다.','하룻밤의 추위를 피할 곳이면 충분했다.','그곳에서도, 사람들은\n패를 놓고 승부를 벌였다.']);
 assert.equal(FIRST_PROLOGUE.find(c=>c.id==='P06a')!.line,'이 문양은… 처음 보는군요.');assert.equal(FIRST_PROLOGUE.find(c=>c.id==='P08')!.line,'…분명 처음 보는 문양인데.');assert.equal(SECOND_PROLOGUE[0].line,'오래된 물건이지.');
 assert.deepEqual(RPG_CONNECTION_SCENES[2].before.map(c=>c.speaker),['포코','밀라','포코','밀라']);assert.deepEqual(RPG_CONNECTION_SCENES[3].after.map(c=>c.speaker),['둘째','첫째','둘째','첫째','첫째',undefined,undefined]);
 assert.equal(RPG_CONNECTION_SCENES[3].after.at(-1)!.line,'새로운 영역을 향해, 다시 한 걸음을 내디뎠다.');assert.match(RPG_CONNECTION_SCENES[3].after.at(-1)!.art!.landscape,/moon-castle-map/);
 assert.ok(PIO_DIALOGUE.some(line=>line.includes('광장 옆 잡화점')));assert.deepEqual(morDialogue(),QUEST_DIALOGUE.morOffer);assert.deepEqual(morDialogue({step:'alley'}),QUEST_DIALOGUE.morDirections);
});
