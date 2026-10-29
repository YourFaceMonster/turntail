// Explicit 100 HP fixtures also cover compatibility with pre-0.6.44 saved matches.
import assert from 'node:assert/strict';
import {act,assertTurnReady,advanceRoom,DRAW_TRAVEL_MS} from '../lib/game.ts';
import {createHpItemGame} from '../lib/hp-item-mode.ts';
import {buyHpItemLoadout} from '../lib/hp-item-shop.ts';
import {placeFloorTrap} from '../lib/item-battle-rules.ts';
import {COIN_PRESENTATION_MS,COIN_AFTER_PICKUP_MS,COIN_TURN_READY_MS} from '../lib/pickup-presentation.ts';
import {HP_BATTLE_WIN_DELAY_MS,HP_BATTLE_REVIEW_MS} from '../lib/hp-item-battle.ts';
function fresh(closing=false){const g=createHpItemGame('주화 템포','',Date.now(),2,'toto','rogue',100);buyHpItemLoadout(g,[]);g.rpgRun!.combat!.actives!.gauge=g.players.map(()=>4);g.rpgRun!.equipped=[];g.rpgRun!.consumables=[];g.rpgRun!.enemyConsumables={1:[],2:[]};g.rpgRun!.combat!.professions=['rogue','swordsman','mage'];g.rpgRun!.hp=[90,90,90];g.completedBattles=1;g.turn=0;g.turnReadyAt=0;g.lastBy=closing?1:2;const tile=g.players[g.lastBy].hand.pop()!;g.trick=[tile];g.playedTiles=[tile];g.tablePlay={id:'tempo-trick',who:g.lastBy,tiles:[tile]};g.floorCoins!.randomTileId=g.stacks[0][1]!.id;return g;}
const now=Date.now(),ordinary=fresh();act(ordinary,0,'draw',[],0,now);const coin=ordinary.floorCoins!.events[0];
assert.equal(COIN_TURN_READY_MS,COIN_PRESENTATION_MS+COIN_AFTER_PICKUP_MS);assert.ok(COIN_AFTER_PICKUP_MS>=1200);assert.equal(ordinary.turnReadyAt,coin.at+COIN_TURN_READY_MS);assert.throws(()=>assertTurnReady(ordinary,coin.at+COIN_PRESENTATION_MS+COIN_AFTER_PICKUP_MS-1));assert.doesNotThrow(()=>assertTurnReady(ordinary,coin.at+COIN_TURN_READY_MS));
const room=structuredClone(ordinary);room.practice=false;room.players[room.turn].bot=true;const before=JSON.stringify(room);assert.equal(advanceRoom(room,coin.at+COIN_PRESENTATION_MS+500),false);assert.equal(JSON.stringify(room),before,'AI cannot start during the quiet beat after a coin');
const closing=fresh(true);act(closing,0,'draw',[],0,now);const pickup=closing.floorCoins!.events[0],battle=closing.hpItemMatch!.lastBattle!;
assert.equal(battle.at,pickup.at+COIN_TURN_READY_MS,'fight timeline starts only after the coin and quiet beat');assert.ok(battle.at+HP_BATTLE_WIN_DELAY_MS>pickup.at+COIN_PRESENTATION_MS+COIN_AFTER_PICKUP_MS);assert.equal(closing.turnReadyAt,battle.at+HP_BATTLE_REVIEW_MS);assert.equal(closing.trick.length,0);assert.equal(closing.phase,'playing');
// Old coin history must not add another quiet beat to a later, ordinary fight.
closing.turn=0;closing.turnReadyAt=0;closing.lastBy=1;const tile=closing.players[1].hand.pop()!;closing.trick=[tile];closing.playedTiles!.push(tile);closing.tablePlay={id:'later-trick',who:1,tiles:[tile]};act(closing,0,'draw',[],0,now+20000);assert.equal(closing.hpItemMatch!.lastBattle!.at,closing.lastEvent!.at!+DRAW_TRAVEL_MS);assert.equal(closing.floorCoins!.events.length,1);
// A fatal trap on the same coin still allows the complete pickup before final results.
const fatal=fresh();fatal.rpgRun!.combat!.professions[1]='rogue';fatal.turn=1;placeFloorTrap(fatal,1,0,now);fatal.turn=0;fatal.rpgRun!.hp[0]=3;act(fatal,0,'draw',[],0,now);assert.equal(fatal.phase,'ended');assert.ok(fatal.turnReadyAt!>=fatal.floorCoins!.events[0].at+COIN_TURN_READY_MS);assert.equal(fatal.hpItemMatch!.report!.floorCoinMoney![0],1);
console.log('PASS: coin credit/banner followed by a quiet beat, AI/action lock, delayed fight winner/damage and final report, no delay from stale coin history, rewards retained on lethal trap.');
