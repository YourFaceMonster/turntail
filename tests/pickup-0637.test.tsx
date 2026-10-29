// Explicit 100 HP fixtures also cover compatibility with pre-0.6.44 saved matches.
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {act,assertTurnReady,view,type Game} from '../lib/game.ts';
import {createHpItemGame,saveHpItemGame,readHpItemArchive} from '../lib/hp-item-mode.ts';
import {buyHpItemLoadout} from '../lib/hp-item-shop.ts';
import {scoutProfessionFloor,placeFloorTrap,itemBattleState,triggerScoutedPickup} from '../lib/item-battle-rules.ts';
import {useRpgTacticalItem} from '../lib/rpg-items.ts';
import {startRpgRound} from '../lib/rpg-game.ts';
import {COIN_DISCOVERY_MS,COIN_PRESENTATION_MS,AMBUSH_PRESENTATION_MS,TRAP_IMPACT_MS} from '../lib/pickup-presentation.ts';
import {HpRoundBreakdown} from '../app/components/HpRoundBreakdown.tsx';
function fresh(){const g=createHpItemGame('회수 검증','',Date.now(),2,'toto','rogue',100);buyHpItemLoadout(g,[]);g.rpgRun!.combat!.actives!.gauge=g.players.map(()=>4);g.rpgRun!.equipped=[];g.rpgRun!.consumables=[];g.rpgRun!.combat!.professions[1]='swordsman';g.rpgRun!.combat!.professions[2]='mage';g.rpgRun!.hp=[90,90,90];g.floorCoins!.randomTileId=null;g.completedBattles=1;ready(g);return g;}
function ready(g:Game,who=0){g.turn=who;g.turnReadyAt=0;g.lastBy=(who+2)%3;if(!g.trick.length){const tile=g.players[g.lastBy].hand.pop()!;g.trick=[tile];g.playedTiles=[...(g.playedTiles||[]),tile];}}
function scout(g:Game,who=0){g.rpgRun!.combat!.professions[who]='rogue';scoutProfessionFloor(g,who,99);}
const g=fresh();scout(g);const hiddenTile=g.stacks[0][1]!,before=[...g.rpgRun!.hp],now=Date.now();act(g,0,'draw',[],0);
assert.deepEqual(g.rpgRun!.hp,[before[0],before[1]-1,before[2]-1]);assert.deepEqual(itemBattleState(g)!.lastAmbush!.damage,[0,1,1]);assert.ok(g.turnReadyAt!>=now+AMBUSH_PRESENTATION_MS);assert.ok(!g.rpgRun!.tactics![0].peeks!.some(peek=>peek.tile.id===hiddenTile.id));assert.equal(triggerScoutedPickup(g,0,0,hiddenTile),null,'a scout tile attacks once');
for(const seat of [1,2]){const publicGame=view(g,g.players[seat].token);assert.equal(publicGame.lastEvent!.tiles,undefined);assert.ok(!JSON.stringify(publicGame.rpgRun!.combat!.itemBattle!.lastAmbush).includes('tile'),'public ambush never includes tile identity');}
for(const kind of ['lens','old-save','other-collector','not-rogue'] as const){const x=fresh(),tile=x.stacks[0][1]!;
 if(kind==='lens'){x.rpgRun!.consumables=['scout-lens'];useRpgTacticalItem(x,'scout-lens',0);ready(x);}
 else if(kind==='old-save'){x.rpgRun!.tactics={[0]:{round:x.round,used:0,peek:{round:x.round,index:0,tile:{...tile}}}};}
 else scout(x);
 if(kind==='not-rogue')x.rpgRun!.combat!.professions[0]='mage';if(kind==='other-collector')ready(x,1);
 const hp=[...x.rpgRun!.hp];act(x,x.turn,'draw',[],0);assert.deepEqual(x.rpgRun!.hp,hp,kind);assert.equal(itemBattleState(x)!.lastAmbush,undefined,kind);
}
const rescan=fresh();scout(rescan);rescan.rpgRun!.consumables=['scout-lens'];useRpgTacticalItem(rescan,'scout-lens',0);ready(rescan);act(rescan,0,'draw',[],0);assert.deepEqual(itemBattleState(rescan)!.lastAmbush!.damage,[0,1,1],'a lens does not erase existing profession scouting');
const blocked=fresh();scout(blocked,1);blocked.rpgRun!.equipped=['cracked-heart'];ready(blocked,1);act(blocked,1,'draw',[],0);assert.deepEqual(blocked.rpgRun!.hp,[90,90,89]);assert.deepEqual(itemBattleState(blocked)!.lastAmbush!.damage,[0,0,1]);assert.equal(blocked.rpgRun!.crackedHeartUsed.length,1);
const ambushFinish=fresh();scout(ambushFinish);ambushFinish.rpgRun!.hp[1]=1;act(ambushFinish,0,'draw',[],0);assert.equal(ambushFinish.phase,'ended');assert.equal(ambushFinish.hpItemMatch!.report!.endReason,'ambush');assert.equal(ambushFinish.hpItemMatch!.report!.ambushDamage![1],1);
const trappedCover=fresh();trappedCover.floorCoins!.randomTileId=trappedCover.stacks[0][0]!.id;trappedCover.rpgRun!.combat!.professions[1]='rogue';ready(trappedCover,1);placeFloorTrap(trappedCover,1,0);ready(trappedCover);act(trappedCover,0,'draw',[],0);assert.equal(trappedCover.floorCoins!.lastDiscovery,undefined);assert.ok(trappedCover.turnReadyAt!>=itemBattleState(trappedCover)!.lastTrap!.at);assert.equal(trappedCover.floorCoins!.events.length,0);
const cover=fresh();cover.floorCoins!.randomTileId=cover.stacks[0][0]!.id;const money=[...cover.hpItemMatch!.points],revealAt=Date.now();act(cover,0,'draw',[],0);assert.deepEqual(cover.hpItemMatch!.points,money);assert.equal(cover.floorCoins!.lastDiscovery,undefined);assert.ok(cover.turnReadyAt!<revealAt+COIN_DISCOVERY_MS);assert.throws(()=>assertTurnReady(cover),/확인|이동|잠시/);assert.equal(view(cover,cover.players[1].token).stacks[0].coinAmount,3);ready(cover,1);const takeAt=Date.now();act(cover,1,'draw',[],0);assert.ok(cover.turnReadyAt!>=takeAt+COIN_PRESENTATION_MS);assert.equal(view(cover,cover.players[1].token).floorCoins!.events.at(-1)!.moneyBefore,money[1]);assert.equal(view(cover,cover.players[0].token).floorCoins!.events.at(-1)!.moneyBefore,undefined,'coin effects do not disclose another wallet');
// One pickup may award a coin and kill both the scouter's opponent and the scouter.
const lethal=fresh();scout(lethal);lethal.rpgRun!.combat!.professions[1]='rogue';ready(lethal,1);placeFloorTrap(lethal,1,0);ready(lethal);lethal.rpgRun!.hp=[3,1,90];lethal.floorCoins!.randomTileId=lethal.stacks[0][1]!.id;const lethalMoney=lethal.hpItemMatch!.points[0];act(lethal,0,'draw',[],0);
assert.deepEqual(lethal.rpgRun!.hp,[0,0,89]);assert.equal(lethal.phase,'ended');assert.equal(lethal.hpItemMatch!.points[0],lethalMoney+1);assert.deepEqual(lethal.hpItemMatch!.report!.ambushDamage,[0,1,1]);assert.deepEqual(lethal.hpItemMatch!.report!.trapDamage,[3,0,0]);assert.equal(lethal.hpItemMatch!.report!.floorCoinMoney![0],1);assert.equal(lethal.hpItemMatch!.report!.endReason,'trap');assert.ok(lethal.floorCoins!.events[0].at>=itemBattleState(lethal)!.lastTrap!.at+450);assert.ok(lethal.turnReadyAt!>=lethal.floorCoins!.events[0].at+COIN_PRESENTATION_MS);assert.ok(TRAP_IMPACT_MS>1000);
const html=renderToStaticMarkup(<HpRoundBreakdown game={view(lethal,lethal.players[0].token)} seat={0} before={3}/>),moneyRow=html.match(/<p class="round-money-detail">([\s\S]*?)<\/p>/)![1];assert.ok(moneyRow.includes('바닥 주화'));assert.equal((html.match(/바닥 주화/g)||[]).length,1);
const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>{values.set(key,value);}};saveHpItemGame(storage,g);assert.deepEqual(readHpItemArchive(storage,2).active!.rpgRun!.combat!.itemBattle!.ambushEvents,JSON.parse(JSON.stringify(itemBattleState(g)!.ambushEvents)));g.phase='ended';startRpgRound(g);assert.equal(itemBattleState(g)!.lastAmbush,undefined);assert.deepEqual(itemBattleState(g)!.ambushEvents,[]);assert.equal(g.floorCoins!.lastDiscovery,undefined);
console.log('PASS: profession-only own pickup, each opponent1, consumed scout, item/old-save/non-rogue exclusions, lens rescan, defense, private tile and wallet, quiet lower-floor reveal and paced collection locks, simultaneous lethal ambush/trap/coin reporting, second money row, save and round reset.');
