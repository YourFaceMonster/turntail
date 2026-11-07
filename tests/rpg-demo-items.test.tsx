// Pre-rework journey save compatibility; current RPG rules: rpg-rework.test.tsx.
import {settleProfessionRound} from '../lib/profession-round-combat';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {createRpgJourneyGame,createRpgGame,enterJourneyNode} from './fixtures/legacy-rpg-journey';
import {RPG_CONSUMABLES,buyRpgItem,currentRpgShop,useRpgConsumable} from '../lib/rpg.ts';
import {RPG_DEMO_PRICES,RPG_DEMO_RELICS} from '../lib/rpg-demo-catalog.ts';
import {BLUE_GLASS_ID} from '../lib/blue-glass.ts';
import {buyRpgCart} from '../lib/rpg-shop-cart.ts';
import {view,act,type Tile} from '../lib/game.ts';
import {useRpgTacticalItem,rpgItemAvailability} from '../lib/rpg-items.ts';
import {resolveProfessionRpgBattle} from '../lib/rpg-profession-combat.ts';
import {chooseRpgStageReward,reconcileRpgEliminations,rpgSynergies} from '../lib/rpg-phase-one.ts';
import {saveRpgGame,readRpgArchive} from '../lib/rpg-storage.ts';
import {equipJourneyRelic} from '../lib/rpg-journey.ts';
import {HP_ITEM_PRICES} from '../lib/hp-item-shop.ts';
import JourneyVillageShop from '../app/components/JourneyVillageShop.tsx';
const t=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const ready=()=>{const g=createRpgJourneyGame('데모 정리');g.rpgRun!.status='ready';g.rpgRun!.coins=1000;g.rpgRun!.shops=[{area:1,stock:RPG_CONSUMABLES.map(i=>({id:i.id,kind:'consumable',price:i.price,quantity:1}))}];return g;};
function combat(profession:'swordsman'|'mage'|'rogue'|'cleric'='swordsman'){const g=createRpgJourneyGame('전술 검사','',0,profession);enterJourneyNode(g,'battle-1',0);g.turn=0;g.turnReadyAt=0;g.roundActions=3;g.completedBattles=1;g.rpgRun!.equipped=[];return g;}
test('demo shop has six consumables, normalizes legacy lens price to 10 and excludes quest/retired relic sales without deleting possessions',()=>{
 const g=ready(),run=g.rpgRun!;run.consumables=['red-vial','moonlight-soup','guardian-bandage','fates-scales','scout-lens','scout-lens'];run.relics.push('final-knot',BLUE_GLASS_ID);run.equipped=['final-knot'];run.unlocked.push(BLUE_GLASS_ID);const before=JSON.stringify(run);
 const stock=currentRpgShop(run)!.stock;assert.deepEqual(stock.filter(i=>i.kind==='consumable').map(i=>i.id).sort(),Object.keys(RPG_DEMO_PRICES).sort());assert.equal(stock.find(i=>i.id==='scout-lens')!.price,10);assert.ok(stock.filter(i=>i.kind==='relic').every(i=>i.id!==BLUE_GLASS_ID&&(RPG_DEMO_RELICS as readonly string[]).includes(i.id)));
 assert.equal(JSON.stringify(run),before);const bought=buyRpgItem(run,'scout-lens');assert.equal(bought.coins,990);assert.equal(bought.consumables.filter(id=>id==='scout-lens').length,3);assert.deepEqual(bought.equipped,['final-knot']);assert.ok(run.consumables.every(id=>bought.consumables.includes(id)));assert.throws(()=>buyRpgItem(run,'red-vial'));assert.throws(()=>buyRpgItem(run,BLUE_GLASS_ID));
 const cart=buyRpgCart(run,['scout-lens','scout-lens']);assert.equal(cart.coins,980);
 const html=render(h(JourneyVillageShop,{run,busy:false,error:'',action:()=>{}}));assert.match(html,/소비 아이템<small>6종/);assert.ok(html.includes('10주화'));assert.ok(!html.includes('붉은 약병 구매 목록에 담기'));
 const other=createRpgGame('이전 모드').rpgRun!;other.status='ready';other.shops=[{area:1,stock:[]}];assert.equal(currentRpgShop(other)!.stock.find(i=>i.id==='scout-lens')!.price,45);assert.equal(RPG_CONSUMABLES.find(i=>i.id==='scout-lens')!.price,45);assert.equal(HP_ITEM_PRICES['scout-lens'],3);
});
test('preparation and combat herbs share 10/15 healing, caps and exact one-item consumption',()=>{
 for(const equipped of [[],[BLUE_GLASS_ID]])for(const hp of [60,96]){
  const g=ready(),run=g.rpgRun!;run.equipped=equipped;run.hp[0]=hp;run.consumables=['emergency-herb','emergency-herb'];const result=useRpgConsumable(run,'emergency-herb');assert.equal(result.hp[0],Math.min(100,hp+(equipped.length?15:10)));assert.equal(result.consumables.length,1);assert.equal(run.consumables.length,2);
  const fight=combat();fight.rpgRun!.equipped=equipped;fight.rpgRun!.hp[0]=hp;fight.rpgRun!.consumables=['emergency-herb','emergency-herb'];useRpgTacticalItem(fight,'emergency-herb');assert.equal(fight.rpgRun!.hp[0],result.hp[0],'combat healing applies immediately');fight.phase='ended';fight.winner=0;settleProfessionRound(fight);assert.equal(fight.rpgRun!.hp[0],result.hp[0]);assert.equal(fight.rpgRun!.consumables.length,1);assert.equal(fight.turn,0);
 }
 const full=ready().rpgRun!;full.consumables=['emergency-herb'];const before=JSON.stringify(full);assert.throws(()=>useRpgConsumable(full,'emergency-herb'));assert.equal(JSON.stringify(full),before);
 const wrong=combat();wrong.turn=1;wrong.rpgRun!.consumables=['emergency-herb'];wrong.rpgRun!.hp[0]=50;assert.equal(rpgItemAvailability(view(wrong,wrong.players[0].token),'emergency-herb',true).usable,false);assert.throws(()=>useRpgTacticalItem(wrong,'emergency-herb'));
});
test('all professions can use legacy lenses privately and the inspected tile still follows ordinary draw rules',()=>{
 for(const profession of ['swordsman','mage','rogue','cleric'] as const){
  const g=combat(profession);g.rpgRun!.consumables=['scout-lens'];const target=0,tile=g.stacks[target][1]!,upper=g.stacks[target][0]!;assert.ok(tile);const privateBefore=JSON.stringify(g.rpgRun!.combat!.privateReveals);useRpgTacticalItem(g,'scout-lens',target);
  assert.equal(g.rpgRun!.consumables.length,0);assert.equal(JSON.stringify(g.rpgRun!.combat!.privateReveals),privateBefore,'lens never overwrites profession scouting');
  const mine=view(g,g.players[0].token),enemy=view(g,g.players[1].token);assert.equal(mine.rpgRun!.tacticalPeeks!.at(-1)!.tile.id,tile.id);assert.equal(enemy.rpgRun!.tacticalPeeks!.length,0);assert.equal(enemy.rpgRun!.tactics?.[0],undefined);assert.equal(enemy.players[0].hand,undefined);assert.equal(enemy.rpgRun!.lastItem?.target,-1);
  const count=g.players[0].hand.length;g.trick=[t(2,3)];g.lastBy=1;g.turnReadyAt=0;act(g,0,'draw',[],0);assert.equal(g.players[0].hand.length,count+1);assert.ok(g.players[0].hand.some(i=>i.id===tile.id));assert.equal(view(g,g.players[0].token).rpgRun!.tacticalPeeks!.length,0);g.turn=0;g.trick=[t(2,3)];g.lastBy=1;g.turnReadyAt=0;act(g,0,'draw',[],0);assert.ok(g.players[0].hand.some(i=>i.id===upper.id));
 }
 const inner=combat();inner.rpgRun!.consumables=['scout-lens'];useRpgTacticalItem(inner,'scout-lens',7);assert.equal(view(inner,inner.players[0].token).rpgRun!.tacticalPeeks!.at(-1)!.index,7);
});
test('ST1 fixed lantern, persisted two-choice ST2 and ST3 ordinary relic plus story card preserve 30/30 rewards',()=>{
 const g=createRpgJourneyGame('보상 선택');enterJourneyNode(g,'battle-1');g.rpgRun!.hp=[50,0,0];reconcileRpgEliminations(g);assert.deepEqual(g.rpgRun!.phaseOne!.clear!.relicOffers,['recovery-lantern']);g.rpgRun=chooseRpgStageReward(g.rpgRun!,'all');assert.ok(g.rpgRun.relics.includes('recovery-lantern'));
 enterJourneyNode(g,'battle-2');g.rpgRun!.hp=[40,0,0];reconcileRpgEliminations(g);const offers=[...g.rpgRun!.phaseOne!.clear!.relicOffers!];assert.equal(offers.length,2);assert.equal(new Set(offers).size,2);assert.ok(offers.every(id=>!g.rpgRun!.relics.includes(id)&&id!==BLUE_GLASS_ID));assert.throws(()=>chooseRpgStageReward(g.rpgRun!,'all'),/선택/);assert.throws(()=>chooseRpgStageReward(g.rpgRun!,'all',undefined,false,'cloud-blessing'));
 const data=new Map<string,string>(),store={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);}};saveRpgGame(store,g);const restored=readRpgArchive(store).active!;assert.deepEqual(restored.rpgRun!.phaseOne!.clear!.relicOffers,offers);const before=structuredClone(restored.rpgRun!);restored.rpgRun=chooseRpgStageReward(restored.rpgRun!,'all',undefined,false,offers[1]);assert.ok(restored.rpgRun.relics.includes(offers[1]));assert.ok(!restored.rpgRun.relics.includes(offers[0]));assert.equal(restored.rpgRun.coins,before.coins+30);assert.equal(restored.rpgRun.hp[0],before.hp[0]+30);
 enterJourneyNode(restored,'battle-3');restored.rpgRun!.hp=[50,0,0];reconcileRpgEliminations(restored);restored.rpgRun=chooseRpgStageReward(restored.rpgRun!,'all');assert.ok(restored.rpgRun.storyCards!.includes('iron-gate-two'));assert.ok(!restored.rpgRun.relics.includes('iron-gate-two'));assert.ok(restored.rpgRun.equipped.length<=3);
});
test('equipped combat relics activate; unequipped effects do not; old excluded gear remains owned and capped at three slots',()=>{
 const cases:[string,Tile[],number,number][]=[['wind-sigil',[t(7),t(7,1)],1,0],['warrior-crest',[t(7),t(7,1),t(7,2)],2,0],['life-sigil',[t(7),t(7,1),t(7,2)],0,2],['sun-sigil',[t(3),t(5),t(7),t(9),t(11)],3,0],['crimson-fang',[t(7,3)],1,0]];
 for(const [id,tiles,damage,heal] of cases)for(const equipped of [false,true]){const g=combat('mage');g.rpgRun!.hp[0]=60;g.rpgRun!.relics=[id];g.rpgRun!.equipped=equipped?[id]:[];g.lastBy=0;g.trick=tiles;g.tablePlay={id:crypto.randomUUID(),who:0,tiles};g.rpgRun!.combat!.battleTiles[0]=tiles.length;const event=resolveProfessionRpgBattle(g,100)!;assert.equal(event.relicDamage||0,equipped?damage:0);assert.equal(event.relicHealing||0,equipped?heal:0);}
 const g=ready(),run=g.rpgRun!;run.relics=['final-knot','cracked-heart','recovery-lantern',BLUE_GLASS_ID];run.equipped=run.relics.slice(0,3);assert.equal(rpgSynergies(run).length,1);assert.throws(()=>equipJourneyRelic(run,BLUE_GLASS_ID));const off=equipJourneyRelic(run,'recovery-lantern');assert.equal(rpgSynergies(off).length,0);assert.ok(off.relics.includes('final-knot'));
 const first=combat();first.rpgRun!.equipped=['cracked-heart'];first.rpgRun!.hp[0]=90;first.lastBy=1;first.trick=[t(7)];first.tablePlay={id:crypto.randomUUID(),who:1,tiles:first.trick};first.rpgRun!.combat!.battleTiles[1]=10;resolveProfessionRpgBattle(first,100);assert.equal(first.rpgRun!.crackedHeartUsed.length,0);first.rpgRun!.combat!.pendingRound!.handFinished=true;first.phase='ended';first.winner=1;settleProfessionRound(first);assert.equal(first.rpgRun!.combat!.lastBattle!.blockedDamage![0],1);
 const lantern=createRpgJourneyGame('등불 검사');enterJourneyNode(lantern,'battle-1');lantern.rpgRun!.relics=['cracked-heart','recovery-lantern'];lantern.rpgRun!.equipped=[...lantern.rpgRun!.relics];lantern.rpgRun!.hp=[50,0,0];reconcileRpgEliminations(lantern);assert.equal(lantern.rpgRun!.phaseOne!.clear!.relicHeal,5);assert.equal(lantern.rpgRun!.phaseOne!.clear!.synergyHeal,2);
});
