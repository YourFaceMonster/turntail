import {uid,view,type Game} from './game.ts';
import type {RpgProfessionId} from './rpg-professions.ts';
import {hpItemShopPending} from './hp-item-shop.ts';
import {finishHpItemMatch} from './hp-item-mode.ts';
import {blockItemBattleDamage,placeFloorTrap,tryBotFloorTrap} from './item-battle-rules.ts';

export const PROFESSION_ACTIVES={
 swordsman:{name:'강타',maxGauge:4,values:[0,1,2,4,6]},
 mage:{name:'화염 파동',maxGauge:5,values:[0,1,2,3,4,6]},
 cleric:{name:'치유',maxGauge:3,values:[0,1,3,5]},
 rogue:{name:'함정 설치',maxGauge:4,values:[0,0,4,4,4]},
} as const;
export const ACTIVE_IMPACT_MS=1050,ACTIVE_PRESENTATION_MS=2400;
export type ProfessionActiveEvent={id:string,round:number,actor:number,profession:RpgProfessionId,spent:number,gaugeBefore:number,gaugeAfter:number,target?:number,damage:number[],healing:number[],hpBefore:number[],hpAfter:number[],at:number};
export type ProfessionActiveState={version:1,gauge:number[],lastUsedTurn:(string|null)[],chargedRounds:number[],events:ProfessionActiveEvent[],lastEvent?:ProfessionActiveEvent};
export type ActiveContext=Pick<Game,'phase'|'turn'|'rpgRun'|'round'|'turnReadyAt'|'hpItemMode'|'hpItemVariant'|'hpItemRules'|'hpItemMatch'|'roundActions'|'result'>;
export function newProfessionActives(size:number):ProfessionActiveState{return {version:1,gauge:Array(size).fill(1),lastUsedTurn:Array(size).fill(null),chargedRounds:[],events:[]};}
export function hasProfessionActives(game:ActiveContext){return !!game.hpItemMode&&game.hpItemVariant===2&&game.hpItemRules===4&&!!game.rpgRun?.combat?.itemBattle;}
/** Old saves receive the starting one cell, never retroactive round charges. */
export function ensureProfessionActives(game:ActiveContext){
 if(!hasProfessionActives(game))return;const combat=game.rpgRun!.combat!,state=combat.actives??=newProfessionActives(combat.professions.length);
 state.gauge=combat.professions.map((profession,seat)=>Math.max(0,Math.min(PROFESSION_ACTIVES[profession].maxGauge,Math.floor(state.gauge[seat]??1))));return state;
}
export function professionTurnKey(game:Pick<Game,'round'|'turn'|'roundActions'>){return `${game.round}:${game.turn}:${game.roundActions||0}`;}
export function activeGauge(game:ActiveContext,who:number){const profession=game.rpgRun?.combat?.professions[who]||'swordsman';return Math.max(0,Math.min(PROFESSION_ACTIVES[profession].maxGauge,game.rpgRun?.combat?.actives?.gauge[who]??1));}
export function professionActiveAvailability(game:ActiveContext,who:number,enabled=true,now=Date.now()){
 const combat=game.rpgRun?.combat,profession=combat?.professions[who];if(!hasProfessionActives(game)||!profession)return {usable:false,reason:'아이템전 직업 스킬'};
 const config=PROFESSION_ACTIVES[profession],gauge=activeGauge(game,who);
 if(game.phase!=='playing'||game.rpgRun!.status!=='playing'||game.rpgRun!.hp[who]<=0)return {usable:false,reason:'대전 종료'};
 if(hpItemShopPending(game))return {usable:false,reason:'상점 준비를 마쳐 주세요'};
 if(!enabled||game.turn!==who)return {usable:false,reason:'내 차례에 사용 가능'};
 if(now<(game.turnReadyAt||0))return {usable:false,reason:'연출이 끝나면 사용 가능'};
 if(combat?.actives?.lastUsedTurn[who]===professionTurnKey(game))return {usable:false,reason:'이번 턴 스킬 사용 완료'};
 if(gauge<(profession==='rogue'?2:1))return {usable:false,reason:profession==='rogue'?'함정은 게이지 2칸 필요':'판 종료 시 게이지 +1'};
 if(profession==='cleric'&&game.rpgRun!.hp[who]>=100)return {usable:false,reason:'HP가 이미 가득 찼어요'};
 const value=config.values[gauge];return {usable:true,reason:profession==='rogue'?'2칸 소비 · 자기 턴 (1회) · 함정 피해 4':`${gauge}칸 전량 소비 · ${profession==='cleric'?`HP +${value}`:profession==='mage'?`상대 각각 피해 ${value}`:`선택 상대 피해 ${value}`}`};
}
/** Validate the target before calling this; invalid actions must consume nothing. */
export function consumeProfessionGauge(game:ActiveContext,who:number,now=Date.now()){
 const available=professionActiveAvailability(game,who,true,now);if(!available.usable)throw Error(available.reason);
 const state=ensureProfessionActives(game)!,profession=game.rpgRun!.combat!.professions[who],before=state.gauge[who],spent=profession==='rogue'?2:before;
 state.gauge[who]-=spent;state.lastUsedTurn[who]=professionTurnKey(game);game.rpgRun!.updatedAt=now;return {state,before,spent,after:state.gauge[who]};
}
/** Called only by completed-round reporting; repeated reporting cannot recharge twice. */
export function chargeProfessionActives(game:Game){
 if(game.phase!=='ended')return false;const state=ensureProfessionActives(game);if(!state||state.chargedRounds.includes(game.round))return false;
 state.chargedRounds.push(game.round);state.gauge=state.gauge.map((value,seat)=>Math.min(PROFESSION_ACTIVES[game.rpgRun!.combat!.professions[seat]].maxGauge,value+1));return true;
}
export function resetProfessionActiveEvents(game:Game){const state=ensureProfessionActives(game);if(state){state.events=[];state.lastEvent=undefined;state.lastUsedTurn=game.players.map(()=>null);}}
export function useProfessionActive(game:Game,who:number,target=-1,now=Date.now()){
 const available=professionActiveAvailability(game,who,true,now);if(!available.usable)throw Error(available.reason);
 const run=game.rpgRun!,profession=run.combat!.professions[who];if(profession==='rogue'){placeFloorTrap(game,who,target,now);return null;}
 if(profession==='swordsman'&&(!Number.isInteger(target)||target===who||!game.players[target]||run.hp[target]<=0))throw Error('공격할 상대를 선택해 주세요.');
 if(profession==='mage'&&!run.hp.some((hp,seat)=>seat!==who&&hp>0))throw Error('공격할 상대가 없어요.');
 const value=PROFESSION_ACTIVES[profession].values[activeGauge(game,who)],hpBefore=[...run.hp],damage=game.players.map((_,seat)=>seat!==who&&run.hp[seat]>0&&(profession==='mage'||profession==='swordsman'&&seat===target)?Math.min(run.hp[seat],blockItemBattleDamage(game,seat,value,now)):0),healing=game.players.map((_,seat)=>profession==='cleric'&&seat===who?Math.min(value,100-run.hp[seat]):0);
 const {state,before,spent,after}=consumeProfessionGauge(game,who,now);run.hp=run.hp.map((hp,seat)=>Math.max(0,Math.min(100,hp-damage[seat]+healing[seat])));
 const event:ProfessionActiveEvent={id:uid(),round:game.round,actor:who,profession,spent,gaugeBefore:before,gaugeAfter:after,...(profession==='swordsman'?{target}:{}),damage,healing,hpBefore,hpAfter:[...run.hp],at:now+ACTIVE_IMPACT_MS};state.lastEvent=event;state.events.push(event);
 game.turnReadyAt=Math.max(game.turnReadyAt||0,now+ACTIVE_PRESENTATION_MS);game.log=[`${game.players[who].name} · ${PROFESSION_ACTIVES[profession].name} · ${spent}칸 소비 · ${profession==='cleric'?`HP +${healing[who]}`:game.players.flatMap((player,seat)=>seat!==who&&(profession==='mage'||seat===target)?[`${player.name} HP −${damage[seat]}`]:[]).join(' · ')}`,...game.log].slice(0,40);
 if(run.hp.some(hp=>hp<=0)){game.hpItemMatch!.endReason='active';finishHpItemMatch(game);}return event;
}
/** Decisions use only public HP, own gauge/hand, and the bot's filtered floor view. */
export function tryBotProfessionActive(game:Game,now=Date.now()){
 const who=game.turn;if(!game.players[who]?.bot||!professionActiveAvailability(game,who,true,now).usable)return false;
 const position=view(game,game.players[who].token),profession=position.rpgRun!.combat!.professions[who];if(profession==='rogue')return tryBotFloorTrap(game,now);
 const gauge=activeGauge(position,who),config=PROFESSION_ACTIVES[profession],value=config.values[gauge],hp=position.rpgRun!.hp,targets=hp.flatMap((health,seat)=>seat!==who&&health>0?[seat]:[]).sort((a,b)=>hp[a]-hp[b]);
 if(profession==='cleric'){if(100-hp[who]<value||gauge<config.maxGauge&&hp[who]>35)return false;}
 else if(gauge<config.maxGauge&&hp[who]>15&&!targets.some(seat=>hp[seat]<=value))return false;
 useProfessionActive(game,who,targets[0]??-1,now);return true;
}
