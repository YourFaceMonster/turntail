import {player,room,start,uid,type Game} from './game.ts';
import {newStageRun,enterNextStage,stageConfig,STAGE_START_SCORE,STAGE_PLAYER_COUNT} from './stage-challenge.ts';
import {stageOpponents} from './stage-theme.ts';
function opponents(stage:number){return stageOpponents(stage).map(person=>{const ai=player(person.name,true);ai.avatar=`stage-portrait:${person.portrait}`;ai.points=stageConfig(stage).aiScore;return ai;});}
export function createStageGame(name:string,avatar='',now=Date.now()):Game{
 const human=player(name||'나');human.avatar=avatar;human.points=STAGE_START_SCORE;
 const game=room('STAGE-'+uid(),human,true,STAGE_PLAYER_COUNT);game.stageRun=newStageRun(uid(),now);
 game.players.push(...opponents(1));
 start(game,now);return game;
}
export function startStageRound(game:Game,now=Date.now()){
 if(!game.stageRun||!game.practice||game.phase!=='ended')throw Error('진행 중인 스테이지의 판 결과를 먼저 확인해 주세요.');
 if(game.stageRun.status==='stage-clear'){
  game.stageRun=enterNextStage(game.stageRun,now);
  game.players=[game.players[0],...opponents(game.stageRun.stage)];
 }
 if(game.stageRun.status!=='playing')throw Error('이번 도전은 종료됐어요. 새 도전을 시작해 주세요.');
 game.capacity=STAGE_PLAYER_COUNT;game.players=game.players.slice(0,STAGE_PLAYER_COUNT);game.stageRun.rulesVersion=2;
 start(game,now);
}
/** Preserve old results until their next-round action. An unfinished old round
 * is re-dealt once, retaining stage, balances and every already-settled record. */
export function migrateStageGame(saved:Game,now=Date.now()):Game{
 if(!saved.stageRun||saved.players.length!==4||saved.phase==='ended')return saved;
 const game=structuredClone(saved);game.capacity=STAGE_PLAYER_COUNT;game.players=game.players.slice(0,STAGE_PLAYER_COUNT);
 game.stageRun!.rulesVersion=2;game.round=Math.max(0,game.round-1);start(game,now);
 game.log.unshift('3인 도전으로 전환 · 스테이지와 점수 유지 · 진행 중인 판 재배분');return game;
}
export function abandonStageGame(game:Game,now=Date.now()){
 if(!game.stageRun||!['playing','stage-clear'].includes(game.stageRun.status))throw Error('진행 중인 도전이 없어요.');
 game.stageRun={...game.stageRun,status:'abandoned',updatedAt:now};game.phase='ended';game.turnDeadline=0;
}
