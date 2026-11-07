// Pre-rework journey save compatibility; current RPG rules: rpg-rework.test.tsx.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRpgJourneyGame,enterJourneyNode} from './fixtures/legacy-rpg-journey';
import {reconcileRpgEliminations,chooseRpgStageReward} from '../lib/rpg-phase-one';
import {journeyNodeState,validateJourneySave} from '../lib/rpg-journey';
import {RpgPreviewSession} from '../lib/rpg-preview';
import {saveRpgGame,readRpgArchive} from '../lib/rpg-storage';

test('three lives retry the same stage with a fresh deal and preserve inventory and coins exactly once',()=>{
 const game=createRpgJourneyGame('방랑자');let run=game.rpgRun!;
 assert.equal(run.fate,3);run.coins=99;run.consumables=['emergency-herb','emergency-herb'];
 for(let attempt=0;attempt<3;attempt++){
  enterJourneyNode(game,'battle-1');assert.equal(game.phase,'playing');assert.equal(game.players[0].hand.length,10);
  run=game.rpgRun!;run.hp[0]=0;assert.ok(reconcileRpgEliminations(game));run=game.rpgRun!;
  assert.equal(run.fate,2-attempt);assert.equal(run.coins,99);assert.deepEqual(run.consumables,['emergency-herb','emergency-herb']);assert.deepEqual(run.relics,['cracked-heart']);
  assert.equal(reconcileRpgEliminations(game),false);assert.equal(game.rpgRun!.fate,2-attempt);
  assert.equal(run.status,attempt<2?'playing':'game-over');assert.equal(run.hp[0],attempt<2?100:0);
  if(attempt<2){assert.equal(run.journey!.location,'map');assert.equal(journeyNodeState(run,'battle-1'),'available');validateJourneySave(game);const data=new Map<string,string>();const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};saveRpgGame(storage,game);const restored=readRpgArchive(storage).active!.rpgRun!;assert.equal(restored.fate,2-attempt);assert.equal(restored.journey!.retryStage,1);assert.equal(restored.coins,99);assert.deepEqual(restored.consumables,run.consumables);}
 }
});
test('stage two retry does not advance stage or award the prior clear again',()=>{
 const game=createRpgJourneyGame('방랑자');enterJourneyNode(game,'battle-1');game.rpgRun!.hp=[100,0,0];reconcileRpgEliminations(game);game.rpgRun=chooseRpgStageReward(game.rpgRun!,'coins');enterJourneyNode(game,'battle-2');
 const coins=game.rpgRun!.coins;game.rpgRun!.hp[0]=0;reconcileRpgEliminations(game);assert.equal(game.rpgRun!.stage,2);assert.equal(game.rpgRun!.coins,coins);assert.equal(journeyNodeState(game.rpgRun!,'battle-2'),'available');enterJourneyNode(game,'battle-2');assert.equal(game.rpgRun!.stage,2);assert.equal(game.players[0].hand.length,10);assert.deepEqual(game.rpgRun!.phaseOne!.clearedStages,[1]);
});
test('result preview fixtures use isolated real settlements and old active journeys gain the life schema once',()=>{
 const game=createRpgJourneyGame('테스트');const preview=new RpgPreviewSession(game,'screens');
 for(const target of ['reward-1','reward-2','reward-3','failed','mini-round','mini-final'] as const){const next=preview.screen(game,target);validateJourneySave(next);assert.equal(next.rpgRun!.status,target==='failed'?'game-over':target.startsWith('reward-')?'allocation':'ready');if(target==='mini-final')assert.equal(next.rpgRun!.journey!.mini!.roundIds.length,3);}
 assert.equal(game.rpgRun!.fate,3);assert.equal(game.rpgRun!.rounds,0);
 delete game.rpgRun!.journey!.livesVersion;game.rpgRun!.fate=0;validateJourneySave(game);assert.equal(game.rpgRun!.fate,3);game.rpgRun!.fate=2;validateJourneySave(game);assert.equal(game.rpgRun!.fate,2);
});
