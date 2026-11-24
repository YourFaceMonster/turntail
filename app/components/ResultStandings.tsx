import type {ReactNode} from 'react';
import {resultStandings,type ResultPlayer} from '../../lib/result-standings';
import {tr,trv} from '../../lib/i18n/index.ts';
const number=(n:number)=>n.toLocaleString('ko-KR');
const signed=(n:number)=>`${n>0?'+':''}${number(n)}`;
/** Tavern results can show one rank per row; other modes retain both rankings. */
export default function ResultStandings({players,voided=false,final=false,portrait,singleRank=false}:{portrait?:(id:string)=>ReactNode,players:readonly ResultPlayer[],voided?:boolean,final?:boolean,singleRank?:boolean}){
 const rows=resultStandings(players);
 if(singleRank&&!final)rows.sort((a,b)=>a.place-b.place);
 return <div className={`results result-standings${singleRank?' single-rank-standings':''}`} aria-label={singleRank?(final?tr('3판 합산 최종 순위'):tr('이번 판 순위')):tr('이번 판 순위와 누적 점수 순위')}>
  <div className="result-head"><span>{singleRank?tr('순위 · 이름'):tr('이번 판 · 이름')}</span><span>{tr('남은 패')}</span><span>{voided?tr('미반영'):tr('이번 점수')}</span><span>{singleRank?(final?tr('최종 점수'):tr('합산 점수')):final?tr('최종 보유 · 순위'):tr('보유 · 누적 순위')}</span></div>
  {rows.map(p=><div key={p.id} data-total-place={p.totalPlace} className={(singleRank&&final?p.totalPlace===1:p.winner)&&!voided?'winner-row':''}>
   <strong className="result-player-name">{!voided&&<small>{(singleRank&&final?p.totalTied:p.roundTied)?tr('공동 '):''}{singleRank&&final?p.totalPlace:p.place}{tr('등')}</small>}{portrait&&<span className="result-name-portrait">{portrait(p.id)}</span>}<span>{trv(p.name)}</span></strong>
   <span>{p.count}{tr('장')}</span><strong className={p.delta>=0?'positive':'negative'}>{signed(p.delta)}</strong>
   <span className="result-total"><span>{signed(p.total)}<small>{tr('점')}</small></span>{!singleRank&&<b className={`cumulative-place rank-${p.totalPlace}`}>{p.totalTied?tr('공동 '):''}{p.totalPlace}{tr('등')}</b>}</span>
  </div>)}
 </div>;
}
