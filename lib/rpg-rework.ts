import {storyCardsForRun} from './rpg-story-cards';
import type {Game,Tile,RoundResult} from './game';
import type {RpgRun} from './rpg';

/** RPG only. Shared item-match catalogues and the global HP limit remain intact. */
export const RPG_REWORK_RELICS=[
 ['gamblers-gloves','승부사의 장갑','5장 족보 승리 시 정찰 +1장'],
 ['cracked-heart','금이 간 심장','최대 HP +20 · 챕터 첫 장착 시 현재 HP +20'],
 ['second-heart','두 번째 심장','최대 HP +10 · 챕터 첫 장착 시 현재 HP +10'],
 ['recovery-lantern','회복의 등불','스테이지 클리어 시 HP +5'],
 ['watchkeepers-blue-glass','파수꾼의 푸른 유리','매 판 시작 시 바닥패 1장 자동 확인'],
 ['stopped-hourglass','멈춘 모래시계','다음 판 선견지명 정찰 +2장'],
 ['final-knot','마지막 매듭','판 종료 후 HP 1~10이면 +5 · 스테이지당 1회'],
 ['second-ring','두 번째 반지','3인전 최종 2등이면 HP +3'],
 ['mor-quill','모르의 깃펜','주점에서 추가 소문 확인'],
 ['twin-needle-compass','쌍침 나침반','다음 유물 선택 보상 미리 보기'],
 ['split-mirror','갈라진 거울','유물 보상 후보 +1개'],
].map(([id,name,effect])=>({id,name,effect,grade:'common'}));
export function reworkRelic(id:string){return RPG_REWORK_RELICS.find(relic=>relic.id===id);}
export const RPG_STAGE_HP=[[25,30],[35,40],[50,55],[40,45],[50,55],[60,65],[50,55],[60,65],[70,75],[85,90]];
export type FloorIntel={round:number,index:number,tile:Tile};
export type RpgRework={version:2,chapter:number,activated:string[],knotStages:number[],nextForesight?:number,
 intel:Record<number,FloorIntel[]>,resolvedTricks:string[],rewardOffers:Record<number,string[]>,
 lastScout?:{seat:number,count:number,bonus:number,round:number},settledSeats?:number[],inherited?:string};
export function isRpgRework(game:{hpItemMode?:boolean,rpgTest?:boolean,rpgRun?:{rework?:RpgRework}|null}){return !!game.rpgRun?.rework&&!game.hpItemMode&&!game.rpgTest;}
export function rpgMaxHp(run:RpgRun,seat=0){return seat===0?100+(run.equipped.includes('cracked-heart')?20:0)+(run.equipped.includes('second-heart')?10:0):100;}
export function activateRpgRelics(run:RpgRun):RpgRun{
 const state=run.rework;if(!state)return run;
 let hp=run.hp[0];const activated=[...state.activated];
 for(const [id,amount] of [['cracked-heart',20],['second-heart',10]] as const)if(run.equipped.includes(id)&&!activated.includes(id)){if(hp>0)hp+=amount;activated.push(id);}
 const maxHp=rpgMaxHp(run);return {...run,maxHp,hp:[Math.min(maxHp,Math.max(0,hp)),...run.hp.slice(1)],rework:{...state,activated}};
}
/** Called for new journeys, or at the next safe deal after a legacy round. */
export function enableRpgRework(run:RpgRun,fresh=false){
 if(run.rework)return;
 run.phaseOne??={version:1,eliminated:[],chargedBattles:[],clearedStages:[]};
 if(run.status==='ready'&&!run.phaseOne.clear)run.phaseOne.clear={stage:run.stage,hpBefore:run.hp[0],baseHeal:0,relicHeal:0,synergyHeal:0,relicId:'',chosen:'relic'};
 const allowed=new Set(RPG_REWORK_RELICS.map(r=>r.id));
 run.relics=fresh?['gamblers-gloves']:run.relics.filter(id=>allowed.has(id));
 if(!run.relics.length)run.relics=['gamblers-gloves'];
 run.equipped=fresh?[...run.relics]:run.equipped.filter(id=>run.relics.includes(id)).slice(0,3);
 run.rework={version:2,chapter:Math.min(4,Math.ceil(run.stage/3)),activated:[],knotStages:[],intel:{},resolvedTricks:[],rewardOffers:{}};
 run.combat=undefined;run.coins=0;run.points=0;run.fate=0;run.consumables=[];run.shops=[];run.enemyConsumables={};run.tactics={};
 run.itemGuards={};run.lastItem=undefined;run.lastExchange=undefined;run.relicActivations=[];run.pendingSoup=false;run.pendingBandage=false;run.shield=0;
 run.maxHp=100;run.hp=fresh?[100,...RPG_STAGE_HP[0]]:run.hp.map(hp=>Math.min(100,Math.max(0,hp)));
 run.discovered=fresh?[...run.relics]:[...new Set([...run.discovered,...run.relics])];
 if(run.journey)run.journey.retryStage=undefined;
 Object.assign(run,activateRpgRelics(run));
}
export function activeRpgSeats(game:Game){return game.players.flatMap((_,seat)=>game.rpgRun!.hp[seat]>0?[seat]:[]);}
/** Separate tie policy: tied runners-up pay only the winner, never each other. */
export function rpgHandSettlement(counts:number[],seats:number[]){
 const delta=counts.map(()=>0),transfers:RoundResult['transfers']=[];
 for(let i=0;i<seats.length;i++)for(let j=i+1;j<seats.length;j++){
  const a=seats[i],b=seats[j];if(counts[a]===counts[b])continue;
  const from=counts[a]>counts[b]?a:b,to=from===a?b:a,points=counts[from];delta[from]-=points;delta[to]+=points;transfers.push({from,to,points});
 }return {delta,transfers};
}
/** Only called with a legal submitted hand; avoids importing the shared engine at runtime. */
export function scoutCount(tiles:Tile[]){
 if(tiles.length!==5)return tiles.length===3?2:tiles.length===2?1:0;
 const nums=[...new Set(tiles.map(tile=>tile.n))].sort((a,b)=>a-b),straight=nums.length===5&&nums.every((n,i)=>!i||n===nums[i-1]+1);
 if(straight&&tiles.every(tile=>tile.s===tiles[0].s))return 5;
 if(nums.some(n=>tiles.filter(tile=>tile.n===n).length===4))return 4;return 3;
}
export function pruneRpgIntel(game:Game){const state=game.rpgRun?.rework;if(!state)return;const ids=new Set(game.stacks.flat().filter(Boolean).map(tile=>tile!.id));for(const seat of Object.keys(state.intel))state.intel[Number(seat)]=state.intel[Number(seat)].filter(intel=>intel.round===game.round&&ids.has(intel.tile.id));}
export function scoutRpgFloor(game:Game,seat:number,count:number,bonus=0){
 const state=game.rpgRun!.rework!;pruneRpgIntel(game);const own=state.intel[seat]??=[];
 const known=new Set(own.map(intel=>intel.tile.id));
 // Covered lower tiles and upper tiles are hidden; exposed lower tiles are already public.
 const pool=game.stacks.flatMap((stack,index)=>stack[1]?stack.flatMap(tile=>tile&&!known.has(tile.id)?[{round:game.round,index,tile:{...tile}}]:[]):[]);
 let revealed=0;while(pool.length&&revealed<count){const random=new Uint32Array(1);crypto.getRandomValues(random);own.push(pool.splice(random[0]%pool.length,1)[0]);revealed++;}
 state.lastScout={seat,count:revealed,bonus:Math.min(bonus,revealed),round:game.round};return revealed;
}
export function beginReworkRound(game:Game){
 if(!isRpgRework(game))return;const run=game.rpgRun!,state=run.rework!;
 state.intel={};state.resolvedTricks=[];state.lastScout=undefined;state.settledSeats=undefined;
 run.roundHealth={round:game.round,before:[...run.hp],damage:run.hp.map(()=>0),healing:run.hp.map(()=>0),moneyDamage:run.hp.map(()=>0),coinsBefore:0};
 if(state.nextForesight!==undefined&&run.hp[state.nextForesight]>0)scoutRpgFloor(game,state.nextForesight,3+(state.nextForesight===0&&run.equipped.includes('stopped-hourglass')?2:0));
 state.nextForesight=undefined;
 if(run.equipped.includes('watchkeepers-blue-glass'))scoutRpgFloor(game,0,1);
}
export function resolveRpgScout(game:Game){
 if(!isRpgRework(game)||game.lastBy===null)return;const state=game.rpgRun!.rework!,id=game.tablePlay?.id;
 if(!id||state.resolvedTricks.includes(id))return;state.resolvedTricks.push(id);
 const bonus=game.lastBy===0&&game.trick.length===5&&game.rpgRun!.equipped.includes('gamblers-gloves')?1:0;
 const count=scoutCount(game.trick);if(count)scoutRpgFloor(game,game.lastBy,count+bonus,bonus);
}
export function reworkRewardOffers(run:RpgRun,stage=run.stage){
 const state=run.rework!;if(state.rewardOffers[stage])return state.rewardOffers[stage];
 const boss=[3,6,9].includes(stage),count=(boss?3:2)+(run.equipped.includes('split-mirror')?1:0);
 const pool=RPG_REWORK_RELICS.filter(r=>r.id!=='watchkeepers-blue-glass'&&(boss||!run.relics.includes(r.id))).map(r=>r.id);
 let seed=2166136261;for(const char of `${run.id}:${stage}`)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
 const picked:string[]=[];while(pool.length&&picked.length<count){picked.push(pool.splice(seed%pool.length,1)[0]);seed=Math.imul(seed^picked.length,16777619)>>>0;}
 return state.rewardOffers[stage]=stage===10?[]:picked;
}
export function settleReworkRound(run:RpgRun,result:RpgResultLike):RpgRun{
 if(run.status!=='playing'||run.roundIds.includes(result.id))return run;
 const next=structuredClone(run),state=next.rework!,seats=result.players.flatMap((p,i)=>p.place>0?[i]:[]);state.settledSeats=seats;
 next.hp=next.hp.map((hp,i)=>seats.includes(i)?Math.min(rpgMaxHp(next,i),Math.max(0,hp+result.players[i].delta)):hp);
 const heal=(amount:number)=>{if(next.hp[0]>0)next.hp[0]=Math.min(rpgMaxHp(next),next.hp[0]+amount);};
 if(seats.length===3&&result.players[0].place===2&&next.equipped.includes('second-ring'))heal(3);
 if(next.hp[0]>0&&next.hp[0]<=10&&next.equipped.includes('final-knot')&&!state.knotStages.includes(next.stage)){heal(5);state.knotStages.push(next.stage);}
 next.rounds++;next.roundIds.push(result.id);next.updatedAt=result.at;state.intel={};state.lastScout=undefined;
 const failed=next.hp[0]===0,cleared=next.hp.slice(1).every(hp=>hp===0);
 next.phaseOne!.eliminated=next.hp.flatMap((hp,i)=>hp===0?[i]:[]);
 if(failed){next.status='game-over';next.reward=null;state.nextForesight=undefined;}
 else if(cleared){
  const phase=next.phaseOne!;if(!phase.clearedStages.includes(next.stage)){
   phase.clearedStages.push(next.stage);const hpBefore=next.hp[0];if(next.equipped.includes('recovery-lantern'))heal(5);
   const offers=reworkRewardOffers(next);phase.clear={stage:next.stage,hpBefore,baseHeal:0,relicHeal:next.hp[0]-hpBefore,synergyHeal:0,relicId:offers[0]||'',relicOffers:offers};
  }next.status=next.stage===10?'complete':'allocation';next.storyCards=storyCardsForRun(next);state.nextForesight=undefined;
 }else state.nextForesight=result.players.findIndex(p=>p.winner);
 const before=run.roundHealth?.before||run.hp;next.roundHealth={round:result.round,before:[...before],damage:next.hp.map((hp,i)=>Math.max(0,before[i]-hp)),healing:next.hp.map((hp,i)=>Math.max(0,hp-before[i])),moneyDamage:next.hp.map(()=>0),coinsBefore:0};
 return next;
}
type RpgResultLike=Pick<RoundResult,'id'|'round'|'at'|'players'>;
export function chooseReworkReward(run:RpgRun,id?:string,decline=false){
 const next=structuredClone(run),clear=next.phaseOne?.clear;
 if(next.status!=='allocation'||!clear||clear.chosen)throw Error('선택할 유물 보상이 없어요.');
 const offers=clear.relicOffers||[];if(!decline&&offers.length&&(!id||!offers.includes(id)))throw Error('제시된 유물 중 하나를 선택해 주세요.');
 if(id&&!decline){clear.relicId=id;if([3,6,9].includes(next.stage))next.rework!.inherited=id;
  else{next.relics=[...new Set([...next.relics,id])];if(next.equipped.length<3&&!next.equipped.includes(id))next.equipped.push(id);}
  next.discovered=[...new Set([...next.discovered,id])];}
 clear.chosen='relic';clear.declined=decline;next.phaseOne!.rewardHistory=[...(next.phaseOne!.rewardHistory||[]),{stage:next.stage,choice:'relic',...(id&&!decline?{relicId:id}:{}),declined:decline}];
 next.status=(next.stage===3&&!!next.journey)||next.stage===10?'complete':'ready';
 return activateRpgRelics(next);
}
export function advanceReworkStage(run:RpgRun){
 if(run.status!=='ready'||!run.phaseOne?.clear?.chosen||run.stage>=10)throw Error('유물 보상을 먼저 확인해 주세요.');
 const next=structuredClone(run),stage=next.stage+1,state=next.rework!;
 if([4,7,10].includes(stage)){
  next.relics=state.inherited?[state.inherited]:[];next.equipped=[...next.relics];next.hp[0]=100;state.chapter++;state.activated=[];state.knotStages=[];state.inherited=undefined;
 }
 next.stage=stage;next.hp=[next.hp[0],...RPG_STAGE_HP[stage-1]];next.status='playing';next.phaseOne!.eliminated=[];next.phaseOne!.clear=undefined;next.reward=null;state.nextForesight=undefined;
 return activateRpgRelics(next);
}
