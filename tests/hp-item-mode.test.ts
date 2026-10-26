import assert from 'node:assert/strict';
import {createHpItemGame,readHpItemArchive,saveHpItemGame,HP_ITEM_STORAGE_KEY,hpItemRanks} from '../lib/hp-item-mode.ts';
import {act,settle,botMove,view} from '../lib/game.ts';
import {startRpgRound} from '../lib/rpg-game.ts';
import {useRpgTacticalItem,RPG_BASIC_ITEMS} from '../lib/rpg-items.ts';
import {saveSingleGame,readSaveSlots} from '../lib/save-slots.ts';
import {saveRpgGame,RPG_STORAGE_KEY} from '../lib/rpg-storage.ts';
import {RPG_TEST_STORAGE_KEY} from '../lib/rpg-test-storage.ts';
import {canSkipEntrance,type EntrancePhase} from '../lib/atmosphere.ts';
import {runLocalBot} from '../lib/local-bot.ts';
const fresh=()=>{const g=createHpItemGame('정식 아이템전');g.turn=0;g.trick=[];g.completedBattles=1;g.roundActions=g.players.length;g.rpgRun!.equipped=[];return g;};
const g=fresh();assert.equal(g.hpItemMode,true);assert.equal(g.rpgTest,undefined);assert.equal(view(g,g.players[0].token).hpItemMode,true);
assert.equal(g.rpgRun!.consumables.length,10);for(const id of RPG_BASIC_ITEMS)assert.equal(g.rpgRun!.consumables.filter(held=>held===id).length,2);
for(let round=1;round<=7;round++){
 g.phase='ended';g.winner=0;g.result=null;g.players[0].hand=[];g.players.slice(1).forEach(player=>{player.hand=player.hand.slice(0,1);});
 settle(g);assert.equal(g.rpgRun!.status,'playing',`HP-positive item matches continue beyond round ${round}`);assert.equal(g.rpgRun!.rounds,round);
 const hp=[...g.rpgRun!.hp],inventory=[...g.rpgRun!.consumables];startRpgRound(g);assert.deepEqual(g.rpgRun!.hp,hp);assert.deepEqual(g.rpgRun!.consumables,inventory,'next round never silently replenishes items');
}
const cardEnd=fresh();cardEnd.rpgRun!.hp=[10,100,1];cardEnd.phase='ended';cardEnd.winner=0;cardEnd.players[0].hand=[];cardEnd.players.slice(1).forEach(player=>{player.hand=player.hand.slice(0,1);});settle(cardEnd);
assert.equal(cardEnd.rpgRun!.status,'complete');assert.equal(cardEnd.rpgRun!.hp[2],0);assert.equal(cardEnd.winner,1,'final HP ranking is distinct from the last card round winner');assert.deepEqual(hpItemRanks(cardEnd),[2,1,3]);assert.equal(cardEnd.rpgRun!.fate,3,'standalone mode does not spend RPG fate');assert.equal(cardEnd.rpgRun!.reward,null);assert.throws(()=>startRpgRound(cardEnd));
const blast=fresh();blast.rpgRun!.hp[1]=6;const cardsBefore=blast.players.map(player=>player.hand.map(tile=>tile.id));useRpgTacticalItem(blast,'ember-bomb',1);
assert.equal(blast.phase,'ended');assert.equal(blast.rpgRun!.status,'complete');assert.equal(blast.rpgRun!.hp[1],0);assert.deepEqual(blast.players.map(player=>player.hand.map(tile=>tile.id)),cardsBefore,'a fatal item ends immediately without inventing a card action');assert.equal(blast.rpgRun!.lastItem?.amount,6);assert.throws(()=>act(blast,0,'play',[blast.players[0].hand[0].id]));
const ai=fresh();ai.turn=1;ai.rpgRun!.hp=[6,100,4];ai.rpgRun!.enemyConsumables![1]=['ember-bomb'];const fallback=structuredClone(ai);botMove(ai);assert.equal(ai.phase,'ended');assert.equal(ai.winner,1);assert.equal(ai.rpgRun!.hp[0],0);assert.equal(ai.lastEvent?.type,'deal','fatal AI items do not attempt an illegal follow-up card action');
const afterFallback=await runLocalBot(fallback,new AbortController().signal);assert.equal(afterFallback.phase,'ended','the bounded worker fallback also handles an immediate item ending');
const memory=new Map<string,string>(),storage={getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>{memory.set(key,value);}};
const saved=fresh();saveHpItemGame(storage,saved);assert.ok(memory.has(HP_ITEM_STORAGE_KEY));assert.equal(memory.has(RPG_STORAGE_KEY),false);assert.equal(memory.has(RPG_TEST_STORAGE_KEY),false);assert.throws(()=>saveSingleGame(storage,saved));assert.throws(()=>saveRpgGame(storage,saved));
assert.deepEqual(readHpItemArchive(storage).active,JSON.parse(JSON.stringify(saved)));assert.equal(readSaveSlots(storage).slots.find(slot=>slot.mode==='hp-item')?.game?.code,saved.code);
const original=memory.get(HP_ITEM_STORAGE_KEY),replacement=fresh();assert.throws(()=>saveHpItemGame(storage,replacement));assert.equal(memory.get(HP_ITEM_STORAGE_KEY),original);saveHpItemGame(storage,replacement,true);assert.equal(readHpItemArchive(storage).records[0].status,'abandoned');
const completed=structuredClone(replacement);completed.rpgRun!.hp[1]=4;completed.turn=0;useRpgTacticalItem(completed,'ember-bomb',1);saveHpItemGame(storage,completed);saveHpItemGame(storage,completed);assert.equal(readHpItemArchive(storage).active,null);assert.equal(readHpItemArchive(storage).records.filter(record=>record.id===completed.rpgRun!.id).length,1,'completion records are idempotent');
const fail={...storage,setItem(){throw Error('quota');}},beforeFailure=memory.get(HP_ITEM_STORAGE_KEY);assert.throws(()=>saveHpItemGame(fail,fresh()));assert.equal(memory.get(HP_ITEM_STORAGE_KEY),beforeFailure);
for(const phase of ['menu-out','room-hold','prepare','game-in','idle'] as EntrancePhase[])assert.equal(canSkipEntrance(phase),false,'preparation cannot be skipped before the actual deal is ready');
for(const phase of ['shuffle','deal','approach','focus','rise','opponent-out','settle'] as EntrancePhase[]){assert.equal(canSkipEntrance(phase),true);assert.equal(canSkipEntrance(phase,true),false);}
console.log('PASS: official HP item mode, seven-round continuation, immediate/card HP-zero endings, AI/fallback endings, isolated saves, records and guarded entrance skip');
