import {retireLegacyLoadout} from './retired-loadout.ts';
import {professionCombatView} from './rpg-profession-combat.ts';
import {isBattleItemMode} from './hp-item-battle.ts';
import {hpItemShopPending,hpItemEffectiveHp} from './hp-item-shop.ts';
import {finishHpItemMatch} from './hp-item-mode.ts';
import type {Game,Tile} from './game.ts';
import {sorted,uid,legalOptions,rank,view} from './game.ts';
import type {RpgRun} from './rpg.ts';
import {withRelicActivations} from './rpg-relic-feedback.ts';

export const RPG_ITEMS_PER_ROUND=3;
export type RpgExchangeItem='swapped-fate'|'fates-scales';
export type RpgTacticalItem=RpgExchangeItem|'scout-lens'|'ember-bomb'|'emergency-herb'|'ward-seal'|'whisper-eye'|'spark-dart';
export const RPG_BASIC_ITEMS:readonly RpgTacticalItem[]=['scout-lens','swapped-fate','ward-seal','ember-bomb','emergency-herb'];
export const RPG_SHOP_ITEMS:readonly RpgTacticalItem[]=[...RPG_BASIC_ITEMS,'whisper-eye'];
export const RPG_TACTICAL_ITEMS:readonly RpgTacticalItem[]=[...RPG_SHOP_ITEMS,'fates-scales'];
export const isAttackItem=(id:string):id is 'ember-bomb'|'spark-dart'=>id==='ember-bomb'||id==='spark-dart';
export const exchangeEligible=(tile:Tile)=>tile.n!==1&&tile.n!==2;
export type RpgTacticalState={round:number,used:number,turn?:number,peek?:{round:number,index:number,tile:Tile},peeks?:{round:number,index:number,tile:Tile}[],handPeek?:{round:number,target:number,tile:Tile},sealed?:number[],ember?:{target:number,turn:number}};
export type RpgItemEvent={id:string,actor:number,target:number,itemId:RpgTacticalItem,kind:'heal'|'damage'|'seal'|'scout'|'exchange'|'blocked'|'armed'|'cancel'|'reveal'|'failed',amount?:number,hpBefore?:number,hpAfter?:number,at:number,tiles?:Tile[]};
export type RpgExchangeEvent={source?:'profession',id:string,itemId:RpgExchangeItem,actor?:number,target:number,round:number,outgoing:Tile[],incoming:Tile[],at:number};
export const exchangeMinimum=(id:string)=>id==='fates-scales'?5:4;
export const RPG_ITEM_HINTS:Record<string,{label:string,bonus:string}>={
 'scout-lens':{label:'2층 투시',bonus:'1장 확인'},'swapped-fate':{label:'1장 교환',bonus:'양쪽 4장↑ · 1·2 제외'},'fates-scales':{label:'2장 교환',bonus:'양쪽 5장↑'},
 'whisper-eye':{label:'상대 손패 정찰',bonus:'무작위 1장'},'spark-dart':{label:'가벼운 공격',bonus:'HP −3'},
 'ember-bomb':{label:'HP 공격',bonus:'HP −8'},'emergency-herb':{label:'자신 회복',bonus:'HP +10'},'ward-seal':{label:'비밀 방패',bonus:'공격 1회 방어'},
};
export function rpgItemDescription(id:string,hpItemMode=false){const effect=RPG_ITEM_DESCRIPTIONS[id];return hpItemMode&&isAttackItem(id)?`선택한 상대에게 HP ${id==='spark-dart'?3:8} 피해 · 판 종료 시 HP에 반영`:effect;}
const RPG_ITEM_DESCRIPTIONS:Record<string,string>={'whisper-eye':'선택한 상대 손패 무작위 1장 확인 · 사용한 사람만 공개','spark-dart':'선택한 상대에게 HP 3 피해 · 최소 HP 1','ember-bomb':'선택한 상대에게 즉시 HP 8 피해 · 최소 HP 1','emergency-herb':'전투 중 자신의 HP 10 회복 · 최대 HP 100','ward-seal':'상대에게 숨겨 방패 준비 · 다음 공격·패 교환 아이템 1회 완전 방어'};
export function itemImage(id:string){if(id==='whisper-eye'||id==='spark-dart')return `/rpg-items-v1/consumables/${id}-v2.webp`;if(id==='ward-seal')return '/rpg-items-v1/consumables/ward-seal-v3.webp';return `/rpg-items-v1/consumables/${id}${['ember-bomb','emergency-herb','ward-seal'].includes(id)?'-v2.webp':'.webp'}`;}
function stateFor(run:RpgRun,who:number,round:number):RpgTacticalState{
 const saved=run.tactics?.[who];
 if(saved?.round===round)return saved;
 return {round,used:who===0&&run.tacticalRound===round?(run.tacticalUsed||0):0,turn:who===0&&run.tacticalRound===round?run.tacticalTurn:undefined};
}
export function protectedTileIds(_run:RpgRun,_who:number,_round:number):number[]{return [];}
export function rpgItemsUnlocked(game:{roundActions?:number,players:readonly unknown[],hpItemMode?:boolean,completedBattles?:number,round?:number}){return game.hpItemMode?((game.round||1)>1||(game.completedBattles||0)>0):(game.roundActions||0)>=game.players.length;}
export function rpgItemLimit(game:{hpItemMode?:boolean}){return game.hpItemMode?2:RPG_ITEMS_PER_ROUND;}
export function rpgInventory(run:RpgRun,who:number){return who===0?run.consumables:run.enemyConsumables?.[who]||[];}
export function giveRpgEnemyItems(run:RpgRun,copies=1){run.enemyConsumables=Object.fromEntries([1,2].map(who=>[who,RPG_BASIC_ITEMS.flatMap(id=>Array(copies).fill(id))]));}
/** Expose only the observer's private scouting/protection state. Inventory names/counts are public. */
export function rpgTacticalView(run:RpgRun,me:number,round:number,game?:Game):RpgRun{
 const own=stateFor(run,me,round),exchange=run.lastExchange,actor=exchange?.actor??0;
 const visibleExchange=me!==0||!exchange?undefined:actor===0?exchange:exchange.target===0?{...exchange,actor:0,target:actor,outgoing:exchange.incoming,incoming:exchange.outgoing}:undefined;
 const visibleItem=run.lastItem?.kind==='seal'&&run.lastItem.actor!==me?undefined:run.lastItem;
 const peeks=(own.peeks||[own.peek].filter(Boolean) as NonNullable<RpgTacticalState['peeks']>).filter(peek=>peek.round===round&&(!game||game.stacks[peek.index]?.[1]?.id===peek.tile.id));
 const handPeek=own.handPeek?.round===round&&(!game||game.players[own.handPeek.target]?.hand.some(tile=>tile.id===own.handPeek!.tile.id))?own.handPeek:undefined;
 return {...run,combat:professionCombatView(run.combat,me,game),enemyConsumables:{[me]:rpgInventory(run,me)},consumables:rpgInventory(run,me),itemGuards:{[me]:!!run.itemGuards?.[me]},tactics:{[me]:{...own,peek:peeks.at(-1),peeks,handPeek,sealed:undefined}},protectedCounts:undefined,lastItem:visibleItem?{...visibleItem,target:visibleItem.kind==='scout'&&visibleItem.actor!==me?-1:visibleItem.target,tiles:visibleItem.actor===me?visibleItem.tiles:undefined}:undefined,lastExchange:visibleExchange,tacticalPeek:peeks.at(-1),tacticalPeeks:peeks,tacticalRound:own.round,tacticalUsed:own.used,tacticalTurn:own.turn};
}
export function exchangeTargetAvailable(game:ReturnType<typeof view>,id:string,target:number){
 const minimum=exchangeMinimum(id),count=id==='fates-scales'?2:1,person=game.players[target];
 return !!person&&target!==game.me&&game.players[game.me].count>=minimum&&person.count>=minimum&&person.count>=count;
}
export function rpgItemSlots(game:ReturnType<typeof view>,enabled:boolean){
 const entries=(game.rpgRun?.consumables||[]).map((id,index)=>({id,index,state:rpgItemAvailability(game,id,enabled)}));
 entries.sort((a,b)=>Number(b.state.usable)-Number(a.state.usable)||a.index-b.index);
 return Array.from({length:3},(_,index)=>entries[index]||null);
}
export function rpgItemAvailability(game:ReturnType<typeof view>,id:string,enabled:boolean):{usable:boolean,reason:string}{
 const run=game.rpgRun;
 if(!run||!RPG_TACTICAL_ITEMS.includes(id as RpgTacticalItem))return {usable:false,reason:'준비 구간 전용'};
 if(!enabled||run.status!=='playing'||game.phase!=='playing'||game.turn!==game.me)return {usable:false,reason:game.phase==='playing'&&game.turn===game.me?'패와 연출을 확인한 뒤 사용 가능':'내 차례에 사용 가능'};
 if(hpItemShopPending(game))return {usable:false,reason:'상점 준비를 마쳐 주세요 · 구매는 선택이에요'};
 if(!rpgItemsUnlocked(game))return {usable:false,reason:game.hpItemMode?'첫 판의 첫 싸움이 끝난 뒤 사용 가능 · 다음 판부터 첫 선도 사용 가능':'첫 바퀴가 끝나면 사용 가능'};
 const state=stateFor(run,game.me,game.round);
 if(state.used>=rpgItemLimit(game))return {usable:false,reason:`이번 판 사용 한도 ${rpgItemLimit(game)}개`};
 if(state.turn===game.roundActions)return {usable:false,reason:'이번 차례 사용 완료'};
 if(id==='scout-lens')return game.stacks.some(stack=>stack.upper)?{usable:true,reason:'원하는 2층 패 1장 투시'}:{usable:false,reason:'남은 2층 패 없음'};
 if(id==='emergency-herb')return {usable:hpItemEffectiveHp(game,game.me)<100,reason:hpItemEffectiveHp(game,game.me)<100?'자신의 HP 10 회복':'HP가 이미 가득 찼어요'};
 if(id==='ward-seal')return {usable:!run.itemGuards?.[game.me],reason:run.itemGuards?.[game.me]?'비밀 방패가 이미 준비됐어요':'다음 공격·패 교환 아이템 1회 방어'};
 if(id==='whisper-eye')return {usable:game.players.some((player,index)=>index!==game.me&&player.count>0),reason:'선택한 상대의 손패 무작위 1장 확인 · 나에게만 공개'};
 if(isAttackItem(id)){
  if(!game.players.some((_,i)=>i!==game.me&&hpItemEffectiveHp(game,i)>(game.hpItemMode?0:1)))return {usable:false,reason:'공격할 수 있는 상대가 없어요'};
  return {usable:true,reason:isBattleItemMode(game)?`즉시 HP ${id==='spark-dart'?3:8} 피해 · HP 0이면 종료`:game.hpItemMode?`HP ${id==='spark-dart'?3:8} 피해 · 판 종료 시 정산`:`선택한 상대에게 즉시 HP ${id==='spark-dart'?3:8} 피해 · 최소 HP 1`};
 }
 const minimum=exchangeMinimum(id);
 if(game.players[game.me].count<minimum)return {usable:false,reason:`내 손패 ${minimum}장 이상 필요`};
 if(!game.players.some((_,index)=>exchangeTargetAvailable(game,id,index)))return {usable:false,reason:`상대 손패 ${minimum}장 이상 · 교환 가능한 패 필요`};
 return {usable:true,reason:`양쪽 손패 ${minimum}장 이상 · 사용 가능`};
}
function randomIndex(length:number){const value=new Uint32Array(1);crypto.getRandomValues(value);return value[0]%length;}
function takeRandom(hand:Tile[],count:number){const pool=[...hand],picked:Tile[]=[];for(let i=0;i<count;i++)picked.push(pool.splice(randomIndex(pool.length),1)[0]);return picked;}
function record(g:Game,who:number,id:RpgTacticalItem,target:number,kind:RpgItemEvent['kind'],amount?:number){g.rpgRun!.lastItem={id:uid(),actor:who,target,itemId:id,kind,amount,at:Date.now()};if((kind==='damage'||kind==='heal')&&(!g.hpItemMode||isBattleItemMode(g))){const after=g.rpgRun!.hp[target];g.rpgRun!.lastItem.hpAfter=after;g.rpgRun!.lastItem.hpBefore=after+(kind==='damage'?1:-1)*(amount||0);}if(g.hpItemMatch)g.hpItemMatch.roundItems.push({actor:who,target,id,kind,amount});}
export function useRpgTacticalItem(g:Game,id:RpgTacticalItem,target=-1,ids:number[]=[],who=0){
 const run=g.rpgRun;
 if(!g.practice||!run||run.status!=='playing'||g.phase!=='playing'||g.turn!==who||!g.players[who])throw Error('RPG 전술 아이템은 진행 중인 내 차례에만 사용할 수 있어요.');
 const inventory=rpgInventory(run,who);
 if(!RPG_TACTICAL_ITEMS.includes(id)||!inventory.includes(id))throw Error('보유한 전술 아이템을 확인해 주세요.');
 const position=view(g,g.players[who].token),available=rpgItemAvailability(position,id,true),old=stateFor(run,who,g.round);
 if(!available.usable)throw Error(available.reason);
 const state:RpgTacticalState={...old};let blocked=false;
 if(id==='scout-lens'){
  if(!Number.isInteger(target)||!g.stacks[target]?.[1])throw Error('확인할 2층 패를 선택해 주세요.');
  state.peek={round:g.round,index:target,tile:{...g.stacks[target][1]!}};state.peeks=[...(old.peeks||(old.peek?[old.peek]:[])).filter(peek=>peek.index!==target),state.peek];
 }else if(id==='whisper-eye'){
  if(!Number.isInteger(target)||target===who||!g.players[target]?.hand.length)throw Error('확인할 상대를 선택해 주세요.');
  state.handPeek={round:g.round,target,tile:{...takeRandom(g.players[target].hand,1)[0]}};record(g,who,id,target,'reveal');
 }else if(id==='ward-seal'){
  run.itemGuards={...run.itemGuards,[who]:true};target=who;
 }else if(id==='emergency-herb'){
  const amount=Math.min(10,100-hpItemEffectiveHp(g,who));if(g.hpItemMode&&!isBattleItemMode(g)&&g.hpItemMatch){g.hpItemMatch.pendingItemDelta??=g.players.map(()=>0);g.hpItemMatch.pendingItemDelta[who]+=amount;}else run.hp[who]+=amount;record(g,who,id,who,'heal',amount);
 }else if(isAttackItem(id)){
  if(!Number.isInteger(target)||!g.players[target]||target===who||hpItemEffectiveHp(g,target)<=(g.hpItemMode?0:1))throw Error('공격할 수 있는 상대를 선택해 주세요.');
  applyRpgEmberDamage(g,who,target,Date.now(),id);
 }else{
  const count=id==='fates-scales'?2:1;
  if(!exchangeTargetAvailable(position,id,target))throw Error(`양쪽 손패 ${exchangeMinimum(id)}장 이상과 교환 가능한 패가 필요해요.`);
  const mine=g.players[who],other=g.players[target],protectedIds=protectedTileIds(run,target,g.round),pool=other.hand.filter(tile=>exchangeEligible(tile)&&!protectedIds.includes(tile.id)),ownPool=mine.hand.filter(exchangeEligible);
  if(ids.length&&(ids.length!==count||new Set(ids).size!==count||ids.some(tileId=>!mine.hand.some(tile=>tile.id===tileId&&exchangeEligible(tile)))))throw Error(`교환할 내 손패 ${count}장을 선택해 주세요.`);
  const attempted=ids.length?ids.map(tileId=>({...mine.hand.find(tile=>tile.id===tileId)!})):ownPool.length>=count?takeRandom(ownPool,count):[];
  blocked=blockHostileItem(g,who,target,id);if(blocked&&run.lastItem)run.lastItem.tiles=attempted;
  if(!blocked&&(pool.length<count||attempted.length<count)){record(g,who,id,target,'failed');blocked=true;}
  if(!blocked){
  const out=attempted,incoming=takeRandom(pool,count);
  mine.hand=sorted([...mine.hand.filter(tile=>!out.some(t=>t.id===tile.id)),...incoming]);
  other.hand=sorted([...other.hand.filter(tile=>!incoming.some(t=>t.id===tile.id)),...out]);
  run.lastExchange={id:uid(),itemId:id,actor:who,target,round:g.round,outgoing:out.map(tile=>({...tile})),incoming:incoming.map(tile=>({...tile})),at:Date.now()};
  if(g.publicDraws){g.publicDraws[mine.id]=(g.publicDraws[mine.id]||[]).filter(tile=>!out.some(t=>t.id===tile.id));g.publicDraws[other.id]=(g.publicDraws[other.id]||[]).filter(tile=>!incoming.some(t=>t.id===tile.id));}
  }
  // Floor scouting stays active until its actual tile is taken.

 }
 inventory.splice(inventory.indexOf(id),1);state.used++;state.turn=position.roundActions;
 run.tactics={...run.tactics,[who]:state};
 if(who===0){run.tacticalRound=g.round;run.tacticalUsed=state.used;run.tacticalTurn=state.turn;run.tacticalPeek=state.peek;}
 if(!blocked&&id!=='emergency-herb'&&!isAttackItem(id)&&id!=='whisper-eye')record(g,who,id,target,id==='ward-seal'?'seal':id==='scout-lens'?'scout':'exchange');
 run.updatedAt=Date.now();if(isBattleItemMode(g))finishHpItemMatch(g);if(id!=='ward-seal'&&!blocked)g.log=[`${g.players[who].name} · ${RPG_ITEM_HINTS[id].label}${id==='emergency-herb'?' HP +10':''}`,...g.log].slice(0,40);
}
/** Reimburse the former preparation state when loading an older local save. */
export function refundLegacyEmbers(g:Game){
 const run=g.rpgRun;if(!run)return;retireLegacyLoadout(g);
 for(const [key,state] of Object.entries(run.tactics||{})){
  const who=Number(key);if(state.sealed?.length){run.itemGuards={...run.itemGuards,[who]:true};delete state.sealed;}
  if(!state.ember)continue;delete state.ember;state.used=Math.max(0,state.used-1);state.turn=undefined;
  if(who===0){run.consumables.push('ember-bomb');run.tacticalUsed=state.used;run.tacticalTurn=undefined;}
  else{run.enemyConsumables={...run.enemyConsumables,[who]:[...(run.enemyConsumables?.[who]||[]),'ember-bomb']};}
 }
}
function applyRpgEmberDamage(g:Game,who:number,target:number,now:number,id:RpgTacticalItem='ember-bomb'){
 if(blockHostileItem(g,who,target,id))return;
 const run=g.rpgRun!;let damage=Math.min(id==='spark-dart'?3:8,Math.max(0,hpItemEffectiveHp(g,target)-(g.hpItemMode?0:1)));
 if(target===0&&damage>0){
  if(run.equipped.includes('cracked-heart')&&!run.crackedHeartUsed.includes(run.stage)){
   const blocked=Math.min(8,damage);damage-=blocked;
   Object.assign(run,withRelicActivations({...run,crackedHeartUsed:[...run.crackedHeartUsed,run.stage]},[{relicId:'cracked-heart',message:`피해 ${blocked} 방어`}],now));
  }
  const blocked=Math.min(run.shield||0,damage);damage-=blocked;run.shield-=blocked;
 }
 if(g.hpItemMode&&!isBattleItemMode(g)&&g.hpItemMatch){g.hpItemMatch.pendingItemDelta??=g.players.map(()=>0);g.hpItemMatch.pendingItemDelta[target]-=damage;}else run.hp[target]=Math.max(isBattleItemMode(g)?0:1,run.hp[target]-damage);record(g,who,id,target,'damage',damage);
 if(g.hpItemVariant===2&&!isBattleItemMode(g)&&g.hpItemMatch){g.hpItemMatch.pendingItemPoints??=g.players.map(()=>0);g.hpItemMatch.pendingItemPoints[who]+=damage;g.hpItemMatch.roundEarned[who]+=damage;}if(!g.hpItemMode)finishHpItemMatch(g);
}
export function resetRpgTactics(run:RpgRun){run.tactics={};run.tacticalPeeks=undefined;run.tacticalPeek=undefined;run.tacticalRound=undefined;run.tacticalUsed=0;run.tacticalTurn=undefined;run.protectedCounts=undefined;}
export function scoutRpgBotDraw(g:Game,who:number,index:number){
 const state=g.rpgRun&&stateFor(g.rpgRun,who,g.round),peek=state?.peek;
 return peek?.round===g.round&&g.stacks[peek.index]?.[1]?.id===peek.tile.id&&view(g,g.players[who].token).stacks[peek.index]?.available?peek.index:index;
}
export type RpgBotItemChoice={id:RpgTacticalItem,target?:number,ids?:number[]};
/** Decisions accept only the same redacted view as an ordinary player. */
export function chooseRpgBotItem(position:ReturnType<typeof view>):RpgBotItemChoice|null{
 const run=position.rpgRun,who=position.me;if(!run||who===0)return null;
 const own=position.players[who],hand=own.hand||[],moves=legalOptions(hand,position.trick);
 const can=(id:RpgTacticalItem)=>run.consumables.includes(id)&&rpgItemAvailability(position,id,true).usable;
 const opponents=position.players.map((_,i)=>i).filter(i=>i!==who),target=opponents.filter(i=>hpItemEffectiveHp(position,i)>(position.hpItemMode?0:1)).sort((a,b)=>run.hp[b]-run.hp[a])[0];
 if(can('emergency-herb')&&hpItemEffectiveHp(position,who)<=90)return {id:'emergency-herb'};
 if(can('ward-seal')&&opponents.length)return {id:'ward-seal'};
 if(can('ember-bomb')&&target!==undefined)return {id:'ember-bomb',target};
 if(can('spark-dart')&&target!==undefined)return {id:'spark-dart',target};
 if(can('whisper-eye')&&opponents.some(index=>position.players[index].count))return {id:'whisper-eye',target:opponents.find(index=>position.players[index].count>0)};
 if(!moves.length){
  for(const id of ['swapped-fate','fates-scales'] as const){const other=opponents.find(i=>exchangeTargetAvailable(position,id,i)),count=id==='fates-scales'?2:1,ids=hand.filter(exchangeEligible).sort((a,b)=>rank(a)-rank(b)).slice(0,count).map(tile=>tile.id);if(can(id)&&other!==undefined)return {id,target:other,ids:ids.length===count?ids:[]};}
  const index=position.stacks.findIndex(stack=>stack.upper&&stack.available);if(can('scout-lens')&&index>=0)return {id:'scout-lens',target:index};
 }
 return null;
}
export function tryRpgBotItem(g:Game){
 const run=g.rpgRun,who=g.turn;if(!run||!g.players[who]?.bot||hpItemShopPending(g))return;
 if(!run.enemyConsumables?.[who]){run.enemyConsumables={...run.enemyConsumables,[who]:[...RPG_BASIC_ITEMS]};}
 const choice=chooseRpgBotItem(view(g,g.players[who].token));if(choice)useRpgTacticalItem(g,choice.id,choice.target??-1,choice.ids||[],who);
}

export function rpgItemNoticeText(event:RpgItemEvent,players:readonly {name:string}[]){
 const actor=players[event.actor]?.name||'참가자',target=players[event.target]?.name||'상대';
 const names:Record<RpgTacticalItem,string>={'scout-lens':'정찰 렌즈','swapped-fate':'뒤바뀐 운명','fates-scales':'운명의 저울','ember-bomb':'작열탄','emergency-herb':'응급 약초','ward-seal':'수호의 봉인','spark-dart':'바늘탄','whisper-eye':'엿보는 눈'};
 const route=event.kind==='scout'?`${actor} → 바닥 2층 패`:event.kind==='seal'?`${actor} → 자신`:event.actor===event.target?`${actor} → 자신`:`${actor} → ${target}`;
 const detail=event.kind==='failed'?'교환할 수 없습니다 · 1·2를 제외한 패가 없어요':event.kind==='reveal'?'상대 손패 무작위 1장 확인':event.kind==='blocked'?'수호의 봉인으로 완전 방어':event.kind==='exchange'?`손패 ${event.itemId==='fates-scales'?2:1}장 교환`:event.kind==='damage'?(event.amount?`HP −${event.amount}`:'피해 방어'):event.kind==='heal'?`HP +${event.amount}`:event.kind==='seal'?'비밀 방패 준비':'2층 패 1장 확인';
 return {title:event.kind==='blocked'?`${names[event.itemId]} 차단`:`${names[event.itemId]} 사용`,route,detail};
}

export function blockHostileItem(g:Game,actor:number,target:number,itemId:RpgTacticalItem,source:'item'|'profession'='item'){
 const run=g.rpgRun!;if(!run.itemGuards?.[target])return false;
 run.itemGuards[target]=false;if(source==='item')record(g,actor,itemId,target,'blocked',0);
 g.log=[`${g.players[target].name} · 수호의 봉인으로 ${source==='profession'?'직업 패 교환':'아이템'} 방어`,...g.log].slice(0,40);return true;
}
