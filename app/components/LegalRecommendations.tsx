import type {LegalOption} from '../../lib/game';
import {recommendationNumbers} from '../../lib/selection';
import {patternTier} from '../../lib/play-presentation';
type Props={groups:[string,LegalOption[]][],family:string|null,selectionKey:string,disabled:boolean,choose:(options:LegalOption[])=>void};
/** All pair/triple numbers remain visible; repeated taps cycle suit variants of that number. */
export default function LegalRecommendations({groups,family,selectionKey,disabled,choose}:Props){
 return <>{groups.map(([label,group])=>{
  const numbered=label==='페어'||label==='트리플',chosen=family===label;
  return <div className={`legal-family combo-tier-${patternTier(label)} ${chosen?'family-active':''}`} data-recommendation-family={label} role="group" aria-label={`${label} 추천`} key={label}>
   <button className={`legal-family-name ${chosen?'chosen':''}`} disabled={disabled} aria-pressed={chosen} onClick={()=>choose(group)} aria-label={`${label} 선택`}><b>{label}</b>{!numbered&&label!=='싱글'&&group.length>1&&<small aria-hidden="true">↻</small>}</button>
   {numbered&&recommendationNumbers(group).map(([n,variants])=><button className={`legal-family-number ${variants.some(o=>o.id===selectionKey)?'chosen':''}`} data-recommendation-number={n} key={n} disabled={disabled} onClick={()=>choose(variants)} aria-label={`${label} ${n} 선택${variants.length>1?` · 문양 조합 ${variants.length}가지, 다시 눌러 교체`:''}`} aria-pressed={variants.some(o=>o.id===selectionKey)}>{n}</button>)}
  </div>;
 })}</>;
}
