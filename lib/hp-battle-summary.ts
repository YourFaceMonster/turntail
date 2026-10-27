import type {HpBattleEvent} from './hp-item-battle.ts';
/** The fight winner and the current HP standing are separate pieces of information. */
export function hpBattleSummary(event:HpBattleEvent,players:readonly {name:string,count:number}[]){
 const order=players.map((_,seat)=>seat).sort((a,b)=>event.hpAfter[b]-event.hpAfter[a]||players[a].count-players[b].count||a-b);
 const rows=order.map((seat,index)=>{
  const damage=Math.max(0,event.hpBefore[seat]-event.hpAfter[seat]);
  const note=seat===event.actor?'승리 · 피해 없음':damage?`싸움 피해 −${damage}`:'방어 · 피해 없음';
  return {seat,rank:index+1,before:event.hpBefore[seat],hp:event.hpAfter[seat],damage,note};
 });
 const totalDamage=rows.reduce((sum,row)=>sum+row.damage,0);
 return {rows,totalDamage,text:`${players[event.actor].name} ${event.label} 승리 · 총 HP 피해 ${totalDamage}`};
}
