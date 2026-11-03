import assert from 'node:assert/strict';
import {act} from '../lib/game.ts';
import {createRpgGame} from '../lib/rpg-game.ts';
import {allocateRpgPoints,buyRpgItem,newRpgRun,settleRpgRound,type RpgRun} from '../lib/rpg.ts';
import {RPG_RELIC_HINTS,withRelicActivations} from '../lib/rpg-relic-feedback.ts';

const round=(id:string,delta:number[],counts=[5,0,10])=>({id,at:20,players:delta.map((value,index)=>({delta:value,count:counts[index]}))});
const effects=(run:RpgRun)=>(run.relicActivations||[]).map(event=>[event.relicId,event.message]);
const original={...newRpgRun('defense',1),equipped:['cracked-heart']};
const blocked=settleRpgRound(original,round('defense-1',[-3,2,1]),1);
assert.equal(blocked.hp[0],100);
assert.deepEqual(effects(blocked),[['cracked-heart','피해 3 방어']],'report the amount actually prevented, even below the eight-point cap');
assert.equal(original.relicActivations,undefined,'the original run and legacy saves are not mutated');
assert.equal(settleRpgRound(blocked,round('defense-1',[-3,2,1]),1),blocked,'a replayed settlement adds no activation');
const again=settleRpgRound(blocked,round('defense-2',[-3,2,1]),1);
assert.equal(again.hp[0],97);assert.equal(again.relicActivations?.length,1,'first-hit protection does not flash twice in a stage');

const finish=(hp:number,stage=1,paid:number[]=[])=>settleRpgRound({...newRpgRun('finish'),stage,hp:[hp,100,1],equipped:['recovery-lantern','second-ring'],bossCoinPaid:paid},round(`finish-${hp}-${stage}`,[0,5,-5]),1);
const cleared=finish(50);
assert.equal(cleared.hp[0],65);assert.equal(cleared.coins,35);
assert.deepEqual(effects(cleared),[['recovery-lantern','추가 회복 +5 HP'],['second-ring','2등 주화 +15']]);
assert.equal(finish(88).relicActivations?.find(event=>event.relicId==='recovery-lantern')?.message,'추가 회복 +2 HP','capped healing reports only the extra HP received');
assert.ok(!effects(finish(90)).some(([id])=>id==='recovery-lantern'),'a full HP bar must not produce a false healing notice');
assert.ok(!effects(finish(50,3)).some(([id])=>id==='recovery-lantern'),'region recovery is not attributed to the lantern');
assert.ok(!effects(finish(50,3,[3])).some(([id])=>id==='second-ring'),'an already-paid boss cannot display another coin bonus');

const rescued=settleRpgRound({...newRpgRun('rescue'),stage:3,hp:[1,100,100],equipped:['final-knot']},round('rescue',[-5,0,5],[10,5,0]),2);
assert.equal(rescued.hp[0],60);assert.deepEqual(effects(rescued),[['final-knot','구제 HP 60']]);
const victory=settleRpgRound({...newRpgRun('victory'),equipped:['stopped-hourglass']},round('victory',[15,0,-15],[0,5,10]),0);
assert.equal(victory.points,20);assert.deepEqual(effects(victory),[['stopped-hourglass','포인트 +5']]);

const allocation={...cleared,coins:0,points:35,hp:[50,100,0],equipped:['second-heart','two-sided-coin'],relicActivations:undefined};
const allocated=allocateRpgPoints(allocation,10);
assert.equal(allocated.hp[0],62);assert.equal(allocated.coins,27);
assert.deepEqual(effects(allocated),[['second-heart','추가 회복 +2 HP'],['two-sided-coin','추가 주화 +2']]);
assert.deepEqual(effects(allocateRpgPoints({...allocation,points:9},4)),[],'rounding down to zero is not a proc');

const shopping:RpgRun={...newRpgRun('shop'),status:'ready',coins:100,equipped:['merchants-scales'],shops:[{area:1,stock:[{id:'red-vial',kind:'consumable',price:30,quantity:1},{id:'moonlight-soup',kind:'consumable',price:35,quantity:1}]}]};
const bought=buyRpgItem(shopping,'red-vial');
assert.equal(bought.coins,90);assert.deepEqual(effects(bought),[['merchants-scales','주화 20 절약']]);
const secondPurchase=buyRpgItem(bought,'moonlight-soup');
assert.equal(secondPurchase.coins,55);assert.equal(secondPurchase.relicActivations?.length,1,'second purchase in the same area has no discount activation');
assert.deepEqual(effects(buyRpgItem({...shopping,equipped:[]},'red-vial')),[],'ordinary stat changes cannot activate an unequipped relic');

const game=createRpgGame('장갑 검증');game.turn=0;game.trick=[];
game.rpgRun!.equipped=['gamblers-gloves'];
game.players[0].hand=[3,5,7,9,11,13].map((n,index)=>({id:101+index,n,s:0}));
act(game,0,'play',game.players[0].hand.slice(0,5).map(tile=>tile.id));
assert.equal(game.rpgRun!.points,2);assert.deepEqual(effects(game.rpgRun!),[['gamblers-gloves','포인트 +2']]);
game.turn=0;game.trick=[];game.players[0].hand=[4,6,8,10,12,14].map((n,index)=>({id:201+index,n,s:1}));
act(game,0,'play',game.players[0].hand.slice(0,5).map(tile=>tile.id));
assert.equal(game.rpgRun!.points,2);assert.equal(game.rpgRun!.relicActivations?.length,1);

let history=newRpgRun('history');for(let i=0;i<30;i++)history=withRelicActivations(history,[{relicId:'gamblers-gloves',message:'포인트 +2'}],i);
assert.equal(history.relicActivations?.length,24);assert.equal(history.relicActivations?.[0].seq,7);assert.equal(history.relicActivations?.at(-1)?.seq,30,'bounded history retains a monotonically increasing cursor');
assert.deepEqual(JSON.parse(JSON.stringify(history)).relicActivations,history.relicActivations,'activation metadata survives a save round trip');
assert.equal(Object.keys(RPG_RELIC_HINTS).length,13);
console.log('PASS: confirmed relic bonuses, capped healing, repeat guards, shop discounts, allocation and bounded feedback history');
