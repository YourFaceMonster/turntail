import {rpgRelicSlots} from './rpg-trials';
import {activateRpgRelics,isPassiveRelic,rpgMaxHp} from './rpg-rework';
import {withRelicActivations} from './rpg-relic-feedback.ts';
import {restoreRetiredJourneyNodes} from './rpg-journey-legacy.ts';
import {restoreDemoReward} from './rpg-demo-catalog.ts';
import {restoreStoryCards,ST3_STORY_KEY} from './rpg-story-cards.ts';
import {LETTER_QUEST_COINS,WAYFARER_AID_HP,letterDuelOutcome} from './rpg-dialogue.ts';
import {BLUE_GLASS_ID} from './blue-glass.ts';
import {DICE_DEN_STAGES,DICE_DEN_STAKE,DICE_RELIC_ID} from './rpg-dice-den.ts';
import {newYachtMatch,rollYacht,scoreYacht,toggleYachtHold,validYachtMatch,yachtAiStep,yachtOutcome,cryptoDie,type DiceRandom,type YachtMatch} from './yacht-dice.ts';
import {player,room,start,uid,type Game} from './game.ts';
import {JOURNEY_STAGE_NAMES,journeyRegion,isStoryQuestId,storyQuest,storyState,type JourneyRegion,type StoryQuestChoice,type StoryQuestState} from './rpg-chapters.ts';
export {JOURNEY_STAGE_NAMES};
import type {RpgRun} from './rpg.ts';

export type JourneyNode='battle-1'|'tavern'|'letter-alley'|'wayfarer-stop'|'watchtower'|'battle-2'|'battle-3'|'battle-4'|'battle-5'|'battle-6'|'battle-7'|'battle-8'|'battle-9'|'battle-10'|'quest-4'|'quest-5'|'quest-6'|'quest-8'|'quest-9'|'dice-den';
/** ST4~6 Yacht Dice side quest: one saved match, HP stake on loss, relic on first win. */
export type DiceDenState={match?:YachtMatch,result?:'win'|'lose'|'draw'|'forfeit',losses:number,relicClaimed?:boolean};
export type JourneyMini={game:Game,roundIds:string[],lastReward:number};
export type LetterQuest={step:'alley'|'recovered'|'complete'|'failed',defeated?:boolean};
export type VillageRequestReward='coins'|'heal';
export type RpgJourneyState={version:1,livesVersion?:1,retryStage?:number,seenScenes?:string[],location:'map'|'tavern'|'market-alley'|'wayfarer-stop'|'watchtower'|'battle'|'mini-game'|'story-quest'|'dice-den',diceDen?:DiceDenState,currentNode:JourneyNode,story?:StoryQuestState,startedStages:number[],completedNodes:JourneyNode[],villageRequestReward?:VillageRequestReward,letterQuest?:LetterQuest,wayfarerHerbGiven?:boolean,watchtowerRelicFound?:boolean,watchtowerRelicClaimed?:boolean,rumors:string[],tavernRewardPaid:boolean,miniSummary?:{roundIndex:number,finished:boolean},mini?:JourneyMini,letterMini?:JourneyMini,miniKind?:'tavern'|'letter'};
/** Trial values for this three-stage prototype; never used by normal or HP item play. */
export const JOURNEY_TRIAL={villageRequestHeal:5,villageRequestCoins:5,miniRounds:3,miniRewards:[12,8,4]} as const;
export const JOURNEY_RUMOR={id:'sheltered-light',title:'모르의 등불 이야기',text:'금이 간 심장 곁에 회복의 등불을 장착해 보게. 둘을 함께 지니고 싸우면, 승부를 마친 뒤 등불이 조금 더 힘을 내지.'};
export const JOURNEY_LETTER_RUMOR={id:'sealed-letter-relic',title:'봉인 편지 속 유물 소문',text:'편지에는 성 안 북쪽 구역에 잠든 낡은 유물의 흔적이 적혀 있다. 정확한 장소를 아는 사람을 찾아보면 좋을 것 같다.'};
export const JOURNEY_WAYFARER_RUMOR={id:'wayfarer-relic-trail',title:'검은 소나무 파수탑',text:'여행자는 성벽 안쪽 파수탑의 무너진 돌틈에서 희미한 푸른 빛이 샌다고 했다. 일부러 들여다보지 않으면 지나치기 쉬운 곳이라 한다.'};
export const JOURNEY_BLUE_GLASS_RUMOR={id:'blue-glass-hidden-route',title:'파수꾼의 푸른 유리',text:'옛 파수꾼의 등잔에 남아 있던 푸른 유리. 장착 중 응급 약초의 회복량이 10에서 15로 늘어난다. 주점의 여행 가방에서 장착할 수 있다.'};
export const JOURNEY_NODES:{id:JourneyNode,name:string,x:number,y:number,portrait?:{x:number,y:number},kind:'battle'|'place'|'event',region:JourneyRegion}[]=[
 {id:'battle-1',name:'ST1 · 마을 관문',x:52,y:66,kind:'battle',region:1},
 {id:'tavern',name:'눈길의 주점',x:67,y:40,kind:'place',region:1},
 {id:'letter-alley',name:'시장 뒤 골목',x:82,y:49,kind:'place',region:1},
 {id:'wayfarer-stop',name:'길가의 여행자',x:17,y:43,kind:'event',region:1},
 {id:'watchtower',name:'검은 소나무 파수탑',x:28,y:31,kind:'place',region:1},
 {id:'battle-2',name:'ST2 · 마을 광장',x:54,y:45,kind:'battle',region:1},
 {id:'battle-3',name:'ST3 · 북쪽 성채',x:57,y:17,kind:'battle',region:1},
 // Landscape placeholders and cropped portrait paintings have separate landmark coordinates.
 {id:'quest-4',name:'물에 젖은 기록',x:22,y:62,portrait:{x:17,y:61},kind:'event',region:2},
 {id:'battle-4',name:'ST4 · 물안개 폭포',x:40,y:78,portrait:{x:67,y:59},kind:'battle',region:2},
 {id:'quest-5',name:'끊긴 매듭',x:76,y:60,portrait:{x:86,y:36},kind:'event',region:2},
 {id:'battle-5',name:'ST5 · 구름다리 쉼터',x:56,y:50,portrait:{x:48,y:42},kind:'battle',region:2},
 {id:'quest-6',name:'잊힌 맹세',x:28,y:30,portrait:{x:18,y:19},kind:'event',region:2},
 {id:'dice-den',name:'안개 나루 주사위판',x:82,y:32,portrait:{x:78,y:83},kind:'event',region:2},
 {id:'battle-6',name:'ST6 · 수호자의 회랑',x:58,y:20,portrait:{x:60,y:14},kind:'battle',region:2},
 {id:'battle-7',name:'ST7 · 달빛 고목',x:40,y:78,portrait:{x:52,y:84},kind:'battle',region:3},
 {id:'quest-8',name:'전해지지 못한 편지',x:76,y:58,portrait:{x:83,y:53},kind:'event',region:3},
 {id:'battle-8',name:'ST8 · 별빛 성소',x:56,y:50,portrait:{x:60,y:31},kind:'battle',region:3},
 {id:'quest-9',name:'마지막 불씨',x:28,y:32,portrait:{x:14,y:21},kind:'event',region:3},
 {id:'battle-9',name:'ST9 · 잿불 제단',x:58,y:20,portrait:{x:56,y:9},kind:'battle',region:3},
 {id:'battle-10',name:'ST10 · 붉은 세계수',x:50,y:42,portrait:{x:50,y:48},kind:'battle',region:4},
];
export function initRpgJourney(game:Game){
 const run=game.rpgRun;if(!run?.phaseOne||game.hpItemMode||game.rpgTest)throw Error('새 스토리 여정에서 시작해 주세요.');
 run.storyCards=['crown-two'];run.fate=3;run.journey={version:1,livesVersion:1,location:'map',currentNode:'battle-1',startedStages:[],completedNodes:[],rumors:[],tavernRewardPaid:false};
 game.phase='ended';game.turnDeadline=0;
}
export function journeyNodeState(run:RpgRun,id:JourneyNode):'available'|'completed'|'locked'|'closed'{
 const j=run.journey;if(!j)return 'locked';
 const def=JOURNEY_NODES.find(node=>node.id===id);if(!def)return 'locked';
 // Each region shows only its own places; earlier optional places close once the journey moves on.
 if(def.region!==journeyRegion(run))return j.completedNodes.includes(id)?'completed':'closed';
 if(isStoryQuestId(id)){const quest=storyQuest(id)!;if(storyState(run).quests[quest.id])return 'completed';return run.status==='ready'&&run.stage+1===quest.stage&&!j.retryStage?'available':run.stage>=quest.stage?'closed':'locked';}
 if(id==='dice-den'){if(j.diceDen?.relicClaimed)return 'completed';return run.status==='ready'&&!j.retryStage&&(DICE_DEN_STAGES as readonly number[]).includes(run.stage)?'available':run.stage>DICE_DEN_STAGES[1]?'closed':'locked';}
 if(id==='tavern')return run.status==='ready'?'available':'locked';
 if(id==='letter-alley')return letterQuestView(j)?.step==='alley'&&run.status==='ready'?'available':j.completedNodes.includes(id)?'completed':'locked';
 if(id==='wayfarer-stop')return j.wayfarerHerbGiven?'completed':run.status==='ready'?'available':'locked';
 if(id==='watchtower')return j.watchtowerRelicClaimed?'completed':j.wayfarerHerbGiven&&run.status==='ready'?'available':'locked';
 if(j.completedNodes.includes(id))return 'completed';
 const next=j.retryStage|| (j.startedStages.length===0&&run.stage===1&&run.status==='playing'?1:run.status==='ready'?run.stage+1:0);
 return id===`battle-${next}`?'available':'locked';
}
function journeyGame(game:Game){const run=game.rpgRun;if(!run?.journey||!run.phaseOne||game.hpItemMode||game.rpgTest)throw Error('탐험형 스토리 여정이 아니에요.');return {run,j:run.journey};}
/** Returns a stage for the caller to enter through the existing combat factory. */
export function visitJourneyNode(game:Game,id:JourneyNode):number|undefined{
 const {run,j}=journeyGame(game);
 if(j.location!=='map'||journeyNodeState(run,id)!=='available')throw Error('지금 갈 수 있는 장소를 선택해 주세요.');
 if(id.startsWith('battle-')){
  const stage=Number(id.slice(7));
  j.location='battle';j.currentNode=id;j.retryStage=undefined;if(!j.startedStages.includes(stage))j.startedStages.push(stage);run.updatedAt=Date.now();return stage;
 }
 j.currentNode=id;
 if(id==='tavern'){j.location='tavern';if(!j.completedNodes.includes(id))j.completedNodes.push(id);}
 else if(id==='letter-alley'){j.location='market-alley';}
 else if(id==='wayfarer-stop'){j.location='wayfarer-stop';}
 else if(id==='watchtower'){j.location='watchtower';}
 else if(isStoryQuestId(id)){j.location='story-quest';}
 else if(id==='dice-den'){j.location='dice-den';}
 run.updatedAt=Date.now();
}
export function returnJourneyMap(game:Game){const {run,j}=journeyGame(game);if(j.location!=='tavern'&&j.location!=='market-alley'&&j.location!=='wayfarer-stop'&&j.location!=='watchtower'&&j.location!=='story-quest'&&j.location!=='dice-den')throw Error('지도로 돌아갈 수 있는 장소가 아니에요.');if(j.location==='dice-den'&&j.diceDen?.match?.status==='playing')throw Error('주사위 승부 중에는 자리를 뜰 수 없어요. 끝까지 두거나 기권해 주세요.');if(j.location==='dice-den'&&j.diceDen)j.diceDen={...j.diceDen,match:undefined,result:undefined};j.location='map';run.updatedAt=Date.now();}
/* ---------- 안개 나루 주사위판 (Yacht Dice side quest) ---------- */
function diceDen(run:RpgRun){const j=run.journey;if(!j||j.location!=='dice-den'||run.status!=='ready')throw Error('안개 나루 주사위판에서만 할 수 있어요.');return {j,den:j.diceDen||{losses:0}};}
export function startDiceDuel(run:RpgRun):RpgRun{
 const {j,den}=diceDen(run);
 if(den.relicClaimed)throw Error('하로와의 승부는 이미 끝났어요.');
 if(den.match?.status==='playing')throw Error('진행 중인 주사위 승부가 있어요.');
 if(run.hp[0]<=DICE_DEN_STAKE)throw Error(`판돈 HP ${DICE_DEN_STAKE}를 걸려면 HP가 ${DICE_DEN_STAKE+1} 이상이어야 해요.`);
 return {...run,journey:{...j,diceDen:{...den,match:newYachtMatch(),result:undefined}},updatedAt:Date.now()};
}
/** Win: relic once. Loss or forfeit: HP stake. Draw: stake returned (nothing changes). */
function settleDiceDen(run:RpgRun,den:DiceDenState,result:'win'|'lose'|'draw'|'forfeit'):RpgRun{
 const j=run.journey!;let next:RpgRun={...run,updatedAt:Date.now()},nextDen:DiceDenState={...den,result};
 if(result==='lose'||result==='forfeit'){next.hp=[Math.max(1,run.hp[0]-DICE_DEN_STAKE),...run.hp.slice(1)];nextDen.losses=den.losses+1;}
 if(result==='win'&&!den.relicClaimed){
  const relics=run.relics.includes(DICE_RELIC_ID)?run.relics:[...run.relics,DICE_RELIC_ID];
  next={...next,relics,equipped:run.equipped.includes(DICE_RELIC_ID)||run.equipped.length>=rpgRelicSlots(run)?run.equipped:[...run.equipped,DICE_RELIC_ID],discovered:[...new Set([...run.discovered,DICE_RELIC_ID])],unlocked:[...new Set([...(run.unlocked||[]),DICE_RELIC_ID])]};
  nextDen={...nextDen,relicClaimed:true};
  next.journey={...j,diceDen:nextDen,completedNodes:[...new Set<JourneyNode>([...j.completedNodes,'dice-den'])]};
  return activateRpgRelics(next);
 }
 next.journey={...j,diceDen:nextDen};return next;
}
export type DiceAction={kind:'roll'}|{kind:'hold',index:number}|{kind:'score',category:string}|{kind:'ai'}|{kind:'forfeit'};
export function playDiceDen(run:RpgRun,action:DiceAction,random:DiceRandom=cryptoDie):RpgRun{
 const {j,den}=diceDen(run),match=den.match;
 if(!match||match.status!=='playing')throw Error('먼저 하로와의 승부를 시작해 주세요.');
 if(action.kind==='forfeit')return settleDiceDen(run,{...den,match:{...match,status:'ended'}},'forfeit');
 const next=action.kind==='roll'?rollYacht(match,0,random):action.kind==='hold'?toggleYachtHold(match,0,action.index):action.kind==='score'?scoreYacht(match,0,action.category):action.kind==='ai'?yachtAiStep(match,random):undefined;
 if(!next)throw Error('알 수 없는 주사위 동작이에요.');
 const updated={...den,match:next},outcome=yachtOutcome(next);
 if(outcome)return settleDiceDen(run,updated,outcome);
 return {...run,journey:{...j,diceDen:updated},updatedAt:Date.now()};
}
/** ST4~9 optional story quests: records the choice only (no HP, relic or currency). */
export function answerStoryQuest(run:RpgRun,id:unknown,choice:unknown):RpgRun{
 const j=run.journey;if(!j||j.location!=='story-quest'||run.status!=='ready'||!isStoryQuestId(id)||j.currentNode!==id)throw Error('이야기 장소에서 선택할 수 있어요.');
 if(choice!=='read'&&choice!=='skip')throw Error('할 일을 선택해 주세요.');
 const story=storyState(run);if(story.quests[id])throw Error('이미 선택을 마친 이야기예요.');
 return {...run,journey:{...j,story:{...story,quests:{...story.quests,[id]:choice as StoryQuestChoice}},completedNodes:[...new Set<JourneyNode>([...j.completedNodes,id])]},updatedAt:Date.now()};
}
/** A journey started after the normal ending belongs to the next traveller (bible 1.4). */
export function setJourneyRunNumber(run:RpgRun,runNumber:number){if(!run.journey)return;run.journey.story={...storyState(run),runNumber:Math.max(1,Math.floor(runNumber))};}
export function journeyAfterReward(run:RpgRun):RpgRun{
 if(!run.journey)return run;
 const node=`battle-${run.stage}` as JourneyNode;
 return {...run,journey:{...run.journey,location:run.status==='complete'?'battle':'map',currentNode:node,completedNodes:[...new Set([...run.journey.completedNodes,node])]}};
}
export function assertJourneyTavern(run:RpgRun){if(!run.journey||run.journey.location!=='tavern'||run.status!=='ready')throw Error('주점에서 준비할 수 있어요.');}
export function chooseVillageRequestReward(run:RpgRun,reward:unknown):RpgRun{
 if(run.rework)reward='heal';
 assertJourneyTavern(run);
 if(reward!=='coins'&&reward!=='heal')throw Error('받을 보상을 선택해 주세요.');
 const j=run.journey!;
 if(j.villageRequestReward)throw Error('이미 주점의 부탁을 도왔어요.');
 if(reward==='heal'&&run.hp[0]>=(run.rework?rpgMaxHp(run):100))throw Error('HP가 가득 찼어요.');
 const hp=[...run.hp];let coins=run.coins;
 if(reward==='coins')coins+=JOURNEY_TRIAL.villageRequestCoins;
 else hp[0]=Math.min(run.rework?rpgMaxHp(run):100,hp[0]+JOURNEY_TRIAL.villageRequestHeal);
 return {...run,hp,coins,journey:{...j,villageRequestReward:reward},updatedAt:Date.now()};
}
export function assertJourneyPreparation(run:RpgRun){if(!run.journey||run.status!=='ready'||['battle','mini-game'].includes(run.journey.location))throw Error('전투 밖 준비 구간에서 사용할 수 있어요.');}
export function assertJourneyShop(run:RpgRun){if(run.rework)throw Error('새 RPG에서는 상점을 이용하지 않아요.');if(!run.journey||run.journey.location!=='map'||run.status!=='ready')throw Error('마을 지도의 잡화점에서 구매할 수 있어요.');}
export function hearJourneyRumor(run:RpgRun):RpgRun{
 assertJourneyTavern(run);const fresh=!run.journey!.rumors.includes(JOURNEY_RUMOR.id);
 const next={...run,journey:{...run.journey!,rumors:[...new Set([...run.journey!.rumors,JOURNEY_RUMOR.id])]},updatedAt:Date.now()};
 return fresh&&run.rework&&run.relics.includes('mor-quill')?withRelicActivations(next,[{relicId:'mor-quill',message:'소문 수첩에 유물 소문 추가'}]):next;
}
export function startLetterQuest(run:RpgRun):RpgRun{
 assertJourneyTavern(run);const j=run.journey!;
 if(j.letterQuest)throw Error('모르의 편지 부탁은 이미 시작했어요.');
 return {...run,journey:{...j,location:'map',currentNode:'tavern',letterQuest:{step:'alley'}},updatedAt:Date.now()};
}
export function returnLetterToMor(run:RpgRun):RpgRun{
 assertJourneyTavern(run);const j=run.journey!;
 if(j.letterQuest?.step!=='recovered')throw Error('도둑에게서 봉인 편지를 먼저 되찾아 주세요.');
 return {...run,coins:run.rework?0:run.coins+LETTER_QUEST_COINS,hp:run.rework?[Math.min(rpgMaxHp(run),run.hp[0]+5),...run.hp.slice(1)]:run.hp,journey:{...j,letterQuest:{step:'complete'},rumors:[...new Set([...j.rumors,JOURNEY_LETTER_RUMOR.id])]},updatedAt:Date.now()};
}
export function giveHerbToWayfarer(run:RpgRun):RpgRun{
 const j=run.journey;if(!j||j.location!=='wayfarer-stop'||run.status!=='ready')throw Error('길가의 여행자를 만났을 때 약초를 건넬 수 있어요.');
 if(j.wayfarerHerbGiven)throw Error('여행자에게 이미 약초를 건넸어요.');
 const index=run.consumables.indexOf('emergency-herb');if(!run.rework&&index<0)throw Error('건넬 응급 약초가 없어요.');
 // New RPG has no consumables: first aid costs the player's own HP instead (never down to 0).
 if(run.rework&&run.hp[0]<=WAYFARER_AID_HP)throw Error(`응급처치에 나눌 HP가 부족해요. HP ${WAYFARER_AID_HP+1} 이상 필요해요.`);
 const consumables=[...run.consumables];if(!run.rework)consumables.splice(index,1);
 const hp=run.rework?[run.hp[0]-WAYFARER_AID_HP,...run.hp.slice(1)]:run.hp;
 return {...run,hp,consumables,coins:run.rework?0:run.coins+8,journey:{...j,wayfarerHerbGiven:true,completedNodes:[...new Set<JourneyNode>([...j.completedNodes,'wayfarer-stop'])],rumors:[...new Set([...j.rumors,JOURNEY_WAYFARER_RUMOR.id])]},updatedAt:Date.now()};
}
export function discoverWayfarerRelic(run:RpgRun):RpgRun{
 const j=run.journey;if(!j||j.location!=='watchtower'||!j.wayfarerHerbGiven||run.status!=='ready')throw Error('여행자의 단서를 따라 파수탑에 도착해야 해요.');
 if(j.watchtowerRelicFound)throw Error('파수탑의 유물을 이미 찾았어요.');
 const found={...run,journey:{...j,watchtowerRelicFound:true,completedNodes:[...new Set<JourneyNode>([...j.completedNodes,'watchtower'])],rumors:[...new Set([...j.rumors,JOURNEY_BLUE_GLASS_RUMOR.id])]},updatedAt:Date.now()};
 return claimWatchtowerRelic(found);
}
/** Unique relics have no storage cap; equipment stays limited to three. */
export function claimWatchtowerRelic(run:RpgRun,replace?:string):RpgRun{
 const j=run.journey;if(!j||j.location!=='watchtower'||run.status!=='ready'||!j.watchtowerRelicFound||j.watchtowerRelicClaimed)throw Error('파수탑에서 아직 받지 않은 푸른 유리를 확인해 주세요.');
 let relics=[...run.relics];
 if(!relics.includes(BLUE_GLASS_ID)){
  relics.push(BLUE_GLASS_ID);
 }
 const equipped=run.equipped.includes(BLUE_GLASS_ID)||run.equipped.length>=rpgRelicSlots(run)?run.equipped:[...run.equipped,BLUE_GLASS_ID];
 return {...run,relics,equipped,discovered:[...new Set([...run.discovered,BLUE_GLASS_ID])],unlocked:[...new Set([...run.unlocked,BLUE_GLASS_ID])],journey:{...j,watchtowerRelicClaimed:true},updatedAt:Date.now()};
}
export function equipJourneyRelic(run:RpgRun,id:string,replace?:string):RpgRun{
 if(!run.journey||(run.journey.location==='mini-game'||run.journey.location==='battle'&&run.status==='playing')||!['playing','ready','allocation','complete'].includes(run.status))throw Error('대결 중에는 유물을 변경할 수 없어요.');
 if(!run.relics.includes(id))throw Error('보유한 유물을 선택해 주세요.');
 if(run.rework&&isPassiveRelic(id)&&!run.equipped.includes(id))throw Error('가방에 갖고만 있어도 적용되는 유물이에요.');
 let equipped=run.equipped.filter(relic=>run.relics.includes(relic));
 if(equipped.includes(id)){equipped=equipped.filter(relic=>relic!==id);}
 else{if(equipped.length>=rpgRelicSlots(run)){if(!replace||!equipped.includes(replace))throw Error('교체할 장착 유물을 선택해 주세요.');equipped=equipped.filter(relic=>relic!==replace);}equipped.push(id);}
 return activateRpgRelics({...run,equipped,updatedAt:Date.now()});
}
function createJourneyMini(game:Game,now:number,purpose:'tavern'|'letter'){
 const run=game.rpgRun!,j=run.journey!;
 const existing=purpose==='letter'?j.letterMini:j.mini;
 if(!existing||existing.roundIds.length===JOURNEY_TRIAL.miniRounds){
  const human=player(game.players[0].name);human.avatar=game.players[0].avatar;
  const child=room('TAVERN-'+uid(),human,true,3),serin=player(purpose==='letter'?'편지 도둑':'세린',true),guest=player(purpose==='letter'?'골목 구경꾼':'여행자',true);serin.avatar=purpose==='letter'?'stage-portrait:16':'tavern-serin';guest.avatar='stage-portrait:5';
  child.players.push(serin,guest);child.rpgMini={storyOnly:!!run.rework,journeyId:run.id,roundIndex:1,totalRounds:3,reward:0,purpose};start(child,now);
  if(purpose==='letter')j.letterMini={game:child,roundIds:[],lastReward:0};else j.mini={game:child,roundIds:[],lastReward:0};
 }
 j.miniKind=purpose;j.location='mini-game';run.updatedAt=now;
}
/** Derive legacy completed losses as well as newly recorded results. */
export function letterQuestView(j:RpgJourneyState):LetterQuest|undefined{
 const quest=j.letterQuest,mini=j.letterMini;
 if(quest?.step!=='alley'||!mini||mini.roundIds.length!==JOURNEY_TRIAL.miniRounds)return quest;
 const outcome=letterDuelOutcome(mini.game.players);
 return outcome==='third'?{step:'failed',defeated:true}:outcome==='second'?{...quest,defeated:true}:quest;
}
export function startJourneyMini(game:Game,now=Date.now()){const {run}=journeyGame(game);assertJourneyTavern(run);createJourneyMini(game,now,'tavern');}
export function startLetterDuel(game:Game,now=Date.now()){
 const {run,j}=journeyGame(game);if(j.location!=='market-alley'||letterQuestView(j)?.step!=='alley'||run.status!=='ready')throw Error('시장 뒤 골목에서 편지 내기를 시작할 수 있어요.');
 j.letterQuest=letterQuestView(j);createJourneyMini(game,now,'letter');
}
export function activeJourneyMini(game:Game){const j=game.rpgRun?.journey;if(j?.location!=='mini-game')return undefined;return (j.miniKind==='letter'?j.letterMini:j.mini)?.game;}
function activeMiniState(j:RpgJourneyState){return j.miniKind==='letter'?j.letterMini:j.mini;}
export function settleJourneyMini(game:Game,now=Date.now()){
 const {run,j}=journeyGame(game),mini=activeMiniState(j),child=mini?.game;
 if(j.location!=='mini-game'||!mini||!child||child.phase!=='ended'||!child.result||mini.roundIds.includes(child.result.id))return;
 mini.roundIds.push(child.result.id);
 if(mini.roundIds.length===JOURNEY_TRIAL.miniRounds){
  if(j.miniKind==='letter'){
   const outcome=letterDuelOutcome(child.players),won=outcome==='win';
   mini.lastReward=0;child.rpgMini!.reward=0;child.rpgMini!.won=won;
   j.letterQuest=won?{step:'recovered'}:outcome==='third'?{step:'failed',defeated:true}:{step:'alley',defeated:true};
   run.updatedAt=now;return;
  }
  const rank=1+child.players.slice(1).filter(p=>(p.points||0)>(child.players[0].points||0)).length;
  mini.lastReward=run.rework?0:j.tavernRewardPaid?0:JOURNEY_TRIAL.miniRewards[rank-1];run.coins+=mini.lastReward;j.tavernRewardPaid=true;child.rpgMini!.reward=mini.lastReward;
 }
 run.updatedAt=now;
}
export function nextJourneyMiniRound(game:Game,now=Date.now()){
 const {j}=journeyGame(game),mini=activeMiniState(j);
 if(j.location!=='mini-game'||!mini||mini.game.phase!=='ended'||mini.roundIds.length>=JOURNEY_TRIAL.miniRounds||!mini.game.result||!mini.roundIds.includes(mini.game.result.id))throw Error('이번 승부의 결과를 먼저 확인해 주세요.');
 start(mini.game,now);mini.game.rpgMini!.roundIndex=mini.roundIds.length+1;
}
export function leaveJourneyMini(game:Game){const {run,j}=journeyGame(game);if(j.location!=='mini-game')throw Error('진행 중인 승부가 없어요.');if(j.miniKind==='letter'){const resolved=['recovered','failed'].includes(letterQuestView(j)?.step||'');j.location=resolved?'tavern':'market-alley';if(resolved){j.completedNodes=[...new Set<JourneyNode>([...j.completedNodes,'letter-alley'])];j.currentNode='tavern';}}else j.location='tavern';j.miniKind=undefined;run.updatedAt=Date.now();}
export function journeyDisplayGame(game:Game){return activeJourneyMini(game)||game;}
/** Reject unsupported/corrupt new journey data without rewriting the original storage. */
export function validateJourneySave(game:Game){
 const run=game.rpgRun,j=run?.journey;if(run){restoreStoryCards(run);restoreDemoReward(run);}if(!j)return;
 restoreRetiredJourneyNodes(run);
 const nodes=new Set<JourneyNode>(JOURNEY_NODES.map(node=>node.id)),unique=(items:unknown)=>Array.isArray(items)&&new Set(items).size===items.length;
 if(j.seenScenes!==undefined&&(!Array.isArray(j.seenScenes)||!j.seenScenes.every(id=>typeof id==='string'&&(/^ST([1-9]|10)_POST$/.test(id)||id===ST3_STORY_KEY))))throw Error('이야기 감상 기록의 형식이 올바르지 않아요.');
 const invalid=()=>{throw Error('탐험 여정의 저장 형식이 올바르지 않거나 지원하지 않는 버전이에요. 기존 데이터는 보존했어요.');};
 if(!unique(run.relics)||!unique(run.equipped)||run.equipped.length>3||run.equipped.some(id=>!run.relics.includes(id))||!Array.isArray(run.consumables))invalid();
 if(j.livesVersion===undefined){if(!run.rework&&run.fate===0&&!['game-over','complete','abandoned'].includes(run.status))run.fate=3;j.livesVersion=1;}if(j.livesVersion!==1||!Number.isInteger(run.fate)||run.fate<0||run.fate>3||j.retryStage!==undefined&&(!Number.isInteger(j.retryStage)||j.retryStage!==run.stage||j.location!=='map'||run.status!=='playing'))invalid();
 if(!run.phaseOne||j.version!==1||!['map','tavern','market-alley','wayfarer-stop','watchtower','battle','mini-game','story-quest','dice-den'].includes(j.location)||!nodes.has(j.currentNode)||!unique(j.startedStages)||!j.startedStages.every(stage=>Number.isInteger(stage)&&stage>=1&&stage<=10)||!unique(j.completedNodes)||!j.completedNodes.every(node=>nodes.has(node))||!Array.isArray(j.rumors)||!j.rumors.every(id=>typeof id==='string')||typeof j.tavernRewardPaid!=='boolean'||j.wayfarerHerbGiven!==undefined&&typeof j.wayfarerHerbGiven!=='boolean'||j.watchtowerRelicFound!==undefined&&typeof j.watchtowerRelicFound!=='boolean'||j.watchtowerRelicClaimed!==undefined&&typeof j.watchtowerRelicClaimed!=='boolean'||j.watchtowerRelicClaimed&&!j.watchtowerRelicFound)invalid();
 if(j.location==='mini-game'&&(j.miniKind!==undefined&&!['tavern','letter'].includes(j.miniKind)||j.miniKind==='letter'&&!j.letterMini||j.miniKind!=='letter'&&!j.mini))invalid();
 if(j.letterQuest!==undefined&&(!['alley','recovered','complete','failed'].includes(j.letterQuest.step)||j.letterQuest.defeated!==undefined&&typeof j.letterQuest.defeated!=='boolean'))invalid();
 if(j.villageRequestReward!==undefined&&j.villageRequestReward!=='coins'&&j.villageRequestReward!=='heal')invalid();
 if(j.story!==undefined&&(!Number.isInteger(j.story.runNumber)||j.story.runNumber<1||typeof j.story.quests!=='object'||!j.story.quests||Object.entries(j.story.quests).some(([key,value])=>!isStoryQuestId(key)||value!=='read'&&value!=='skip')||j.story.secondPlaceSeen!==undefined&&typeof j.story.secondPlaceSeen!=='boolean'))invalid();
 if(j.location==='story-quest'&&!isStoryQuestId(j.currentNode))invalid();
 const den=j.diceDen;if(den!==undefined&&(!den||typeof den!=='object'||!Number.isInteger(den.losses)||den.losses<0||den.relicClaimed!==undefined&&typeof den.relicClaimed!=='boolean'||den.result!==undefined&&!['win','lose','draw','forfeit'].includes(den.result)||den.match!==undefined&&!validYachtMatch(den.match)))invalid();
 if(j.location==='dice-den'&&j.currentNode!=='dice-den')invalid();
 for(const mini of [j.mini,j.letterMini].filter((value):value is JourneyMini=>!!value)){const child=mini.game,meta=child?.rpgMini;
  if(!child||!child.practice||child.rpgRun||child.hpItemMode||child.stageRun||child.itemRun||!Array.isArray(child.players)||child.players.length!==3||!child.players.every(p=>Array.isArray(p.hand)&&typeof p.id==='string'&&typeof p.token==='string')||!Array.isArray(child.stacks)||!['playing','ended'].includes(child.phase)||!unique(mini.roundIds)||mini.roundIds.length>3||!mini.roundIds.every(id=>typeof id==='string')||!meta||meta.journeyId!==run.id||meta.totalRounds!==3||!Number.isInteger(meta.roundIndex)||meta.roundIndex<1||meta.roundIndex>3||!Number.isFinite(meta.reward)||meta.reward<0||!Number.isFinite(mini.lastReward)||mini.lastReward<0)invalid();
 }
}
