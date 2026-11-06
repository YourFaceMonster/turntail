// Pre-0.7 saved-rule compatibility; new rules have a separate integration suite.
import {createLegacyRpgPhaseOneGame as createRpgPhaseOneGame,startLegacyRpgRound as startRpgRound,createLegacyRpgGame as createRpgGame,createLegacyHpItemGame as createHpItemGame} from './fixtures/legacy-profession';
import assert from 'node:assert/strict';
import {act,view,rpgTwinBotView,type Game,type Tile} from '../lib/game.ts';

import {RPG_PHASE_ONE,reconcileRpgEliminations,chooseRpgStageReward,advanceRpgPhaseOne,rpgSynergies,chargeRpgDuel} from '../lib/rpg-phase-one.ts';
import {resolveProfessionRpgBattle} from '../lib/rpg-profession-combat.ts';
import {useProfessionActive} from '../lib/profession-actives.ts';
import {saveRpgGame,readRpgArchive,RPG_STORAGE_KEY,RPG_PHASE_ONE_STORAGE_KEY} from '../lib/rpg-storage.ts';
import {useRpgTacticalItem} from '../lib/rpg-items.ts';
import {hpBattleSummary} from '../lib/hp-battle-summary.ts';
import {placeFloorTrap} from '../lib/item-battle-rules.ts';

import {buyHpItemLoadout} from '../lib/hp-item-shop.ts';


const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const fresh=()=>{const game=createRpgPhaseOneGame('검증','',0,'swordsman');game.turnReadyAt=0;return game;};
const fight=(game:Game,actor=0,count=1)=>{game.trick=[tile(7)];game.lastBy=actor;game.tablePlay={id:crypto.randomUUID(),who:actor,tiles:game.trick};game.rpgRun!.combat!.battleTiles[actor]=count;return resolveProfessionRpgBattle(game,100)!;};
const startGame=fresh();assert.deepEqual(startGame.rpgRun!.hp,[100,70,70]);assert.deepEqual(startGame.rpgRun!.relics,['cracked-heart']);assert.equal(startGame.players.length,3);assert.deepEqual(startGame.rpgRun!.consumables,[]);assert.deepEqual(startGame.rpgRun!.enemyConsumables,{1:[],2:[]});assert.equal(startGame.players[0].hand.length,10);assert.equal(startGame.rpgRun!.combat!.actives!.gauge[0],1);

const duel=fresh();duel.rpgRun!.hp=[80,1,50];const mine=structuredClone(duel.players[0].hand),survivor=structuredClone(duel.players[2].hand),floor=structuredClone(duel.stacks);const event=fight(duel);
assert.equal(duel.phase,'playing');assert.equal(duel.rpgRun!.status,'playing');assert.deepEqual(duel.rpgRun!.phaseOne!.eliminated,[1]);assert.equal(duel.players[1].hand.length,0);assert.deepEqual(duel.players[0].hand,mine);assert.deepEqual(duel.players[2].hand,survivor);assert.deepEqual(duel.stacks,floor);assert.equal(event.roundFinal,false);
duel.turn=1;assert.throws(()=>act(duel,1,'play',[]),/퇴장/);reconcileRpgEliminations(duel);assert.equal(duel.turn,2);
const filtered=rpgTwinBotView(duel,2);assert.equal(filtered.players.length,2);assert.equal(filtered.me,1);assert.equal(filtered.players[0].hand,undefined);assert.equal(filtered.players[1].hand?.length,survivor.length);assert.equal(filtered.lastBy,0);
const nextEvent=fight(duel,0);assert.deepEqual(nextEvent.excludedSeats,[1]);assert.equal(nextEvent.damageTaken![1],0);assert.deepEqual(hpBattleSummary(nextEvent,view(duel,duel.players[0].token).players).rows.map(row=>row.seat),[0,2]);
// Two survivors alternate normally, keeping the original floor access rules.
duel.trick=[];duel.lastBy=null;duel.turn=0;duel.players[0].hand=[tile(5),tile(10)];duel.players[2].hand=[tile(6,1),tile(11,1)];duel.turnReadyAt=0;
act(duel,0,'play',[tile(5).id]);assert.equal(duel.turn,2);const accessible=view(duel,duel.players[2].token).stacks.findIndex(stack=>stack.available);assert.ok(accessible>=0);const beforeDraw=duel.players[2].hand.length;act(duel,2,'draw',[],accessible);assert.equal(duel.players[2].hand.length,beforeDraw+1);assert.equal(duel.turn,0);assert.equal(duel.trick.length,0);
duel.stacks=duel.stacks.map(()=>[null,null]);duel.turnReadyAt=0;act(duel,0,'play',[tile(10).id]);assert.equal(duel.phase,'ended');assert.equal(duel.rpgRun!.status,'playing');startRpgRound(duel,200);assert.equal(duel.players[1].hand.length,0);assert.equal(duel.players[0].hand.length,12);assert.equal(duel.players[2].hand.length,12);assert.equal(duel.cols,6);assert.equal(duel.stacks.length,18);assert.notEqual(duel.turn,1);
duel.players[0].hand=[tile(5),tile(10)];duel.players[2].hand=[tile(6,1),tile(11,1)];duel.stacks=duel.stacks.map(()=>[null,null]);duel.turn=0;duel.trick=[];duel.lastBy=null;act(duel,0,'play',[tile(5).id]);act(duel,2,'pass');assert.equal(duel.turn,0);assert.equal(duel.trick.length,0);

// Killing a current trick owner with a manual skill gives a valid fresh lead.
const active=fresh();active.turn=0;active.trick=[tile(8)];active.lastBy=1;active.rpgRun!.hp[1]=1;useProfessionActive(active,0,1,0);assert.equal(active.phase,'playing');assert.equal(active.turn,0);assert.equal(active.lastBy,null);assert.equal(active.trick.length,0);assert.throws(()=>useProfessionActive(active,0,1,3000));
const mage=createRpgPhaseOneGame('마법사','',0,'mage');mage.turn=0;mage.turnReadyAt=0;mage.rpgRun!.hp=[60,1,1];useProfessionActive(mage,0,-1,0);assert.equal(mage.rpgRun!.status,'allocation');assert.equal(mage.rpgRun!.hp[0],60);assert.equal(mage.result!.players[0].winner,true);
const item=fresh();item.turn=0;item.roundActions=3;item.completedBattles=1;item.rpgRun!.consumables=['ember-bomb'];item.rpgRun!.enemyConsumables={1:[],2:[]};item.rpgRun!.hp[1]=8;useRpgTacticalItem(item,'ember-bomb',1);assert.equal(item.rpgRun!.hp[1],0);assert.equal(item.players[1].hand.length,0);assert.equal(item.phase,'playing');
const trap=createRpgPhaseOneGame('함정 검증','',0,'rogue');trap.turn=0;trap.turnReadyAt=0;trap.rpgRun!.combat!.actives!.gauge[0]=2;trap.trick=[tile(8)];trap.lastBy=2;const trapIndex=view(trap,trap.players[0].token).stacks.findIndex(stack=>stack.available);placeFloorTrap(trap,0,trapIndex,0);trap.turn=1;trap.rpgRun!.hp[1]=4;const floorBeforeTrap=structuredClone(trap.stacks),survivingHand=structuredClone(trap.players[2].hand);act(trap,1,'draw',[],trapIndex,100);assert.equal(trap.rpgRun!.hp[1],0);assert.equal(trap.players[1].hand.length,0);assert.equal(trap.turn,2);assert.equal(trap.phase,'playing');assert.deepEqual(trap.players[2].hand,survivingHand);assert.deepEqual(trap.stacks.filter((_,index)=>index!==trapIndex),floorBeforeTrap.filter((_,index)=>index!==trapIndex));

// A fixture with legal hands drives the complete stage lifecycle without bypassing reward locks.
const journey=fresh();for(let stage=1;stage<=3;stage++){
 journey.rpgRun!.hp=[60,1,1];fight(journey);assert.equal(journey.rpgRun!.status,'allocation');assert.equal(journey.rpgRun!.phaseOne!.clear!.baseHeal,0);const hp=journey.rpgRun!.hp[0];
 assert.throws(()=>startRpgRound(journey));const once=JSON.stringify(journey.rpgRun);reconcileRpgEliminations(journey);assert.equal(JSON.stringify(journey.rpgRun),once);
 journey.rpgRun=chooseRpgStageReward(journey.rpgRun!,stage===1?'relic':stage===2?'coins':'heal');assert.throws(()=>chooseRpgStageReward(journey.rpgRun!,'coins'));
 if(stage<3){const coins=journey.rpgRun.coins,relics=[...journey.rpgRun.relics];startRpgRound(journey,stage*1000);assert.equal(journey.rpgRun.stage,stage+1);assert.equal(journey.rpgRun.hp[0],hp);assert.deepEqual(journey.rpgRun.hp.slice(1),RPG_PHASE_ONE.enemyHp[stage]);assert.equal(journey.rpgRun.coins,coins);assert.deepEqual(journey.rpgRun.relics,relics);assert.deepEqual(journey.rpgRun.phaseOne!.eliminated,[]);}
}assert.equal(journey.rpgRun!.status,'complete');assert.equal(journey.rpgRun!.stage,3);assert.equal(journey.rpgRun!.coins,30);assert.equal(journey.rpgRun!.phaseOne!.rewardHistory!.length,3);assert.throws(()=>advanceRpgPhaseOne(journey.rpgRun!));
const cap=fresh();cap.rpgRun!.hp=[95,1,1];fight(cap);assert.equal(cap.rpgRun!.hp[0],95);assert.equal(cap.rpgRun!.phaseOne!.clear!.baseHeal,0);cap.rpgRun=chooseRpgStageReward(cap.rpgRun!,'heal');assert.equal(cap.rpgRun.hp[0],100);
const full=fresh();full.rpgRun!.relics=['cracked-heart','recovery-lantern','wind-sigil','warrior-crest','life-sigil','sun-sigil'];full.rpgRun!.equipped=[...full.rpgRun!.relics];assert.equal(rpgSynergies(full.rpgRun!).length,1);full.rpgRun!.hp=[60,1,1];fight(full);assert.equal(full.rpgRun!.hp[0],67);assert.equal(full.rpgRun!.phaseOne!.clear!.synergyHeal,2);
assert.throws(()=>chooseRpgStageReward(full.rpgRun!,'relic'));const declined=chooseRpgStageReward(structuredClone(full.rpgRun!),'relic',undefined,true);assert.deepEqual(declined.relics,full.rpgRun!.relics);assert.equal(declined.phaseOne!.clear!.declined,true);
const replaced=chooseRpgStageReward(full.rpgRun!,'relic','cracked-heart');assert.equal(replaced.relics.length,6);assert.equal(rpgSynergies(replaced).length,0);assert.equal(replaced.relics.includes('crimson-fang'),true);assert.deepEqual(replaced.equipped,replaced.relics);
const failed=fresh();failed.rpgRun!.hp[0]=0;reconcileRpgEliminations(failed);assert.equal(failed.rpgRun!.status,'game-over');assert.deepEqual(failed.rpgRun!.relics,[]);assert.ok(failed.rpgRun!.discovered.includes('cracked-heart'));assert.equal(fresh().rpgRun!.stage,1);
const gauge=fresh(),initial=gauge.rpgRun!.combat!.actives!.gauge[0];chargeRpgDuel(gauge,'one',[4,4,5]);chargeRpgDuel(gauge,'one',[4,4,5]);chargeRpgDuel(gauge,'two',[4,4,5]);chargeRpgDuel(gauge,'three',[4,4,5]);assert.equal(gauge.rpgRun!.combat!.actives!.gauge[0],initial+1);

// Isolated storage preserves legacy RPG and all unrelated user data byte for byte.
const data=new Map<string,string>(),storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
const legacy=createRpgGame('기존');saveRpgGame(storage,legacy);const original=data.get(RPG_STORAGE_KEY);storage.setItem('jangseong-practice-game','untouched-normal');storage.setItem('turntale-hp-items-2-v1','untouched-hp');saveRpgGame(storage,duel,true);assert.equal(data.get(RPG_STORAGE_KEY),original);assert.equal(data.get('jangseong-practice-game'),'untouched-normal');assert.equal(data.get('turntale-hp-items-2-v1'),'untouched-hp');assert.ok(data.has(RPG_PHASE_ONE_STORAGE_KEY));assert.deepEqual(readRpgArchive(storage).active,JSON.parse(JSON.stringify(duel)));
saveRpgGame(storage,failed,true);assert.equal(readRpgArchive(storage).active,null);assert.ok(readRpgArchive(storage).discovered.includes('cracked-heart'));
const hp=createHpItemGame('회귀','',0,2,undefined,'swordsman');buyHpItemLoadout(hp,[]);assert.equal(hp.rpgRun!.phaseOne,undefined);hp.turn=0;hp.turnReadyAt=0;hp.rpgRun!.hp[1]=1;useProfessionActive(hp,0,1,0);assert.equal(hp.rpgRun!.status,'complete','HP item still ends on the first eliminated seat');
console.log('PASS: RPG 1–3 lifecycle, 3→2 stable-seat play/draw/pass/redeal, eliminated targeting/results, active/item kills, reward locks/heal caps, 6-slot replacement/decline, synergy on/off, death, idempotence, isolated saves, legacy and HP-item behavior.');
