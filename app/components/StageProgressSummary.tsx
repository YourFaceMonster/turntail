import {stageProgress} from '../../lib/stage-progress';
import type {StageRun} from '../../lib/stage-challenge';
const number=(n:number)=>n.toLocaleString('ko-KR');
export default function StageProgressSummary({run}:{run:StageRun}){
 const progress=stageProgress(run);
 if(progress.ended)return <div className="stage-next-balance stage-next-terminal"><small>이번 도전 종료</small><strong>다시 시작하면 {number(progress.carry)}점</strong><span>이번 도전의 점수와 기록은 저장했어요.</span></div>;
 if(progress.complete)return <div className="stage-next-balance stage-next-complete"><small>ALL STAGES CLEARED</small><strong>10개 지역의 여정을 마쳤어요</strong><span>최종 보유 {number(progress.carry)}점 · 모든 세트 해금</span></div>;
 return <div className="stage-next-balance" aria-label="다음 판 보유 점수와 남은 목표 점수"><small>{progress.advancing?`${progress.stage}스테이지로 이어갈 점수`:'다음 판 시작 점수'}</small>
  <div><strong>{number(progress.carry)}<small>점</small></strong><span>목표까지 <b>{number(progress.remaining)}점</b></span></div>
  <div className="stage-score-track" role="progressbar" aria-label={`${progress.stage}스테이지 점수 목표`} aria-valuemin={0} aria-valuemax={progress.target} aria-valuenow={Math.max(0,Math.min(progress.target,progress.carry))}><i style={{width:`${Math.max(0,Math.min(100,progress.carry/progress.target*100))}%`}}/></div>
  <span>목표 {number(progress.target)}점 · 또는 AI 한 명 0점 이하{progress.advancing?' · 새 AI는 각 200점':''}</span>
  {progress.remaining===0&&<span>다음 지역의 한 판을 마치면 클리어를 판정해요.</span>}
 </div>;
}
