import {stageConfig,STAGE_START_SCORE,type StageRun} from './stage-challenge';
/** A cleared stage carries the human balance forward; new opponents reset separately. */
export function stageProgress(run:StageRun){
 const ended=run.status==='game-over'||run.status==='abandoned',complete=run.status==='complete';
 const stage=run.status==='stage-clear'?Math.min(10,run.stage+1):run.stage;
 const target=stageConfig(stage).target;
 return {stage,target,carry:ended?STAGE_START_SCORE:run.score,remaining:complete?0:Math.max(0,target-run.score),ended,complete,advancing:run.status==='stage-clear'};
}
