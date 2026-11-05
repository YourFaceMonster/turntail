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
  game.rpgRun=chooseRpgStageReward(before,'all',undefined,false,before.phaseOne!.clear!.relicOffers?.[0]);
  assert.equal(game.rpgRun.coins,before.coins+RPG_PHASE_ONE.rewardCoins);
  assert.equal(game.rpgRun.hp[0],before.hp[0]+30);
  assert.ok(game.rpgRun.relics.includes(id));assert.ok(before.relics.every(x=>game.rpgRun!.relics.includes(x)));
  assert.equal(new Set(game.rpgRun.relics).size,game.rpgRun.relics.length);assert.ok(game.rpgRun.equipped.length<=3);
  assert.equal(game.rpgRun.phaseOne!.rewardHistory!.length,stage);
  assert.equal(game.rpgRun.phaseOne!.clear!.chosen,'all');
  const data=new Map<string,string>(),store={getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>{data.set(k,v);}};
  saveRpgGame(store,game);const resumed=readRpgArchive(store).active;
  if(resumed)assert.throws(()=>chooseRpgStageReward(resumed.rpgRun!,'all'));
  assert.throws(()=>chooseRpgStageReward(game.rpgRun!,'all',undefined,false,game.rpgRun!.phaseOne!.clear!.relicOffers?.[0]));
  assert.equal(game.rpgRun.status,stage===3?'complete':'ready');
 }
});

test('base healing is granted only on reward claim and only once',()=>{
 const game=createRpgJourneyGame('회복 검증');enterJourneyNode(game,'battle-1');
 game.rpgRun!.equipped=[];game.rpgRun!.hp=[40,0,0];reconcileRpgEliminations(game);
 assert.equal(game.rpgRun!.hp[0],40);assert.equal(game.rpgRun!.phaseOne!.clear!.baseHeal,0);
 game.rpgRun=chooseRpgStageReward(game.rpgRun!,'all');assert.equal(game.rpgRun.hp[0],70);
 assert.throws(()=>chooseRpgStageReward(game.rpgRun!,'all'));assert.equal(game.rpgRun.hp[0],70);
});

test('all rewards cap healing at 100 and still grant coins when the relic pool is exhausted',()=>{
 const game=createRpgJourneyGame('가득 찬 보상');enterJourneyNode(game,'battle-1');
 game.rpgRun!.relics=[...RPG_PHASE_ONE.relicPool];game.rpgRun!.equipped=game.rpgRun!.relics.slice(0,3);
 game.rpgRun!.hp=[99,0,0];reconcileRpgEliminations(game);const before=structuredClone(game.rpgRun!);
 game.rpgRun=chooseRpgStageReward(game.rpgRun!,'all');
 assert.equal(game.rpgRun.hp[0],100);assert.equal(game.rpgRun.coins,before.coins+30);
 assert.deepEqual(game.rpgRun.relics,before.relics);assert.deepEqual(game.rpgRun.equipped,before.equipped);
});

test('resumed old pending clears count the already received 10 HP toward the same 30 HP',()=>{
 const game=createRpgJourneyGame('기존 회복 저장');enterJourneyNode(game,'battle-1');
 game.rpgRun!.equipped=[];game.rpgRun!.hp=[40,0,0];reconcileRpgEliminations(game);
 game.rpgRun!.hp[0]=50;game.rpgRun!.phaseOne!.clear!.baseHeal=10;
 const data=new Map<string,string>(),storage={getItem:(key:string)=>data.get(key)||null,setItem:(key:string,value:string)=>{data.set(key,value);}};
 saveRpgGame(storage,game);const resumed=readRpgArchive(storage).active!;
 const before=JSON.stringify(resumed.rpgRun),claimed=chooseRpgStageReward(resumed.rpgRun!,'all');
 assert.equal(claimed.hp[0],70);assert.equal(claimed.hp[0]-40,30);
 assert.equal(JSON.stringify(resumed.rpgRun),before,'claim leaves the source save untouched');
 assert.throws(()=>chooseRpgStageReward(claimed,'all'));assert.equal(claimed.hp[0],70);
});

test('old partial base heal at the HP cap and independent relic recovery remain intact',()=>{
 for(const [hpBefore,baseHeal,relicHeal,synergyHeal,expected] of [[95,5,0,0,100],[40,10,5,2,77]]){
  const game=createRpgJourneyGame('기존 추가 회복');enterJourneyNode(game,'battle-1');
  game.rpgRun!.equipped=[];game.rpgRun!.hp=[hpBefore,0,0];reconcileRpgEliminations(game);
  Object.assign(game.rpgRun!.phaseOne!.clear!,{baseHeal,relicHeal,synergyHeal});
  game.rpgRun!.hp[0]=hpBefore+baseHeal+relicHeal+synergyHeal;
  assert.equal(chooseRpgStageReward(game.rpgRun!,'all').hp[0],expected);
 }
});
