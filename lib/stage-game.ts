import {player,room,start,uid,type Game} from './game.ts';
import {newStageRun,enterNextStage,stageConfig,STAGE_START_SCORE} from './stage-challenge.ts';
import {stageTheme} from './stage-theme.ts';
function opponents(stage:number){return stageTheme(stage).opponents.map(person=>{const ai=player(person.name,true);ai.avatar=`stage-portrait:${person.portrait}`;ai.points=stageConfig(stage).aiScore;return ai;});}
export function createStageGame(name:string,avatar='',now=Date.now()):Game{
 const human=player(name||'나');human.avatar=avatar;human.points=STAGE_START_SCORE;
 const game=room('STAGE-'+uid(),human,true,4);game.stageRun=newStageRun(uid(),now);
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
 start(game,now);
}
export function abandonStageGame(game:Game,now=Date.now()){
 if(!game.stageRun||!['playing','stage-clear'].includes(game.stageRun.status))throw Error('진행 중인 도전이 없어요.');
 game.stageRun={...game.stageRun,status:'abandoned',updatedAt:now};game.phase='ended';game.turnDeadline=0;
}
