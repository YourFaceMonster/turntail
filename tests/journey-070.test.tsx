import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {createRpgJourneyGame,enterJourneyNode} from '../lib/rpg-game.ts';
import {reconcileRpgEliminations,chooseRpgStageReward} from '../lib/rpg-phase-one.ts';
import {journeyNodeState,returnJourneyMap,startLetterQuest,returnLetterToMor,hearJourneyRumor,startJourneyMini,leaveJourneyMini,JOURNEY_NODES,type JourneyNode} from '../lib/rpg-journey.ts';
import {LETTER_QUEST_COINS,QUEST_DIALOGUE} from '../lib/rpg-dialogue.ts';
import {saveRpgGame,readRpgArchive,RPG_PHASE_ONE_STORAGE_KEY} from '../lib/rpg-storage.ts';
import {readSaveSlots} from '../lib/save-slots.ts';
import {JourneyMapView} from '../app/components/RpgJourneyScene.tsx';
function memory(){const data=new Map<string,string>();return {data,getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);}};}
function clear(g:ReturnType<typeof createRpgJourneyGame>,stage:number){enterJourneyNode(g,`battle-${stage}` as JourneyNode);g.rpgRun!.hp=[70,0,0];reconcileRpgEliminations(g);g.rpgRun=chooseRpgStageReward(g.rpgRun!,'coins');}
function stage2(){const g=createRpgJourneyGame('후속 검증');clear(g,1);clear(g,2);return g;}
test('ST2 preparation can start the letter quest, hear rumors and play Serin without replaying stage rewards',()=>{
 const g=stage2(),before={coins:g.rpgRun!.coins,stages:[...g.rpgRun!.phaseOne!.clearedStages]};
 assert.equal(journeyNodeState(g.rpgRun!,'tavern'),'available');enterJourneyNode(g,'tavern');
 g.rpgRun=hearJourneyRumor(g.rpgRun!);startJourneyMini(g);leaveJourneyMini(g);
 g.rpgRun=startLetterQuest(g.rpgRun!);assert.equal(journeyNodeState(g.rpgRun!,'letter-alley'),'available');
 assert.equal(g.rpgRun!.coins,before.coins);assert.deepEqual(g.rpgRun!.phaseOne!.clearedStages,before.stages);
});
test('recovered letter can leave the ST2 tavern, save, return and deliver once for 30 coins',()=>{
 let g=stage2();g.rpgRun!.journey!.letterQuest={step:'recovered'};g.rpgRun!.journey!.location='tavern';
 returnJourneyMap(g);const store=memory();saveRpgGame(store,g);g=readRpgArchive(store).active!;
 enterJourneyNode(g,'tavern');const before=g.rpgRun!.coins;g.rpgRun=returnLetterToMor(g.rpgRun!);
 assert.equal(LETTER_QUEST_COINS,30);assert.equal(g.rpgRun!.coins,before+30);assert.equal(g.rpgRun!.journey!.letterQuest!.step,'complete');
 assert.throws(()=>returnLetterToMor(g.rpgRun!));
});
test('retired path saves remain readable without changing HP, coins, quests or original stored bytes',()=>{
 const g=stage2(),store=memory();g.rpgRun!.journey!.letterQuest={step:'recovered'};saveRpgGame(store,g);
 const raw=JSON.parse(store.getItem(RPG_PHASE_ONE_STORAGE_KEY)!);Object.assign(raw.active.rpgRun.journey,{currentNode:'ruins',completedNodes:['battle-1','battle-2','ruins','town-event'],path:'ruins',branchOutcome:{path:'ruins',hpBefore:78,hpAfter:70,coins:15},townEvent:{reward:'coins',hpBefore:70,hpAfter:70,coins:5}});
 const bytes=JSON.stringify(raw);store.setItem(RPG_PHASE_ONE_STORAGE_KEY,bytes);const loaded=readRpgArchive(store).active!;
 assert.equal(store.getItem(RPG_PHASE_ONE_STORAGE_KEY),bytes);assert.equal(loaded.rpgRun!.coins,g.rpgRun!.coins);assert.deepEqual(loaded.rpgRun!.hp,g.rpgRun!.hp);
 assert.deepEqual(loaded.rpgRun!.journey!.letterQuest,{step:'recovered'});assert.equal(loaded.rpgRun!.journey!.currentNode,'battle-2');
 assert.deepEqual(loaded.rpgRun!.journey!.completedNodes,['battle-1','battle-2']);
 for(const id of ['ruins','forest','town-event']){assert.ok(!JOURNEY_NODES.some(n=>(n.id as string)===id));assert.equal(journeyNodeState(loaded.rpgRun!,id as JourneyNode),'locked');assert.throws(()=>enterJourneyNode(loaded,id as JourneyNode));}
});
test('retry restriction is explained and saved journey slots show remaining fate',()=>{
 const g=createRpgJourneyGame('재도전');enterJourneyNode(g,'battle-1');g.rpgRun!.hp[0]=0;reconcileRpgEliminations(g);
 const html=render(h(JourneyMapView,{run:g.rpgRun!,busy:false,error:'',action:()=>{},exit:()=>{}}));
 assert.ok(html.includes('재도전 대기 중에는 상점·주점·여행자를 이용할 수 없어요.'));
 assert.equal(journeyNodeState(g.rpgRun!,'tavern'),'locked');assert.equal(journeyNodeState(g.rpgRun!,'wayfarer-stop'),'locked');
 const store=memory();saveRpgGame(store,g);assert.ok(readSaveSlots(store).slots.find(s=>s.mode==='rpg')!.detail.includes('운명력 2/3'));
});
test('letter acceptance is explicit and thief ranks are explained before the duel',()=>{
 assert.ok(QUEST_DIALOGUE.morOffer.some(s=>s.includes('수락')));
 assert.ok(QUEST_DIALOGUE.morOffer.some(s=>s.includes('30')));
 assert.ok(QUEST_DIALOGUE.thief.some(s=>s.includes('2등')&&s.includes('다시 도전')));
 assert.ok(QUEST_DIALOGUE.thief.some(s=>s.includes('3등')&&s.includes('끝')));
});
