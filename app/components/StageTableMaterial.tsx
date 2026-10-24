import {STAGE_TABLE_ATLAS} from '../../lib/stage-table-material';
import {stageSetting} from '../../lib/stage-setting';
import {stagePalette} from '../../lib/stage-presentation';
/** Top and vertical body sample the same painted material, with restrained surface relief. */
export default function StageTableMaterial({stage}:{stage:number}){
 const n=stage-1,setting=stageSetting(stage),stone=!setting.wood,accent=stagePalette(stage).accent;
 return <div className={`table-surface ${stone?'surface-stone':'surface-wood'} surface-region-${stage}`} data-surface-stage={stage} data-painted-table={stage} aria-hidden="true">
  <svg className="table-surface-material" viewBox="0 0 1000 1000" preserveAspectRatio="none"><image href={STAGE_TABLE_ATLAS} x={-(n%5)*1000} y={-Math.floor(n/5)*1000} width="5000" height="2000" preserveAspectRatio="none"/><rect width="1000" height="1000" fill={stagePalette(stage).floor} opacity={stage===1?.17:.08}/></svg>
  <svg className="table-surface-patina" viewBox="0 0 1000 1000" preserveAspectRatio="none"><g fill="none" stroke={stone?'#211f22':'#170f13'} opacity=".2" strokeWidth="2">
   {Array.from({length:11},(_,i)=>{const a=(i*137.5+stage*19)*Math.PI/180,x=500+Math.cos(a)*455,y=500+Math.sin(a)*455;return <path key={i} d={`M${x} ${y}l${-Math.cos(a)*45} ${-Math.sin(a)*35}l${-Math.cos(a+.7)*22} ${-Math.sin(a+.7)*22}`}/>;})}</g>
   {[1,6,8].includes(stage)&&<g fill="none" stroke={accent} opacity={stage===8?.32:.16} strokeWidth="3"><path d="M160 285V190H260M170 200H205V235H170M740 190H840V285M795 200H830V235H795M160 715V810H260M740 810H840V715"/><circle cx="500" cy="500" r="443" strokeDasharray="9 16 3 12"/></g>}
   {[3,4,9].includes(stage)&&<g fill="none" stroke={stage===3?'#a7be6a':stage===4?'#b9e7e9':'#a7a8bd'} opacity=".18" strokeWidth="4"><path d="M20 450L140 470L185 530L224 514M950 230L850 276L822 332M650 980L624 866L660 817"/></g>}
   {[5,7,10].includes(stage)&&<g fill="none" stroke={accent} opacity=".13" strokeWidth="3"><ellipse cx="510" cy="490" rx="418" ry="440"/><ellipse cx="510" cy="490" rx="435" ry="451" strokeDasharray="3 11 18 14"/></g>}
   <ellipse cx="500" cy="500" rx="480" ry="483" fill="none" stroke="#11151b" opacity=".16" strokeWidth="11"/>
  </svg><div className="table-surface-light"/><div className="table-surface-bevel"/>
 </div>;
}
