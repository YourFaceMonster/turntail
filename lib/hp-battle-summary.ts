import type {HpBattleEvent} from './hp-item-battle.ts';
/** The fight winner and the current HP standing are separate pieces of information. */
export function hpBattleSummary(event:HpBattleEvent,players:readonly {name:string,count:number}[]){
 const order=players.map((_,seat)=>seat).sort((a,b)=>event.hpAfter[b]-event.hpAfter[a]||players[a].count-players[b].count||a-b);
 const rows=order.map((seat,index)=>{
  const damage=Math.max(0,event.hpBefore[seat]-event.hpAfter[seat]),healed=Math.max(0,event.hpAfter[seat]-event.hpBefore[seat]);
  const classExtra=event.professions?.reduce((sum,effect)=>sum+effect.damage,0)||0,extra=classExtra+(event.relicDamage||0)+(event.skills?.filter(skill=>skill.actor===event.actor&&skill.outcome==='attack').reduce((sum,skill)=>sum+(skill.amount||0),0)||0),guard=(event.skills?.filter(skill=>skill.actor===seat&&skill.outcome==='guard').reduce((sum,skill)=>sum+(skill.amount||0),0)||0)+(event.blockedDamage?.[seat]||0);
  const note=seat===event.actor?(healed?`승리 · 회복 +${healed}`:'승리 · 피해 없음'):event.playedCount?[extra?`추가 피해 +${extra}`:'',guard?`방어 ${guard}`:''].filter(Boolean).join(' · '):damage?`싸움 피해 −${damage}`:'방어 · 피해 없음';
  return {seat,rank:index+1,before:event.hpBefore[seat],hp:event.hpAfter[seat],damage,healed,note};
 });
 const totalDamage=rows.reduce((sum,row)=>sum+row.damage,0);
 return {rows,totalDamage,calculation:event.playedCount?{count:event.playedCount,base:event.damage}:null,text:`${players[event.actor].name} ${event.label} 승리${event.playedCount?` · 제출 ${event.playedCount}장`:""} · 총 HP 피해 ${totalDamage}`};
}
