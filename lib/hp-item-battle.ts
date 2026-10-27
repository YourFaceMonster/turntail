import {combo,type Game,type Tile} from './game.ts';
import {finishHpItemMatch} from './hp-item-mode.ts';
import {finishHpItemRoundReport} from './hp-item-shop.ts';
import {resolveHpSkills,type HpSkillUse} from './hp-item-skills.ts';

export type HpBattleEvent={id:string,round:number,actor:number,label:string,damage:number,playedCount?:number,roundFinal?:boolean,damageTaken?:number[],pointsEarned?:number,skills?:HpSkillUse[],hpBefore:number[],hpAfter:number[],at:number};
/** Impact beat before the click-to-dismiss result; the client holds turns until acknowledged. */
export const HP_BATTLE_WIN_DELAY_MS=1250;
export const HP_BATTLE_REVIEW_MS=2600;
/** Rules 2 preserves previously saved mode-1 trials; new battles belong to mode 2. */
export function isBattleItemMode(game:{hpItemMode?:boolean,hpItemVariant?:number,hpItemRules?:number}){return !!game.hpItemMode&&(game.hpItemVariant===2&&(game.hpItemRules===3||game.hpItemRules===4)||game.hpItemVariant===1&&game.hpItemRules===2);}
/** Original purchase-start shop and allowance; HP damage never creates coins. */
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
 const resolved=resolveHpSkills(game,actor,damage),hpBefore=[...run.hp],hpAfter=run.hp.map((hp,seat)=>Math.max(0,hp-resolved.damage[seat]));
 const pointsEarned=0;
 const roundFinal=roundEnding||hpAfter.some(hp=>hp<=0);
 const battle:HpBattleEvent={id,round:game.round,actor,label,damage,playedCount,roundFinal,damageTaken:resolved.damage,pointsEarned,skills:resolved.effects,hpBefore,hpAfter:[...hpAfter],at:now};
 run.hp=hpAfter;run.updatedAt=now;state.battles=[...(state.battles||[]),battle];state.lastBattle=battle;
 state.battleTiles=game.players.map(()=>0);
 game.turnReadyAt=Math.max(game.turnReadyAt||0,now+(roundFinal?700:HP_BATTLE_REVIEW_MS));
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
