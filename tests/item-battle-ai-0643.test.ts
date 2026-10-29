// Explicit 100 HP fixtures also cover compatibility with pre-0.6.44 saved matches.
import assert from 'node:assert/strict';
import {createHpItemGame} from '../lib/hp-item-mode';
import {buyHpItemLoadout} from '../lib/hp-item-shop';
import {view,botMove,beats,combo,type Game,type Tile} from '../lib/game';
import {analyzeItemBattleTurn,itemBattlePositionValue} from '../lib/item-battle-plan';
import {chooseItemBattlePurchases} from '../lib/item-battle-shopping';
import {HP_ITEM_PRICES} from '../lib/hp-item-shop';
import {runLocalBot} from '../lib/local-bot';
import type {RpgProfessionId} from '../lib/rpg-professions';
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
function fresh(role:RpgProfessionId='swordsman',who=1){
 const g=createHpItemGame('AI 검증','',Date.now(),2,'toto','swordsman',100);buyHpItemLoadout(g,[]);g.turn=who;g.turnReadyAt=0;g.completedBattles=1;g.roundActions=6;g.trick=[];g.lastBy=null;g.log=[];g.players.forEach(p=>p.bot=true);g.rpgRun!.equipped=[];g.rpgRun!.consumables=[];g.rpgRun!.enemyConsumables={1:[],2:[]};g.rpgRun!.combat!.professions=['rogue',role,'rogue'];g.rpgRun!.combat!.professions[who]=role;g.rpgRun!.combat!.actives!.gauge=[0,0,0];g.floorCoins!.randomTileId=null;
 hands(g,[[tile(4),tile(8,1),tile(12,2),tile(1)],[tile(3),tile(7,1),tile(11,2),tile(2,3)],[tile(5),tile(9,1),tile(13,2),tile(15)]]);return g;
}
function hands(g:Game,sets:Tile[][]){
 g.players.forEach((p,i)=>p.hand=sets[i]);const used=new Set([...sets.flat(),...g.trick].map(t=>t.id)),deck=Array.from({length:60},(_,id)=>({id,n:Math.floor(id/4)+1,s:id%4})).filter(t=>!used.has(t.id));
 g.stacks=Array.from({length:15},(_,i)=>[deck[i*2]||null,deck[i*2+1]||null]);g.playedTiles=deck.slice(30);g.cols=5;g.rows=3;g.publicDraws={};
}
const position=(g:Game)=>view(g,g.players[g.turn].token),plan=(g:Game)=>analyzeItemBattleTurn(position(g));
const reports:Record<string,unknown>[]=[];
function check(name:string,g:Game,verify:(result:ReturnType<typeof plan>)=>void){const before=JSON.stringify(g),at=performance.now(),result=plan(g);verify(result);assert.equal(JSON.stringify(g),before,'planning must not mutate live state');reports.push({name,action:result.action,followUp:result.followUp,objective:result.objective,considered:result.considered,ms:performance.now()-at});}
const secure=fresh();secure.rpgRun!.hp=[80,10,3];secure.rpgRun!.combat!.actives!.gauge[1]=4;
check('secure second rather than risk third',secure,result=>{assert.deepEqual(result.action,{type:'profession',target:2});assert.equal(result.objective,'secure-second');});
const pursue=fresh();pursue.rpgRun!.hp=[45,40,5];pursue.rpgRun!.combat!.actives!.gauge[1]=4;
check('attack leader when first is still realistic',pursue,result=>{assert.deepEqual(result.action,{type:'profession',target:0});});
const bank=fresh();bank.rpgRun!.combat!.actives!.gauge[1]=1;
check('save healthy low charge',bank,result=>assert.notEqual(result.action.type,'profession'));
const comboOrder=fresh('mage');comboOrder.rpgRun!.hp=[5,4,12];comboOrder.rpgRun!.combat!.actives!.gauge[1]=5;comboOrder.rpgRun!.enemyConsumables![1]=['emergency-herb'];
check('heal BEFORE lethal area attack to finish first',comboOrder,result=>{assert.equal(result.action.type,'item');if(result.action.type==='item')assert.equal(result.action.id,'emergency-herb');assert.equal(result.followUp?.type,'profession');assert.equal(result.objective,'first');});
botMove(comboOrder);assert.equal(comboOrder.rpgRun!.hp[1],14);assert.equal(comboOrder.turn,1);assert.equal(comboOrder.roundActions,6);const locked=JSON.stringify(comboOrder);botMove(comboOrder);assert.equal(JSON.stringify(comboOrder),locked,'one item presentation precedes the skill');comboOrder.turnReadyAt=0;botMove(comboOrder);assert.equal(comboOrder.rpgRun!.status,'complete');assert.equal(comboOrder.winner,1);assert.deepEqual(comboOrder.rpgRun!.hp,[0,14,6]);
const response=fresh('cleric',2);response.rpgRun!.hp=[30,20,4];response.trick=[tile(14),tile(14,1)];response.lastBy=0;response.hpItemMatch!.battleTiles=[5,0,0];response.rpgRun!.combat!.itemBattle!.pairWins[2]=1;
hands(response,[[tile(4),tile(8,1),tile(12,2),tile(1)],[tile(3),tile(7,1),tile(11,2),tile(6,3)],[tile(2),tile(2,3),tile(5)]]);
check('cleric pair response prevents fatal conceded battle',response,result=>{assert.equal(result.action.type,'play');if(result.action.type==='play'){assert.equal(combo(result.action.tiles)?.label,'페어');assert.ok(beats(result.action.tiles,response.trick));}});
const trapped=fresh('rogue');trapped.rpgRun!.hp=[90,3,60];trapped.trick=[tile(2,3)];trapped.lastBy=0;
hands(trapped,[[tile(4),tile(8,1)],[tile(3),tile(7,1),tile(11,2)],[tile(5),tile(9,1)]]);
const pv=position(trapped),available=pv.stacks.flatMap((s,i)=>s.available?[i]:[]);assert.ok(available.length>1);pv.stacks[available[0]].coinAmount=8;pv.rpgRun!.combat!.itemBattle!.trapIntel[1]=[{index:available[0],tileId:-1,trapped:true}];
const safe=analyzeItemBattleTurn(pv,{auxiliary:false});assert.equal(safe.action.type,'draw');if(safe.action.type==='draw')assert.notEqual(safe.action.index,available[0],'public coin bait cannot justify certain fatal trap');
for(const g of [secure,pursue,bank,response,trapped]){
 const p=position(g),before=JSON.stringify(p),expected=analyzeItemBattleTurn(p),injected=structuredClone(p);
 injected.players.forEach((player,seat)=>{if(seat!==p.me)player.hand=[tile(1,3),tile(2,3)];});injected.stacks.forEach(stack=>{if(stack.upper)stack.lower=tile(2,3);});
 injected.hpItemMatch!.points=injected.hpItemMatch!.points.map((v,i)=>i===p.me?v:999999);injected.rpgRun!.enemyConsumables={...injected.rpgRun!.enemyConsumables,0:['ember-bomb'],2:['emergency-herb']};
 injected.rpgRun!.itemGuards={...injected.rpgRun!.itemGuards,0:true};injected.rpgRun!.combat!.actives!.gauge=injected.rpgRun!.combat!.actives!.gauge.map((v,i)=>i===p.me?v:5);
 assert.deepEqual(analyzeItemBattleTurn(injected),expected,'non-public enemy state must not change action, score or candidate count');assert.equal(JSON.stringify(p),before);
}
for(const round of [1,2,5]){const g=fresh('mage');g.round=round;g.hpItemMatch!.shopRound=round;g.completedBattles=0;g.rpgRun!.enemyConsumables![1]=['ember-bomb','emergency-herb'];const result=plan(g);assert.notEqual(result.action.type,'item');}
const pause=fresh();pause.turnReadyAt=Date.now()+3000;const beforePause=JSON.stringify(pause);botMove(pause);assert.equal(JSON.stringify(pause),beforePause);
for(const finish of [[tile(7)],[tile(7),tile(7,1)],[tile(7),tile(7,1),tile(7,2)],[3,4,5,6,7].map(n=>tile(n))]){
 const g=fresh();hands(g,[[tile(8),tile(10,1),tile(12,2),tile(1) ],finish,[tile(9),tile(11,1),tile(13,2),tile(15)]]);const result=analyzeItemBattleTurn(position(g),{auxiliary:false});assert.equal(result.action.type,'play');if(result.action.type==='play')assert.equal(result.action.tiles.length,finish.length,'do not hoard floor cards instead of a safe round finish');
}
const mage=fresh('mage');mage.rpgRun!.hp=[20,12,10];mage.trick=[tile(3),tile(4,1),tile(5,2),tile(6,3),tile(7)];mage.lastBy=0;
hands(mage,[[tile(8),tile(10,1),tile(12,2),tile(1)],[tile(9),tile(9,1),tile(9,2),tile(9,3),tile(10),tile(11,1),tile(12),tile(13,2),tile(14,3)],[tile(5),tile(8,1),tile(13),tile(15)]]);
for(const used of [false,true]){mage.rpgRun!.combat!.activeUsed[1]=used;const result=analyzeItemBattleTurn(position(mage),{auxiliary:false});assert.equal(result.action.type,'play');if(result.action.type==='play')assert.equal(combo(result.action.tiles)?.label,'포카드','mage knows repeatable four-of-kind damage when responding');}
const swordsman=fresh();swordsman.rpgRun!.hp=[65,70,3];hands(swordsman,[[tile(4),tile(8,1),tile(12,2),tile(1)],[tile(7),tile(7,1),tile(11,2),tile(2,3)],[tile(5),tile(9,1),tile(13,2),tile(15)]]);
check('swordsman pair passive secures first',swordsman,result=>{assert.equal(result.action.type,'play');if(result.action.type==='play')assert.equal(combo(result.action.tiles)?.label,'페어');});
for(const role of ['swordsman','mage','cleric','rogue'] as const)for(const budget of [0,3,5,8,10,20]){
 const g=fresh(role);g.rpgRun!.hp[1]=30;const p=position(g),cart=chooseItemBattlePurchases(p,budget);assert.ok(cart.length<=2);assert.equal(new Set(cart).size,cart.length);assert.ok(cart.reduce((sum,id)=>sum+HP_ITEM_PRICES[id],0)<=budget);
 const foreign=structuredClone(p);foreign.players[0].hand=[tile(2,3)];foreign.hpItemMatch!.points[0]=999;foreign.rpgRun!.combat!.actives!.gauge[0]=5;assert.deepEqual(chooseItemBattlePurchases(foreign,budget),cart,'shopping uses only own budget and public information');
}
const injured=fresh();injured.rpgRun!.hp[1]=8;assert.ok(chooseItemBattlePurchases(position(injured),20).includes('emergency-herb'));
const healthy=fresh();assert.ok(!chooseItemBattlePurchases(position(healthy),20).includes('emergency-herb'));
const fallback=fresh('mage');fallback.rpgRun!.hp=[5,4,12];fallback.rpgRun!.combat!.actives!.gauge[1]=5;fallback.rpgRun!.enemyConsumables![1]=['emergency-herb'];await runLocalBot(fallback,new AbortController().signal);assert.equal(fallback.rpgRun!.hp[1],14,'worker-unavailable fallback follows the same heal-first plan');assert.equal(fallback.roundActions,6);
for(const count of [18,24,36]){
 const g=fresh(),all=Array.from({length:60},(_,id)=>({id,n:Math.floor(id/4)+1,s:id%4}));hands(g,[all.slice(count,count+5),all.slice(0,count),all.slice(count+5,count+10)]);
 const at=performance.now(),result=analyzeItemBattleTurn(position(g),{auxiliary:false}),elapsed=performance.now()-at;assert.equal(result.action.type,'play');if(result.action.type==='play')assert.ok(result.action.tiles.every(t=>g.players[1].hand.some(own=>own.id===t.id)));assert.ok(Number.isFinite(result.score));reports.push({name:'bounded large rack',cards:count,ms:elapsed,considered:result.considered});
 if(count===36){g.rpgRun!.enemyConsumables![1]=['swapped-fate','scout-lens','whisper-eye'];const begin=performance.now(),joint=plan(g);assert.ok(Number.isFinite(joint.score));assert.ok(joint.considered<10000);reports.push({name:'bounded large rack with items',cards:count,ms:performance.now()-begin,considered:joint.considered});}
}
assert.ok(itemBattlePositionValue([100,10,0],[4,4,4],1)>itemBattlePositionValue([100,0,10],[4,4,4],1),'second must beat third');
console.log('PASS: rank-aware endings, first-place pursuit, gauge reservation, heal/skill ordering with real execution, defensive class response, trap survival, privacy and first-duel/animation locks.');
console.log(JSON.stringify({reports}));
