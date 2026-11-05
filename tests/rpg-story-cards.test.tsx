import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {FIRST_PROLOGUE,PROLOGUE_STORYBOARD,PrologueClock} from '../lib/rpg-prologue.ts';
import {createRpgJourneyGame,createRpgPhaseOneGame,enterJourneyNode} from '../lib/rpg-game.ts';
import {reconcileRpgEliminations,chooseRpgStageReward} from '../lib/rpg-phase-one.ts';
import {RPG_CONNECTION_SCENES} from '../lib/rpg-connection-scenes.ts';
import {markStageStorySeen,pendingStageStory,ST3_STORY_KEY} from '../lib/rpg-story-cards.ts';
import {readRpgArchive,saveRpgGame,RPG_PHASE_ONE_STORAGE_KEY} from '../lib/rpg-storage.ts';
import StoryCardCollection from '../app/components/StoryCardCollection.tsx';
const normalize=(s:string)=>s.replace(/\s/g,'');
function memory(){const data=new Map<string,string>();return {data,getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};}
function through(stage:number){const game=createRpgJourneyGame('이야기 검사');for(let n=1;n<=stage;n++){enterJourneyNode(game,`battle-${n}` as 'battle-1');game.rpgRun!.hp=[60,0,0];reconcileRpgEliminations(game);if(n<stage)game.rpgRun=chooseRpgStageReward(game.rpgRun!,'all',undefined,false,game.rpgRun!.phaseOne?.clear?.relicOffers?.[0]);}return game;}
test('all nineteen boards retain the supplied exact words, order and speakers through sentence pagination',()=>{
 const approved=readFileSync('docs/prologue-revision-approved-2026-11-05.md','utf8');
 const boards=[...approved.matchAll(/### (P\d+)\.[^\n]*\n([\s\S]*?)(?=\n### P|\n---)/g)];assert.equal(boards.length,19);
 for(const [,id,body] of boards){const raw=body.split('**연출**')[0].replace(/\*\*[^*]+\*\*/g,'');const board=PROLOGUE_STORYBOARD.find(b=>b.id===id)!;assert.equal(normalize(board.parts.map(p=>p.line).join('')),normalize(raw),id);
  assert.equal(normalize(FIRST_PROLOGUE.filter(c=>c.storyboard===id).map(c=>c.line).join('')),normalize(raw),id+' pagination');
  for(const part of board.parts){const text=normalize(part.line);assert.ok(FIRST_PROLOGUE.filter(c=>c.storyboard===id&&c.speaker===part.speaker).some(c=>text.includes(normalize(c.line))),id+' speaker');}
 }
 assert.equal(FIRST_PROLOGUE[0].line,'패 한 장으로 시작된 여행도 있었다.');assert.equal(FIRST_PROLOGUE[0].scene,'dark');
 assert.ok(FIRST_PROLOGUE.filter(c=>c.storyboard==='P10').every(c=>c.scene==='card'&&!c.back));assert.ok(FIRST_PROLOGUE.filter(c=>['P11','P12'].includes(c.storyboard||'')).every(c=>c.back));
});
test('story keepsakes stay outside combat and grant the second card only on a real ST3 clear',()=>{
 const first=createRpgJourneyGame('보통 방랑자'),snapshot=JSON.stringify({hands:first.players.map(p=>p.hand),relics:first.rpgRun!.relics,items:first.rpgRun!.consumables});assert.deepEqual(first.rpgRun!.storyCards,['crown-two']);
 let exits=0;const intro=new PrologueClock(FIRST_PROLOGUE,()=>exits++);intro.complete();intro.complete();assert.equal(exits,1);assert.equal(JSON.stringify({hands:first.players.map(p=>p.hand),relics:first.rpgRun!.relics,items:first.rpgRun!.consumables}),snapshot);
 const second=through(2);assert.deepEqual(second.rpgRun!.storyCards,['crown-two']);
 const third=through(3),run=third.rpgRun!;assert.deepEqual(run.storyCards,['crown-two','iron-gate-two']);assert.ok(!run.relics.includes('iron-gate-two')&&!run.consumables.includes('iron-gate-two'));
 let replayed=0;new PrologueClock(RPG_CONNECTION_SCENES[3].after,()=>replayed++).complete();assert.equal(replayed,1);assert.deepEqual(run.storyCards,['crown-two','iron-gate-two']);
 third.rpgRun=chooseRpgStageReward(run,'all');assert.equal(third.rpgRun.status,'complete');assert.deepEqual(third.rpgRun.storyCards,run.storyCards);assert.throws(()=>chooseRpgStageReward(third.rpgRun!,'all'));
 assert.equal(createRpgPhaseOneGame('기존 별도 모드').rpgRun!.storyCards,undefined);
});
test('old pending clears restore collection without changing hands, ordinary rewards or records; completed keepsakes survive restart',()=>{
 const store=memory(),game=through(3);delete game.rpgRun!.storyCards;game.rpgRun!.journey!.seenScenes=['ST3_POST'];
 const old={version:1,active:game,records:[],discovered:[],unlocked:[]};store.data.set(RPG_PHASE_ONE_STORAGE_KEY,JSON.stringify(old));const bytes=store.getItem(RPG_PHASE_ONE_STORAGE_KEY),hands=JSON.stringify(game.players.map(p=>p.hand));
 const restored=readRpgArchive(store);assert.equal(store.getItem(RPG_PHASE_ONE_STORAGE_KEY),bytes,'read never rewrites legacy bytes');assert.deepEqual(restored.active!.rpgRun!.storyCards,['crown-two','iron-gate-two']);assert.equal(JSON.stringify(restored.active!.players.map(p=>p.hand)),hands);assert.deepEqual(restored.records,[]);
 assert.ok(pendingStageStory(restored.active!.rpgRun!),'old ST3 viewing flag cannot hide the new ending');restored.active!.rpgRun=markStageStorySeen(restored.active!.rpgRun!,ST3_STORY_KEY);assert.equal(pendingStageStory(restored.active!.rpgRun!),false);
 const run=restored.active!.rpgRun!;assert.deepEqual(markStageStorySeen(markStageStorySeen(run,ST3_STORY_KEY),ST3_STORY_KEY).journey!.seenScenes,['ST3_POST',ST3_STORY_KEY]);
 restored.active!.rpgRun=chooseRpgStageReward(run,'all');saveRpgGame(store,restored.active!);assert.equal(readRpgArchive(store).active,null);assert.deepEqual(readRpgArchive(store).storyCards,['crown-two','iron-gate-two']);
 const fresh=createRpgJourneyGame('다음 방랑');saveRpgGame(store,fresh);assert.deepEqual(fresh.rpgRun!.storyCards,['crown-two']);assert.deepEqual(readRpgArchive(store).storyCards,['crown-two','iron-gate-two']);
});
test('incomplete stages and malformed collection cannot invent a clear or silently overwrite saves',()=>{
 const game=createRpgJourneyGame('저장 검사'),store=memory();assert.equal(markStageStorySeen(game.rpgRun!,ST3_STORY_KEY),game.rpgRun);delete game.rpgRun!.storyCards;saveRpgGame(store,game);assert.deepEqual(readRpgArchive(store).storyCards,['crown-two']);
 const prior=store.getItem(RPG_PHASE_ONE_STORAGE_KEY)!;const bad=JSON.parse(prior);bad.active.rpgRun.storyCards=['torch-two'];store.data.set(RPG_PHASE_ONE_STORAGE_KEY,JSON.stringify(bad));const corrupt=store.getItem(RPG_PHASE_ONE_STORAGE_KEY);assert.throws(()=>readRpgArchive(store),/이야기 패/);assert.equal(store.getItem(RPG_PHASE_ONE_STORAGE_KEY),corrupt);
});
test('epilogue joins crown and gate to an uncertain torch-region lead without revealing later locations or granting replay rewards',()=>{
 const text=RPG_CONNECTION_SCENES[3].after.map(c=>c.line).join('');for(const term of ['검은 철문','숫자 2','두 개의 철문','붉은 왕관 2','겹쳐진 두 왕관','같은 묶음','성화의 영역'])assert.ok(normalize(text).includes(normalize(term)),term);
 for(const term of ['스테이지 6','스테이지 9','네 장을 모','진엔딩','두 왕의 희생'])assert.ok(!text.includes(term));
 const html=render(h(StoryCardCollection,{cards:['crown-two','iron-gate-two']}));assert.ok(html.includes('이야기의 패')&&html.includes('두 철문'));assert.equal((html.match(/<img/g)||[]).length,4);assert.ok(html.includes('/story-cards/iron-gate-two-back-v1.png')&&!html.includes('장착'));
});
