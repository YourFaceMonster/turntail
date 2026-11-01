import {journeyAfterReward} from './rpg-journey.ts';
import {settle,type Game} from './game.ts';
import type {RpgRun,RpgResult} from './rpg.ts';
import {withRelicActivations} from './rpg-relic-feedback.ts';

/** Phase-one tuning only. Never used by normal play, item matches or legacy RPG saves. */
export const RPG_PHASE_ONE={maxHp:100,duelsPerGauge:3,enemyHp:[[70,70],[75,75],[85,85]],clearHealRatio:.1,rewardCoins:30,rewardHeal:20,startingRelic:'cracked-heart',relicLimit:6,
 relicPool:['cracked-heart','recovery-lantern','wind-sigil','warrior-crest','life-sigil','sun-sigil','crimson-fang','cloud-blessing'],
 enemyStartingItems:[] as readonly string[],
 shop:[{id:'emergency-herb',price:30},{id:'ember-bomb',price:45}],
 synergy:{id:'sheltered-light',name:'지켜낸 등불',requires:['cracked-heart','recovery-lantern'],clearHeal:2},
} as const;
export type RpgStageReward='relic'|'coins'|'heal';
export type RpgPhaseOneState={version:1,eliminated:number[],chargedBattles:string[],clearedStages:number[],rewardHistory?:{stage:number,choice:RpgStageReward,relicId?:string,replaced?:string,declined?:boolean}[],
 clear?:{stage:number,hpBefore:number,baseHeal:number,relicHeal:number,synergyHeal:number,relicId:string,chosen?:RpgStageReward,replaced?:string,declined?:boolean}};
export function isRpgPhaseOne(game:{hpItemMode?:boolean,rpgTest?:boolean,rpgRun?:{phaseOne?:RpgPhaseOneState}|null}){return !!game.rpgRun?.phaseOne&&!game.hpItemMode&&!game.rpgTest;}
export function rpgAlive(game:Pick<Game,'rpgRun'|'hpItemMode'|'rpgTest'|'players'>,seat:number){return !isRpgPhaseOne(game)||!!game.players[seat]&&game.rpgRun!.hp[seat]>0;}
export function nextRpgSeat(game:Pick<Game,'rpgRun'|'hpItemMode'|'rpgTest'|'players'>,seat:number){for(let step=1;step<=game.players.length;step++){const next=(seat+step)%game.players.length;if(rpgAlive(game,next))return next;}return 0;}
export function rpgSynergies(run:Pick<RpgRun,'relics'|'phaseOne'|'journey'|'equipped'>){return run.phaseOne&&RPG_PHASE_ONE.synergy.requires.every(id=>(run.journey?run.equipped:run.relics).includes(id))?[RPG_PHASE_ONE.synergy]:[];}
export function initRpgPhaseOne(run:RpgRun){
 run.phaseOne={version:1,eliminated:[],chargedBattles:[],clearedStages:[],rewardHistory:[]};run.maxHp=RPG_PHASE_ONE.maxHp;
 run.hp=[RPG_PHASE_ONE.maxHp,...RPG_PHASE_ONE.enemyHp[0]];run.fate=0;
 run.relics=[RPG_PHASE_ONE.startingRelic];run.equipped=[...run.relics];run.discovered=[...new Set([...run.discovered,...run.relics])];
}
/** Stable seat IDs keep portraits, item ownership and animation anchors intact. */
export function reconcileRpgEliminations(game:Game,now=Date.now()){
 if(!isRpgPhaseOne(game)||game.rpgRun!.status!=='playing')return false;
 const run=game.rpgRun!,state=run.phaseOne!;
 run.hp=run.hp.map(hp=>Math.max(0,hp));
 for(let seat=0;seat<game.players.length;seat++)if(run.hp[seat]<=0&&!state.eliminated.includes(seat)){
  state.eliminated.push(seat);game.players[seat].hand=[];
  if(game.publicDraws)game.publicDraws[game.players[seat].id]=[];
  const combat=run.combat;if(combat?.itemBattle)combat.itemBattle.traps=combat.itemBattle.traps.filter(trap=>trap.owner!==seat);
  game.log=[`${game.players[seat].name} · HP 0 · 전투에서 퇴장`,...game.log].slice(0,40);
 }
 const failed=run.hp[0]<=0,cleared=run.hp.slice(1).every(hp=>hp<=0);
 if(failed||cleared){
  game.phase='ended';game.turnDeadline=0;game.winner=cleared&&!failed?0:run.hp.findIndex((hp,seat)=>seat>0&&hp>0);
  if(game.winner<0)game.winner=1;
  run.updatedAt=now;settle(game);return true;
 }
 if(game.lastBy!==null&&!rpgAlive(game,game.lastBy)){
  game.trick=[];game.tablePlay=null;game.lastBy=null;game.rally=0;
  if(run.combat)run.combat.battleTiles=game.players.map(()=>0);
 }
 if(!rpgAlive(game,game.turn))game.turn=nextRpgSeat(game,game.turn);
 return false;
}
/** Called once by normal round settlement, including terminal active/item attacks. */
export function settleRpgPhaseOne(run:RpgRun,result:RpgResult):RpgRun{
 if(run.status!=='playing'||run.roundIds.includes(result.id))return run;
 const base={...run,rounds:run.rounds+1,roundIds:[...run.roundIds,result.id],updatedAt:result.at};
 if(run.hp[0]<=0)return {...base,status:'game-over',relics:[],equipped:[],consumables:[],reward:null};
 if(!run.hp.slice(1).every(hp=>hp<=0))return base;
 const state=structuredClone(run.phaseOne!);if(state.clearedStages.includes(run.stage))return base;
 state.clearedStages.push(run.stage);
 const hpBefore=run.hp[0],baseHeal=Math.min(RPG_PHASE_ONE.maxHp-hpBefore,Math.round(RPG_PHASE_ONE.maxHp*RPG_PHASE_ONE.clearHealRatio));
 const relicHeal=(run.journey?run.equipped:run.relics).includes('recovery-lantern')?Math.min(5,RPG_PHASE_ONE.maxHp-hpBefore-baseHeal):0;
 const synergyHeal=Math.min(rpgSynergies(run).reduce((sum,effect)=>sum+effect.clearHeal,0),RPG_PHASE_ONE.maxHp-hpBefore-baseHeal-relicHeal);
 const relicId=RPG_PHASE_ONE.relicPool.find(id=>!run.relics.includes(id))||'';
 state.clear={stage:run.stage,hpBefore,baseHeal,relicHeal,synergyHeal,relicId};
 const effects=[...(relicHeal?[{relicId:'recovery-lantern',message:`추가 회복 +${relicHeal} HP`}]:[]),...(synergyHeal?[{relicId:'recovery-lantern',message:`${RPG_PHASE_ONE.synergy.name} · 조합 회복 +${synergyHeal} HP`}]:[])];
 return withRelicActivations({...base,phaseOne:state,hp:[hpBefore+baseHeal+relicHeal+synergyHeal,...run.hp.slice(1)],status:'allocation',reward:null},effects,result.at);
}
export function chooseRpgStageReward(run:RpgRun,choice:RpgStageReward,replace?:string,decline=false):RpgRun{
 const state=run.phaseOne,clear=state?.clear;
 if(!state||!clear||run.status!=='allocation'||clear.chosen)throw Error('선택할 스테이지 보상이 없어요.');
 if(!['relic','coins','heal'].includes(choice))throw Error('보상 3종 중 하나를 선택해 주세요.');
 let relics=[...run.relics],coins=run.coins,hp=[...run.hp];
 if(choice==='relic'&&!decline){
  if(!clear.relicId||relics.includes(clear.relicId))throw Error('획득할 수 있는 새 유물이 없어요.');
  if(relics.length>=RPG_PHASE_ONE.relicLimit){if(!replace||!relics.includes(replace))throw Error('교체할 기존 유물을 선택하거나 획득을 포기해 주세요.');relics=relics.filter(id=>id!==replace);}
  else if(replace)throw Error('빈 유물 자리가 있어 교체가 필요하지 않아요.');
  relics.push(clear.relicId);
 }else if(choice==='coins')coins+=RPG_PHASE_ONE.rewardCoins;
 else if(choice==='heal')hp[0]=Math.min(RPG_PHASE_ONE.maxHp,hp[0]+RPG_PHASE_ONE.rewardHeal);
 const nextState={...state,rewardHistory:[...(state.rewardHistory||[]),{stage:run.stage,choice,...(choice==='relic'&&!decline?{relicId:clear.relicId}:{}),...(replace?{replaced:replace}:{}),...(decline?{declined:true}:{})}],clear:{...clear,chosen:choice,...(replace?{replaced:replace}:{}),...(decline?{declined:true}:{})}};
 let equipped=run.journey?run.equipped.filter(id=>relics.includes(id)):[...relics];if(run.journey&&choice==='relic'&&!decline&&equipped.length<3&&!equipped.includes(clear.relicId))equipped.push(clear.relicId);
 return journeyAfterReward({...run,phaseOne:nextState,relics,equipped,coins,hp,discovered:[...new Set([...run.discovered,...relics])],status:run.stage===3?'complete':'ready',updatedAt:Date.now()});
}
export function advanceRpgPhaseOne(run:RpgRun):RpgRun{
 if(!run.phaseOne||run.status!=='ready'||!run.phaseOne.clear?.chosen||run.stage>=3)throw Error('보상 선택을 마친 뒤 다음 스테이지로 진행해 주세요.');
 const stage=run.stage+1;
 return {...run,stage,status:'playing',hp:[run.hp[0],...RPG_PHASE_ONE.enemyHp[stage-1]],phaseOne:{...run.phaseOne,eliminated:[],clear:undefined},reward:null,updatedAt:Date.now()};
}
/** Independent RPG pacing: one cell per three resolved duels; persists across stages. */
export function chargeRpgDuel(game:Game,id:string,maxGauge:readonly number[]){
 const run=game.rpgRun,state=run?.phaseOne,actives=run?.combat?.actives;
 if(!isRpgPhaseOne(game)||!state||!actives||state.chargedBattles.includes(id))return;
 state.chargedBattles.push(id);if(state.chargedBattles.length%RPG_PHASE_ONE.duelsPerGauge!==0)return;actives.gauge=actives.gauge.map((gauge,seat)=>rpgAlive(game,seat)?Math.min(maxGauge[seat],gauge+1):gauge);
}
