import {hpLimit} from './hp-limit';
import {combo,type Game,type Tile} from './game.ts';
import {finishHpItemMatch} from './hp-item-mode.ts';
import {finishHpItemRoundReport} from './hp-item-shop.ts';
import {resolveHpSkills,type HpSkillUse} from './hp-item-skills.ts';
import {resolveProfessionWin,type ProfessionEffect} from './rpg-profession-combat.ts';
import {rememberPublicBattleRelics} from './item-battle-public-relics';
import {itemBattleRelicWin} from './item-battle-relics.ts';
import {blockItemBattleDamage,itemBattleState} from './item-battle-rules.ts';
import {withRelicActivations} from './rpg-relic-feedback.ts';

export type HpBattleEvent={id:string,round:number,actor:number,label:string,damage:number,maxHp?:number,ordinal?:number,winningTiles?:Tile[],playedCount?:number,roundFinal?:boolean,damageTaken?:number[],blockedDamage?:number[],pointsEarned?:number,skills?:HpSkillUse[],professions?:ProfessionEffect[],relics?:{relicId:string,message:string}[],relicDamage?:number,relicHealing?:number,hpBefore:number[],hpAfter:number[],at:number};
/** Impact beat before the click-to-dismiss result; the client holds turns until acknowledged. */
export const HP_BATTLE_WIN_DELAY_MS=1250;
export const HP_BATTLE_REVIEW_MS=2000;
export const FINAL_SETTLEMENT_DELAY_MS=1000;
/** Rules 2 preserves previously saved mode-1 trials; new battles belong to mode 2. */
export function isBattleItemMode(game:{hpItemMode?:boolean,hpItemVariant?:number,hpItemRules?:number}){return !!game.hpItemMode&&(game.hpItemVariant===2&&(game.hpItemRules===3||game.hpItemRules===4)||game.hpItemVariant===1&&game.hpItemRules===2);}
/** Original purchase-start shop; HP damage never creates coins. */
export function usesOriginalItemShop(game:{hpItemMode?:boolean,hpItemVariant?:number,hpItemRules?:number}){return !!game.hpItemMode&&game.hpItemVariant===2&&game.hpItemRules===4;}
export const HP_BATTLE_DAMAGE:Readonly<Record<string,number>>={'싱글':1,'페어':2,'트리플':3,'스트레이트':4,'플러시':4,'풀하우스':5,'포카드':6,'스트레이트 플러시':10};
export function hpBattleDamage(tiles:Tile[]){const label=combo(tiles)?.label;return label?HP_BATTLE_DAMAGE[label]||0:0;}
/** Older saves can recover the visible submissions since the last lead change. */
function battleTileCounts(game:Game){
 const state=game.hpItemMatch!;if(state.battleTiles?.length===game.players.length)return state.battleTiles;
 const counts=game.players.map(()=>0);
 for(const line of game.log){
  if(line.includes('선을 잡았습니다')||line.startsWith('라운드 '))break;
  const match=line.match(/ · .+ (\d+)개 제출$/);if(!match)continue;
  const seats=game.players.flatMap((player,seat)=>line.startsWith(`${player.name} · `)?[seat]:[]);if(seats.length===1)counts[seats[0]]+=Number(match[1]);
 }
 if(game.lastBy!==null)counts[game.lastBy]=Math.max(counts[game.lastBy],game.trick.length);
 state.battleTiles=counts;return counts;
}
export function recordHpBattlePlay(game:Game,who:number,count:number){if(usesOriginalItemShop(game)&&game.hpItemMatch)battleTileCounts(game)[who]+=count;}
/** Called before clearing the winning trick and before final-hand money settlement. */
export function resolveHpItemBattle(game:Game,now=Date.now(),roundEnding=false):HpBattleEvent|null{
 if(!isBattleItemMode(game)||!game.rpgRun||!game.hpItemMatch||game.rpgRun.status!=='playing'||game.lastBy===null||!game.trick.length)return null;
 const state=game.hpItemMatch,run=game.rpgRun,id=`${game.code}:${game.round}:${game.tablePlay?.id||game.lastEvent?.id||game.completedBattles||0}`;
 const prior=state.battles?.find(battle=>battle.id===id);if(prior)return prior;
 const actor=game.lastBy,label=combo(game.trick)?.label,playedCount=usesOriginalItemShop(game)?Math.max(game.trick.length,battleTileCounts(game)[actor]):undefined,damage=playedCount??hpBattleDamage(game.trick);if(!label||!damage)return null;
 const hpBefore=[...run.hp],profession=resolveProfessionWin(game,actor,label,now),relic=actor===0&&itemBattleState(game)?itemBattleRelicWin(run.equipped,label,game.trick):{damage:0,heal:0,effects:[]},resolved=resolveHpSkills(game,actor,damage+profession.damage+relic.damage);
 const blockedDamage=game.players.map(()=>0);
 if(itemBattleState(game))resolved.damage=resolved.damage.map((amount,seat)=>{const actual=blockItemBattleDamage(game,seat,amount,now);blockedDamage[seat]=amount-actual;return actual;});
 const relicHeal=Math.min(relic.heal,Math.max(0,hpLimit(run)-run.hp[actor]-profession.heal[actor]));
 let remaining=relicHeal;const relicEffects=relic.effects.flatMap(effect=>{if(!effect.message.startsWith('HP'))return [effect];const wanted=effect.relicId==='life-sigil'?2:1,actual=Math.min(wanted,remaining);remaining-=actual;return actual?[{...effect,message:`HP +${actual}`}]:[];});
 if(relicEffects.length)Object.assign(run,withRelicActivations(run,relicEffects,now));
 const hpAfter=run.hp.map((hp,seat)=>Math.min(hpLimit(run),Math.max(0,hp+profession.heal[seat]+(seat===actor?relicHeal:0)-resolved.damage[seat])));
 const pointsEarned=0;
 const roundFinal=roundEnding||hpAfter.some(hp=>hp<=0);
 const battle:HpBattleEvent={id,round:game.round,actor,label,damage,maxHp:hpLimit(run),ordinal:(state.battles?.length||0)+1,winningTiles:game.trick.map(tile=>({...tile})),playedCount,roundFinal,damageTaken:resolved.damage,...(blockedDamage.some(Boolean)?{blockedDamage}:{}),pointsEarned,skills:resolved.effects,professions:profession.effects,...(relicEffects.length?{relics:relicEffects,relicDamage:relic.damage,relicHealing:relicHeal}:{}),hpBefore,hpAfter:[...hpAfter],at:now};
 rememberPublicBattleRelics(state,battle);
 run.hp=hpAfter;run.updatedAt=now;state.battles=[...(state.battles||[]),battle];state.lastBattle=battle;
 state.battleTiles=game.players.map(()=>0);
 game.turnReadyAt=Math.max(game.turnReadyAt||0,now+HP_BATTLE_REVIEW_MS+(roundFinal?FINAL_SETTLEMENT_DELAY_MS:0));
 game.log=[`${game.players[actor].name} · ${label} 승리 · ${game.players.map((player,seat)=>seat===actor?null:`${player.name} HP −${hpBefore[seat]-hpAfter[seat]}`).filter(Boolean).join(" · ")}`,...game.log].slice(0,40);
 if(run.hp.some(hp=>hp<=0)){state.endReason='battle';state.moneySkipped=true;finishHpItemMatch(game);}
 return battle;
}
/** Net score is applied to every wallet together. Only the unpaid loss costs HP. */
export function settleHpBattleMoney(game:Game){
 const state=game.hpItemMatch,run=game.rpgRun,result=game.result;
 if(!isBattleItemMode(game)||!state||!run||!result)return;
 if(state.moneySettlementId===result.id)return;
 if(game.phase!=='ended'||run.status!=='playing'||state.moneySkipped)throw Error('종료된 싸움의 돈은 정산하지 않아요.');
 const before=[...state.points],delta=result.players.map(player=>player.delta),shortfall=before.map((money,seat)=>Math.max(0,-delta[seat]-money));
 state.points=before.map((money,seat)=>Math.max(0,money+delta[seat]));
 run.hp=run.hp.map((hp,seat)=>Math.max(0,hp-shortfall[seat]));
 state.moneyBefore=before;state.moneyDelta=delta;state.moneyDamage=shortfall;state.moneySkipped=false;state.moneySettlementId=result.id;
 result.players.forEach((player,seat)=>{player.total=state.points[seat];});
 run.rounds++;run.roundIds=[...run.roundIds,result.id];run.updatedAt=result.at;
 if(run.hp.some(hp=>hp<=0))state.endReason='bankruptcy';
 finishHpItemRoundReport(game);finishHpItemMatch(game);
}
