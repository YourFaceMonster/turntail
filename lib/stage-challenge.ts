export const STAGE_TARGETS=[300,450,650,900,1200,1550,1950,2400,2900,3450] as const;
export const STAGE_START_SCORE=200;
export const STAGE_PLAYER_COUNT=3;
// Initial balancing values from the handoff, isolated for later playtesting.
export const STAGE_AI_STARTS=[200,200,200,200,200,200,200,200,200,200] as const;
export type StageStatus='playing'|'stage-clear'|'game-over'|'complete'|'abandoned';
export type StageClear={stage:number,round:number,score:number,reason:'target'|'bankrupt'|'both',bankrupt:string[],at:number};
export type StageRun={id:string,rulesVersion:1|2,stage:number,cleared:number,status:StageStatus,score:number,peakScore:number,rounds:number,stageRounds:number,roundIds:string[],clears:StageClear[],startedAt:number,updatedAt:number};
export type StageRecord={id:string,name:string,stage:number,cleared:number,score:number,peakScore:number,rounds:number,status:StageStatus,startedAt:number,updatedAt:number,clears:StageClear[]};
export function stageConfig(stage:number){
 if(!Number.isInteger(stage)||stage<1||stage>10)throw Error('스테이지는 1~10 사이여야 해요.');
 return {stage,target:STAGE_TARGETS[stage-1],aiScore:STAGE_AI_STARTS[stage-1],difficulty:stage};
}
export function newStageRun(id:string,now=Date.now()):StageRun{return {id,rulesVersion:2,stage:1,cleared:0,status:'playing',score:STAGE_START_SCORE,peakScore:STAGE_START_SCORE,rounds:0,stageRounds:0,roundIds:[],clears:[],startedAt:now,updatedAt:now};}
/** The same pairwise settlement, with two AI seats in new runs. */
export function settleStageRun(run:StageRun,result:{id:string,at:number,players:{name:string,total:number}[]}):StageRun{
 if(run.status!=='playing'||run.roundIds.includes(result.id))return run;
 if(result.players.length!==(run.rulesVersion===1?4:STAGE_PLAYER_COUNT))throw Error('스테이지 도전은 AI 2명과 함께하는 3인전이에요.');
 const score=result.players[0].total,next={...run,score,peakScore:Math.max(run.peakScore,score),rounds:run.rounds+1,stageRounds:run.stageRounds+1,roundIds:[...run.roundIds,result.id],updatedAt:result.at};
 // Exactly zero survives. Human bankruptcy takes priority over every clear condition.
 if(score<0)return {...next,status:'game-over'};
 const target=score>=stageConfig(run.stage).target,bankrupt=result.players.slice(1).filter(p=>p.total<=0).map(p=>p.name);
 if(!target&&!bankrupt.length)return next;
 const clear:StageClear={stage:run.stage,round:next.stageRounds,score,reason:target&&bankrupt.length?'both':target?'target':'bankrupt',bankrupt,at:result.at};
 return {...next,cleared:run.stage,status:run.stage===10?'complete':'stage-clear',clears:[...run.clears,clear]};
}
/** One settled round can clear one stage. Overflow is retained, never auto-skipped. */
export function enterNextStage(run:StageRun,now=Date.now()):StageRun{
 if(run.status!=='stage-clear'||run.stage>=10)throw Error('스테이지를 클리어한 뒤 다음 단계로 이동할 수 있어요.');
 return {...run,stage:run.stage+1,status:'playing',stageRounds:0,updatedAt:now};
}
export function stageRecord(run:StageRun,name:string):StageRecord{const {id,stage,cleared,score,peakScore,rounds,status,startedAt,updatedAt,clears}=run;return {id,name,stage,cleared,score,peakScore,rounds,status,startedAt,updatedAt,clears};}
export function stageRecordOrder(a:StageRecord,b:StageRecord){return b.cleared-a.cleared||b.stage-a.stage||b.peakScore-a.peakScore||a.startedAt-b.startedAt;}
