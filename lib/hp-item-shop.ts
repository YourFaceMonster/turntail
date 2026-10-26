import type {Game} from './game.ts';
import {RPG_BASIC_ITEMS,type RpgTacticalItem} from './rpg-items.ts';

export type HpItemVariant=1|2;
export type HpItemRoundReport={round:number,hpBefore:number[],hpAfter:number[],earned:number[],items:{actor:number,target:number,id:string,kind:string,amount?:number}[]};
export type HpItemMatchState={points:number[],shopRound:number,roundStartHp:number[],roundItems:HpItemRoundReport['items'],roundEarned:number[],report?:HpItemRoundReport};
export const HP_ITEM_PRICES:Record<string,number>={'scout-lens':6,'swapped-fate':10,'ward-seal':10,'ember-bomb':16,'emergency-herb':8};
export const HP_ITEM_LOADOUT_SIZE=5;
export const HP_ITEM_ROUND_ALLOWANCE=30;
export function hpItemShopPending(game:Pick<Game,'hpItemMode'|'hpItemVariant'|'hpItemMatch'|'round'>){return !!game.hpItemMode&&game.hpItemVariant===2&&game.hpItemMatch?.shopRound!==game.round;}
/** Commit a full cart atomically. AI pays the same prices and never reads another hand. */
export function buyHpItemLoadout(game:Game,cart:string[]){
 const state=game.hpItemMatch,run=game.rpgRun;
 if(!state||!run||!hpItemShopPending(game)||game.phase!=='playing'||game.roundActions)throw Error('지금은 아이템 구매 시간이 아니에요.');
 if(cart.length!==HP_ITEM_LOADOUT_SIZE||cart.some(id=>!RPG_BASIC_ITEMS.includes(id as RpgTacticalItem)))throw Error('이번 판에 가져갈 아이템 5개를 골라 주세요.');
 const price=cart.reduce((sum,id)=>sum+HP_ITEM_PRICES[id],0);
 if(price>state.points[0])throw Error('구매 포인트가 부족해요.');
 const kits:string[][]=[cart];
 for(let seat=1;seat<game.players.length;seat++){
  const kit:string[]=[],preferred=['ward-seal','ember-bomb',run.hp[seat]<90?'emergency-herb':'swapped-fate','swapped-fate','scout-lens'];let budget=state.points[seat];
  for(let index=0;index<5;index++){
   const affordable=RPG_BASIC_ITEMS.filter(id=>HP_ITEM_PRICES[id]<=budget-(4-index)*6);
   const id=affordable.includes(preferred[index] as RpgTacticalItem)?preferred[index]:affordable[0];
   if(!id)throw Error('AI 구매 포인트를 확인해 주세요.');kit.push(id);budget-=HP_ITEM_PRICES[id];
  }
  kits.push(kit);
 }
 kits.forEach((kit,seat)=>{state.points[seat]-=kit.reduce((sum,id)=>sum+HP_ITEM_PRICES[id],0);});
 run.consumables=[...cart];run.enemyConsumables=Object.fromEntries(kits.slice(1).map((kit,index)=>[index+1,kit]));
 state.shopRound=game.round;run.updatedAt=Date.now();
}
export function finishHpItemRoundReport(game:Game,hpBeforeSettlement?:number[]){
 const run=game.rpgRun,state=game.hpItemMatch;if(!game.hpItemMode||!run||!state||state.report?.round===game.round)return;
 const earned=[...state.roundEarned],loss=(hpBeforeSettlement||run.hp).map((hp,index)=>Math.max(0,hp-run.hp[index]));
 // Only HP actually lost is converted, with the card winner receiving the settlement pool.
 if(game.hpItemVariant===2&&game.result&&game.winner!==null){
  const cardLoss=game.result.players.map((player,index)=>Math.min(Math.max(0,-player.delta),loss[index]));
  const reward=cardLoss.reduce((sum,value,index)=>sum+(index===game.winner?0:value),0);
  earned[game.winner]+=reward;state.points[game.winner]+=reward;
 }
 state.report={round:game.round,hpBefore:[...state.roundStartHp],hpAfter:[...run.hp],earned,items:[...state.roundItems]};
}
export function beginHpItemRound(game:Game){
 const state=game.hpItemMatch,run=game.rpgRun;if(!game.hpItemMode||!state||!run)return;
 if(game.hpItemVariant===2&&game.round>1)state.points=state.points.map(points=>points+HP_ITEM_ROUND_ALLOWANCE);
 state.roundStartHp=[...run.hp];state.roundItems=[];state.roundEarned=game.players.map(()=>0);
 if(game.hpItemVariant===2){run.consumables=[];run.enemyConsumables={1:[],2:[]};}
}
