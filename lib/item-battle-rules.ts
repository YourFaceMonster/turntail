import {accessible,assertTurnReady,lowestHandLead,sorted,uid,view,type Game,type Tile} from './game.ts';
import {hpItemShopPending} from './hp-item-shop.ts';
import {finishHpItemMatch} from './hp-item-mode.ts';
import {withRelicActivations} from './rpg-relic-feedback.ts';

export type FloorTrap={id:string,owner:number,index:number,tileId:number,round:number};
export type TrapIntel={index:number,tileId:number,trapped:boolean};
export type TrapBurst={id:string,owner:number,owners?:number[],target:number,index:number,damage:number,hpBefore:number,hpAfter:number,at:number,safe:boolean};
export type ItemBattleState={version:1,pairWins:number[],firstFiveUsed:boolean[],trapUsed:boolean[],traps:FloorTrap[],trapIntel:Record<number,TrapIntel[]>,trapEvents:TrapBurst[],lastTrap?:TrapBurst,pioneerApplied?:boolean};
export function newItemBattleState(size:number):ItemBattleState{return {version:1,pairWins:Array(size).fill(0),firstFiveUsed:Array(size).fill(false),trapUsed:Array(size).fill(false),traps:[],trapIntel:{},trapEvents:[]};}
export function itemBattleState(game:{rpgRun?:{combat?:{itemBattle?:ItemBattleState}}|null}){return game.rpgRun?.combat?.itemBattle;}
/** Reset only round resources, preserving the once-per-match first-deal marker. */
export function resetItemBattle(game:Game){const state=itemBattleState(game);if(state)Object.assign(state,newItemBattleState(game.players.length),{pioneerApplied:state.pioneerApplied,lastTrap:undefined});}
export function applyPioneerDeal(game:Game,now=Date.now()){
 const run=game.rpgRun,state=itemBattleState(game);if(!run||!state||state.pioneerApplied||game.round!==1)return;
 state.pioneerApplied=true;if(!run.equipped.includes('pioneers-eye'))return;
 const hand=game.players[0].hand,wanted=(tile:Tile|null)=>tile?.n===3&&tile.s===0;
 if(!hand.some(wanted)){
  const outgoing=hand[0];let found=false;
  for(let seat=1;seat<game.players.length&&!found;seat++){const at=game.players[seat].hand.findIndex(wanted);if(at>=0){[hand[0],game.players[seat].hand[at]]=[game.players[seat].hand[at],outgoing];game.players[seat].hand=sorted(game.players[seat].hand);found=true;}}
  for(const stack of game.stacks){if(found)break;const at=stack.findIndex(wanted);if(at>=0){[hand[0],stack[at]]=[stack[at]!,outgoing];found=true;}}
  game.players[0].hand=sorted(hand);
 }
 game.opening=lowestHandLead(game.players);game.turn=game.opening.who;
 game.log[0]=`라운드 ${game.round} · 첫 선 ${game.players[game.turn].name} (구름 3)`;
 Object.assign(run,withRelicActivations(run,[{relicId:'pioneers-eye',message:'첫 분배 · 구름 3으로 첫 선'}],now));
}
export function trapAvailability(game:Pick<Game,'phase'|'turn'|'rpgRun'|'round'|'turnReadyAt'|'hpItemMode'|'hpItemVariant'|'hpItemRules'|'hpItemMatch'|'roundActions'|'result'>,who:number,enabled=true,now=Date.now()){
 const state=itemBattleState(game),combat=game.rpgRun?.combat;
 if(!state||combat?.professions[who]!=='rogue')return {usable:false,reason:'도적의 함정'};
 if(game.phase!=='playing'||game.rpgRun?.status!=='playing')return {usable:false,reason:'대전 종료'};
 if(hpItemShopPending(game))return {usable:false,reason:'상점 준비를 마쳐 주세요'};
 if(state.trapUsed[who])return {usable:false,reason:'이번 판 함정 사용 완료'};
 if(!enabled||game.turn!==who)return {usable:false,reason:'내 차례에 설치 가능'};
 if(now<(game.turnReadyAt||0))return {usable:false,reason:'패 확인 후 설치 가능'};
 return {usable:true,reason:'매판 1회 · 가져갈 수 있는 바닥패에 설치 · 피해 4'};
}
export function placeFloorTrap(game:Game,who:number,index:number,now=Date.now()){
 const availability=trapAvailability(game,who,true,now);if(!availability.usable)throw Error(availability.reason);
 if(!game.practice||!Number.isInteger(index)||!accessible(game,index))throw Error('가져갈 수 있는 바닥패에 설치해 주세요.');
 assertTurnReady(game,now);const state=itemBattleState(game)!,tile=game.stacks[index][1]||game.stacks[index][0]!;
 state.traps.push({id:uid(),owner:who,index,tileId:tile.id,round:game.round});state.trapUsed[who]=true;game.rpgRun!.updatedAt=now;
 // No public event/log, turn, item inventory or action counter changes on installation.
}
export function recordTrapIntel(game:Game,who:number,index:number,tileId:number){
 const state=itemBattleState(game);if(!state)return;
 state.trapIntel[who]=[...(state.trapIntel[who]||[]).filter(intel=>intel.index!==index),{index,tileId,trapped:state.traps.some(trap=>trap.tileId===tileId&&trap.owner!==who)}];
}
/** Apply the original cracked-heart effect only to its existing player owner. */
export function blockItemBattleDamage(game:Game,seat:number,damage:number,now=Date.now()){
 const run=game.rpgRun;if(!run||seat!==0||damage<=0)return damage;
 if(run.equipped.includes('cracked-heart')&&!run.crackedHeartUsed.includes(run.stage)){
  const blocked=Math.min(8,damage);run.crackedHeartUsed.push(run.stage);Object.assign(run,withRelicActivations(run,[{relicId:'cracked-heart',message:`피해 ${blocked} 방어`}],now));return damage-blocked;
 }
 return damage;
}
export function triggerFloorTrap(game:Game,who:number,index:number,tile:Tile,now=Date.now()){
 const state=itemBattleState(game),run=game.rpgRun;if(!state||!run)return;
 const traps=state.traps.filter(trap=>trap.tileId===tile.id&&trap.round===game.round);state.traps=state.traps.filter(trap=>!traps.includes(trap));
 for(const key of Object.keys(state.trapIntel))state.trapIntel[Number(key)]=state.trapIntel[Number(key)].filter(intel=>intel.tileId!==tile.id);
 const hpBeforePickup=run.hp[who],triggered:TrapBurst[]=[];
 for(const trap of traps){
  const safe=trap.owner===who,hpBefore=run.hp[who],damage=safe?0:blockItemBattleDamage(game,who,4,now);run.hp[who]=Math.max(0,hpBefore-damage);
  state.lastTrap={id:uid(),owner:trap.owner,target:who,index,damage:hpBefore-run.hp[who],hpBefore,hpAfter:run.hp[who],at:now+1200,safe};state.trapEvents.push(state.lastTrap);triggered.push(state.lastTrap);
  if(!safe){game.log=[`${game.players[trap.owner].name}의 함정 발동 · ${game.players[who].name} HP −${state.lastTrap.damage}`,...game.log].slice(0,40);game.turnReadyAt=Math.max(game.turnReadyAt||0,now+2100);}
 }
 const hostile=triggered.filter(event=>!event.safe);
 if(hostile.length)state.lastTrap={...hostile[0],id:uid(),owners:hostile.map(event=>event.owner),damage:hpBeforePickup-run.hp[who],hpBefore:hpBeforePickup,hpAfter:run.hp[who]};
 if(traps.length){run.updatedAt=now;if(run.hp.some(hp=>hp<=0)){if(game.hpItemMatch)game.hpItemMatch.endReason='trap';finishHpItemMatch(game);}}
}
/** Automatic scouting uses hidden upper tiles only and the receiver's own private map. */
export function scoutProfessionFloor(game:Game,who:number,count:number){
 const run=game.rpgRun;if(!run)return 0;
 const old=run.tactics?.[who],known=old?.round===game.round?old.peeks||(old.peek?[old.peek]:[]):[];
 const candidates=game.stacks.flatMap((stack,index)=>stack[1]&&!known.some(peek=>peek.tile.id===stack[1]!.id)?[index]:[]);let revealed=0;
 while(candidates.length&&revealed<count){const random=new Uint32Array(1);crypto.getRandomValues(random);const index=candidates.splice(random[0]%candidates.length,1)[0],peek={round:game.round,index,tile:{...game.stacks[index][1]!}};
  const current=run.tactics?.[who],state=current?.round===game.round?{...current}:{round:game.round,used:0};
  state.peek=peek;state.peeks=[...(state.peeks||[]),peek];run.tactics={...run.tactics,[who]:state};revealed++;
 }
 return revealed;
}
/** Bot decisions use only the bot's filtered view, including its own trap/intel. */
export function tryBotFloorTrap(game:Game,now=Date.now()){
 const who=game.turn;if(!game.players[who]?.bot||!trapAvailability(game,who,true,now).usable)return false;
 const position=view(game,game.players[who].token),own=position.rpgRun?.combat?.itemBattle?.traps||[],choices=position.stacks.flatMap((stack,index)=>accessible(game,index)&&!own.some(trap=>trap.index===index)?[{index,score:stack.lower?stack.lower.n:0}]:[]);
 choices.sort((a,b)=>b.score-a.score||a.index-b.index);if(!choices.length)return false;placeFloorTrap(game,who,choices[0].index,now);return true;
}
