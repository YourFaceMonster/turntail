import {storyCardsForRun} from './rpg-story-cards';
import type {Game,Tile,RoundResult} from './game';
import type {RpgRun} from './rpg';
import {DICE_RELIC,DICE_RELIC_HEAL} from './rpg-dice-den';
import {withRelicActivations} from './rpg-relic-feedback';
import {rpgRelicSlots,trialEnemyHp,trialStartHp} from './rpg-trials';
/** Quest-only relics never appear in stage reward offers. */
const QUEST_RELICS=['watchkeepers-blue-glass',DICE_RELIC.id];

/** Owned-only relics: they work from the bag and never take one of the three equip slots. */
export const PASSIVE_RELICS:readonly string[]=['mor-quill','twin-needle-compass','split-mirror'];
export const isPassiveRelic=(id:string)=>PASSIVE_RELICS.includes(id);
/** RPG only. Shared item-match catalogues and the global HP limit remain intact.
 * effect = one line "when → what"; detail = the plain-language explanation shown when the relic is tapped. */
export const RPG_REWORK_RELICS=[
 ['gamblers-gloves','승부사의 장갑','5장 족보로 이기면 바닥 패를 1장 더 몰래 봐요','족보 싸움에서 이기면 바닥의 뒤집힌 위층 패를 몰래 볼 수 있어요(정찰). 5장 족보로 이기면 1장을 더 봐요. 나에게만 보여요.'],
 ['cracked-heart','금이 간 심장','최대 HP +20 · 챕터에서 처음 장착하면 HP도 +20','장착하는 동안 최대 HP가 20 늘어나요. 현재 HP +20은 챕터마다 처음 장착할 때 한 번만 받아요.'],
 ['second-heart','두 번째 심장','최대 HP +10 · 챕터에서 처음 장착하면 HP도 +10','장착하는 동안 최대 HP가 10 늘어나요. 현재 HP +10은 챕터마다 처음 장착할 때 한 번만 받아요.'],
 ['recovery-lantern','회복의 등불','스테이지를 클리어하면 HP +5','AI 한 명의 HP를 0으로 만들어 스테이지를 클리어하면 바로 HP 5를 회복해요. 최대 HP를 넘으면 회복하지 않아요.'],
 ['watchkeepers-blue-glass','파수꾼의 푸른 유리','판이 시작될 때마다 바닥 패 1장을 몰래 봐요','매 판 시작 시 바닥의 뒤집힌 위층 패 1장을 자동으로 확인해요. 나에게만 보여요.'],
 ['stopped-hourglass','멈춘 모래시계','판에서 이기면 다음 판에 바닥 패를 2장 더 봐요','판에서 1등을 하면 다음 판 시작에 바닥 패 3장을 몰래 봐요(선견지명). 이 유물이 있으면 5장을 봐요.'],
 ['final-knot','마지막 매듭','판이 끝났을 때 HP 10 이하면 HP +5 · 스테이지당 1번','판 정산 후 HP가 1~10이면 HP 5를 회복해요. 한 스테이지에서 한 번만 발동해요.'],
 ['second-ring','두 번째 반지','셋이 겨룬 판에서 2등이면 HP +3','세 명 모두 HP가 남은 판에서 2등으로 마치면 정산 후 HP 3을 회복해요.'],
 ['mor-quill','모르의 깃펜','주점의 피오에게서 유물 소문을 하나 더 들어요','장착하지 않고 갖고만 있어도 적용돼요. 주점에서 피오와 이야기하면 소문 수첩에 유물 정보가 추가돼요.'],
 ['twin-needle-compass','쌍침 나침반','다음 유물 보상 후보를 미리 봐요','장착하지 않고 갖고만 있어도 적용돼요. 여행 가방과 스테이지 정산 화면에서 다음 클리어 보상 후보를 보여 줘요.'],
 ['split-mirror','갈라진 거울','유물 보상 후보가 1개 더 나와요','장착하지 않고 갖고만 있어도 적용돼요. 스테이지 클리어 보상 후보가 2개에서 3개로(보스는 3개에서 4개로) 늘어요.'],
 [DICE_RELIC.id,DICE_RELIC.name,'판이 시작될 때 HP가 50 이하면 HP +2','매 판 시작 시 HP가 50 이하이면 HP 2를 회복해요. 위기일수록 조금씩 버티게 도와줘요.'],
].map(([id,name,effect,detail])=>({id,name,effect,detail,grade:'common',passive:isPassiveRelic(id)}));
export function reworkRelic(id:string){return RPG_REWORK_RELICS.find(relic=>relic.id===id);}
/** Two-line rail summary (when / what) for the narrow equipped-relic rail; the full effect stays in the tap tooltip. */
export const RPG_REWORK_RELIC_SHORT:Record<string,{label:string,bonus:string}>={
 'gamblers-gloves':{label:'5장 승리',bonus:'바닥 +1장'},
 'cracked-heart':{label:'최대 HP',bonus:'+20'},
 'second-heart':{label:'최대 HP',bonus:'+10'},
 'recovery-lantern':{label:'클리어',bonus:'HP +5'},
 'watchkeepers-blue-glass':{label:'판 시작',bonus:'바닥 1장'},
 'stopped-hourglass':{label:'판 승리',bonus:'바닥 +2장'},
 'final-knot':{label:'HP 10↓',bonus:'HP +5'},
 'second-ring':{label:'2등',bonus:'HP +3'},
 'mor-quill':{label:'소지',bonus:'소문 +1'},
 'twin-needle-compass':{label:'소지',bonus:'미리 보기'},
 'split-mirror':{label:'소지',bonus:'후보 +1'},
 [DICE_RELIC.id]:{label:'HP 50↓',bonus:'HP +2'},
};
/** Chapter of a stage (1~3, 4~6, 7~9, 10): normal-stage relics last until the chapter ends. */
export function reworkChapterRange(stage:number):[number,number]{return stage>=10?[10,10]:[Math.floor((stage-1)/3)*3+1,Math.floor((stage-1)/3)*3+3];}
/** Compass preview: the offers the next clear would show (read-only clone). */
export function previewRewardOffers(run:RpgRun){return reworkRewardOffers(structuredClone(run),Math.min(10,run.status==='ready'?run.stage+1:run.stage));}
const recordRelic=(run:RpgRun,relicId:string,message:string)=>{run.relicActivations=withRelicActivations(run,[{relicId,message}]).relicActivations;};
export const RPG_STAGE_HP=[[25,30],[35,40],[50,55],[40,45],[50,55],[60,65],[50,55],[60,65],[70,75],[85,90]];
export type FloorIntel={round:number,index:number,tile:Tile};
export type RpgRework={version:2,chapter:number,activated:string[],knotStages:number[],nextForesight?:number,
 intel:Record<number,FloorIntel[]>,resolvedTricks:string[],rewardOffers:Record<number,string[]>,
 lastScout?:{seat:number,count:number,bonus:number,round:number},settledSeats?:number[],overflow?:{dealt:number[],taken:number[]},inherited?:string,
 /** Player relic heals applied in the last settlement, for the result screen line. */
 relicHeals?:{relicId:string,amount:number}[]};
export function isRpgRework(game:{hpItemMode?:boolean,rpgTest?:boolean,rpgRun?:{rework?:RpgRework}|null}){return !!game.rpgRun?.rework&&!game.hpItemMode&&!game.rpgTest;}
export function rpgMaxHp(run:RpgRun,seat=0){return seat===0?100+(run.equipped.includes('cracked-heart')?20:0)+(run.equipped.includes('second-heart')?10:0):100;}
export function activateRpgRelics(run:RpgRun):RpgRun{
 const state=run.rework;if(!state)return run;
 // Owned-only relics never sit in an equip slot (older saves may still have them equipped).
 const equipped=run.equipped.filter(id=>!isPassiveRelic(id));
 let hp=run.hp[0];const activated=[...state.activated],procs:string[]=[];
 for(const [id,amount] of [['cracked-heart',20],['second-heart',10]] as const)if(equipped.includes(id)&&!activated.includes(id)){if(hp>0){hp+=amount;procs.push(id);}activated.push(id);}
 const next={...run,equipped},maxHp=rpgMaxHp(next),healed=Math.min(maxHp,Math.max(0,hp));
 const result={...next,maxHp,hp:[healed,...run.hp.slice(1)],rework:{...state,activated}};
 return procs.length?withRelicActivations(result,procs.map(id=>({relicId:id,message:`최대 HP ${maxHp} · HP +${id==='cracked-heart'?20:10}`}))):result;
}
/** Called for new journeys, or at the next safe deal after a legacy round. */
export function enableRpgRework(run:RpgRun,fresh=false){
 if(run.rework)return;
 run.phaseOne??={version:1,eliminated:[],chargedBattles:[],clearedStages:[]};
 if(run.status==='ready'&&!run.phaseOne.clear)run.phaseOne.clear={stage:run.stage,hpBefore:run.hp[0],baseHeal:0,relicHeal:0,synergyHeal:0,relicId:'',chosen:'relic'};
 const allowed=new Set(RPG_REWORK_RELICS.map(r=>r.id));
 run.relics=fresh?['gamblers-gloves']:run.relics.filter(id=>allowed.has(id));
 if(!run.relics.length)run.relics=['gamblers-gloves'];
 run.equipped=fresh?run.relics.slice(0,rpgRelicSlots(run)):run.equipped.filter(id=>run.relics.includes(id)).slice(0,rpgRelicSlots(run));
 run.rework={version:2,chapter:Math.min(4,Math.ceil(run.stage/3)),activated:[],knotStages:[],intel:{},resolvedTricks:[],rewardOffers:{}};
 run.combat=undefined;run.coins=0;run.points=0;run.fate=0;run.consumables=[];run.shops=[];run.enemyConsumables={};run.tactics={};
 run.itemGuards={};run.lastItem=undefined;run.lastExchange=undefined;run.relicActivations=[];run.pendingSoup=false;run.pendingBandage=false;run.shield=0;
 run.maxHp=100;run.hp=fresh?[trialStartHp(run),...trialEnemyHp(run,RPG_STAGE_HP[0])]:run.hp.map(hp=>Math.min(100,Math.max(0,hp)));
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
/** HP gained past the cap returns as damage to the seats that paid it, split by what each paid (largest remainder). */
export function rpgOverflowSettlement(hp:number[],max:number[],delta:number[],counts:number[],transfers:RoundResult['transfers'],seats:number[]){
 const after=[...hp],dealt=hp.map(()=>0),taken=hp.map(()=>0);
 // Payers always hold more tiles than the payee, so fewest-tiles-first sees every overflow hit before it settles itself.
 for(const seat of [...seats].sort((a,b)=>counts[a]-counts[b]||a-b)){
  const raw=hp[seat]+delta[seat]-taken[seat],overflow=Math.max(0,raw-max[seat]);
  after[seat]=Math.min(max[seat],Math.max(0,raw));
  const payers=transfers.filter(t=>t.to===seat&&t.points>0&&seats.includes(t.from)),total=payers.reduce((sum,t)=>sum+t.points,0);
  if(!overflow||!total)continue;
  const shares=payers.map(t=>({seat:t.from,points:t.points,share:Math.floor(overflow*t.points/total),rest:overflow*t.points%total}));
  let left=overflow-shares.reduce((sum,s)=>sum+s.share,0);
  for(const s of [...shares].sort((a,b)=>b.rest-a.rest||b.points-a.points||a.seat-b.seat)){if(!left)break;s.share++;left--;}
  for(const s of shares){taken[s.seat]+=s.share;dealt[seat]+=s.share;}
 }
 return {hp:after,dealt,taken};
}
/**
 * "If the round ended now": per-seat HP change from public hand counts only (no hidden tiles),
 * using the same pairwise settlement and overflow rule as the real round end. Relic heals are not included.
 */
export function rpgSettlementPreview(run:Pick<RpgRun,'hp'|'equipped'>,counts:readonly number[]){
 const seats=counts.flatMap((_,i)=>run.hp[i]>0?[i]:[]),list=[...counts],{delta,transfers}=rpgHandSettlement(list,seats);
 const result=rpgOverflowSettlement(run.hp,run.hp.map((_,i)=>rpgMaxHp(run as RpgRun,i)),delta,list,transfers,seats);
 return run.hp.map((hp,i)=>seats.includes(i)?result.hp[i]-hp:0);
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
 // Scouting only sees through face-down 2층 (upper) tiles; covered 1층 tiles stay hidden and exposed ones are already public.
 const pool=game.stacks.flatMap((stack,index)=>stack[1]&&!known.has(stack[1].id)?[{round:game.round,index,tile:{...stack[1]}}]:[]);
 let revealed=0;while(pool.length&&revealed<count){const random=new Uint32Array(1);crypto.getRandomValues(random);own.push(pool.splice(random[0]%pool.length,1)[0]);revealed++;}
 state.lastScout={seat,count:revealed,bonus:Math.min(bonus,revealed),round:game.round};return revealed;
}
export function beginReworkRound(game:Game){
 if(!isRpgRework(game))return;const run=game.rpgRun!,state=run.rework!;
 state.intel={};state.resolvedTricks=[];state.lastScout=undefined;state.settledSeats=undefined;state.overflow=undefined;state.relicHeals=undefined;
 if(run.equipped.includes(DICE_RELIC.id)&&run.hp[0]>0&&run.hp[0]<=DICE_RELIC_HEAL.threshold){
  const before=run.hp[0];run.hp=[Math.min(rpgMaxHp(run),before+DICE_RELIC_HEAL.amount),...run.hp.slice(1)];
  if(run.hp[0]>before)recordRelic(run,DICE_RELIC.id,`HP +${run.hp[0]-before}`);
 }
 run.roundHealth={round:game.round,before:[...run.hp],damage:run.hp.map(()=>0),healing:run.hp.map(()=>0),moneyDamage:run.hp.map(()=>0),coinsBefore:0};
 if(state.nextForesight!==undefined&&run.hp[state.nextForesight]>0){
  const mine=state.nextForesight===0,hourglass=mine&&run.equipped.includes('stopped-hourglass');
  const revealed=scoutRpgFloor(game,state.nextForesight,3+(hourglass?2:0),hourglass?2:0);
  if(hourglass&&revealed>3)recordRelic(run,'stopped-hourglass',`바닥 패 ${revealed-3}장 더 확인`);
 }
 state.nextForesight=undefined;
 if(run.equipped.includes('watchkeepers-blue-glass')&&scoutRpgFloor(game,0,1))recordRelic(run,'watchkeepers-blue-glass','바닥 패 1장 확인');
}
export function resolveRpgScout(game:Game){
 if(!isRpgRework(game)||game.lastBy===null)return;const state=game.rpgRun!.rework!,id=game.tablePlay?.id;
 if(!id||state.resolvedTricks.includes(id))return;state.resolvedTricks.push(id);
 const bonus=game.lastBy===0&&game.trick.length===5&&game.rpgRun!.equipped.includes('gamblers-gloves')?1:0;
 const count=scoutCount(game.trick);if(!count)return;
 const revealed=scoutRpgFloor(game,game.lastBy,count+bonus,bonus);
 if(bonus&&revealed>count)recordRelic(game.rpgRun!,'gamblers-gloves','바닥 패 1장 더 확인');
}
export function reworkRewardOffers(run:RpgRun,stage=run.stage){
 const state=run.rework!;if(state.rewardOffers[stage])return state.rewardOffers[stage];
 const boss=[3,6,9].includes(stage),count=(boss?3:2)+(run.relics.includes('split-mirror')?1:0);
 const pool=RPG_REWORK_RELICS.filter(r=>!QUEST_RELICS.includes(r.id)&&(boss||!run.relics.includes(r.id))).map(r=>r.id);
 let seed=2166136261;for(const char of `${run.id}:${stage}`)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
 const picked:string[]=[];while(pool.length&&picked.length<count){picked.push(pool.splice(seed%pool.length,1)[0]);seed=Math.imul(seed^picked.length,16777619)>>>0;}
 return state.rewardOffers[stage]=stage===10?[]:picked;
}
export function settleReworkRound(run:RpgRun,result:RpgResultLike):RpgRun{
 if(run.status!=='playing'||run.roundIds.includes(result.id))return run;
 const next=structuredClone(run),state=next.rework!,seats=result.players.flatMap((p,i)=>p.place>0?[i]:[]);state.settledSeats=seats;
 const counts=result.players.map(p=>p.count),transfers=result.transfers??rpgHandSettlement(counts,seats).transfers;
 const overflow=rpgOverflowSettlement(next.hp,next.hp.map((_,i)=>rpgMaxHp(next,i)),result.players.map(p=>p.delta),counts,transfers,seats);
 next.hp=overflow.hp;state.overflow=overflow.dealt.some(Boolean)?{dealt:overflow.dealt,taken:overflow.taken}:undefined;
 const heals:{relicId:string,amount:number}[]=[];
 const heal=(relicId:string,amount:number,label:string)=>{
  if(next.hp[0]<=0)return;const before=next.hp[0];next.hp[0]=Math.min(rpgMaxHp(next),before+amount);
  const gained=next.hp[0]-before;if(gained>0){heals.push({relicId,amount:gained});recordRelic(next,relicId,`${label} HP +${gained}`);}
 };
 if(seats.length===3&&result.players[0].place===2&&next.equipped.includes('second-ring'))heal('second-ring',3,'2등 ·');
 if(next.hp[0]>0&&next.hp[0]<=10&&next.equipped.includes('final-knot')&&!state.knotStages.includes(next.stage)){heal('final-knot',5,'위기 회복 ·');state.knotStages.push(next.stage);}
 next.rounds++;next.roundIds.push(result.id);next.updatedAt=result.at;state.intel={};state.lastScout=undefined;
 // ST7 optional observation: finishing a round in second place unlocks one extra line.
 if(next.stage===7&&next.journey&&result.players[0]?.place===2)next.journey={...next.journey,story:{runNumber:next.journey.story?.runNumber||1,quests:next.journey.story?.quests||{},secondPlaceSeen:true}};
 // Any seat at 0 HP ends the stage: the player at 0 fails first, otherwise one fallen AI clears it (no 1v1 continuation).
 const failed=next.hp[0]===0,cleared=next.hp.slice(1).some(hp=>hp===0);
 next.phaseOne!.eliminated=next.hp.flatMap((hp,i)=>hp===0?[i]:[]);
 if(failed){next.status='game-over';next.reward=null;state.nextForesight=undefined;}
 else if(cleared){
  const phase=next.phaseOne!;if(!phase.clearedStages.includes(next.stage)){
   phase.clearedStages.push(next.stage);const hpBefore=next.hp[0];if(next.equipped.includes('recovery-lantern'))heal('recovery-lantern',5,'클리어 회복 ·');
   const offers=reworkRewardOffers(next);
   if(offers.length&&next.relics.includes('split-mirror'))recordRelic(next,'split-mirror','보상 후보 +1');phase.clear={stage:next.stage,hpBefore,baseHeal:0,relicHeal:next.hp[0]-hpBefore,synergyHeal:0,relicId:offers[0]||'',relicOffers:offers};
  }next.status=next.stage===10?'complete':'allocation';next.storyCards=storyCardsForRun(next);state.nextForesight=undefined;
 }else state.nextForesight=result.players.findIndex(p=>p.winner);
 state.relicHeals=heals.length?heals:undefined;
 const before=run.roundHealth?.before||run.hp;next.roundHealth={round:result.round,before:[...before],damage:next.hp.map((hp,i)=>Math.max(0,before[i]-hp)),healing:next.hp.map((hp,i)=>Math.max(0,hp-before[i])),moneyDamage:next.hp.map(()=>0),coinsBefore:0};
 return next;
}
type RpgResultLike=Pick<RoundResult,'id'|'round'|'at'|'players'>&{transfers?:RoundResult['transfers']};
export function chooseReworkReward(run:RpgRun,id?:string,decline=false){
 const next=structuredClone(run),clear=next.phaseOne?.clear;
 if(next.status!=='allocation'||!clear||clear.chosen)throw Error('선택할 유물 보상이 없어요.');
 const offers=clear.relicOffers||[];if(!decline&&offers.length&&(!id||!offers.includes(id)))throw Error('제시된 유물 중 하나를 선택해 주세요.');
 if(id&&!decline){clear.relicId=id;if([3,6,9].includes(next.stage))next.rework!.inherited=id;
  else{next.relics=[...new Set([...next.relics,id])];if(!isPassiveRelic(id)&&next.equipped.length<3&&!next.equipped.includes(id))next.equipped.push(id);}
  next.discovered=[...new Set([...next.discovered,id])];}
 clear.chosen='relic';clear.declined=decline;next.phaseOne!.rewardHistory=[...(next.phaseOne!.rewardHistory||[]),{stage:next.stage,choice:'relic',...(id&&!decline?{relicId:id}:{}),declined:decline}];
 // The journey now continues through ST10 (story bible v1.4); ST3 is no longer a demo ending.
 next.status=next.stage===10?'complete':'ready';
 return activateRpgRelics(next);
}
export function advanceReworkStage(run:RpgRun){
 if(run.status!=='ready'||!run.phaseOne?.clear?.chosen||run.stage>=10)throw Error('유물 보상을 먼저 확인해 주세요.');
 const next=structuredClone(run),stage=next.stage+1,state=next.rework!;
 if([4,7,10].includes(stage)){
  next.relics=state.inherited?[state.inherited]:[];next.equipped=next.relics.slice(0,rpgRelicSlots(next));next.hp[0]=trialStartHp(next);state.chapter++;state.activated=[];state.knotStages=[];state.inherited=undefined;
 }
 next.stage=stage;next.hp=[next.hp[0],...trialEnemyHp(next,RPG_STAGE_HP[stage-1])];next.status='playing';next.phaseOne!.eliminated=[];next.phaseOne!.clear=undefined;next.reward=null;state.nextForesight=undefined;
 return activateRpgRelics(next);
}
