import {player,room,start,uid,type Game} from './game.ts';
import type {RpgRun} from './rpg.ts';

export type JourneyNode='battle-1'|'tavern'|'battle-2'|'town-event'|'ruins'|'forest'|'battle-3';
export type JourneyMini={game:Game,roundIds:string[],lastReward:number};
export type VillageRequestReward='coins'|'heal';
export type RpgJourneyState={version:1,seenScenes?:string[],location:'map'|'tavern'|'battle'|'mini-game',currentNode:JourneyNode,startedStages:number[],completedNodes:JourneyNode[],path?:'ruins'|'forest'|'skip',branchOutcome?:{path:'ruins'|'forest',hpBefore:number,hpAfter:number,coins:number},townEvent?:{reward:'heal'|'coins',hpBefore:number,hpAfter:number,coins:number},villageRequestReward?:VillageRequestReward,rumors:string[],tavernRewardPaid:boolean,miniSummary?:{roundIndex:number,finished:boolean},mini?:JourneyMini};
/** Trial values for this three-stage prototype; never used by normal or HP item play. */
export const JOURNEY_TRIAL={ruinsDamage:8,ruinsCoins:15,forestHeal:8,villageRequestHeal:5,villageRequestCoins:5,miniRounds:3,miniRewards:[12,8,4]} as const;
export const JOURNEY_RUMOR={id:'sheltered-light',title:'모르의 등불 이야기',text:'금이 간 심장 곁에 회복의 등불을 장착해 보게. 둘을 함께 지니고 싸우면, 승부를 마친 뒤 등불이 조금 더 힘을 내지.'};
export const JOURNEY_NODES:{id:JourneyNode,name:string,x:number,y:number,kind:'battle'|'place'|'event'|'choice'}[]=[
 {id:'battle-1',name:'ST1 · 마을 관문',x:52,y:66,kind:'battle'},
 {id:'tavern',name:'눈길의 주막',x:67,y:40,kind:'place'},
 {id:'battle-2',name:'ST2 · 마을 광장',x:54,y:45,kind:'battle'},
 {id:'battle-3',name:'ST3 · 북쪽 성채',x:57,y:17,kind:'battle'},
];
export function initRpgJourney(game:Game){
 const run=game.rpgRun;if(!run?.phaseOne||game.hpItemMode||game.rpgTest)throw Error('새 RPG 여정에서 시작해 주세요.');
 run.journey={version:1,location:'map',currentNode:'battle-1',startedStages:[],completedNodes:[],rumors:[],tavernRewardPaid:false};
 game.phase='ended';game.turnDeadline=0;
}
export function journeyNodeState(run:RpgRun,id:JourneyNode):'available'|'completed'|'locked'|'closed'{
 const j=run.journey;if(!j)return 'locked';
 if(id==='town-event')return 'completed';
 if(id==='ruins'||id==='forest'){
  if(j.path)return j.path===id?'completed':'closed';
  return run.stage===2&&run.status==='ready'?'available':'locked';
 }
 if(id==='tavern')return run.stage===1&&run.status==='ready'?'available':j.completedNodes.includes(id)?'completed':'locked';
 if(j.completedNodes.includes(id))return 'completed';
 const next=j.startedStages.length===0&&run.stage===1&&run.status==='playing'?1:run.status==='ready'?run.stage+1:0;
 return id===`battle-${next}`?'available':'locked';
}
function journeyGame(game:Game){const run=game.rpgRun;if(!run?.journey||!run.phaseOne||game.hpItemMode||game.rpgTest)throw Error('탐험형 RPG 여정이 아니에요.');return {run,j:run.journey};}
/** Returns a stage for the caller to enter through the existing combat factory. */
export function visitJourneyNode(game:Game,id:JourneyNode):number|undefined{
 const {run,j}=journeyGame(game);
 if(j.location!=='map'||journeyNodeState(run,id)!=='available')throw Error('지금 갈 수 있는 장소를 선택해 주세요.');
 if(id.startsWith('battle-')){
  const stage=Number(id.slice(7));
  j.location='battle';j.currentNode=id;j.startedStages.push(stage);run.updatedAt=Date.now();return stage;
 }
 j.currentNode=id;
 if(id==='tavern'){j.location='tavern';if(!j.completedNodes.includes(id))j.completedNodes.push(id);}
 else if(id==='ruins'||id==='forest'){
  const before=run.hp[0],coins=id==='ruins'?JOURNEY_TRIAL.ruinsCoins:0;
  run.hp[0]=id==='ruins'?Math.max(1,before-JOURNEY_TRIAL.ruinsDamage):Math.min(100,before+JOURNEY_TRIAL.forestHeal);run.coins+=coins;
  j.path=id as 'ruins'|'forest';j.branchOutcome={path:j.path,hpBefore:before,hpAfter:run.hp[0],coins};j.completedNodes.push(id);
 }
 run.updatedAt=Date.now();
}
export function returnJourneyMap(game:Game){const {run,j}=journeyGame(game);if(j.location!=='tavern')throw Error('주점의 문으로 나가 주세요.');j.location='map';run.updatedAt=Date.now();}
export function journeyAfterReward(run:RpgRun):RpgRun{
 if(!run.journey)return run;
 const node=`battle-${run.stage}` as JourneyNode;
 return {...run,journey:{...run.journey,location:run.status==='complete'?'battle':'map',currentNode:node,completedNodes:[...new Set([...run.journey.completedNodes,node])]}};
}
export function assertJourneyTavern(run:RpgRun){if(!run.journey||run.journey.location!=='tavern'||run.status!=='ready')throw Error('주점에서 준비할 수 있어요.');}
export function chooseVillageRequestReward(run:RpgRun,reward:unknown):RpgRun{
 assertJourneyTavern(run);
 if(reward!=='coins'&&reward!=='heal')throw Error('받을 보상을 선택해 주세요.');
 const j=run.journey!;
 if(j.villageRequestReward)throw Error('이미 주점의 부탁을 도왔어요.');
 if(reward==='heal'&&run.hp[0]>=100)throw Error('HP가 가득 찼어요.');
 const hp=[...run.hp];let coins=run.coins;
 if(reward==='coins')coins+=JOURNEY_TRIAL.villageRequestCoins;
 else hp[0]=Math.min(100,hp[0]+JOURNEY_TRIAL.villageRequestHeal);
 return {...run,hp,coins,journey:{...j,villageRequestReward:reward},updatedAt:Date.now()};
}
export function assertJourneyShop(run:RpgRun){if(!run.journey||run.journey.location!=='map'||run.status!=='ready')throw Error('마을 지도의 잡화점에서 구매할 수 있어요.');}
export function hearJourneyRumor(run:RpgRun):RpgRun{assertJourneyTavern(run);return {...run,journey:{...run.journey!,rumors:[...new Set([...run.journey!.rumors,JOURNEY_RUMOR.id])]},updatedAt:Date.now()};}
export function equipJourneyRelic(run:RpgRun,id:string,replace?:string):RpgRun{
 assertJourneyTavern(run);if(!run.relics.includes(id))throw Error('보유한 유물을 선택해 주세요.');
 let equipped=run.equipped.filter(relic=>run.relics.includes(relic));
 if(equipped.includes(id)){if(run.relics.length-equipped.length>=3)throw Error('가방이 가득 찼어요. 보관 유물을 장착하면서 교체해 주세요.');equipped=equipped.filter(relic=>relic!==id);}
 else{if(equipped.length>=3){if(!replace||!equipped.includes(replace))throw Error('교체할 장착 유물을 선택해 주세요.');equipped=equipped.filter(relic=>relic!==replace);}equipped.push(id);}
 return {...run,equipped,updatedAt:Date.now()};
}
export function startJourneyMini(game:Game,now=Date.now()){
 const {run,j}=journeyGame(game);assertJourneyTavern(run);
 if(!j.mini||j.mini.roundIds.length===JOURNEY_TRIAL.miniRounds){
  const human=player(game.players[0].name);human.avatar=game.players[0].avatar;
  const child=room('TAVERN-'+uid(),human,true,3),serin=player('세린',true),guest=player('여행자',true);serin.avatar='stage-portrait:16';guest.avatar='stage-portrait:5';
  child.players.push(serin,guest);child.rpgMini={journeyId:run.id,roundIndex:1,totalRounds:3,reward:0};start(child,now);j.mini={game:child,roundIds:[],lastReward:0};
 }
 j.location='mini-game';run.updatedAt=now;
}
export function activeJourneyMini(game:Game){return game.rpgRun?.journey?.location==='mini-game'?game.rpgRun.journey.mini?.game:undefined;}
export function settleJourneyMini(game:Game,now=Date.now()){
 const {run,j}=journeyGame(game),mini=j.mini,child=mini?.game;
 if(j.location!=='mini-game'||!mini||!child||child.phase!=='ended'||!child.result||mini.roundIds.includes(child.result.id))return;
 mini.roundIds.push(child.result.id);
 if(mini.roundIds.length===JOURNEY_TRIAL.miniRounds){
  const rank=1+child.players.slice(1).filter(p=>(p.points||0)>(child.players[0].points||0)).length;
  mini.lastReward=j.tavernRewardPaid?0:JOURNEY_TRIAL.miniRewards[rank-1];run.coins+=mini.lastReward;j.tavernRewardPaid=true;child.rpgMini!.reward=mini.lastReward;
 }
 run.updatedAt=now;
}
export function nextJourneyMiniRound(game:Game,now=Date.now()){
 const {j}=journeyGame(game),mini=j.mini;
 if(j.location!=='mini-game'||!mini||mini.game.phase!=='ended'||mini.roundIds.length>=JOURNEY_TRIAL.miniRounds||!mini.game.result||!mini.roundIds.includes(mini.game.result.id))throw Error('이번 승부의 결과를 먼저 확인해 주세요.');
 start(mini.game,now);mini.game.rpgMini!.roundIndex=mini.roundIds.length+1;
}
export function leaveJourneyMini(game:Game){const {run,j}=journeyGame(game);if(j.location!=='mini-game')throw Error('진행 중인 주점 승부가 없어요.');j.location='tavern';run.updatedAt=Date.now();}
export function journeyDisplayGame(game:Game){return activeJourneyMini(game)||game;}
/** Reject unsupported/corrupt new journey data without rewriting the original storage. */
export function validateJourneySave(game:Game){
 const run=game.rpgRun,j=run?.journey;if(!j)return;
 const nodes=new Set<JourneyNode>([...JOURNEY_NODES.map(node=>node.id),'ruins','forest','town-event']),unique=(items:unknown)=>Array.isArray(items)&&new Set(items).size===items.length;
 if(j.seenScenes!==undefined&&(!Array.isArray(j.seenScenes)||!j.seenScenes.every(id=>typeof id==='string'&&/^ST[123]_POST$/.test(id))))throw Error('이야기 감상 기록의 형식이 올바르지 않아요.');
 const invalid=()=>{throw Error('탐험 여정의 저장 형식이 올바르지 않거나 지원하지 않는 버전이에요. 기존 데이터는 보존했어요.');};
 if(!run.phaseOne||j.version!==1||!['map','tavern','battle','mini-game'].includes(j.location)||!nodes.has(j.currentNode)||!unique(j.startedStages)||!j.startedStages.every(stage=>Number.isInteger(stage)&&stage>=1&&stage<=3)||!unique(j.completedNodes)||!j.completedNodes.every(node=>nodes.has(node))||!Array.isArray(j.rumors)||!j.rumors.every(id=>typeof id==='string')||typeof j.tavernRewardPaid!=='boolean'||j.path&&!['ruins','forest','skip'].includes(j.path))invalid();
 if(j.location==='mini-game'&&!j.mini)invalid();
 if(j.townEvent&&(!['heal','coins'].includes(j.townEvent.reward)||!Number.isFinite(j.townEvent.hpBefore)||!Number.isFinite(j.townEvent.hpAfter)||!Number.isFinite(j.townEvent.coins)))invalid();
 if(j.villageRequestReward!==undefined&&j.villageRequestReward!=='coins'&&j.villageRequestReward!=='heal')invalid();
 if(j.mini){const mini=j.mini,child=mini.game,meta=child?.rpgMini;
  if(!child||!child.practice||child.rpgRun||child.hpItemMode||child.stageRun||child.itemRun||!Array.isArray(child.players)||child.players.length!==3||!child.players.every(p=>Array.isArray(p.hand)&&typeof p.id==='string'&&typeof p.token==='string')||!Array.isArray(child.stacks)||!['playing','ended'].includes(child.phase)||!unique(mini.roundIds)||mini.roundIds.length>3||!mini.roundIds.every(id=>typeof id==='string')||!meta||meta.journeyId!==run.id||meta.totalRounds!==3||!Number.isInteger(meta.roundIndex)||meta.roundIndex<1||meta.roundIndex>3||!Number.isFinite(meta.reward)||meta.reward<0||!Number.isFinite(mini.lastReward)||mini.lastReward<0)invalid();
 }
}
