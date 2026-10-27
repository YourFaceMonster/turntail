import {assertTurnReady,combo,legalOptions,uid,view,type Game} from './game.ts';
import {isBattleItemMode} from './hp-item-battle.ts';
import {hpItemShopPending} from './hp-item-shop.ts';
import {hpCharacter,pickHpOpponents,type HpCharacterId} from './hp-item-characters.ts';
export {HP_CHARACTERS,HP_BATTLE_CHARACTERS,hpCharacter,isHpCharacterId,pickHpOpponents,type HpCharacterId} from './hp-item-characters.ts';
export type HpSkillOutcome='ready'|'attack'|'guard'|'money'|'missed'|'expired';
export type HpSkillUse={id:string,round:number,actor:number,character:HpCharacterId,at:number,outcome:HpSkillOutcome,amount?:number};
export type HpSkillState={version:1,round:number,characters:HpCharacterId[],seats:{used:boolean,armed:boolean,turn?:number}[],uses:HpSkillUse[],lastEvent?:HpSkillUse};
export function createHpSkills(character:HpCharacterId,round:number):HpSkillState{
 const characters=[character,...pickHpOpponents(character)];
 return {version:1,round,characters,seats:characters.map(()=>({used:false,armed:false})),uses:[]};
}
type SkillGame=Pick<Game,'hpItemMode'|'hpItemVariant'|'hpItemRules'|'hpItemMatch'|'rpgRun'|'phase'|'round'|'turn'|'roundActions'|'completedBattles'|'turnReadyAt'|'result'>;
export function hasHpSkills(game:SkillGame){return isBattleItemMode(game)&&game.hpItemMatch?.skills?.version===1;}
export function hpSkillAvailability(game:SkillGame,who:number,enabled=true,now=Date.now()){
 const skills=game.hpItemMatch?.skills,seat=skills?.seats[who];
 if(!hasHpSkills(game)||!seat)return {usable:false,reason:'고유스킬은 새 아이템전에서 사용할 수 있어요.'};
 if(game.phase!=='playing'||game.rpgRun?.status!=='playing')return {usable:false,reason:'이번 판이 종료됐어요.'};
 if(hpItemShopPending(game))return {usable:false,reason:'상점 준비를 먼저 마쳐 주세요.'};
 if(seat.armed)return {usable:false,reason:'준비됨 · 다음 싸움 종료 시 발동'};
 if(seat.used)return {usable:false,reason:'사용 완료 · 다음 판에 다시 충전'};
 if(!enabled||game.turn!==who)return {usable:false,reason:'내 차례에 사용 가능'};
 if(now<(game.turnReadyAt||0))return {usable:false,reason:'패와 연출을 확인한 뒤 사용 가능'};
 if(!(game.completedBattles||0))return {usable:false,reason:'첫 싸움이 끝나 새 선이 정해지면 사용 가능'};
 const tactic=game.rpgRun?.tactics?.[who];
 if(tactic?.round===game.round&&tactic.turn===(game.roundActions||0))return {usable:false,reason:'아이템을 쓴 차례에는 스킬을 사용할 수 없어요.'};
 return {usable:true,reason:'매판 1회 · 준비 후에도 패 내기·가져오기 가능'};
}
export function usedHpSkillThisTurn(game:SkillGame,who:number){
 const skills=game.hpItemMatch?.skills,seat=skills?.seats[who];
 return hasHpSkills(game)&&skills?.round===game.round&&!!seat?.used&&seat.turn===(game.roundActions||0);
}
export function useHpSkill(game:Game,who=0,now=Date.now()){
 if(!game.practice||!game.players[who])throw Error('고유스킬은 아이템전에서 사용할 수 있어요.');
 const availability=hpSkillAvailability(game,who,true,now);if(!availability.usable)throw Error(availability.reason);
 assertTurnReady(game,now);
 const skills=game.hpItemMatch!.skills!,character=hpCharacter(skills.characters[who]);
 skills.seats[who]={used:true,armed:true,turn:game.roundActions||0};
 const event:HpSkillUse={id:uid(),round:game.round,actor:who,character:character.id,at:now,outcome:'ready'};
 skills.uses.push(event);skills.lastEvent={...event};game.rpgRun!.updatedAt=now;
 game.log=[`${game.players[who].name} · ${character.skill} 준비`,...game.log].slice(0,40);
}
/** One pending ability lasts exactly until the next fight ends, including a loss. */
export function resolveHpSkills(game:Game,actor:number,baseDamage:number){
 const skills=game.hpItemMatch?.skills,damage=game.players.map((_,seat)=>seat===actor?0:baseDamage),effects:HpSkillUse[]=[];
 if(!hasHpSkills(game)||!skills)return {damage,effects};
 const attack=skills.seats[actor]?.armed&&hpCharacter(skills.characters[actor]).kind==='attack';
 if(attack)damage.forEach((_,seat)=>{if(seat!==actor)damage[seat]++;});
 skills.seats.forEach((seat,index)=>{
  if(!seat.armed)return;seat.armed=false;
  const character=hpCharacter(skills.characters[index]),event=skills.uses.findLast(use=>use.actor===index&&use.outcome==='ready');
  if(!event)return;
  event.outcome='missed';event.amount=0;
  if(character.kind==='attack'&&index===actor){event.outcome='attack';event.amount=1;}
  if(character.kind==='guard'&&index!==actor){event.outcome='guard';event.amount=Math.min(2,damage[index]);damage[index]-=event.amount;}
  if(character.kind==='money'&&index===actor){event.outcome='money';event.amount=2;game.hpItemMatch!.points[index]+=2;}
  effects.push({...event});
 });
 return {damage,effects};
}
export function expireHpSkills(game:Game){
 if(!hasHpSkills(game))return;
 const skills=game.hpItemMatch!.skills!;skills.seats.forEach(seat=>{seat.armed=false;});
 skills.uses.forEach(use=>{if(use.outcome==='ready'){use.outcome='expired';use.amount=0;}});
}
export function resetHpSkills(game:Game){
 if(!hasHpSkills(game))return;
 const state=game.hpItemMatch!.skills!;state.round=game.round;state.seats=state.characters.map(()=>({used:false,armed:false}));state.uses=[];state.lastEvent=undefined;
}
/** Only public information and the AI's own hand inform its skill decision. */
export function tryHpBotSkill(game:Game){
 const who=game.turn;if(!game.players[who]?.bot||!hpSkillAvailability(game,who).usable)return false;
 const position=view(game,game.players[who].token),character=hpCharacter(position.hpItemMatch!.skills!.characters[who]),hand=position.players[who].hand||[],moves=legalOptions(hand,position.trick);
 const winningNow=position.lastBy===who||moves.length>0||!position.trick.length;
 if(character.kind==='guard'){
  const label=combo(position.trick)?.label,damage=label==='싱글'?1:label==='페어'?2:label==='트리플'?3:position.trick.length?4:0;
  if(!position.trick.length||moves.length&&position.rpgRun!.hp[who]>20||damage<2&&position.rpgRun!.hp[who]>12)return false;
 }else if(!winningNow)return false;
 useHpSkill(game,who);return true;
}
export function hpSkillUseText(use:HpSkillUse){
 const name=hpCharacter(use.character).skill;
 return `${name} · ${use.outcome==='ready'?'준비됨':use.outcome==='attack'?'승리 피해 +1':use.outcome==='guard'?`싸움 피해 ${use.amount} 방어`:use.outcome==='money'?'돈 +2P':use.outcome==='expired'?'대전 종료로 만료':'조건 미충족 · 소진'}`;
}
