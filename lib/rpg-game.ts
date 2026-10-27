import {newProfessionCombat} from './rpg-profession-combat.ts';
import type {RpgProfessionId} from './rpg-professions.ts';
import {player,room,start,uid,type Game} from './game.ts';
import {advanceRpgStage,newRpgRun,RPG_RELICS} from './rpg.ts';
import {RPG_BASIC_ITEMS,giveRpgEnemyItems} from './rpg-items.ts';
import {stageOpponents} from './stage-theme.ts';
import {RPG_TWINS} from './rpg-twins.ts';

function opponents(stage:number){
 if([3,6,9,10].includes(stage))return RPG_TWINS.map(person=>{const ai=player(person.name,true);ai.avatar=person.avatar;return ai;});
 return stageOpponents(stage).map(person=>{const ai=player(person.name,true);ai.avatar=`stage-portrait:${person.portrait}`;return ai;});
}
export function createRpgGame(name:string,avatar='',now=Date.now(),profession?:RpgProfessionId):Game{
 const human=player(name||'나');human.avatar=avatar;
 const game=room('RPG-'+uid(),human,true,3);game.rpgRun=newRpgRun(uid(),now);
 game.players.push(...opponents(1));if(profession)game.rpgRun!.combat=newProfessionCombat(profession,game.players.map(player=>player.avatar||''),game.round);giveRpgEnemyItems(game.rpgRun!);start(game,now);return game;
}
function sample<T>(pool:readonly T[],count:number){const choices=[...pool],picked:T[]=[];while(choices.length&&picked.length<count){const value=new Uint32Array(1);crypto.getRandomValues(value);picked.push(choices.splice(value[0]%choices.length,1)[0]);}return picked;}
export function createRpgTestGame(name:string,avatar='',now=Date.now()):Game{
 const game=createRpgGame(name,avatar,now),run=game.rpgRun!;
 const relicPool=RPG_RELICS.filter(item=>!['mor-quill','twin-needle-compass','split-mirror'].includes(item.id));
 const relics=sample(relicPool,3).map(item=>item.id);
 const consumables=RPG_BASIC_ITEMS.flatMap(id=>[id,id]);
 game.rpgTest=true;game.code='RPG-TEST-'+uid();
 run.relics=relics;run.equipped=[...relics];run.discovered=[...relics];run.unlocked=['second-heart'];run.consumables=sample(consumables,consumables.length);giveRpgEnemyItems(run,2);
 return game;
}
export function startRpgRound(game:Game,now=Date.now()){
 const run=game.rpgRun;if(!run||!game.practice||game.phase!=='ended')throw Error('RPG 여정의 판 결과를 먼저 확인해 주세요.');
 if(game.hpItemMode&&run.status!=='playing')throw Error('아이템전이 종료됐어요. 새 대전을 시작해 주세요.');
 if(run.status==='ready'){
  game.rpgRun=advanceRpgStage(run);game.rpgRun.itemGuards={0:!!run.itemGuards?.[0]};
  game.players=[game.players[0],...opponents(game.rpgRun.stage)];giveRpgEnemyItems(game.rpgRun,game.rpgTest?2:1);
 }else if(run.status!=='playing')throw Error('보상과 준비를 마친 뒤 다음 판을 시작해 주세요.');
 game.capacity=3;start(game,now);
}
export function abandonRpgGame(game:Game,now=Date.now()){
 if(!game.rpgRun||['complete','game-over','abandoned'].includes(game.rpgRun.status))throw Error('진행 중인 RPG 여정이 없어요.');
 game.rpgRun={...game.rpgRun,status:'abandoned',updatedAt:now};game.phase='ended';game.turnDeadline=0;
}
