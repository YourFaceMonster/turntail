import type {HpItemRoundReport} from './hp-item-shop';

/** Gross losses and actual recovery stay separate, even when the net HP is zero. */
export function hpRoundTotals(report:HpItemRoundReport|undefined,seat:number,before:number,after:number){
 const amount=(field:number[]|undefined)=>Math.max(0,field?.[seat]||0);
 const items=report?.items||[],itemAmount=(kind:string)=>items.filter(item=>item.target===seat&&item.kind===kind).reduce((sum,item)=>sum+Math.max(0,item.amount||0),0);
 const healing=(report?.itemHealing?amount(report.itemHealing):itemAmount('heal'))+amount(report?.professionHealing)+amount(report?.relicHealing)+amount(report?.activeHealing);
 const otherDamage=(report?.itemDamage?amount(report.itemDamage):itemAmount('damage'))+amount(report?.moneyDamage)+amount(report?.trapDamage)+amount(report?.ambushDamage)+amount(report?.activeDamage);
 const cards=report?.cardDamage??report?.battleDamage;
 const cardDamage=cards?amount(cards):Math.max(0,before+healing-otherDamage-after);
 return {damage:cardDamage+otherDamage,healing};
}
