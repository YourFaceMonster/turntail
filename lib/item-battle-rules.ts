import {applyImmediateEffects,finishImmediateCombat} from './profession-immediate-combat';
import {hasRoundCombat,hasImmediateSkills} from './profession-round-rules';
import {queueRoundDamage} from './profession-round-combat';
import {recordRpgRoundHealth} from './rpg-round-health';
import {isRpgPhaseOne,reconcileRpgEliminations,rpgAlive} from './rpg-phase-one.ts';
import {assertTurnReady,lowestHandLead,sorted,uid,view,type Game,type Tile} from './game.ts';
import {finishHpItemMatch} from './hp-item-mode.ts';
import {withRelicActivations} from './rpg-relic-feedback.ts';
import {AMBUSH_IMPACT_MS,AMBUSH_PRESENTATION_MS,TRAP_IMPACT_MS,TRAP_TURN_READY_MS} from './pickup-presentation.ts';
import {professionActiveAvailability,consumeProfessionGauge} from './profession-actives.ts';

export type FloorTrap={damage?:number,id:string,owner:number,index:number,tileId:number,round:number};
export type TrapIntel={index:number,tileId:number,trapped:boolean};
export type TrapBurst={id:string,owner:number,owners?:number[],target:number,index:number,damage:number,hpBefore:number,hpAfter:number,at:number,safe:boolean};
export type AmbushBurst={id:string,round:number,owner:number,index:number,damage:number[],hpBefore:number[],hpAfter:number[],at:number};
export type ItemBattleState={version:1,pairWins:number[],firstFiveUsed:boolean[],trapUsed:boolean[],traps:FloorTrap[],trapIntel:Record<number,TrapIntel[]>,trapEvents:TrapBurst[],lastTrap?:TrapBurst,ambushEvents?:AmbushBurst[],ambushedTileIds?:number[],lastAmbush?:AmbushBurst,pioneerApplied?:boolean};
export function newItemBattleState(size:number):ItemBattleState{return {version:1,pairWins:Array(size).fill(0),firstFiveUsed:Array(size).fill(false),trapUsed:Array(size).fill(false),traps:[],trapIntel:{},trapEvents:[]};}
export function itemBattleState(game:{rpgRun?:{combat?:{itemBattle?:ItemBattleState}}|null}){return game.rpgRun?.combat?.itemBattle;}
/** Reset only round resources, preserving the once-per-match first-deal marker. */
export function resetItemBattle(game:Game){const state=itemBattleState(game);if(state)Object.assign(state,newItemBattleState(game.players.length),{pioneerApplied:state.pioneerApplied,lastTrap:undefined,ambushEvents:[],ambushedTileIds:[],lastAmbush:undefined});}
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
 game.log[0]=`라운드 ${game.round} · 첫 선 ${game.players[game.turn].name} (철문 3)`;
 Object.assign(run,withRelicActivations(run,[{relicId:'pioneers-eye',message:'첫 분배 · 철문 3으로 첫 선'}],now));
}
export function trapAvailability(game:Pick<Game,'phase'|'turn'|'rpgRun'|'round'|'turnReadyAt'|'hpItemMode'|'hpItemVariant'|'hpItemRules'|'hpItemMatch'|'roundActions'|'result'>,who:number,enabled=true,now=Date.now()){
 const state=itemBattleState(game),combat=game.rpgRun?.combat;
 if(!state||combat?.professions[who]!=='rogue')return {usable:false,reason:'도적의 함정'};
 return professionActiveAvailability(game,who,enabled,now);
}
export function placeFloorTrap(game:Game,who:number,index:number,now=Date.now()){
 const availability=trapAvailability(game,who,true,now);if(!availability.usable)throw Error(availability.reason);
 if(!game.practice||!Number.isInteger(index)||!game.stacks[index]?.some(Boolean))throw Error('남아 있는 바닥패를 선택해 주세요.');
 assertTurnReady(game,now);const state=itemBattleState(game)!,tile=game.stacks[index][1]||game.stacks[index][0]!;
 if(state.traps.some(trap=>trap.owner===who&&trap.tileId===tile.id&&trap.round===game.round))throw Error('이미 내 함정이 설치된 패예요.');
 consumeProfessionGauge(game,who,now);
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
export function triggerFloorTrap(game:Game,who:number,index:number,tile:Tile,now=Date.now(),deferFinish=false){
 const state=itemBattleState(game),run=game.rpgRun;if(!state||!run)return;
 const traps=state.traps.filter(trap=>trap.tileId===tile.id&&trap.round===game.round&&rpgAlive(game,trap.owner));state.traps=state.traps.filter(trap=>!traps.includes(trap));
 for(const key of Object.keys(state.trapIntel))state.trapIntel[Number(key)]=state.trapIntel[Number(key)].filter(intel=>intel.tileId!==tile.id);
 if(hasImmediateSkills(game)){
  for(const trap of traps){const safe=trap.owner===who,damage=game.players.map((_,seat)=>seat===who&&!safe?trap.damage??4:0),result=applyImmediateEffects(game,damage,game.players.map(()=>0),now);state.trapEvents.push({id:uid(),owner:trap.owner,target:who,index,damage:result.damage[who],hpBefore:result.before[who],hpAfter:result.after[who],at:now,safe});if(!safe)game.log=[`${game.players[trap.owner].name}의 함정 · ${game.players[who].name} HP −${result.damage[who]}`,...game.log].slice(0,40);}
  if(!deferFinish)finishImmediateCombat(game,now,'trap');return;
 }
 if(hasRoundCombat(game)){
  for(const trap of traps){const safe=trap.owner===who,damage=safe?0:trap.damage??4;if(damage)queueRoundDamage(game,who,damage,'trap');state.trapEvents.push({id:uid(),owner:trap.owner,target:who,index,damage,hpBefore:run.hp[who],hpAfter:run.hp[who],at:now,safe});if(!safe)game.log=[`${game.players[trap.owner].name}의 함정 · ${game.players[who].name} 피해 ${damage} 적립`,...game.log].slice(0,40);}
  run.updatedAt=now;return;
 }
 const hpBeforePickup=run.hp[who],triggered:TrapBurst[]=[];
 for(const trap of traps){
  const safe=trap.owner===who,hpBefore=run.hp[who],damage=safe?0:blockItemBattleDamage(game,who,4,now);run.hp[who]=Math.max(0,hpBefore-damage);
  if(!game.hpItemMode){const before=[...run.hp];before[who]=hpBefore;recordRpgRoundHealth(run,before);}
  state.lastTrap={id:uid(),owner:trap.owner,target:who,index,damage:hpBefore-run.hp[who],hpBefore,hpAfter:run.hp[who],at:now+TRAP_IMPACT_MS,safe};state.trapEvents.push(state.lastTrap);triggered.push(state.lastTrap);
  if(!safe){game.log=[`${game.players[trap.owner].name}의 함정 발동 · ${game.players[who].name} HP −${state.lastTrap.damage}`,...game.log].slice(0,40);game.turnReadyAt=Math.max(game.turnReadyAt||0,now+TRAP_TURN_READY_MS);}
 }
 const hostile=triggered.filter(event=>!event.safe);
 if(hostile.length)state.lastTrap={...hostile[0],id:uid(),owners:hostile.map(event=>event.owner),damage:hpBeforePickup-run.hp[who],hpBefore:hpBeforePickup,hpAfter:run.hp[who]};
 if(traps.length){run.updatedAt=now;if(!deferFinish&&isRpgPhaseOne(game)){reconcileRpgEliminations(game,now);return;}if(!deferFinish&&run.hp.some(hp=>hp<=0)){if(game.hpItemMatch)game.hpItemMatch.endReason='trap';finishHpItemMatch(game);}}
}
/** Only profession-origin scouting arms this pickup attack; lenses never arm it. */
export function triggerScoutedPickup(game:Game,who:number,index:number,tile:Tile,now=Date.now()){
 if(hasRoundCombat(game))return null;
 const run=game.rpgRun,state=itemBattleState(game),tactic=run?.tactics?.[who];
 if(!run||!state||run.combat?.professions[who]!=='rogue'||tactic?.round!==game.round)return null;
 const peeks=tactic.peeks||(tactic.peek?[tactic.peek]:[]);if(!peeks.some(peek=>peek.source==='profession'&&peek.round===game.round&&peek.tile.id===tile.id)||state.ambushedTileIds?.includes(tile.id))return null;
 tactic.peeks=peeks.filter(peek=>peek.tile.id!==tile.id);tactic.peek=tactic.peeks.at(-1);state.ambushedTileIds=[...(state.ambushedTileIds||[]),tile.id];
 const hpBefore=[...run.hp],damage=game.players.map((_,seat)=>seat===who||run.hp[seat]<=0?0:Math.min(run.hp[seat],blockItemBattleDamage(game,seat,1,now)));
 run.hp=run.hp.map((hp,seat)=>Math.max(0,hp-damage[seat]));run.updatedAt=now;
 if(!game.hpItemMode)recordRpgRoundHealth(run,hpBefore);
 const event:AmbushBurst={id:uid(),round:game.round,owner:who,index,damage,hpBefore,hpAfter:[...run.hp],at:now+AMBUSH_IMPACT_MS};state.lastAmbush=event;state.ambushEvents=[...(state.ambushEvents||[]),event];
 game.turnReadyAt=Math.max(game.turnReadyAt||0,now+AMBUSH_PRESENTATION_MS);game.log=[`${game.players[who].name} · 투시 패 회수 기습 · ${game.players.map((player,seat)=>seat===who?null:`${player.name} HP −${damage[seat]}`).filter(Boolean).join(' · ')}`,...game.log].slice(0,40);return event;
}
/** Automatic scouting uses hidden upper tiles only and the receiver's own private map. */
export function scoutProfessionFloor(game:Game,who:number,count:number){
 const run=game.rpgRun;if(!run)return 0;
 const old=run.tactics?.[who],known=old?.round===game.round?old.peeks||(old.peek?[old.peek]:[]):[];
 const candidates=game.stacks.flatMap((stack,index)=>stack[1]&&!known.some(peek=>peek.tile.id===stack[1]!.id)?[index]:[]);let revealed=0;
 while(candidates.length&&revealed<count){const random=new Uint32Array(1);crypto.getRandomValues(random);const index=candidates.splice(random[0]%candidates.length,1)[0],peek={round:game.round,index,tile:{...game.stacks[index][1]!},source:'profession' as const};
  const current=run.tactics?.[who],state=current?.round===game.round?{...current}:{round:game.round,used:0};
  state.peek=peek;state.peeks=[...(state.peeks||[]),peek];run.tactics={...run.tactics,[who]:state};revealed++;
 }
 return revealed;
}
/** Bot decisions use only the bot's filtered view, including its own trap/intel. */
export function tryBotFloorTrap(game:Game,now=Date.now()){
 const who=game.turn;if(!game.players[who]?.bot||!trapAvailability(game,who,true,now).usable)return false;
 const position=view(game,game.players[who].token),own=position.rpgRun?.combat?.itemBattle?.traps||[],choices=position.stacks.flatMap((stack,index)=>(stack.upper||stack.lowerPresent)&&!own.some(trap=>trap.index===index)?[{index,score:(stack.coinAmount||0)*5+(stack.lower?stack.lower.n:0)}]:[]);
 choices.sort((a,b)=>b.score-a.score||a.index-b.index);if(!choices.length)return false;placeFloorTrap(game,who,choices[0].index,now);return true;
}
