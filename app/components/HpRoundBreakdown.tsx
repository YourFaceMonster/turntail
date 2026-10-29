import type {view} from '../../lib/game.ts';
import {isBattleItemMode,usesOriginalItemShop} from '../../lib/hp-item-battle';
import {hpRoundTotals} from '../../lib/hp-round-totals';
export function HpRoundTotals({game,seat,before}:{game:ReturnType<typeof view>,seat:number,before:number}){
 const after=game.rpgRun!.hp[seat],totals=hpRoundTotals(game.hpItemMatch?.report,seat,before,after),net=after-before,netText=net>0?`+${net}`:net<0?`−${-net}`:'±0';
 return <span className="round-hp-totals" aria-label={`이번 판 총피해 ${totals.damage}, 총회복 ${totals.healing}, 최종 ${netText}`}><span className="hp-lost">피해 −{totals.damage}</span><span className="hp-recovered">회복 +{totals.healing}</span><b className={`hp-net ${net<0?'is-loss':net>0?'is-gain':'is-even'}`}>최종 {netText}</b></span>;
}
export function HpRoundBreakdown({game,seat,before}:{game:ReturnType<typeof view>,seat:number,before:number}){
 const run=game.rpgRun!,report=game.hpItemMatch?.report,items=report?.items||[],battle=isBattleItemMode(game);
 const damage=report?.itemDamage?.[seat]??items.filter(item=>item.kind==='damage'&&item.target===seat).reduce((sum,item)=>sum+(item.amount||0),0);
 const itemHeal=report?.itemHealing?.[seat]||0,skillHeal=report?.professionHealing?.[seat]||0,moneyDamage=report?.moneyDamage?.[seat]||0,relicHeal=report?.relicHealing?.[seat]||0,trapDamage=report?.trapDamage?.[seat]||0,ambushDamage=report?.ambushDamage?.[seat]||0,activeDamage=report?.activeDamage?.[seat]||0,activeHeal=report?.activeHealing?.[seat]||0;
 const cardDamage=report?.cardDamage?.[seat]??Math.max(0,before+itemHeal+skillHeal+relicHeal-damage-moneyDamage-trapDamage-ambushDamage-activeDamage+activeHeal-run.hp[seat]);
 const hpNumber=(amount:number,healing=false)=>amount>0?<b className={healing?'hp-recovered':'hp-lost'}>{healing?'+':'−'}{amount}</b>:<span className="hp-unchanged">0</span>;
 const moneyDelta=report?.moneyDelta?.[seat]||0;
 return <div className="compact-hp-breakdown"><p className="round-health-detail">아이템 {hpNumber(damage)}<span className="breakdown-dot">·</span>{battle?'싸움':'카드'} {hpNumber(cardDamage)}{trapDamage>0&&<><span className="breakdown-dot">·</span>함정 {hpNumber(trapDamage)}</>}{ambushDamage>0&&<><span className="breakdown-dot">·</span>기습 {hpNumber(ambushDamage)}</>}{activeDamage>0&&<><span className="breakdown-dot">·</span>액티브 {hpNumber(activeDamage)}</>}{activeHeal>0&&<><span className="breakdown-dot">·</span>액티브 회복 {hpNumber(activeHeal,true)}</>}{relicHeal>0&&<><span className="breakdown-dot">·</span>유물 회복 {hpNumber(relicHeal,true)}</>}{itemHeal>0&&<><span className="breakdown-dot">·</span>아이템 회복 {hpNumber(itemHeal,true)}</>}{skillHeal>0&&<><span className="breakdown-dot">·</span>스킬 회복 {hpNumber(skillHeal,true)}</>}</p>
  {battle&&<p className="round-money-detail"><span className="money-balance">주화 {game.hpItemMatch?.points[seat]}P</span> <small>{report?.moneySkipped?'(미정산)':<>(판 정산 <span className={`money-delta ${moneyDelta>0?'is-positive':moneyDelta<0?'is-negative':'is-neutral'}`}>{moneyDelta>0?'+':''}{moneyDelta}P</span>)</>}</small>{!!report?.floorCoinMoney?.[seat]&&<span className="floor-coin-report"> · 바닥 주화 <b>+{report.floorCoinMoney[seat]}P</b></span>}{moneyDamage>0&&<span className="round-money-shortage"> · 주화 부족 {moneyDamage}P → HP {hpNumber(moneyDamage)}</span>}</p>}
  {usesOriginalItemShop(game)&&!!((report?.battlePoints?.[seat]||0)+(report?.itemPoints?.[seat]||0))&&<small>이전 규칙 보상 +{(report?.battlePoints?.[seat]||0)+(report?.itemPoints?.[seat]||0)}P</small>}
  {!!report?.skillMoney?.[seat]&&<small>스킬 주화 +{report.skillMoney[seat]}P</small>}
  {game.hpItemVariant===2&&!battle&&<p className="round-money-detail">포인트 {game.hpItemMatch?.points[seat]}P <small>(아이템 +{report?.itemPoints?.[seat]||0} · 승리 +{report?.cardPoints?.[seat]||0})</small></p>}
 </div>;
}
