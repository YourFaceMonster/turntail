import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {resultStandings} from '../lib/result-standings';
import {stageProgress} from '../lib/stage-progress';
import {newStageRun,settleStageRun,enterNextStage} from '../lib/stage-challenge';
import ResultStandings from '../app/components/ResultStandings';
import StageProgressSummary from '../app/components/StageProgressSummary';
import StageClearReveal from '../app/components/StageClearReveal';
const players=[{id:'a',name:'이번 판 승자',count:0,place:1,delta:21,total:40,winner:true},{id:'b',name:'누적 선두',count:2,place:2,delta:13,total:100,winner:false},{id:'c',name:'공동 선두',count:3,place:3,delta:9,total:100,winner:false},{id:'d',name:'넷째',count:9,place:4,delta:-43,total:-20,winner:false}];
const before=JSON.stringify(players),rows=resultStandings(players);assert.deepEqual(rows.map(r=>r.id),['b','c','a','d']);assert.deepEqual(rows.map(r=>r.totalPlace),[1,1,3,4]);assert.ok(rows[0].totalTied&&rows[1].totalTied);assert.equal(JSON.stringify(players),before);
const html=renderToStaticMarkup(<ResultStandings players={players}/>);assert.ok(html.includes('이번 판 · 이름')&&html.includes('보유 · 누적 순위'));assert.equal((html.match(/공동 1등/g)||[]).length,2);assert.ok(html.indexOf('누적 선두')<html.indexOf('이번 판 승자'));assert.ok(html.includes('>3등</b>'),'round winner can still be third overall');
const run=newStageRun('PROGRESS',1),result=(score:number,other=195)=>({id:`r-${score}`,at:2,players:[{name:'나',total:score},{name:'A',total:other},{name:'B',total:200},{name:'C',total:200}]});
for(const score of [184,221,0]){const next=settleStageRun(run,result(score)),progress=stageProgress(next);assert.equal(progress.carry,score);assert.equal(progress.remaining,300-score);const text=renderToStaticMarkup(<StageProgressSummary run={next}/>);assert.ok(text.includes(`${300-score}점`)&&text.includes('다음 판 시작 점수'));}
const clear=settleStageRun(run,result(310));assert.equal(clear.status,'stage-clear');assert.deepEqual(stageProgress(clear),{stage:2,target:450,carry:310,remaining:140,ended:false,complete:false,advancing:true});assert.equal(enterNextStage(clear,3).score,310);
const bankruptcy=settleStageRun(run,result(230,0));assert.equal(stageProgress(bankruptcy).remaining,220,'bankruptcy clear still computes against the next region');
const over=settleStageRun(run,result(-1));assert.equal(over.status,'game-over');assert.equal(stageProgress(over).carry,200);
const complete={...run,stage:10,cleared:10,status:'complete' as const,score:3500};assert.equal(stageProgress(complete).remaining,0);assert.equal(stageProgress(complete).stage,10);assert.ok(!renderToStaticMarkup(<StageProgressSummary run={complete}/>).includes('11스테이지'));
for(let stage=1;stage<=10;stage++){const h=renderToStaticMarkup(<StageClearReveal stage={stage} reason="목표 달성" complete={stage===10}/>);assert.ok(h.includes(`data-cleared-stage="${stage}"`)&&h.includes(`stage-${stage}-055.webp`)&&h.includes('세트 해금'));if(stage===10)assert.ok(h.includes('모든 지역')&&!h.includes('NEXT DESTINATION'));}
console.log('PASS: separate round/cumulative ranks, tied totals, current/next-region remaining scores, zero survival, bankruptcy clears and all ten material reveal screens.');
