import type {ReactNode} from 'react';
import {resultStandings,type ResultPlayer} from '../../lib/result-standings';
const number=(n:number)=>n.toLocaleString('ko-KR');
const signed=(n:number)=>`${n>0?'+':''}${number(n)}`;
/** Tavern results can show one rank per row; other modes retain both rankings. */
export default function ResultStandings({players,voided=false,final=false,portrait,singleRank=false}:{portrait?:(id:string)=>ReactNode,players:readonly ResultPlayer[],voided?:boolean,final?:boolean,singleRank?:boolean}){
 const rows=resultStandings(players);
 if(singleRank&&!final)rows.sort((a,b)=>a.place-b.place);
 return <div className={`results result-standings${singleRank?' single-rank-standings':''}`} aria-label={singleRank?(final?'3판 합산 최종 순위':'이번 판 순위'):'이번 판 순위와 누적 점수 순위'}>
  <div className="result-head"><span>{singleRank?'순위 · 이름':'이번 판 · 이름'}</span><span>남은 패</span><span>{voided?'미반영':'이번 점수'}</span><span>{singleRank?(final?'최종 점수':'합산 점수'):final?'최종 보유 · 순위':'보유 · 누적 순위'}</span></div>
  {rows.map(p=><div key={p.id} data-total-place={p.totalPlace} className={(singleRank&&final?p.totalPlace===1:p.winner)&&!voided?'winner-row':''}>
   <strong className="result-player-name">{!voided&&<small>{(singleRank&&final?p.totalTied:p.roundTied)?'공동 ':''}{singleRank&&final?p.totalPlace:p.place}등</small>}{portrait&&<span className="result-name-portrait">{portrait(p.id)}</span>}<span>{p.name}</span></strong>
   <span>{p.count}장</span><strong className={p.delta>=0?'positive':'negative'}>{signed(p.delta)}</strong>
   <span className="result-total"><span>{signed(p.total)}<small>점</small></span>{!singleRank&&<b className={`cumulative-place rank-${p.totalPlace}`}>{p.totalTied?'공동 ':''}{p.totalPlace}등</b>}</span>
  </div>)}
 </div>;
}
