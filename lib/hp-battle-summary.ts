import type {HpBattleEvent} from './hp-item-battle.ts';
import {tr} from './i18n/index.ts';
/** The fight winner and the current HP standing are separate pieces of information. */
export function hpBattleSummary(event:HpBattleEvent,players:readonly {name:string,count:number}[]){
 const order=[event.actor,...players.flatMap((_,seat)=>seat===event.actor||event.excludedSeats?.includes(seat)?[]:[seat])];
 const rows=order.map((seat,index)=>{
  const damage=Math.max(0,event.hpBefore[seat]-event.hpAfter[seat]),healed=Math.max(0,event.hpAfter[seat]-event.hpBefore[seat]);
  const classExtra=event.professions?.reduce((sum,effect)=>sum+effect.damage,0)||0,extra=classExtra+(event.relicDamage||0),guard=event.blockedDamage?.[seat]||0;
  const note=seat===event.actor?(healed?tr('회복 +{0}',{0:healed}):tr('피해 없음')):event.playedCount?[extra?tr('추가 피해 −{0}',{0:extra}):'',guard?tr('방어 {0}',{0:guard}):''].filter(Boolean).join(' · '):damage?tr('싸움 피해 −{0}',{0:damage}):tr('방어 · 피해 없음');
  return {seat,rank:index+1,before:event.hpBefore[seat],hp:event.hpAfter[seat],damage,healed,note};
 });
 const totalDamage=rows.reduce((sum,row)=>sum+row.damage,0);
 return {rows,totalDamage,calculation:event.playedCount?{count:event.playedCount,base:event.damage}:null,text:tr('{0} {1} 승리{2} · 총 HP 피해 {3}',{0:players[event.actor].name,1:event.label,2:event.playedCount?` · 제출 ${event.playedCount}장`:"",3:totalDamage})};
}
