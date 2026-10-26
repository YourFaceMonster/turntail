import type {Game} from './game.ts';
import {RPG_BASIC_ITEMS,type RpgTacticalItem} from './rpg-items.ts';

export type HpItemVariant=1|2;
export type HpItemRoundReport={round:number,hpBefore:number[],hpAfter:number[],earned:number[],itemDamage?:number[],itemHealing?:number[],cardDamage?:number[],itemPoints?:number[],cardPoints?:number[],items:{actor:number,target:number,id:string,kind:string,amount?:number}[]};
export type HpItemMatchState={points:number[],shopRound:number,roundStartHp:number[],roundItems:HpItemRoundReport['items'],roundEarned:number[],pendingItemDelta?:number[],pendingItemPoints?:number[],report?:HpItemRoundReport};
export const HP_ITEM_PRICES:Record<string,number>={'scout-lens':3,'swapped-fate':6,'ward-seal':6,'ember-bomb':10,'emergency-herb':5};
export const HP_ITEM_START_POINTS=20;
export const HP_ITEM_ROUND_ALLOWANCE=8;
export function hpItemShopPending(game:Pick<Game,'hpItemMode'|'hpItemVariant'|'hpItemMatch'|'round'>){return !!game.hpItemMode&&game.hpItemVariant===2&&game.hpItemMatch?.shopRound!==game.round;}
/** Any affordable cart, including an empty cart. Existing items survive the purchase. */
export function buyHpItemLoadout(game:Game,cart:string[]){
 const state=game.hpItemMatch,run=game.rpgRun;
 if(!state||!run||!hpItemShopPending(game)||game.phase!=='playing'||game.roundActions)throw Error('지금은 아이템 구매 시간이 아니에요.');
 if(!Array.isArray(cart)||cart.some(id=>!RPG_BASIC_ITEMS.includes(id as RpgTacticalItem)))throw Error('구매할 아이템을 확인해 주세요.');
 const price=cart.reduce((sum,id)=>sum+HP_ITEM_PRICES[id],0);
 if(price>state.points[0])throw Error('구매 포인트가 부족해요.');
 const kits:string[][]=[cart];
 for(let seat=1;seat<game.players.length;seat++){
  const held=run.enemyConsumables?.[seat]||[],kit:string[]=[],preferred=[...(run.hp[seat]<=85?['emergency-herb']:[]),...(run.itemGuards?.[seat]?[]:['ward-seal']),'ember-bomb','swapped-fate','scout-lens'];let budget=state.points[seat];
  for(const id of preferred){
   if(kit.length>=2||held.includes(id)||HP_ITEM_PRICES[id]>budget)continue;
   kit.push(id);budget-=HP_ITEM_PRICES[id];
  }
  kits.push(kit);
 }
 kits.forEach((kit,seat)=>{state.points[seat]-=kit.reduce((sum,id)=>sum+HP_ITEM_PRICES[id],0);});
 run.consumables=run.consumables.concat(cart);run.enemyConsumables=Object.fromEntries(kits.slice(1).map((kit,index)=>[index+1,[...(run.enemyConsumables?.[index+1]||[]),...kit]]));
 state.shopRound=game.round;run.updatedAt=Date.now();
}
export function finishHpItemRoundReport(game:Game,hpBeforeSettlement?:number[]){
 const run=game.rpgRun,state=game.hpItemMatch;if(!game.hpItemMode||!run||!state||state.report?.round===game.round)return;
 const earned=[...state.roundEarned],loss=(hpBeforeSettlement||run.hp).map((hp,index)=>Math.max(0,hp-run.hp[index])),cardPoints=game.players.map(()=>0);
 if(game.hpItemVariant===2)state.points=state.points.map((points,index)=>points+(state.pendingItemPoints?.[index]||0));
 // Only HP actually lost is converted, with the card winner receiving the settlement pool.
 if(game.hpItemVariant===2&&game.result&&game.winner!==null){
  const cardLoss=game.result.players.map((player,index)=>Math.min(Math.max(0,-player.delta),loss[index]));
  const reward=cardLoss.reduce((sum,value,index)=>sum+(index===game.winner?0:value),0);
  earned[game.winner]+=reward;state.points[game.winner]+=reward;cardPoints[game.winner]=reward;
 }
 const amounts=(kind:string)=>game.players.map((_,seat)=>state.roundItems.filter(item=>item.target===seat&&item.kind===kind).reduce((sum,item)=>sum+(item.amount||0),0));
 state.report={round:game.round,hpBefore:[...state.roundStartHp],hpAfter:[...run.hp],earned,itemDamage:amounts('damage'),itemHealing:amounts('heal'),cardDamage:loss,itemPoints:[...state.roundEarned],cardPoints,items:[...state.roundItems]};
}
export function beginHpItemRound(game:Game){
 const state=game.hpItemMatch,run=game.rpgRun;if(!game.hpItemMode||!state||!run)return;
 if(game.hpItemVariant===2&&game.round>1)state.points=state.points.map(points=>points+HP_ITEM_ROUND_ALLOWANCE);
 state.roundStartHp=[...run.hp];state.roundItems=[];state.roundEarned=game.players.map(()=>0);state.pendingItemDelta=game.players.map(()=>0);state.pendingItemPoints=game.players.map(()=>0);
}
export function hpItemEffectiveHp(game:Pick<Game,'hpItemMode'|'hpItemMatch'|'rpgRun'>,seat:number){return Math.max(0,Math.min(100,(game.rpgRun?.hp[seat]||0)+(game.hpItemMode?game.hpItemMatch?.pendingItemDelta?.[seat]||0:0)));}
/** Apply queued HP once, immediately before the card settlement. */
export function applyPendingHpItems(game:Game){if(!game.hpItemMode||!game.hpItemMatch||!game.rpgRun)return;game.rpgRun.hp=game.rpgRun.hp.map((_,seat)=>hpItemEffectiveHp(game,seat));game.hpItemMatch.pendingItemDelta=game.players.map(()=>0);}
export function hpItemDisplayHp(game:Pick<Game,'hpItemMode'|'hpItemMatch'|'rpgRun'|'phase'>,seat:number,reveal=false){return game.hpItemMode&&game.phase==='ended'&&!reveal?game.hpItemMatch?.report?.hpBefore[seat]??game.rpgRun?.hp[seat]??0:game.rpgRun?.hp[seat]??0;}
