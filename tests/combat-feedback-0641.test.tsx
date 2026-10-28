import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createHpItemGame} from '../lib/hp-item-mode.ts';
import {buyHpItemLoadout,HP_ITEM_PRICES,hpItemDisplayHp} from '../lib/hp-item-shop.ts';
import {act,botMove,view} from '../lib/game.ts';
import {tryRpgBotItem,rpgItemAvailability} from '../lib/rpg-items.ts';
import {resolveProfessionWin} from '../lib/rpg-profession-combat.ts';
import {placeFloorTrap} from '../lib/item-battle-rules.ts';
import {ANNOUNCED_PLAY_MS} from '../lib/play-notices.ts';
import {TRAP_TURN_READY_MS,TRAP_PRESENTATION_MS} from '../lib/pickup-presentation.ts';
import {itemScenePoints} from '../lib/rpg-item-motion.ts';
import {BattleEffectText} from '../app/components/HpBattleReview';
import {RpgHpBar} from '../app/components/RpgHpBar';
function fresh(){const g=createHpItemGame('검증','',Date.now(),2,'toto','mage');buyHpItemLoadout(g,[]);g.turn=0;g.turnReadyAt=0;g.completedBattles=1;g.roundActions=6;g.rpgRun!.equipped=[];g.rpgRun!.consumables=[];g.rpgRun!.enemyConsumables={1:[],2:[]};g.rpgRun!.combat!.actives!.gauge=[0,0,0];g.rpgRun!.combat!.professions=['mage','swordsman','mage'];g.floorCoins!.randomTileId=null;return g;}
const mage=fresh();mage.trick=Array.from({length:5},(_,id)=>({id,n:7,s:id%4}));mage.rpgRun!.combat!.activeUsed[0]=true;
for(let i=0;i<3;i++){const effect=resolveProfessionWin(mage,0,'포카드',Date.now());assert.equal(effect.damage,8);assert.ok(effect.effects.some(e=>e.trait==='비전 증폭'));}
const audit=[];
for(const budget of [0,3,4,5,6,8,10,20]){const g=createHpItemGame('예산','',Date.now(),2,'toto','rogue');g.hpItemMatch!.points=[20,budget,budget];g.rpgRun!.hp=[100,60,100];buyHpItemLoadout(g,[]);for(const seat of [1,2]){const held=g.rpgRun!.enemyConsumables![seat],spent=held.reduce((sum,id)=>sum+HP_ITEM_PRICES[id],0);assert.ok(spent<=budget);assert.equal(g.hpItemMatch!.points[seat],budget-spent);audit.push({seat,budget,spent,remaining:g.hpItemMatch!.points[seat],items:held});}}
const missing=fresh();missing.turn=1;missing.hpItemMatch!.points[1]=0;delete missing.rpgRun!.enemyConsumables![1];tryRpgBotItem(missing);assert.deepEqual(missing.rpgRun!.enemyConsumables![1],[]);assert.equal(missing.rpgRun!.lastItem,undefined,'no free kit for a missing saved inventory');
const ai=fresh();ai.turn=1;ai.rpgRun!.enemyConsumables![1]=['ember-bomb'];ai.turnReadyAt=Date.now()+3400;const before=JSON.stringify(ai);assert.equal(rpgItemAvailability(view(ai,ai.players[1].token),'ember-bomb',true).usable,false);botMove(ai);assert.equal(JSON.stringify(ai),before,'neither item nor card interrupts a combo caption');ai.turnReadyAt=0;botMove(ai);assert.equal(ai.turn,1);assert.equal(ai.roundActions,6);assert.equal(ai.rpgRun!.lastItem!.itemId,'ember-bomb');assert.ok(ai.turnReadyAt>Date.now());const after=JSON.stringify(ai);botMove(ai);assert.equal(JSON.stringify(ai),after,'projectile finishes before a card action');
const trap=fresh();trap.rpgRun!.combat!.professions[1]='rogue';trap.rpgRun!.combat!.actives!.gauge[1]=2;trap.turn=1;placeFloorTrap(trap,1,0);trap.turn=0;trap.trick=[trap.players[1].hand.pop()!];trap.lastBy=1;trap.tablePlay={id:'trap-battle',who:1,tiles:[...trap.trick]};const now=Date.now();act(trap,0,'draw',[],0,now);assert.ok(TRAP_TURN_READY_MS>=TRAP_PRESENTATION_MS+1000);assert.ok(trap.hpItemMatch!.lastBattle!.at>=now+TRAP_TURN_READY_MS,'fight waits for trap presentation and quiet beat');
const final=fresh();final.players[0].hand=final.players[0].hand.slice(0,1);final.trick=[];final.lastBy=null;act(final,0,'play',[final.players[0].hand[0].id],-1,now);assert.equal(final.phase,'ended');assert.equal(final.hpItemMatch!.lastBattle!.roundFinal,true);assert.ok(final.hpItemMatch!.lastBattle!.at>=now+ANNOUNCED_PLAY_MS,'last winner is reviewed after its combo caption');
const rect=(left:number,top:number,width:number,height:number)=>({left,top,width,height}),board=rect(30,150,330,310),own=rect(20,530,180,48),enemy=rect(20,50,170,48);
const a=itemScenePoints(390,844,enemy,own,board,{impact:'floor-edge'}),b=itemScenePoints(390,844,own,enemy,board,{impact:'floor-edge'});assert.equal(a.impactAngle,180);assert.ok(a.to.y<own.top);assert.equal(b.impactAngle,0);assert.ok(b.to.y>enemy.top+enemy.height);
const text=renderToStaticMarkup(<BattleEffectText text="추가 피해 +2 · HP +5"/>);assert.ok(text.includes('class="battle-damage">−2'));assert.ok(text.includes('class="battle-healing">+5'));
const hp=renderToStaticMarkup(<RpgHpBar hp={10} persistentChange identity={<strong>나</strong>} change={<em className="negative">−7</em>}/>);assert.ok(hp.includes('keeps-hp-change')&&hp.includes('−7'));
for(const seat of [0,1,2]){assert.equal(hpItemDisplayHp(final,seat,false),final.hpItemMatch!.lastBattle!.hpAfter[seat]);assert.equal(hpItemDisplayHp(final,seat,true),final.rpgRun!.hp[seat]);}
console.log('PASS: repeated mage combos, AI affordable purchases/no free inventory, label and item action ordering, trap quiet beat, reviewed final winner, phone-facing explosion, signed colored effects and persistent HP delta.');
console.log(JSON.stringify({aiPurchaseAudit:audit}));
