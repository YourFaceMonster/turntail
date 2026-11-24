import {stageProgress} from '../../lib/stage-progress';
import type {StageRun} from '../../lib/stage-challenge';
import {tr} from '../../lib/i18n/index.ts';
const number=(n:number)=>n.toLocaleString('ko-KR');
export default function StageProgressSummary({run}:{run:StageRun}){
 const progress=stageProgress(run);
 if(progress.ended)return <div className="stage-next-balance stage-next-terminal"><small>{tr('이번 도전 종료')}</small><strong>{tr('다시 시작하면')} {number(progress.carry)}{tr('점')}</strong><span>{tr('이번 도전의 점수와 기록은 저장했어요.')}</span></div>;
 if(progress.complete)return <div className="stage-next-balance stage-next-complete"><small>ALL STAGES CLEARED</small><strong>{tr('10개 지역의 여정을 마쳤어요')}</strong><span>{tr('최종 보유')} {number(progress.carry)}{tr('점 · 모든 세트 해금')}</span></div>;
 return <div className="stage-next-balance" aria-label={tr('다음 판 보유 점수와 남은 목표 점수')}><small>{progress.advancing?tr('{0}스테이지로 이어갈 점수',{0:progress.stage}):tr('다음 판 시작 점수')}</small>
  <div><strong>{number(progress.carry)}<small>{tr('점')}</small></strong><span>{tr('목표까지')} <b>{number(progress.remaining)}{tr('점')}</b></span></div>
  <div className="stage-score-track" role="progressbar" aria-label={tr('{0}스테이지 점수 목표',{0:progress.stage})} aria-valuemin={0} aria-valuemax={progress.target} aria-valuenow={Math.max(0,Math.min(progress.target,progress.carry))}><i style={{width:`${Math.max(0,Math.min(100,progress.carry/progress.target*100))}%`}}/></div>
  <span>{tr('목표')} {number(progress.target)}{tr('점 · 또는 AI 한 명 0점 이하')}{progress.advancing?tr(' · 새 AI는 각 200점'):''}</span>
  {progress.remaining===0&&<span>{tr('다음 지역의 한 판을 마치면 클리어를 판정해요.')}</span>}
 </div>;
}
