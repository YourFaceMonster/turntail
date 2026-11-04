import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRpgJourneyGame,enterJourneyNode} from '../lib/rpg-game';
import {reconcileRpgEliminations,chooseRpgStageReward,RPG_PHASE_ONE} from '../lib/rpg-phase-one';
import {saveRpgGame,readRpgArchive} from '../lib/rpg-storage';

test('each stage grants relic, coins and healing together once, including save/resume and final clear',()=>{
 const game=createRpgJourneyGame('보상 검증');
 for(let stage=1;stage<=3;stage++){
  enterJourneyNode(game,`battle-${stage}` as 'battle-1'|'battle-2'|'battle-3');
  game.rpgRun!.hp=[40,0,0];reconcileRpgEliminations(game);
  const before=structuredClone(game.rpgRun!),id=before.phaseOne!.clear!.relicId;
  game.rpgRun=chooseRpgStageReward(before,'all');
  assert.equal(game.rpgRun.coins,before.coins+RPG_PHASE_ONE.rewardCoins);
  assert.equal(game.rpgRun.hp[0],before.hp[0]+20);
  assert.ok(game.rpgRun.relics.includes(id));assert.ok(before.relics.every(x=>game.rpgRun!.relics.includes(x)));
  assert.equal(new Set(game.rpgRun.relics).size,game.rpgRun.relics.length);assert.ok(game.rpgRun.equipped.length<=3);
  assert.equal(game.rpgRun.phaseOne!.rewardHistory!.length,stage);
  assert.equal(game.rpgRun.phaseOne!.clear!.chosen,'all');
  const data=new Map<string,string>(),store={getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>{data.set(k,v);}};
  saveRpgGame(store,game);const resumed=readRpgArchive(store).active;
  if(resumed)assert.throws(()=>chooseRpgStageReward(resumed.rpgRun!,'all'));
  assert.throws(()=>chooseRpgStageReward(game.rpgRun!,'all'));
  assert.equal(game.rpgRun.status,stage===3?'complete':'ready');
 }
});

test('all rewards cap healing at 100 and still grant coins when the relic pool is exhausted',()=>{
 const game=createRpgJourneyGame('가득 찬 보상');enterJourneyNode(game,'battle-1');
 game.rpgRun!.relics=[...RPG_PHASE_ONE.relicPool];game.rpgRun!.equipped=game.rpgRun!.relics.slice(0,3);
 game.rpgRun!.hp=[99,0,0];reconcileRpgEliminations(game);const before=structuredClone(game.rpgRun!);
 game.rpgRun=chooseRpgStageReward(game.rpgRun!,'all');
 assert.equal(game.rpgRun.hp[0],100);assert.equal(game.rpgRun.coins,before.coins+30);
 assert.deepEqual(game.rpgRun.relics,before.relics);assert.deepEqual(game.rpgRun.equipped,before.equipped);
});
