import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {settle,type Game} from '../lib/game.ts';
import {createRpgJourneyGame,createRpgTestGame,enterJourneyNode} from '../lib/rpg-game.ts';
import {reconcileRpgEliminations} from '../lib/rpg-phase-one.ts';
import {RpgPreviewSession} from '../lib/rpg-preview.ts';
import {journeyNodeState,returnJourneyMap,startJourneyMini,activeJourneyMini,validateJourneySave} from '../lib/rpg-journey.ts';
import {RpgHub} from '../app/components/RpgJourney.tsx';
import {RpgPreviewLabel} from '../app/components/RpgPreviewTools.tsx';
import {saveRpgGame} from '../lib/rpg-storage.ts';

function finishHand(game:Game,winner=1){game.phase='ended';game.winner=winner;game.players[winner].hand=[];settle(game);}

test('RPG hub offers two distinct test entries and names their no-save scope',()=>{
 const noop=()=>{},html=renderToStaticMarkup(h(RpgHub,{active:null,records:[],start:noop,resume:noop,testActive:null,testStart:noop,testResume:noop,previewStart:noop,close:noop,error:''}));
 for(const label of ['프롤로그·화면 테스트','한 판 통과 테스트','테스트 진행은 저장하지 않아요','ST1~3'])assert.ok(html.includes(label));
 const tools=renderToStaticMarkup(h(RpgPreviewLabel,{mode:'one-round',exit:noop}));assert.ok(tools.includes('테스트 종료'));assert.ok(tools.includes('한 판 후 자동 통과'));
});
test('screen preview uses unchanged RPG rules, while a foreign game and the existing equipment test are never adapted',()=>{
 const game=createRpgJourneyGame('화면'),session=new RpgPreviewSession(game,'screens');enterJourneyNode(game,'battle-1');finishHand(game);
 const before=JSON.stringify(game);assert.equal(session.update(game),false);assert.equal(JSON.stringify(game),before);assert.equal(game.rpgRun!.status,'playing');
 const other=createRpgJourneyGame('실제 RPG'),old=JSON.stringify(other);assert.equal(session.owns(other),false);assert.equal(session.update(other),false);assert.equal(JSON.stringify(other),old);
 assert.throws(()=>new RpgPreviewSession(createRpgTestGame('기존 장비'),'one-round'));
});
test('one losing hand per stage unlocks the map, tavern and branch, and ends at stage three exactly once',()=>{
 const game=createRpgJourneyGame('빠른 확인'),session=new RpgPreviewSession(game,'one-round');
 for(let stage=1;stage<=3;stage++){
  enterJourneyNode(game,`battle-${stage}` as 'battle-1'|'battle-2'|'battle-3');session.update(game);const coinsBefore=game.rpgRun!.coins;finishHand(game,1);
  const settledCoins=Math.max(0,coinsBefore+game.result!.players[0].delta);assert.equal(game.rpgRun!.coins,settledCoins);
  assert.ok(game.rpgRun!.hp.slice(1).some(hp=>hp>0),'surviving enemies do not block this preview');
  assert.equal(session.update(game),true);const after=JSON.stringify(game);assert.equal(session.update(game),false);assert.equal(JSON.stringify(game),after);
  assert.equal(game.rpgRun!.rounds,stage);assert.equal(game.rpgRun!.phaseOne!.rewardHistory!.length,stage);assert.equal(game.rpgRun!.coins,settledCoins+30,'preview clear rewards once without charging round losses twice');
  if(stage===1){assert.equal(journeyNodeState(game.rpgRun!,'tavern'),'available');enterJourneyNode(game,'tavern');returnJourneyMap(game);}
  if(stage===2)assert.equal(journeyNodeState(game.rpgRun!,'ruins'),'available');
 }
 assert.equal(game.rpgRun!.stage,3);assert.equal(game.rpgRun!.status,'complete');assert.equal(game.rpgRun!.phaseOne!.clearedStages.length,3);assert.deepEqual(game.rpgRun!.unlocked,[]);
});
test('HP zero still advances a disposable run, preserving its gear and leaving the real RPG archive byte-for-byte intact',()=>{
 const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
 const real=createRpgJourneyGame('기존 저장'),original=JSON.stringify(real);saveRpgGame(storage,real);const saved=[...values.entries()];
 const game=createRpgJourneyGame('테스트'),session=new RpgPreviewSession(game,'one-round'),gear=[...game.rpgRun!.relics];enterJourneyNode(game,'battle-1');session.update(game);
 game.rpgRun!.hp[0]=0;reconcileRpgEliminations(game);assert.equal(game.rpgRun!.status,'game-over');assert.deepEqual(game.rpgRun!.relics,[]);
 assert.equal(session.update(game),true);assert.equal(game.rpgRun!.status,'ready');assert.equal(journeyNodeState(game.rpgRun!,'battle-2'),'available');assert.deepEqual(game.rpgRun!.relics,gear);assert.equal(game.rpgRun!.rounds,1);
 assert.deepEqual([...values.entries()],saved);assert.equal(JSON.stringify(real),original);
});
test('natural clears do not duplicate settlement or rewards; tavern mini-games retain their own three-round rules',()=>{
 const game=createRpgJourneyGame('정상 클리어'),session=new RpgPreviewSession(game,'one-round');enterJourneyNode(game,'battle-1');session.update(game);game.rpgRun!.hp=[60,0,0];reconcileRpgEliminations(game);
 assert.equal(game.rpgRun!.status,'allocation');session.update(game);assert.equal(game.rpgRun!.rounds,1);assert.equal(game.rpgRun!.coins,30);
 enterJourneyNode(game,'tavern');startJourneyMini(game);const mini=activeJourneyMini(game)!;finishHand(mini);const before=JSON.stringify(game);assert.equal(session.update(game),false);assert.equal(JSON.stringify(game),before);
});
test('screen preview opens the tavern and every stage directly without playing a hand, and can go back freely',()=>{
 const game=createRpgJourneyGame('화면 바로가기'),session=new RpgPreviewSession(game,'screens'),original=JSON.stringify(game);
 const map=session.screen(game,'map');assert.equal(journeyNodeState(map.rpgRun!,'tavern'),'available');
 for(const target of ['tavern','battle-3','map','battle-1','battle-2','tavern','prologue'] as const){
  const scene=session.screen(game,target);assert.equal(session.owns(scene),true);validateJourneySave(scene);
  if(target.startsWith('battle-')){assert.equal(scene.rpgRun!.stage,Number(target.slice(7)));assert.equal(scene.phase,'playing');}
  else assert.equal(scene.rpgRun!.journey!.location,target==='tavern'?'tavern':'map');
  assert.equal(scene.roundActions,0,'fixtures require no hand actions');
 }
 assert.equal(JSON.stringify(game),original,'changing screens never mutates the source game');
 const oneRound=new RpgPreviewSession(game,'one-round');assert.throws(()=>oneRound.screen(game,'tavern'));
 assert.throws(()=>session.screen(createRpgJourneyGame('실제 여정'),'tavern'));
});
test('the screen-only toolbar offers a no-combat tavern shortcut and prologue replay',()=>{
 const tools=renderToStaticMarkup(h(RpgPreviewLabel,{mode:'screens',exit:()=>{},screen:()=>{}}));
 for(const label of ['테스트 화면 바로가기','주점 바로 보기','지도 보기','프롤로그 다시 보기','ST1 전투 화면','ST2 전투 화면','ST3 전투 화면'])assert.ok(tools.includes(label));
 const oneRound=renderToStaticMarkup(h(RpgPreviewLabel,{mode:'one-round',exit:()=>{},screen:()=>{}}));assert.ok(!oneRound.includes('<select'));
});
