import type {view} from '../../lib/game.ts';
import {isBattleItemMode,usesOriginalItemShop} from '../../lib/hp-item-battle';
export function HpRoundBreakdown({game,seat,before}:{game:ReturnType<typeof view>,seat:number,before:number}){
 const run=game.rpgRun!,report=game.hpItemMatch?.report,items=report?.items||[],battle=isBattleItemMode(game);
 const damage=report?.itemDamage?.[seat]??items.filter(item=>item.kind==='damage'&&item.target===seat).reduce((sum,item)=>sum+(item.amount||0),0);
 const itemHeal=report?.itemHealing?.[seat]||0,skillHeal=report?.professionHealing?.[seat]||0,moneyDamage=report?.moneyDamage?.[seat]||0;
 const cardDamage=report?.cardDamage?.[seat]??Math.max(0,before+itemHeal+skillHeal-damage-moneyDamage-run.hp[seat]);
 const hpNumber=(amount:number,healing=false)=>amount>0?<b className={healing?'hp-recovered':'hp-lost'}>{healing?'+':'−'}{amount}</b>:<span className="hp-unchanged">0</span>;
 return <div className="compact-hp-breakdown"><p className="round-health-detail">아이템 {hpNumber(damage)}<span className="breakdown-dot">·</span>{battle?'싸움':'카드'} {hpNumber(cardDamage)}{itemHeal>0&&<><span className="breakdown-dot">·</span>아이템 회복 {hpNumber(itemHeal,true)}</>}{skillHeal>0&&<><span className="breakdown-dot">·</span>스킬 회복 {hpNumber(skillHeal,true)}</>}</p>
  {battle&&<p className="round-money-detail">주화 {game.hpItemMatch?.points[seat]}P <small>{report?.moneySkipped?'(미정산)':`(판 정산 ${(report?.moneyDelta?.[seat]||0)>0?'+':''}${report?.moneyDelta?.[seat]||0}P)`}</small>{moneyDamage>0&&<span className="round-money-shortage"> · 주화 부족 {moneyDamage}P → HP {hpNumber(moneyDamage)}</span>}</p>}
  {usesOriginalItemShop(game)&&!!((report?.battlePoints?.[seat]||0)+(report?.itemPoints?.[seat]||0))&&<small>이전 규칙 보상 +{(report?.battlePoints?.[seat]||0)+(report?.itemPoints?.[seat]||0)}P</small>}
  {!!report?.skillMoney?.[seat]&&<small>스킬 주화 +{report.skillMoney[seat]}P</small>}
  {game.hpItemVariant===2&&!battle&&<p className="round-money-detail">포인트 {game.hpItemMatch?.points[seat]}P <small>(아이템 +{report?.itemPoints?.[seat]||0} · 승리 +{report?.cardPoints?.[seat]||0})</small></p>}
 </div>;
}
