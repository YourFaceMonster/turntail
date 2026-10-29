// Explicit 100 HP fixtures also cover compatibility with pre-0.6.44 saved matches.
import assert from 'node:assert/strict';
import {createRpgGame,startRpgRound} from '../lib/rpg-game.ts';
import {createHpItemGame,saveHpItemGame,readHpItemArchive} from '../lib/hp-item-mode.ts';
import {resolveHpItemBattle,recordHpBattlePlay} from '../lib/hp-item-battle.ts';
import {resolveProfessionRpgBattle,recordProfessionBattlePlay} from '../lib/rpg-profession-combat.ts';
import {settleRpgRound,newRpgRun} from '../lib/rpg.ts';
import {buyHpItemLoadout,finishHpItemRoundReport} from '../lib/hp-item-shop.ts';
import {useHpSkill} from '../lib/hp-item-skills.ts';
import {RPG_PROFESSIONS,type RpgProfessionId} from '../lib/rpg-professions.ts';
import {readRpgArchive,saveRpgGame} from '../lib/rpg-storage.ts';
import {view,act,type Game,type Tile} from '../lib/game.ts';
const t=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const pair=[t(7),t(7,1)],triple=[...pair,t(7,2)],straight=[t(3),t(4,1),t(5,2),t(6,3),t(7)],full=[...triple,t(8),t(8,1)],four=[...triple,t(7,3),t(8)];
function fresh(id:RpgProfessionId,item=false){
 const g=item?createHpItemGame('나','',Date.now(),2,'toto',id,100):createRpgGame('나','',Date.now(),id);
 // This suite preserves the pre-expansion saved profession rules in both modes.
 if(item){delete g.rpgRun!.combat!.itemBattle;buyHpItemLoadout(g,[]);}g.turn=0;g.turnReadyAt=0;g.roundActions=3;g.completedBattles=1;g.rpgRun!.equipped=[];g.rpgRun!.consumables=[];g.rpgRun!.enemyConsumables={1:[],2:[]};g.rpgRun!.combat!.professions=[id,'cleric','cleric'];
 g.players.forEach((player,seat)=>{player.hand=Array.from({length:8},(_,i)=>t(i+3,seat));});return g;
}
function fight(g:Game,tiles:Tile[],count=tiles.length,actor=0){
 g.trick=tiles;g.lastBy=actor;g.tablePlay={id:crypto.randomUUID(),who:actor,tiles};g.rpgRun!.combat!.battleTiles[actor]=0;if(g.hpItemMatch)g.hpItemMatch.battleTiles![actor]=0;recordHpBattlePlay(g,actor,count);recordProfessionBattlePlay(g,actor,count);
 return (g.hpItemMode?resolveHpItemBattle(g):resolveProfessionRpgBattle(g))!;
}
for(const item of [false,true]){
 const sword=fresh('swordsman',item),first=fight(sword,pair,4);assert.equal(first.damage,4);assert.deepEqual(first.damageTaken,[0,5,5]);assert.equal(first.professions![0].kind,'passive');
 const before=sword.rpgRun!.hp[1];fight(sword,pair);assert.equal(sword.rpgRun!.hp[1],before-3,'passive repeats');
 const active=fight(sword,straight);assert.equal(active.damageTaken![1],8);assert.equal(sword.rpgRun!.combat!.activeUsed[0],true);const next=fight(sword,straight);assert.equal(next.damageTaken![1],5);assert.equal(next.professions!.length,0);
 const mage=fresh('mage',item);assert.equal(fight(mage,triple).damageTaken![1],5);assert.equal(fight(mage,four).damageTaken![1],11);assert.equal(fight(mage,four).damageTaken![1],11);
 const cleric=fresh('cleric',item);cleric.rpgRun!.hp[0]=95;fight(cleric,pair);assert.equal(cleric.rpgRun!.hp[0],96);fight(cleric,pair);assert.equal(cleric.rpgRun!.hp[0],97);cleric.rpgRun!.hp[0]=98;assert.equal(fight(cleric,full).professions![0].heal,2);assert.equal(cleric.rpgRun!.hp[0],100);cleric.rpgRun!.hp[0]=95;fight(cleric,full);assert.equal(cleric.rpgRun!.hp[0],95,'active does not repeat before the next card round');
 if(item){finishHpItemRoundReport(cleric);assert.equal(cleric.hpItemMatch!.report!.cardDamage![0],0);assert.equal(cleric.hpItemMatch!.report!.professionHealing![0],4);}
 const lost=fresh('mage',item);fight(lost,triple,3,1);assert.equal(lost.rpgRun!.combat!.effects.some(effect=>effect.actor===0),false,'a matching submission by a loser never activates');
 const rogue=fresh('rogue',item);rogue.players[2].hand=[];const items=[...rogue.rpgRun!.consumables];fight(rogue,[t(7)]);assert.equal(rogue.rpgRun!.combat!.privateReveals[0].at(-1)!.tiles.length,1);
 const handCounts=rogue.players.map(player=>player.hand.length),allIds=rogue.players.flatMap(player=>player.hand.map(tile=>tile.id)).sort((a,b)=>a-b);const swap=fight(rogue,triple);
 assert.equal(swap.professions![0].exchange,'done');assert.equal(swap.professions![0].revealed,2);assert.deepEqual(rogue.players.map(player=>player.hand.length),handCounts);assert.deepEqual(rogue.players.flatMap(player=>player.hand.map(tile=>tile.id)).sort((a,b)=>a-b),allIds);assert.deepEqual(rogue.rpgRun!.consumables,items);assert.equal(rogue.rpgRun!.tactics?.[0]?.used||0,0);
 assert.equal(view(rogue,rogue.players[0].token).rpgRun!.combat!.privateReveals[0].at(-1)!.tiles.length,2);assert.equal(view(rogue,rogue.players[1].token).rpgRun!.combat!.privateReveals[0],undefined);assert.equal(view(rogue,rogue.players[0].token).players[1].hand,undefined);
 const blocked=fresh('rogue',item);blocked.players[2].hand=[];blocked.rpgRun!.itemGuards={1:true};const beforeHands=JSON.stringify(blocked.players.map(player=>player.hand));const shield=fight(blocked,triple);assert.equal(shield.professions![0].exchange,'blocked');assert.equal(blocked.rpgRun!.itemGuards[1],false);assert.equal(JSON.stringify(blocked.players.map(player=>player.hand)),beforeHands);if(item)assert.equal(blocked.hpItemMatch!.roundItems.length,0,'profession use is not an item inventory/history use');
 const short=fresh('rogue',item);short.players[0].hand=[t(1),t(2),t(1,1)];short.players[2].hand=[];assert.equal(fight(short,triple).professions![0].exchange,'unavailable');assert.equal(short.rpgRun!.combat!.activeUsed[0],true);
 const protectedNumbers=fresh('rogue',item);protectedNumbers.players[0].hand=[t(1),t(2),t(3),t(4)];protectedNumbers.players[1].hand=[t(1,1),t(2,1),t(3,1),t(4,1)];protectedNumbers.players[2].hand=[];fight(protectedNumbers,triple);assert.ok(protectedNumbers.players[0].hand.some(tile=>tile.id===t(1).id)&&protectedNumbers.players[0].hand.some(tile=>tile.id===t(2).id));assert.ok(protectedNumbers.players[1].hand.some(tile=>tile.id===t(1,1).id)&&protectedNumbers.players[1].hand.some(tile=>tile.id===t(2,1).id));
 const state=rogue.rpgRun!.combat!,once=JSON.stringify(rogue);(item?resolveHpItemBattle:resolveProfessionRpgBattle)(rogue);assert.equal(JSON.stringify(rogue),once,'duplicate winner settlement cannot trigger another swap');rogue.phase='ended';startRpgRound(rogue);assert.equal(rogue.rpgRun!.combat!.activeUsed[0],false);assert.deepEqual(rogue.rpgRun!.combat!.privateReveals,{});assert.equal(rogue.rpgRun!.combat!.professions[0],state.professions[0]);
}
const stacked=fresh('swordsman',true);assert.equal(stacked.hpItemMatch!.skills,undefined);assert.throws(()=>useHpSkill(stacked));const combined=fight(stacked,pair,4);assert.deepEqual(combined.damageTaken,[0,5,5],'only base 4 + profession 1 remains');
const final=fresh('swordsman');final.rpgRun!.hp=[80,1,60];const ended=fight(final,pair);assert.equal(ended.hpAfter[1],0);assert.equal(ended.roundFinal,true);assert.equal(final.phase,'ended');assert.equal(final.rpgRun!.status,'allocation');assert.ok(final.rpgRun!.reward);
const result={id:'score',at:Date.now(),players:[{count:10,delta:-10},{count:0,delta:10},{count:5,delta:0}]},proto=fresh('mage').rpgRun!;assert.equal(settleRpgRound(proto,result,1).hp[0],100,'new prototype never adds score-based HP damage after fight damage');assert.equal(settleRpgRound(newRpgRun('legacy'),result,1).hp[0],90,'old saves retain old settlement rules');
const relic=fresh('cleric');relic.rpgRun!.equipped=['cracked-heart'];assert.equal(fight(relic,pair,4,1).damageTaken![0],0);assert.equal(relic.rpgRun!.crackedHeartUsed.length,1);assert.equal(fight(relic,pair,4,1).damageTaken![0],4);
const live=fresh('mage',true);fight(live,four);const mem=new Map<string,string>(),storage={getItem:(key:string)=>mem.get(key)||null,setItem:(key:string,value:string)=>{mem.set(key,value);}};saveHpItemGame(storage,live);assert.deepEqual(readHpItemArchive(storage,2).active!.rpgRun!.combat,JSON.parse(JSON.stringify(live.rpgRun!.combat)));
const rpgSaved=fresh('rogue');fight(rpgSaved,triple);saveRpgGame(storage,rpgSaved);assert.deepEqual(readRpgArchive(storage).active!.rpgRun!.combat,JSON.parse(JSON.stringify(rpgSaved.rpgRun!.combat)));const legacyRpg=createRpgGame('이전 저장');saveRpgGame(storage,legacyRpg,true);assert.equal(readRpgArchive(storage).active!.rpgRun!.combat,undefined,'older saved rules are never silently upgraded');
const flow=fresh('swordsman');flow.players[0].hand=[t(7),t(8)];flow.players[1].hand=[t(4,1),t(5,1)];flow.players[2].hand=[t(4,2),t(5,2)];flow.stacks=Array.from({length:15},()=>[null,null]);flow.trick=[];flow.lastBy=null;act(flow,0,'play',[t(7).id]);assert.deepEqual(flow.rpgRun!.hp,[100,100,100]);flow.turnReadyAt=0;act(flow,1,'pass');flow.turnReadyAt=0;act(flow,2,'pass');assert.deepEqual(flow.rpgRun!.hp,[100,99,99]);assert.equal(flow.rpgRun!.combat!.lastBattle!.playedCount,1);
for(const profession of RPG_PROFESSIONS)assert.ok(profession.id);
console.log('PASS: both modes, cumulative winner-only HP, all passive/once-per-round effects, bounded healing, private two-card scouting, guarded eligible swaps, existing character/relic coexistence, death/progression, reset, old-save rules and new-save persistence.');
