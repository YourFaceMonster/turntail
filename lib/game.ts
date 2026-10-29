import {publicCoinEvents,nextCoinPresentationAt} from './coin-presentation';
import {recordProfessionBattlePlay,resetProfessionCombat,resolveProfessionRpgBattle} from './rpg-profession-combat.ts';
import {isBattleItemMode,recordHpBattlePlay,resolveHpItemBattle,settleHpBattleMoney} from './hp-item-battle.ts';
import {applyPendingHpItems,beginHpItemRound,finishHpItemRoundReport,hpItemShopPending,type HpItemMatchState} from './hp-item-shop.ts';
import {finishHpItemMatch} from './hp-item-mode.ts';
import {newItemRun,itemView,scoutBotDraw,type ItemRun} from './items';
import {chooseKoreanOpponents} from './korean-opponents';
import {shouldShowPlayNotice,QUICK_PLAY_MS,ANNOUNCED_PLAY_MS,announcedPlayDuration} from './play-notices.ts';
import {accessibleStack} from './table-access.ts';
import {chooseStrategicAction} from './bot.ts';
import {chooseItemBattleAction} from './item-battle-ai.ts';
import {runItemBattleBotTurn} from './item-battle-bot.ts';
import {isHiboringji,hiboringjiAction,hiboringjiTemperament} from './hiboringji';
import {newChallenge,advanceChallenge,type Challenge} from './challenge.ts';
import type {TablePlay} from './table-play';
import {settleStageRun,type StageRun} from './stage-challenge.ts';
import {RPG_TEST_ROUNDS,settleRpgRound,type RpgRun} from './rpg.ts';
import {withRelicActivations} from './rpg-relic-feedback.ts';
import {rpgTacticalView,resetRpgTactics,tryRpgBotItem,scoutRpgBotDraw} from './rpg-items.ts';
import {itemTurnReadyAt} from './rpg-item-motion.ts';
import {twinIndex} from './rpg-twins.ts';
import {applyPioneerDeal,itemBattleState,triggerFloorTrap,triggerScoutedPickup} from './item-battle-rules.ts';
import {prepareFloorCoins,hasFloorCoins,claimFloorCoin,revealFloorCoin,floorCoinsView,publicFloorCoinAmount,type FloorCoinState} from './floor-coins.ts';
import {tryBotProfessionActive} from './profession-actives.ts';
import {COIN_TURN_READY_MS,TRAP_IMPACT_MS,TRAP_PRESENTATION_MS} from './pickup-presentation.ts';
export type Tile = {id:number,n:number,s:number};
export type Player = {id:string,token:string,name:string,hand:Tile[],wins:number,bot?:boolean,points?:number,losses?:number,games?:number,profile?:string,avatar?:string,timeouts?:number,replaced?:boolean};
export type RoundResult = {id:string,at:number,round:number,players:{id:string,name:string,count:number,place:number,delta:number,total:number,winner:boolean}[],transfers:{from:number,to:number,points:number}[],voided?:boolean,voidReason?:string,challenge?:Challenge|null,stageRun?:StageRun|null};
export type GameEvent = {id:string,type:string,who:number,index?:number,tiles?:Tile[],label?:string,at?:number,rally?:number,concealed?:boolean,showNotice?:boolean,reviewMs?:number};
export type ChatMessage={id:string,who:number,name:string,text:string,at:number};
export type Game = {floorCoins?:FloorCoinState,code:string,phase:"lobby"|"playing"|"ended",players:Player[],stacks:(Tile|null)[][],turn:number,lastBy:number|null,trick:Tile[],tablePlay?:TablePlay|null,log:string[],winner:number|null,round:number,practice:boolean,capacity?:number,cols?:number,rows?:number,result?:RoundResult|null,lastEvent?:GameEvent,chat?:ChatMessage[],opening?:{who:number,tile:Tile},turnReadyAt?:number,rally?:number,playedTiles?:Tile[],publicDraws?:Record<string,Tile[]>,turnDeadline?:number,turnStartedAt?:number,aiAssisted?:boolean,matchMode?:"unlimited"|"target",targetScore?:number,matchWinner?:number|null,matchNo?:number,matchRoundOffset?:number,turnRuleVersion?:number,roundActions?:number,challenge?:Challenge|null,stageRun?:StageRun|null,rpgRun?:RpgRun|null,rpgTest?:boolean,hpItemMode?:boolean,hpItemVariant?:1|2,hpItemRules?:2|3|4,hpItemMatch?:HpItemMatchState,completedBattles?:number,revealedHands?:string[],announcedCombos?:number[],itemRun?:ItemRun};
export function uid(){if(typeof crypto.randomUUID==="function")return crypto.randomUUID();const a=new Uint8Array(16);crypto.getRandomValues(a);a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;const h=Array.from(a,n=>n.toString(16).padStart(2,"0")).join("");return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
export const suits = ["구름","별","달","해"];
export const symbols = ["☁","✦","☾","☀"];
export function suitRank(s:number){return [0,2,1,3][s];}
export function rank(t:Tile){return t.n===2?16:t.n===1?15:t.n-1;}
export function sorted(ts:Tile[]){return [...ts].sort((a,b)=>rank(a)-rank(b)||suitRank(a.s)-suitRank(b.s));}
function cmp(a:number[],b:number[]){for(let i=0;i<Math.max(a.length,b.length);i++){let d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;}
export function combo(ts:Tile[]):{label:string,key:number[]}|null {
 if(![1,2,3,5].includes(ts.length)||new Set(ts.map(t=>t.id)).size!==ts.length)return null;
 const ss=sorted(ts),max=ss[ss.length-1];
 if(ts.length===1)return {label:"싱글",key:[0,rank(max),suitRank(max.s)]};
 const groups=new Map<number,Tile[]>();for(const t of ts)groups.set(t.n,[...(groups.get(t.n)||[]),t]);
 if(ts.length<5)return groups.size===1?{label:ts.length===2?"페어":"트리플",key:[0,rank(max),suitRank(max.s)]}:null;
 const nums=[...groups.keys()].sort((a,b)=>a-b),flush=ts.every(t=>t.s===ts[0].s);
 let straight=nums.length===5&&nums.every((n,i)=>i===0||n===nums[i-1]+1);
 if(nums.join(",")==="1,12,13,14,15")straight=true;
 const straightKey=[nums.join(",")==="1,2,3,4,5"?17:rank(max),suitRank(max.s)];
 if(straight&&flush)return {label:"스트레이트 플러시",key:[5,...straightKey]};
 const four=[...groups.values()].find(g=>g.length===4),three=[...groups.values()].find(g=>g.length===3);
 if(four)return {label:"포카드",key:[4,rank(four[0])]};
 if(three&&groups.size===2)return {label:"풀하우스",key:[3,rank(three[0])]};
 if(flush)return {label:"플러시",key:[2,...[...ss].reverse().map(rank),suitRank(max.s)]};
 if(straight)return {label:"스트레이트",key:[1,...straightKey]};
 return null;
}
export function beats(ts:Tile[],old:Tile[]){const a=combo(ts),b=combo(old);return !!a&&(!old.length||(ts.length===old.length&&!!b&&cmp(a.key,b.key)>0));}
export function capacity(g:Game){return g.capacity||3;}
export function dimensions(g:Game){const cols=g.cols||(capacity(g)===2?6:capacity(g)===4?(g.stacks.length===12?4:3):g.stacks.length===15?5:4);return {cols,rows:g.rows||Math.ceil(g.stacks.length/cols)};}
export function accessible(g:Game,i:number){
 const {cols,rows}=dimensions(g);return accessibleStack(g.stacks,cols,rows,i);
}
export function player(name:string,bot=false):Player{return {id:uid(),token:uid(),name:name.trim().slice(0,12)||"플레이어",hand:[],wins:0,losses:0,games:0,points:0,bot};}
export function matchRules(mode:unknown="unlimited",target:unknown=100){
 if(mode!=="unlimited"&&mode!=="target")throw Error("목표 점수 또는 무제한 모드를 선택해 주세요.");
 const score=Number(target);if(mode==="target"&&(!Number.isInteger(score)||score<1||score>10000))throw Error("목표 점수는 1~10,000 사이 정수로 정해 주세요.");
 return {matchMode:mode,targetScore:mode==="target"?score:0} as const;
}
export function room(code:string,p:Player,practice=false,size=3,rules:{matchMode?:unknown,targetScore?:unknown,challenge?:boolean,itemMode?:boolean}={}):Game{
 if(rules.itemMode&&(!practice||!rules.challenge))throw Error('아이템전은 싱글 10판 도전에서만 시작할 수 있어요.');
 if(![2,3,4].includes(size))throw Error("2·3·4인 중 선택해 주세요.");
 return {code,phase:"lobby",players:[p],stacks:[],turn:0,lastBy:null,trick:[],log:[],winner:null,round:0,practice,capacity:size,result:null,...matchRules(rules.matchMode,rules.targetScore),matchWinner:null,matchNo:1,challenge:rules.challenge?{...newChallenge(uid(),size),...(rules.itemMode?{itemMode:true}:{})}:null,...(rules.itemMode&&rules.challenge&&practice?{itemRun:newItemRun(size)}:{})};
}
export function lowestHandLead(players:Player[]){
 const candidates=players.flatMap((p,who)=>p.hand.map(tile=>({who,tile})));
 if(!candidates.length)throw Error("선 결정에 필요한 손패가 없어요.");
 return candidates.reduce((best,t)=>rank(t.tile)*4+suitRank(t.tile.s)<rank(best.tile)*4+suitRank(best.tile.s)?t:best);
}
export const REVIEW_MS=1000;
export const DEAL_REVIEW_MS=3000;
export const LEAD_REVIEW_MS=1200; // Show the new lead after the last draw has landed.
export const PLAY_REVIEW_MS=ANNOUNCED_PLAY_MS; // Flight + one second to read the play.
export const DRAW_TRAVEL_MS=1200; // 140ms to centre + 800ms review + 180ms collect, with a small guard.
export const TURN_MS=30000,FINAL_TURN_MS=60000;
export const automated=(p:Player)=>!!(p.bot||p.replaced);
export function hostSeat(g:Game){const at=g.players.findIndex(p=>!automated(p));return at<0?0:at;}
export function scheduleTurn(g:Game,now=Date.now()){
 g.turnRuleVersion=2;g.turnStartedAt=Math.max(now,g.turnReadyAt||0);
 g.turnDeadline=g.practice||g.phase!=="playing"||automated(g.players[g.turn])?0:g.turnStartedAt+((g.players[g.turn].timeouts||0)>=2?FINAL_TURN_MS:TURN_MS);
}
/** One authoritative transition per request; compare-and-swap persistence prevents double actions. */
export function advanceRoom(g:Game,now=Date.now()){
 if(g.phase!=="playing"||g.practice)return false;
 const p=g.players[g.turn];
 if(!automated(p)&&g.turnRuleVersion!==2){scheduleTurn(g,now);return true;}
 if(automated(p)){if(now<Math.max(g.turnReadyAt||0,g.turnStartedAt||0)+450)return false;if(p.replaced)g.aiAssisted=true;botMove(g,now);return true;}
 if(!g.turnDeadline){scheduleTurn(g,now);return true;} // Safely start clocks for rooms created by older versions.
 if(now<g.turnDeadline)return false;
 g.aiAssisted=true;p.timeouts=(p.timeouts||0)+1;if(p.timeouts>=3)p.replaced=true;
 const who=g.turn,decision=chooseBotAction(view(g,p.token));
 if(decision.type==="play")act(g,who,"play",decision.tiles.map(t=>t.id),-1,now,true);
 else if(decision.type==="draw")act(g,who,"draw",[],decision.index,now,true);
 else act(g,who,"pass",[],-1,now,true);
 note(g,p.replaced?`${p.name} · 3회 연속 시간 초과, AI가 자리를 이어받았습니다.`:`${p.name} · 시간 초과 ${p.timeouts}/3, 이번 차례는 AI가 진행했습니다.`);
 return true;
}
export function assertTurnReady(g:Game,now=Date.now()){if(now<(g.turnReadyAt||0))throw Error("낸 패를 확인하는 중이에요. 잠시 뒤 다음 차례가 시작돼요.");}
export function isRedTwoSingle(ts:Tile[]){return ts.length===1&&ts[0].n===2&&ts[0].s===3;}
export function startingHandSize(size:number){return size===3?10:size===4?9:12;}
export function start(g:Game,now=Date.now()){
 if(isBattleItemMode(g)&&hpItemShopPending(g))throw Error("판 결과의 상점에서 구매하거나 구매 없이 다음 판을 시작해 주세요.");
 if(g.stageRun&&g.stageRun.status!=="playing")throw Error("판 결과에서 다음 스테이지를 선택해 주세요.");
 if(g.rpgRun&&g.rpgRun.status!=="playing")throw Error("RPG 여정의 보상을 먼저 선택해 주세요.");
 if(g.challenge?.complete)throw Error("10판 도전이 끝났어요. 새 도전을 시작해 주세요.");
 if(g.matchWinner!==null&&g.matchWinner!==undefined)throw Error("목표 점수에 도달해 매치가 끝났어요. 새 매치를 시작해 주세요.");
 if(g.players.length!==capacity(g))throw Error(`${capacity(g)}명이 모이면 시작할 수 있어요.`);
 const deck:Tile[]=[];for(let n=1;n<=15;n++)for(let s=0;s<4;s++)deck.push({id:(n-1)*4+s,n,s});
 for(let i=deck.length-1;i>0;i--){let x=new Uint32Array(1);crypto.getRandomValues(x);const j=x[0]%(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
 for(const p of g.players){p.hand=sorted(deck.splice(0,startingHandSize(capacity(g))));p.timeouts=0;}
 const stacks=deck.length/2;g.stacks=Array.from({length:stacks},()=>[deck.shift()!,deck.shift()!]);
 g.cols=capacity(g)===2?6:capacity(g)===4?4:5;g.rows=Math.ceil(stacks/g.cols);
 g.opening=lowestHandLead(g.players);g.turn=g.opening.who;
 g.turnReadyAt=now+DEAL_REVIEW_MS;g.aiAssisted=!g.practice&&g.players.some(p=>p.replaced);g.rally=0;g.roundActions=0;g.completedBattles=0;g.playedTiles=[];g.publicDraws={};g.phase="playing";g.trick=[];g.tablePlay=null;g.lastBy=null;g.winner=null;g.result=null;g.round++;g.log=[`라운드 ${g.round} · 첫 선 ${g.players[g.turn].name} (${suits[g.opening.tile.s]} ${g.opening.tile.n})`];
 g.announcedCombos=[];g.revealedHands=[];g.lastEvent={id:uid(),type:"deal",who:g.turn,at:now};scheduleTurn(g,now);
 if(g.rpgRun)resetRpgTactics(g.rpgRun);beginHpItemRound(g);resetProfessionCombat(g);applyPioneerDeal(g,now);prepareFloorCoins(g);
}
export function restartMatch(g:Game,now=Date.now()){
 if(g.phase!=="ended"||g.matchWinner===null||g.matchWinner===undefined)throw Error("목표 점수 매치가 끝난 뒤 새 매치를 시작할 수 있어요.");
 for(const p of g.players){p.points=0;p.wins=0;p.losses=0;p.games=0;}
 g.matchWinner=null;g.matchNo=(g.matchNo||1)+1;g.matchRoundOffset=g.round;start(g,now);
}
function note(g:Game,s:string){g.log=[s,...g.log].slice(0,40);}
export function settle(g:Game):RoundResult{
 if(isBattleItemMode(g)&&g.hpItemMatch?.moneySkipped)throw Error("HP 0으로 대전이 끝나 이번 판의 돈은 정산하지 않아요.");
 if(g.result)return g.result;
 if(g.phase!=="ended"||g.winner===null)throw Error("라운드가 끝난 뒤 정산합니다.");
 const voided=!g.practice&&!!g.aiAssisted;
 const counts=g.players.map(p=>p.hand.length),delta=counts.map(()=>0),transfers:RoundResult["transfers"]=[];
 for(let i=0;i<counts.length;i++)for(let j=i+1;j<counts.length;j++){
  const diff=voided?0:counts[j]-counts[i];delta[i]+=diff;delta[j]-=diff;
  if(diff)transfers.push({from:diff>0?j:i,to:diff>0?i:j,points:Math.abs(diff)});
 }
 const players=g.players.map((p,i)=>{if(!g.rpgRun)p.points=(p.points||0)+delta[i];if(!voided){p.games=(p.games||0)+1;if(i===g.winner)p.wins++;else p.losses=(p.losses||0)+1;}
 return {id:p.id,name:p.name,count:counts[i],place:1+counts.filter(c=>c<counts[i]).length,delta:delta[i],total:p.points||0,winner:i===g.winner};});
 if(!voided&&g.matchMode==="target"){
  const reached=g.players.map((p,i)=>({i,points:p.points||0,count:p.hand.length})).filter(p=>p.points>=(g.targetScore||100)).sort((a,b)=>b.points-a.points||a.count-b.count||a.i-b.i);
  g.matchWinner=reached[0]?.i??null;
 }
 g.result={id:`${g.code}:${g.round}`,at:Date.now(),round:g.round,players,transfers,voided,voidReason:voided?"AI가 대신 진행한 참가자가 있어 전적과 점수를 반영하지 않아요.":undefined};if(g.stageRun){g.stageRun=settleStageRun(g.stageRun,g.result);g.result.stageRun=structuredClone(g.stageRun);}if(g.rpgRun){if(isBattleItemMode(g)){settleHpBattleMoney(g);}else{applyPendingHpItems(g);const beforeHp=[...g.rpgRun.hp];g.rpgRun=settleRpgRound(g.rpgRun,g.result,g.winner,!!g.rpgTest,!!g.hpItemMode);if(g.hpItemMode){finishHpItemRoundReport(g,beforeHp);finishHpItemMatch(g);}if(g.rpgTest&&g.rpgRun.rounds>=RPG_TEST_ROUNDS)g.rpgRun={...g.rpgRun,status:'complete',reward:null};}}if(g.challenge){g.challenge=advanceChallenge(g.challenge,g.result);g.result.challenge=structuredClone(g.challenge);}return g.result;
}
export function act(g:Game,who:number,action:string,ids:number[]=[],index=-1,now=Date.now(),automatic=false){
 if(hpItemShopPending(g))throw Error("이번 판의 상점 준비를 마쳐 주세요. 구매 없이 시작할 수도 있어요.");
 if(g.stageRun&&g.stageRun.status!=="playing")throw Error("이번 도전의 판 결과를 먼저 확인해 주세요.");
 if(g.rpgRun&&g.rpgRun.status!=="playing")throw Error("RPG 여정의 판 결과를 먼저 확인해 주세요.");
 if(g.phase!=="playing"||g.turn!==who)throw Error("지금은 내 차례가 아니에요.");const p=g.players[who];
 if(p.replaced&&!automatic)throw Error("시간 초과로 AI가 대신 진행 중이에요. 새 방에서 다시 참여해 주세요.");
 if(action==="play"){
  if(!ids.length||new Set(ids).size!==ids.length)throw Error("낼 타일을 선택해 주세요.");
  const ts=ids.map(id=>p.hand.find(t=>t.id===id));if(ts.some(t=>!t))throw Error("손패를 다시 확인해 주세요.");
  const tiles=ts as Tile[];if(!beats(tiles,g.trick))throw Error("같은 개수의 더 높은 조합을 내야 해요.");
  if(g.rpgRun&&!isBattleItemMode(g)&&who===0&&tiles.length===5&&g.rpgRun.equipped.includes('gamblers-gloves')){
   const roundId=`${g.code}:${g.round}`;
   if(!(g.rpgRun.gloveRoundIds||[]).includes(roundId))g.rpgRun=withRelicActivations({...g.rpgRun,points:g.rpgRun.points+2,gloveRoundIds:[...(g.rpgRun.gloveRoundIds||[]),roundId]},[{relicId:'gamblers-gloves',message:'포인트 +2'}],now);
  }
  g.roundActions=(g.roundActions??(g.playedTiles?.length||0))+1;
  recordHpBattlePlay(g,who,tiles.length);recordProfessionBattlePlay(g,who,tiles.length);
  p.hand=p.hand.filter(t=>!ids.includes(t.id));const protection=g.rpgRun?.tactics?.[who];if(protection?.sealed)protection.sealed=protection.sealed.filter(id=>!ids.includes(id));g.playedTiles=[...(g.playedTiles||[]),...tiles];if(g.publicDraws?.[p.id])g.publicDraws[p.id]=g.publicDraws[p.id].filter(t=>!ids.includes(t.id));g.trick=tiles;g.lastBy=who;
  const introductions=new Set(g.announcedCombos??[1,2,3].filter(n=>g.log.some(line=>line.includes(`· ${['싱글','페어','트리플'][n-1]} ${n}개 제출`))));
  const showNotice=shouldShowPlayNotice(introductions,tiles.length),reviewMs=showNotice?announcedPlayDuration(tiles.length):QUICK_PLAY_MS;g.announcedCombos=[...introductions];
  g.rally=(g.rally||0)+1;g.turnReadyAt=now+reviewMs;
  g.lastEvent={id:uid(),type:"play",who,tiles,label:combo(tiles)!.label,at:now,rally:g.rally,showNotice,reviewMs};
  g.tablePlay={tiles:tiles.map(t=>({...t})),who,id:g.lastEvent.id};
  note(g,`${p.name} · ${combo(tiles)!.label} ${tiles.length}개 제출`);
  if(!p.hand.length){resolveHpItemBattle(g,now+reviewMs,true);resolveProfessionRpgBattle(g,now+reviewMs,true);if(g.rpgRun&&g.rpgRun.status!=='playing')return;g.phase="ended";g.turnDeadline=0;g.winner=who;if(!automatic)p.timeouts=0;settle(g);note(g,g.result?.voided?`${p.name} 손패 소진 · AI 대체로 무효 경기입니다.`:`${p.name} 승리! 손패를 모두 냈습니다.`);return;}
 }else if(action==="draw"){
  if(!g.trick.length)throw Error("선을 잡은 차례에는 패를 반드시 내야 해요.");
  if(!Number.isInteger(index)||!accessible(g,index))throw Error("밝게 표시된 외곽 타일만 가져올 수 있어요.");
  g.roundActions=(g.roundActions??(g.playedTiles?.length||0))+1;const z=g.stacks[index][1]?1:0,t=g.stacks[index][z]!;g.stacks[index][z]=null;p.hand=sorted([...p.hand,t]);
  g.publicDraws=g.publicDraws||{};if(z===0)g.publicDraws[p.id]=[...(g.publicDraws[p.id]||[]),t];
  g.turnReadyAt=now+DRAW_TRAVEL_MS;g.lastEvent={id:uid(),type:"draw",who,index,tiles:[t],concealed:z===1,at:now};note(g,`${p.name} · ${z===1?"위층 비공개":"아래층 공개"} 패 1개 가져오기`);
  const coin=claimFloorCoin(g,who,index,t,z===1?2:1,now),ambush=triggerScoutedPickup(g,who,index,t,now);
  triggerFloorTrap(g,who,index,t,now,true);
  const trap=itemBattleState(g)?.lastTrap,pickupBeat=trap&&!trap.safe&&trap.index===index&&trap.at>=now?trap.at-TRAP_IMPACT_MS+TRAP_PRESENTATION_MS:ambush?ambush.at+350:now;
  if(coin){coin.at=nextCoinPresentationAt(publicCoinEvents(g.floorCoins),coin.id,Math.max(pickupBeat,now+DRAW_TRAVEL_MS));g.turnReadyAt=Math.max(g.turnReadyAt||0,coin.at+COIN_TURN_READY_MS);}
  revealFloorCoin(g,index,pickupBeat);
  if(g.rpgRun?.hp.some(hp=>hp<=0)){if(g.hpItemMatch)g.hpItemMatch.endReason=g.rpgRun.hp[who]<=0?'trap':'ambush';finishHpItemMatch(g);return;}
 }else if(action==="pass"){
  if(g.stacks.some(s=>s[0]||s[1]))throw Error("바닥 패가 남아 있으면 내거나 가져와야 해요.");
  if(!g.trick.length)throw Error("새 선에서는 타일을 내야 해요.");g.roundActions=(g.roundActions??(g.playedTiles?.length||0))+1;g.turnReadyAt=0;g.lastEvent={id:uid(),type:"pass",who,at:now};note(g,`${p.name} · 패스`);
 }else throw Error("지원하지 않는 동작이에요.");
 if(!automatic)p.timeouts=0;
 g.turn=(who+1)%g.players.length;
 if(g.lastBy===g.turn){const battleAt=Math.max(now,g.turnReadyAt||0);
  const battle=resolveHpItemBattle(g,battleAt)||resolveProfessionRpgBattle(g,battleAt);if(g.rpgRun&&g.rpgRun.status!=='playing')return;g.completedBattles=(g.completedBattles||0)+1;g.rally=0;g.trick=[];g.tablePlay=null;g.lastBy=null;if(!battle)g.turnReadyAt=Math.max(now,g.turnReadyAt||0)+LEAD_REVIEW_MS;note(g,`${g.players[g.turn].name}이 선을 잡았습니다.`);}
 scheduleTurn(g,now);
}
export function view(g:Game,token:string){
 const me=g.players.findIndex(p=>p.token===token);if(me<0)throw Error("입장 정보가 없어요. 방 코드로 다시 입장해 주세요.");
 const event=g.lastEvent;const lastEvent=event?.type==="draw"&&event.concealed&&event.who!==me?{...event,tiles:undefined}:event;
 return {floorCoins:floorCoinsView(g,me),code:g.code,phase:g.phase,roundActions:g.roundActions??(g.playedTiles?.length||0),matchMode:g.matchMode||"unlimited",targetScore:g.targetScore||0,matchWinner:g.matchWinner??null,matchNo:g.matchNo||1,displayRound:g.round-(g.matchRoundOffset||0),capacity:capacity(g),...dimensions(g),turn:g.turn,host:hostSeat(g),turnReadyAt:g.turnReadyAt||0,turnDeadline:g.turnDeadline||0,turnStartedAt:g.turnStartedAt||0,rally:g.rally||0,lastBy:g.lastBy,trick:g.trick,tablePlay:g.tablePlay||null,log:g.log,winner:g.winner,round:g.round,practice:g.practice,challenge:g.challenge||null,stageRun:g.stageRun||null,rpgRun:g.rpgRun?rpgTacticalView(g.rpgRun,me,g.round,g):null,rpgTest:!!g.rpgTest,hpItemMode:!!g.hpItemMode,hpItemVariant:g.hpItemVariant||1,hpItemRules:g.hpItemRules,hpItemMatch:g.hpItemMatch?{...g.hpItemMatch,roundItems:g.hpItemMatch.roundItems.filter(item=>item.id!=="ward-seal"||item.actor===me).map(item=>item.kind==='scout'&&item.actor!==me?{...item,target:-1}:item)}:undefined,completedBattles:g.completedBattles||0,revealedHands:g.revealedHands||[],played:g.playedTiles||g.trick,chat:g.chat||[],opening:g.opening||null,result:g.result||null,lastEvent,me,items:itemView(g,me),
 players:g.players.map((p,i)=>({id:p.id,name:p.name,avatar:p.avatar||"",count:p.hand.length,wins:p.wins,losses:p.losses||0,games:p.games||0,points:p.points||0,bot:p.bot,replaced:!!p.replaced,timeouts:p.timeouts||0,known:g.publicDraws?.[p.id]||[],hand:i===me||(g.phase==="ended"&&(g.practice||!!g.revealedHands?.includes(p.id)))?p.hand:undefined})),
 stacks:g.stacks.map((s,i)=>({...itemBattleState(g)?{trapAvailable:!!(s[0]||s[1])}:{},...hasFloorCoins(g)?{coinAmount:publicFloorCoinAmount(g,i,me)}:{},lower:s[1]?null:s[0],lowerPresent:!!s[0],upper:!!s[1],available:!!g.trick.length&&accessible(g,i)}))};
}
export function findMove(hand:Tile[],trick:Tile[]):Tile[]|null{
 const h=sorted(hand),counts=trick.length?[trick.length]:[5,3,2,1];
 for(const size of counts){if(h.length<size)continue;let chosen:Tile[]|null=null,budget=18000;
 function search(at:number,ts:Tile[]){if(chosen||--budget<0)return;if(ts.length===size){if(beats(ts,trick))chosen=[...ts];return;}
 for(let i=at;i<=h.length-(size-ts.length);i++){search(i+1,[...ts,h[i]]);if(chosen||budget<0)return;}}
 search(0,[]);if(chosen)return chosen;
 }return null;
}
export function botMove(g:Game,now=Date.now()){
 const p=g.players[g.turn];if(!p||!automated(p)||g.phase!=="playing")return;
 if(now<(g.turnReadyAt||0))return;
 if(!g.practice&&!p.bot)g.aiAssisted=true;
 if(runItemBattleBotTurn(g,now))return;
 if(tryBotProfessionActive(g,now))return;
 const lastItem=g.rpgRun?.lastItem?.id;tryRpgBotItem(g);
 if(g.rpgRun?.lastItem&&g.rpgRun.lastItem.id!==lastItem){g.turnReadyAt=Math.max(g.turnReadyAt||0,itemTurnReadyAt(g.rpgRun.lastItem));scheduleTurn(g,now);return;}
 if(g.rpgRun?.status==='complete')return;
 let decision=chooseBotAction(rpgTwinBotView(g,g.turn));
 if(g.rpgRun&&decision.type==='draw')decision={type:'draw',index:scoutRpgBotDraw(g,g.turn,decision.index)};
 if(g.itemRun&&decision.type==='draw')decision={type:'draw',index:scoutBotDraw(g,g.turn,decision.index)};
 if(decision.type==="play")act(g,g.turn,"play",decision.tiles.map(t=>t.id),-1,now,true);
 else if(decision.type==="draw")act(g,g.turn,"draw",[],decision.index,now,true);
 else act(g,g.turn,"pass",[],-1,now,true);
}

/** Only the two RPG bosses share their current hands. The human-facing view stays unchanged. */
export function rpgTwinBotView(g:Game,who:number){
 const position=view(g,g.players[who].token),own=twinIndex(g.players[who].avatar);
 if(!g.rpgRun||![3,6,9,10].includes(g.rpgRun.stage)||own===null)return position;
 const partner=g.players.findIndex((p,i)=>i!==who&&twinIndex(p.avatar)!==null);
 if(partner>=0)position.players[partner].known=[...g.players[partner].hand];
 return position;
}

export type LegalOption={id:string,label:string,tiles:Tile[],key:number[]};
/** Enumerate valid patterns directly so large hands do not scan every invalid five-tile set. */
export function legalOptions(hand:Tile[],trick:Tile[]):LegalOption[]{
 const h=sorted(hand),wanted=trick.length,byNum=new Map<number,Tile[]>(),bySuit=new Map<number,Tile[]>(),out:LegalOption[]=[],seen=new Set<string>();
 for(const t of h){byNum.set(t.n,[...(byNum.get(t.n)||[]),t]);bySuit.set(t.s,[...(bySuit.get(t.s)||[]),t]);}
 const add=(tiles:Tile[])=>{const id=tiles.map(t=>t.id).sort((a,b)=>a-b).join(',');if(seen.has(id))return;seen.add(id);const c=combo(tiles);if(c&&beats(tiles,trick))out.push({id,label:c.label,tiles:sorted(tiles),key:c.key});};
 const choose=(xs:Tile[],n:number,fn:(ts:Tile[])=>void)=>{function visit(at:number,ts:Tile[]){if(ts.length===n){fn(ts);return;}for(let i=at;i<=xs.length-(n-ts.length);i++)visit(i+1,[...ts,xs[i]]);}if(xs.length>=n)visit(0,[]);};
 if(!wanted||wanted===1)h.forEach(t=>add([t]));
 for(const n of [2,3])if(!wanted||wanted===n)for(const xs of byNum.values())choose(xs,n,add);
 if(!wanted||wanted===5){
  for(const xs of bySuit.values())choose(xs,5,add);
  for(let first=1;first<=12;first++){
   const ns=first===12?[12,13,14,15,1]:Array.from({length:5},(_,i)=>first+i);
   if(!ns.every(n=>byNum.has(n)))continue;
   function product(at:number,ts:Tile[]){if(at===5){add(ts);return;}for(const t of byNum.get(ns[at])!)product(at+1,[...ts,t]);}product(0,[]);
  }
  for(const [n,xs] of byNum){
   if(xs.length===4)for(const other of h)if(other.n!==n)add([...xs,other]);
   choose(xs,3,three=>{for(const [m,ys] of byNum)if(m!==n)choose(ys,2,two=>add([...three,...two]));});
  }
 }
 return out.sort((a,b)=>a.tiles.length-b.tiles.length||cmp(a.key,b.key)||a.id.localeCompare(b.id));
}

export type BotPosition=ReturnType<typeof view>;
export type BotAction={type:'play',tiles:Tile[]}|{type:'draw',index:number}|{type:'pass'};
/** Shared single-player and timeout policy. Only the public seat view is accepted. */
export function chooseBotAction(position:BotPosition):BotAction{
 if(position.hpItemMode&&position.hpItemRules===4)return chooseItemBattleAction(position);
 if(!position.stageRun&&isHiboringji(position.players[position.me])){
  const best=chooseStrategicAction(position,hiboringjiTemperament(position.roundActions).level);return hiboringjiAction(position,best);
 }
 return chooseStrategicAction(position,position.stageRun?.stage);
}
export function revealHand(g:Game,who:number,show:boolean){if(g.practice||g.phase!=='ended'||g.winner===who)throw Error('멀티 종료 후 패배한 참가자만 자신의 패를 공개할 수 있어요.');g.revealedHands=(g.revealedHands||[]).filter(id=>id!==g.players[who].id);if(show)g.revealedHands.push(g.players[who].id);}
export function resetChallenge(g:Game){if(g.phase!=='ended'||!g.challenge?.complete)throw Error('10판 완료 후 새 도전을 시작해 주세요.');const itemMode=!!g.challenge.itemMode;g.challenge={...newChallenge(uid(),capacity(g)),...(itemMode?{itemMode:true}:{})};if(itemMode)g.itemRun=newItemRun(capacity(g));g.players.forEach(p=>p.points=0);g.matchWinner=null;start(g);}

/** Human host controls one optional AI seat before a three-seat friend game starts. */
export function changeLobbyAI(g:Game,who:number,add:boolean){
 if(g.practice||g.phase!=='lobby'||capacity(g)!==3||who!==hostSeat(g))throw Error('3인 대기실의 방장만 AI 자리를 설정할 수 있어요.');
 const bots=g.players.filter(p=>p.bot);
 if(add){if(bots.length||g.players.length>=3)throw Error('빈 자리 하나에만 AI를 추가할 수 있어요.');const cast=chooseKoreanOpponents(1)[0],ai=player(cast.name,true);ai.avatar=cast.avatar;g.players.push(ai);}
 else{if(!bots.length)throw Error('참여 중인 AI가 없어요.');g.players=g.players.filter(p=>!p.bot);}
}
