import {combo,settle,sorted,uid,type Game,type Tile} from './game.ts';
import type {HpBattleEvent} from './hp-item-battle.ts';
import {HP_BATTLE_REVIEW_MS} from './hp-item-battle.ts';
import {blockHostileItem,exchangeEligible} from './rpg-items.ts';
import {withRelicActivations,type RpgRelicEffect} from './rpg-relic-feedback.ts';
import {rpgProfession,rpgProfessionTriggers,type RpgProfessionId} from './rpg-professions.ts';

export type ProfessionEffect={id:string,round:number,actor:number,target?:number,profession:RpgProfessionId,kind:'passive'|'active',label:string,damage:number,heal:number,revealed:number,exchange?:'done'|'blocked'|'unavailable',at:number};
export type ProfessionReveal={round:number,target:number,tiles:Tile[],eventId:string};
export type RpgProfessionCombat={version:1,round:number,professions:RpgProfessionId[],activeUsed:boolean[],battleTiles:number[],battles:HpBattleEvent[],lastBattle?:HpBattleEvent,effects:ProfessionEffect[],privateReveals:Record<number,ProfessionReveal[]>,avatars:string[]};
const npcProfession=(avatar:string,index:number):RpgProfessionId=>{
 const portrait=Number(avatar.split(':')[1]);
 if(avatar.startsWith('stage-portrait:'))return [ 'swordsman','cleric','rogue','rogue','cleric','cleric','swordsman','swordsman','mage','rogue','swordsman','cleric','rogue','rogue','swordsman','swordsman','swordsman','mage','mage','mage','cleric','mage','cleric','cleric','rogue','mage','rogue','mage','swordsman','mage'][portrait] as RpgProfessionId;
 return index===1?'swordsman':'mage';
};
export function newProfessionCombat(profession:RpgProfessionId,avatars:string[],round:number):RpgProfessionCombat{
 return {version:1,round,professions:avatars.map((avatar,index)=>index===0?profession:npcProfession(avatar,index)),activeUsed:avatars.map(()=>false),battleTiles:avatars.map(()=>0),battles:[],effects:[],privateReveals:{},avatars};
}
export function hasProfessionCombat(game:{rpgRun?:{combat?:RpgProfessionCombat}|null}){return game.rpgRun?.combat?.version===1;}
export function lastCombatBattle(game:{hpItemMatch?:{lastBattle?:HpBattleEvent},rpgRun?:{combat?:RpgProfessionCombat}|null}){return game.hpItemMatch?.lastBattle||game.rpgRun?.combat?.lastBattle;}
export function resetProfessionCombat(game:Game){
 const state=game.rpgRun?.combat;if(!state)return;
 const avatars=game.players.map(player=>player.avatar||'');
 if(avatars.slice(1).join('|')!==state.avatars.slice(1).join('|'))state.professions=avatars.map((avatar,index)=>index===0?state.professions[0]:npcProfession(avatar,index));
 Object.assign(state,{round:game.round,activeUsed:game.players.map(()=>false),battleTiles:game.players.map(()=>0),battles:[],lastBattle:undefined,effects:[],privateReveals:{},avatars});
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
  if(kind==='active')state.activeUsed[actor]=true;
  const event:ProfessionEffect={id:uid(),round:game.round,actor,profession,kind,label,damage:trigger.damage,heal:Math.min(trigger.heal,100-game.rpgRun!.hp[actor]),revealed:0,at:now};
  damage+=event.damage;heal[actor]+=event.heal;
  if(trigger.reveal){
   const target=take(game.players.flatMap((player,seat)=>seat!==actor&&player.hand.length?[seat]:[]),1)[0];
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
 return {effects,heal,damage};
}
/** Private snapshots describe the instant of the trigger, including a tile subsequently exchanged. */
export function professionCombatView(state:RpgProfessionCombat|undefined,me:number,game?:Game):RpgProfessionCombat|undefined{
 if(!state)return;
 const own=(state.privateReveals[me]||[]).filter(reveal=>reveal.round===state.round).map(reveal=>({...reveal,tiles:reveal.tiles.map(tile=>({...tile}))}));
 return {...state,privateReveals:own.length?{[me]:own}:{}};
}
export function professionEffectText(effect:ProfessionEffect){return `${rpgProfession(effect.profession).name} ${effect.kind==='active'?'자동 스킬':'패시브'} · ${[effect.damage?`추가 피해 +${effect.damage}`:'',effect.heal?`HP +${effect.heal}`:'',effect.revealed?`상대 패 ${effect.revealed}장 확인`:'',effect.exchange==='done'?'패 1장 교환':effect.exchange==='blocked'?'패 교환 · 수호의 봉인으로 방어':effect.exchange==='unavailable'?'교환할 수 없습니다':''].filter(Boolean).join(' · ')||'회복 한도 도달'}`;}
/** RPG fight damage replaces score-based HP loss for new profession journeys only. */
export function resolveProfessionRpgBattle(game:Game,now=Date.now(),roundEnding=false):HpBattleEvent|null{
 const run=game.rpgRun,state=run?.combat;if(!run||!state||game.hpItemMode||run.status!=='playing'||game.lastBy===null||!game.trick.length)return null;
 const id=`${game.code}:${game.round}:${game.tablePlay?.id||game.lastEvent?.id||game.completedBattles||0}`,prior=state.battles.find(event=>event.id===id);if(prior)return prior;
 const actor=game.lastBy,label=combo(game.trick)?.label;if(!label)return null;
 const playedCount=Math.max(game.trick.length,state.battleTiles[actor]||0),hpBefore=[...run.hp],profession=resolveProfessionWin(game,actor,label,now),damageTaken=game.players.map((_,seat)=>seat===actor?0:playedCount+profession.damage),relics:RpgRelicEffect[]=[],blockedDamage=game.players.map(()=>0);
 if(damageTaken[0]>0){
  if(run.equipped.includes('cracked-heart')&&!run.crackedHeartUsed.includes(run.stage)){const blocked=Math.min(8,damageTaken[0]);damageTaken[0]-=blocked;blockedDamage[0]+=blocked;run.crackedHeartUsed.push(run.stage);relics.push({relicId:'cracked-heart',message:`피해 ${blocked} 방어`});}
  if(run.shield>0){const blocked=Math.min(run.shield,damageTaken[0]);damageTaken[0]-=blocked;blockedDamage[0]+=blocked;run.shield-=blocked;}
 }
 run.hp=run.hp.map((hp,seat)=>Math.min(100,Math.max(0,hp+profession.heal[seat]-damageTaken[seat])));run.updatedAt=now;
 const event:HpBattleEvent={id,round:game.round,actor,label,damage:playedCount,playedCount,hpBefore,hpAfter:[...run.hp],damageTaken,blockedDamage,professions:profession.effects,roundFinal:roundEnding||run.hp.some(hp=>hp<=0),at:now};
 state.battles.push(event);state.lastBattle=event;state.battleTiles=game.players.map(()=>0);
 if(relics.length)game.rpgRun=withRelicActivations(run,relics,now);
 game.turnReadyAt=Math.max(game.turnReadyAt||0,now+(event.roundFinal?700:HP_BATTLE_REVIEW_MS));
 game.log=[`${game.players[actor].name} · ${label} 승리 · 제출 ${playedCount}장 · 기본 피해 ${playedCount}`,...profession.effects.map(effect=>`${game.players[actor].name} · ${professionEffectText(effect)}`),...game.log].slice(0,40);
 if(run.hp.some(hp=>hp<=0)){game.phase='ended';game.turnDeadline=0;game.winner=actor;settle(game);}
 return event;
}
