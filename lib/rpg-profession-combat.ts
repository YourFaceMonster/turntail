import {queueProfessionRoundBattle,type RoundCombatState} from './profession-round-combat';
import {hasRoundCombat} from './profession-round-rules';
import {beginRpgRoundHealth,recordRpgRoundHealth} from './rpg-round-health';
import {isRpgPhaseOne,rpgAlive,reconcileRpgEliminations,chargeRpgDuel} from './rpg-phase-one.ts';
import {PROFESSION_ACTIVES} from './profession-actives.ts';
import {itemBattleRelicWin} from './item-battle-relics.ts';
import {hpLimit} from './hp-limit';
import {combo,settle,sorted,uid,type Game,type Tile} from './game.ts';
import type {HpBattleEvent} from './hp-item-battle.ts';
import {HP_BATTLE_REVIEW_MS,FINAL_SETTLEMENT_DELAY_MS} from './hp-item-battle.ts';
import {blockHostileItem,exchangeEligible} from './rpg-items.ts';
import {withRelicActivations,type RpgRelicEffect} from './rpg-relic-feedback.ts';
import {rpgProfession,rpgProfessionTriggers,type RpgProfessionId} from './rpg-professions.ts';
import {resetItemBattle,scoutProfessionFloor,type ItemBattleState} from './item-battle-rules.ts';
import {resetProfessionActiveEvents,type ProfessionActiveState} from './profession-actives.ts';

export type ProfessionEffect={id:string,round:number,actor:number,target?:number,profession:RpgProfessionId,kind:'passive'|'active',label:string,damage:number,heal:number,revealed:number,floorScout?:boolean,trait?:string,immediate?:boolean,trapDamage?:number,trapFallback?:number,exchange?:'done'|'blocked'|'unavailable',at:number};
export type ProfessionReveal={round:number,target:number,tiles:Tile[],eventId:string};
export type RpgProfessionCombat={roundRules?:boolean,immediateSkills?:boolean,lastInstant?:HpBattleEvent,pendingRound?:RoundCombatState,version:1,round:number,professions:RpgProfessionId[],activeUsed:boolean[],battleTiles:number[],battles:HpBattleEvent[],lastBattle?:HpBattleEvent,effects:ProfessionEffect[],privateReveals:Record<number,ProfessionReveal[]>,avatars:string[],itemBattle?:ItemBattleState,actives?:ProfessionActiveState};
const npcProfession=(avatar:string,index:number):RpgProfessionId=>{
 const portrait=Number(avatar.split(':')[1]);
 if(avatar.startsWith('stage-portrait:'))return [ 'swordsman','cleric','rogue','rogue','cleric','cleric','swordsman','swordsman','mage','rogue','swordsman','cleric','rogue','rogue','swordsman','swordsman','swordsman','mage','mage','mage','cleric','mage','cleric','cleric','rogue','mage','rogue','mage','swordsman','mage'][portrait] as RpgProfessionId;
 return index===1?'swordsman':'mage';
};
export function newProfessionCombat(profession:RpgProfessionId,avatars:string[],round:number):RpgProfessionCombat{
 return {version:1,roundRules:true,immediateSkills:true,round,professions:avatars.map((avatar,index)=>index===0?profession:npcProfession(avatar,index)),activeUsed:avatars.map(()=>false),battleTiles:avatars.map(()=>0),battles:[],effects:[],privateReveals:{},avatars};
}
export function hasProfessionCombat(game:{rpgRun?:{combat?:RpgProfessionCombat}|null}){return game.rpgRun?.combat?.version===1;}
export function lastCombatBattle(game:{hpItemMatch?:{lastBattle?:HpBattleEvent},rpgRun?:{combat?:RpgProfessionCombat}|null}){if(hasRoundCombat(game))return undefined;return game.hpItemMatch?.lastBattle||game.rpgRun?.combat?.lastBattle;}
export function resetProfessionCombat(game:Game){
 const state=game.rpgRun?.combat;if(!state)return;
 const avatars=game.players.map(player=>player.avatar||'');
 if(avatars.slice(1).join('|')!==state.avatars.slice(1).join('|'))state.professions=avatars.map((avatar,index)=>index===0?state.professions[0]:npcProfession(avatar,index));
 Object.assign(state,{roundRules:true,immediateSkills:true,lastInstant:undefined,pendingRound:undefined,round:game.round,activeUsed:game.players.map(()=>false),battleTiles:game.players.map(()=>0),battles:[],lastBattle:undefined,effects:[],privateReveals:{},avatars});
 resetItemBattle(game);if(state.actives){state.actives.events=[];state.actives.lastEvent=undefined;state.actives.lastUsedTurn=game.players.map(()=>null);}resetProfessionActiveEvents(game);if(!game.hpItemMode)beginRpgRoundHealth(game.rpgRun!,game.round);
}
export function recordProfessionBattlePlay(game:Game,who:number,count:number){if(game.rpgRun?.combat&&!game.hpItemMode)game.rpgRun.combat.battleTiles[who]+=count;}
function take<T>(pool:readonly T[],count:number):T[]{const choices=[...pool],picked:T[]=[];while(choices.length&&picked.length<count){const random=new Uint32Array(1);crypto.getRandomValues(random);picked.push(choices.splice(random[0]%choices.length,1)[0]);}return picked;}
/** This runs only after the fight winner is known, once for that fight. Never consumes items. */
export function resolveProfessionWin(game:Game,actor:number,label:string,now:number){
 const state=game.rpgRun?.combat,effects:ProfessionEffect[]=[],heal=game.players.map(()=>0);let damage=0;
 if(!state||state.round!==game.round)return {effects,heal,damage};
 const profession=state.professions[actor],triggers=rpgProfessionTriggers(profession,label,state.activeUsed[actor]);
 for(const kind of ['passive','active'] as const){
  const trigger=triggers[kind];if(!trigger)continue;
  if(kind==='active'&&profession!=='mage')state.activeUsed[actor]=true;
  const event:ProfessionEffect={id:uid(),round:game.round,actor,profession,kind,label,damage:trigger.damage,heal:Math.min(trigger.heal,hpLimit(game.rpgRun)-game.rpgRun!.hp[actor]),revealed:0,at:now};
  damage+=event.damage;heal[actor]+=event.heal;
  if(trigger.reveal&&state.itemBattle&&(game.hpItemMode||isRpgPhaseOne(game))&&profession==='rogue'){
   event.floorScout=true;event.revealed=scoutProfessionFloor(game,actor,trigger.reveal);
  }else if(trigger.reveal){
   const target=take(game.players.flatMap((player,seat)=>seat!==actor&&rpgAlive(game,seat)&&player.hand.length?[seat]:[]),1)[0];
   if(target!==undefined){
    event.target=target;const tiles=take(game.players[target].hand,trigger.reveal).map(tile=>({...tile}));event.revealed=tiles.length;
    state.privateReveals[actor]=[...(state.privateReveals[actor]||[]),{round:game.round,target,tiles,eventId:event.id}];
    if(trigger.exchange){
     event.exchange='unavailable';const mine=game.players[actor],other=game.players[target],out=take(mine.hand.filter(exchangeEligible),1),incoming=take(other.hand.filter(exchangeEligible),1);
     if(mine.hand.length>=4&&other.hand.length>=4){
      if(blockHostileItem(game,actor,target,'swapped-fate','profession'))event.exchange='blocked';
      else if(out.length&&incoming.length){
       mine.hand=sorted([...mine.hand.filter(tile=>tile.id!==out[0].id),...incoming]);other.hand=sorted([...other.hand.filter(tile=>tile.id!==incoming[0].id),...out]);event.exchange='done';
       game.rpgRun!.lastExchange={id:uid(),source:'profession',itemId:'swapped-fate',actor,target,round:game.round,outgoing:out.map(tile=>({...tile})),incoming:incoming.map(tile=>({...tile})),at:now};
       if(game.publicDraws){game.publicDraws[mine.id]=(game.publicDraws[mine.id]||[]).filter(tile=>tile.id!==out[0].id);game.publicDraws[other.id]=(game.publicDraws[other.id]||[]).filter(tile=>tile.id!==incoming[0].id);}
      }
     }
    }
   }else if(trigger.exchange)event.exchange='unavailable';
  }
  effects.push(event);state.effects.push(event);
 }
 const extra=state.itemBattle;
 if(extra&&game.hpItemMode){
  let extraDamage=0,extraHeal=0,trait='';
  if(profession==='swordsman'&&label==='싱글'){extraDamage=1;trait='날카로운 한 수';}
  if(profession==='cleric'&&label==='페어'){extra.pairWins[actor]++;if(extra.pairWins[actor]===2){extraHeal=2;trait='이어지는 기도';}}
  if(profession==='mage'&&game.trick.length===5){extraDamage=4;trait='5장 족보 강화';}
  if(trait){const event:ProfessionEffect={id:uid(),round:game.round,actor,profession,kind:'passive',label,damage:extraDamage,heal:Math.min(extraHeal,Math.max(0,hpLimit(game.rpgRun)-game.rpgRun!.hp[actor]-heal[actor])),revealed:0,trait,at:now};damage+=event.damage;heal[actor]+=event.heal;effects.push(event);state.effects.push(event);}
 }
 return {effects,heal,damage};
}
/** Private snapshots describe the instant of the trigger, including a tile subsequently exchanged. */
export function professionCombatView(state:RpgProfessionCombat|undefined,me:number,game?:Game):RpgProfessionCombat|undefined{
 if(!state)return;
 const own=(state.privateReveals[me]||[]).filter(reveal=>reveal.round===state.round).map(reveal=>({...reveal,tiles:reveal.tiles.map(tile=>({...tile}))}));
 const extra=state.itemBattle;
 const itemBattle=extra?{...extra,ambushedTileIds:undefined,trapUsed:extra.trapUsed.map((used,seat)=>seat===me?used:false),traps:extra.traps.filter(trap=>trap.owner===me).map(trap=>({...trap,tileId:-1})),trapIntel:{[me]:(extra.trapIntel[me]||[]).filter(intel=>!game||(game.stacks[intel.index]?.[1]||game.stacks[intel.index]?.[0])?.id===intel.tileId)},trapEvents:extra.trapEvents.filter(event=>!event.safe||event.owner===me),lastTrap:extra.lastTrap?.safe&&extra.lastTrap.owner!==me?undefined:extra.lastTrap}:undefined;
 const actives=state.actives?{...state.actives,gauge:state.actives.gauge.map((value,seat)=>seat===me?value:0),lastUsedTurn:state.actives.lastUsedTurn.map((value,seat)=>seat===me?value:null)}:undefined;
 return {...state,itemBattle,actives,privateReveals:own.length?{[me]:own}:{}};
}
export function professionEffectText(effect:ProfessionEffect){if(effect.immediate)return `${rpgProfession(effect.profession).name} · ${effect.label} · ${[effect.damage?`${effect.profession==='mage'?'상대 각각':'무작위 상대 1명'} 즉시 공격 ${effect.damage}`:'',effect.heal?`HP +${effect.heal}`:'',effect.profession==='cleric'&&!effect.heal?'회복 한도 도달':'',effect.floorScout?`바닥 패 ${effect.revealed}장 확인`:'',effect.trapDamage?`함정 피해 ${effect.trapDamage} 설치`:'',effect.trapFallback?'기습 피해 1 적용':''].filter(Boolean).join(' · ')}`;if(effect.trait==='족보 자동 스킬')return `${rpgProfession(effect.profession).name} · ${effect.label} · ${[effect.damage?`${effect.profession==='mage'?'상대 각각':effect.target!==undefined?'무작위 상대 1명':'공격'} 피해 ${effect.damage} 적립`:'',effect.heal?`회복 +${effect.heal} 적립`:'',effect.floorScout?`바닥 패 ${effect.revealed}장 확인`:'',effect.trapDamage?`함정 피해 ${effect.trapDamage} 설치`:'',effect.trapFallback?'함정 대기 피해 1 적립':''].filter(Boolean).join(' · ')}`;return `${rpgProfession(effect.profession).name} ${(effect.trait==='비전 증폭'?'5장 족보 강화':effect.trait)|| (effect.kind==='active'?'자동 스킬':'패시브')} · ${[effect.damage?`추가 피해 +${effect.damage}`:'',effect.heal?`HP +${effect.heal}`:'',effect.revealed?`${effect.floorScout?'바닥':'상대'} 패 ${effect.revealed}장 확인`:'',effect.floorScout&&!effect.revealed?'숨겨진 바닥패 없음':'',effect.exchange==='done'?'패 1장 교환':effect.exchange==='blocked'?'패 교환 · 수호의 봉인으로 방어':effect.exchange==='unavailable'?'교환할 수 없습니다':''].filter(Boolean).join(' · ')||'회복 한도 도달'}`;}
/** RPG fight damage replaces score-based HP loss for new profession journeys only. */
export function resolveProfessionRpgBattle(game:Game,now=Date.now(),roundEnding=false):HpBattleEvent|null{
 if(hasRoundCombat(game)&&!game.hpItemMode)return queueProfessionRoundBattle(game,now);
 const run=game.rpgRun,state=run?.combat;if(!run||!state||game.hpItemMode||run.status!=='playing'||game.lastBy===null||!game.trick.length)return null;
 const id=`${game.code}:${game.round}:${game.tablePlay?.id||game.lastEvent?.id||game.completedBattles||0}`,prior=state.battles.find(event=>event.id===id);if(prior)return prior;
 const actor=game.lastBy,label=combo(game.trick)?.label;if(!label||!rpgAlive(game,actor))return null;
 const playedCount=Math.max(game.trick.length,state.battleTiles[actor]||0),hpBefore=[...run.hp],profession=resolveProfessionWin(game,actor,label,now),damageTaken=game.players.map((_,seat)=>seat===actor||!rpgAlive(game,seat)?0:playedCount+profession.damage),relics:RpgRelicEffect[]=[],blockedDamage=game.players.map(()=>0);
 const relic=isRpgPhaseOne(game)&&actor===0?itemBattleRelicWin(run.equipped,label,game.trick):{damage:0,heal:0,effects:[]};
 for(let seat=0;seat<damageTaken.length;seat++)if(seat!==actor&&rpgAlive(game,seat))damageTaken[seat]+=relic.damage;
 const relicHeal=Math.min(relic.heal,Math.max(0,hpLimit(run)-run.hp[actor]-profession.heal[actor]));profession.heal[actor]+=relicHeal;
 let remainingRelicHeal=relicHeal;for(const effect of relic.effects){if(!effect.message.startsWith('HP'))relics.push(effect);else{const amount=Math.min(remainingRelicHeal,effect.relicId==='life-sigil'?2:1);remainingRelicHeal-=amount;if(amount)relics.push({...effect,message:`HP +${amount}`});}}
 if(damageTaken[0]>0){
  if(run.equipped.includes('cracked-heart')&&!run.crackedHeartUsed.includes(run.stage)){const blocked=Math.min(8,damageTaken[0]);damageTaken[0]-=blocked;blockedDamage[0]+=blocked;run.crackedHeartUsed.push(run.stage);relics.push({relicId:'cracked-heart',message:`피해 ${blocked} 방어`});}
  if(run.shield>0){const blocked=Math.min(run.shield,damageTaken[0]);damageTaken[0]-=blocked;blockedDamage[0]+=blocked;run.shield-=blocked;}
 }
 run.hp=run.hp.map((hp,seat)=>Math.min(hpLimit(run),Math.max(0,hp+profession.heal[seat]-damageTaken[seat])));run.updatedAt=now;recordRpgRoundHealth(run,hpBefore);
 const event:HpBattleEvent={...(isRpgPhaseOne(game)?{excludedSeats:game.players.flatMap((_,seat)=>hpBefore[seat]<=0?[seat]:[])}:{}),...(relics.length?{relics,relicDamage:relic.damage,relicHealing:relicHeal}:{}),id,round:game.round,actor,label,damage:playedCount,ordinal:state.battles.length+1,winningTiles:game.trick.map(tile=>({...tile})),playedCount,hpBefore,hpAfter:[...run.hp],damageTaken,blockedDamage,professions:profession.effects,roundFinal:roundEnding||(isRpgPhaseOne(game)?run.hp[0]<=0||run.hp.slice(1).every(hp=>hp<=0):run.hp.some(hp=>hp<=0)),at:now};
 state.battles.push(event);state.lastBattle=event;state.battleTiles=game.players.map(()=>0);
 if(relics.length)Object.assign(run,withRelicActivations(run,relics,now));
 if(isRpgPhaseOne(game))chargeRpgDuel(game,id,state.professions.map(profession=>PROFESSION_ACTIVES[profession].maxGauge));
 game.turnReadyAt=Math.max(game.turnReadyAt||0,now+HP_BATTLE_REVIEW_MS+(event.roundFinal?FINAL_SETTLEMENT_DELAY_MS:0));
 game.log=[`${game.players[actor].name} · ${label} 승리 · 제출 ${playedCount}장 · 기본 피해 ${playedCount}`,...profession.effects.map(effect=>`${game.players[actor].name} · ${professionEffectText(effect)}`),...game.log].slice(0,40);
 if(isRpgPhaseOne(game)){reconcileRpgEliminations(game,now);return event;}
 if(run.hp.some(hp=>hp<=0)){game.phase='ended';game.turnDeadline=0;game.winner=actor;settle(game);}
 return event;
}
