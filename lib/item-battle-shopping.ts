import {legalOptions,type BotPosition} from './game';
import {itemBattlePositionValue} from './item-battle-plan';
import {HP_ITEM_PRICES} from './hp-item-shop';
import {RPG_SHOP_ITEMS} from './rpg-items';

/** The same prices and two-item purchase cap; only the AI's preferences change.
 * Opponent wallets, guards, gauges, inventory and hidden tiles are never read. */
export function chooseItemBattlePurchases(p:BotPosition,budget:number){
 const run=p.rpgRun!,me=p.me,hp=run.hp,counts=p.players.map(player=>player.count),role=run.combat?.professions[me],held=run.consumables,base=itemBattlePositionValue(hp,counts,me);
 const candidates=RPG_SHOP_ITEMS.filter(id=>!held.includes(id)&&HP_ITEM_PRICES[id]<=budget),value=(next:number[])=>itemBattlePositionValue(next,counts,me)-base;
 const options=legalOptions((p.players[me].hand||[]).slice(0,18),[]),families=new Set(options.map(option=>option.label));
 const utility=(id:string)=>{
  if(id==='emergency-herb')return value(hp.map((v,i)=>i===me?Math.min(100,v+10):v))/100+(hp[me]<=25?12:hp[me]<=60?5:0);
  if(id==='ember-bomb')return Math.max(...hp.map((v,i)=>i===me?-Infinity:value(hp.map((h,j)=>j===i?Math.max(0,h-8):h))))/50;
  if(id==='ward-seal')return run.itemGuards?.[me]?0:value(hp.map((v,i)=>i===me?v+7:v))*.75/100+2;
  if(id==='scout-lens')return role==='rogue'&&(families.has('싱글')||families.has('트리플'))?1.8:3.8;
  if(id==='swapped-fate')return families.size<=2&&counts[me]>=5?4.2:1.5;
  return counts.some((n,i)=>i!==me&&n<=3)?4:2;
 };
 const reserve=Math.min(8,Math.max(3,counts[me]-Math.min(...counts.filter((_,i)=>i!==me))+3));
 let best:string[]=[],bestScore=0;
 for(let mask=1;mask<(1<<candidates.length);mask++){
  const cart=candidates.filter((_,i)=>mask&(1<<i));if(cart.length>2)continue;
  const price=cart.reduce((sum,id)=>sum+HP_ITEM_PRICES[id],0);if(price>budget)continue;
  const score=cart.reduce((sum,id)=>sum+utility(id)-HP_ITEM_PRICES[id]*.35,0)-Math.max(0,reserve-(budget-price))*.9;
  if(score>bestScore){best=cart;bestScore=score;}
 }
 return best;
}
