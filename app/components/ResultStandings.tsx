import {resultStandings,type ResultPlayer} from '../../lib/result-standings';
const number=(n:number)=>n.toLocaleString('ko-KR');
const signed=(n:number)=>`${n>0?'+':''}${number(n)}`;
/** Both standings stay in the existing result row, rather than a second screen. */
export default function ResultStandings({players,voided=false,final=false}:{players:readonly ResultPlayer[],voided?:boolean,final?:boolean}){
 return <div className="results result-standings" aria-label="이번 판 순위와 누적 점수 순위">
  <div className="result-head"><span>이번 판 · 이름</span><span>남은 패</span><span>{voided?'미반영':'이번 점수'}</span><span>{final?'최종 보유 · 순위':'보유 · 누적 순위'}</span></div>
  {resultStandings(players).map(p=><div key={p.id} data-total-place={p.totalPlace} className={p.winner&&!voided?'winner-row':''}>
   <strong className="result-player-name">{!voided&&<small>{p.roundTied?'공동 ':''}{p.place}등</small>}<span>{p.name}</span></strong>
   <span>{p.count}장</span><strong className={p.delta>=0?'positive':'negative'}>{signed(p.delta)}</strong>
   <span className="result-total"><span>{signed(p.total)}<small>점</small></span><b className={`cumulative-place rank-${p.totalPlace}`}>{p.totalTied?'공동 ':''}{p.totalPlace}등</b></span>
  </div>)}
 </div>;
}
