import type {LegalOption} from '../../lib/game';
import {recommendationNumbers} from '../../lib/selection';
import {patternTier} from '../../lib/play-presentation';
import {tr} from '../../lib/i18n/index.ts';
type Props={groups:[string,LegalOption[]][],family:string|null,selectionKey:string,disabled:boolean,choose:(options:LegalOption[])=>void};
/** All pair/triple numbers remain visible; repeated taps cycle suit variants of that number. */
export default function LegalRecommendations({groups,family,selectionKey,disabled,choose}:Props){
 return <>{groups.map(([label,group])=>{
  const numbered=label==='페어'||label==='트리플',chosen=family===label;
  return <div className={`legal-family combo-tier-${patternTier(label)} ${chosen?'family-active':''}`} data-recommendation-family={label} role="group" aria-label={tr('{0} 추천',{0:tr(label)})} key={label}>
   <button className={`legal-family-name ${chosen?'chosen':''}`} disabled={disabled} aria-pressed={chosen} onClick={()=>choose(group)} aria-label={tr('{0} 선택',{0:tr(label)})}><b>{tr(label)}</b>{!numbered&&label!=='싱글'&&group.length>1&&<small aria-hidden="true">↻</small>}</button>
   {numbered&&recommendationNumbers(group).map(([n,variants])=><button className={`legal-family-number ${variants.some(o=>o.id===selectionKey)?'chosen':''}`} data-recommendation-number={n} key={n} disabled={disabled} onClick={()=>choose(variants)} aria-label={tr('{0} {1} 선택{2}',{0:tr(label),1:n,2:variants.length>1?tr(' · 문양 조합 {0}가지, 다시 눌러 교체',{0:variants.length}):''})} aria-pressed={variants.some(o=>o.id===selectionKey)}>{n}</button>)}
  </div>;
 })}</>;
}
