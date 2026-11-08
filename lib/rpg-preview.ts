import {settle,start,type Game} from './game.ts';
import {startJourneyMini,activeJourneyMini,settleJourneyMini,nextJourneyMiniRound} from './rpg-journey';
import {enterJourneyNode} from './rpg-game.ts';
import {setJourneyRunNumber,returnJourneyMap,type JourneyNode} from './rpg-journey.ts';
import {STORY_QUESTS,JOURNEY_REGIONS,type JourneyRegion} from './rpg-chapters.ts';
import {settleRpgPhaseOne,chooseRpgStageReward,reconcileRpgEliminations} from './rpg-phase-one.ts';

function finishPreview(game:Game,failed=false){
 if(!game.rpgRun?.rework){reconcileRpgEliminations(game);return;}
 game.rpgRun.status='playing';game.rpgRun.hp=failed?[1,50,50]:[70,1,1];game.rpgRun.roundHealth={round:game.round,before:[...game.rpgRun.hp],damage:[0,0,0],healing:[0,0,0],moneyDamage:[0,0,0],coinsBefore:0};game.result=null;game.winner=failed?1:0;game.phase='ended';
 game.players.forEach((p,seat)=>p.hand=failed?(seat===0?p.hand.slice(0,5):[]):seat===0?[]:p.hand.slice(0,4));settle(game);
}
export type RpgPreviewMode='screens'|'one-round';
type StageNo=1|2|3|4|5|6|7|8|9|10;
export type RpgPreviewScreen='prologue'|'prologue-2'|'map'|'map-2'|'map-3'|'map-4'|'tavern'|`battle-${StageNo}`|`reward-${Exclude<StageNo,10>}`|'quest-4'|'quest-5'|'quest-6'|'quest-8'|'quest-9'|'ending-1'|'ending-2'|'failed'|'mini-round'|'mini-final';
const STAGES=[1,2,3,4,5,6,7,8,9,10] as const;
/** Every screen shortcut, in menu order (ST1~10 battles, rewards, quests, region maps and both endings). */
export const RPG_PREVIEW_SCREENS:readonly {id:RpgPreviewScreen,label:string}[]=[
 {id:'tavern',label:'주점 바로 보기'},{id:'map',label:'지도 보기 · 철문의 영역'},
 ...([2,3,4] as const).map(region=>({id:`map-${region}` as RpgPreviewScreen,label:`지도 보기 · ${JOURNEY_REGIONS[region as JourneyRegion].name}`})),
 {id:'prologue',label:'프롤로그 다시 보기'},{id:'prologue-2',label:'2회차 프롤로그'},
 ...STAGES.map(stage=>({id:`battle-${stage}` as RpgPreviewScreen,label:`ST${stage} 전투 화면`})),
 ...STORY_QUESTS.map(quest=>({id:quest.id as RpgPreviewScreen,label:`ST${quest.stage} 서브퀘스트 · ${quest.name}`})),
 ...STAGES.filter(stage=>stage<10).map(stage=>({id:`reward-${stage}` as RpgPreviewScreen,label:`ST${stage} 클리어·보상`})),
 {id:'ending-1',label:'ST10 클리어 · 정상 엔딩'},{id:'ending-2',label:'ST10 클리어 · 2회차 진엔딩'},
 {id:'mini-round',label:'세린 · 이번 판 결과'},{id:'mini-final',label:'세린 · 3판 최종 결과'},{id:'failed',label:'여정 실패'},
];
export function isRpgPreviewScreen(value:unknown):value is RpgPreviewScreen{return RPG_PREVIEW_SCREENS.some(screen=>screen.id===value);}
/** Runtime-only owner. Never attach preview rules to a Game or serialize them. */
export class RpgPreviewSession{
 readonly runId:string;
 private handled=new Set<string>();
 private gear:{relics:string[],equipped:string[],consumables:string[]};
 private initial:Game;
 constructor(game:Game,readonly mode:RpgPreviewMode){
  if(!game.rpgRun?.journey||!game.rpgRun.phaseOne||game.rpgTest||game.hpItemMode)throw Error('화면 테스트용 새 RPG가 필요해요.');
  game.rpgRun.coins=game.rpgRun.rework?0:1000;this.runId=game.rpgRun.id;this.gear=this.equipment(game);this.initial=structuredClone(game);
 }
 owns(game:Game){return game.rpgRun?.id===this.runId&&!game.hpItemMode&&!game.rpgTest;}
 private equipment(game:Game){const run=game.rpgRun!;return {relics:[...run.relics],equipped:[...run.equipped],consumables:[...run.consumables]};}
 screen(game:Game,target:RpgPreviewScreen):Game{
  if(this.mode!=='screens'||!this.owns(game))throw Error('프롤로그·화면 테스트에서만 바로 이동할 수 있어요.');
  if(!isRpgPreviewScreen(target))throw Error('확인할 화면을 선택해 주세요.');
  const quest=STORY_QUESTS.find(q=>q.id===target),region=/^map-(\d)$/.exec(target)?.[1];
  const stage=target.startsWith('battle-')||target.startsWith('reward-')?Number(target.split('-')[1]):target.startsWith('ending-')?10:quest?quest.stage:region?JOURNEY_REGIONS[Number(region) as JourneyRegion].stages[0]:target==='failed'?1:2;
  const next=structuredClone(this.initial);
  if(target==='ending-2'||target==='prologue-2')setJourneyRunNumber(next.rpgRun!,2);
  if(target==='prologue-2')return next;
  // Disposable scene fixtures use the existing stage gates. No hand is played,
  // and no fabricated clear is written to the user's RPG archive.
  for(let prior=1;prior<stage;prior++){
   enterJourneyNode(next,`battle-${prior}` as JourneyNode);
   next.rpgRun!.hp=[100,0,0];finishPreview(next);
   next.rpgRun=chooseRpgStageReward(next.rpgRun!,'all',undefined,false,next.rpgRun!.phaseOne?.clear?.relicOffers?.[0]);
  }
  if(target==='failed'){enterJourneyNode(next,'battle-1');next.rpgRun!.fate=1;next.rpgRun!.hp[0]=0;finishPreview(next,true);}
  else if(target.startsWith('reward-')){enterJourneyNode(next,`battle-${stage}` as JourneyNode);next.rpgRun!.hp=[70,0,0];finishPreview(next);next.rpgRun!.journey!.seenScenes=[`ST${stage}_POST`];}
  // Endings: clearing ST10 plays the ending on the result screen (first or second traveller).
  else if(target.startsWith('ending-')){enterJourneyNode(next,'battle-10');next.rpgRun!.hp=[70,0,0];finishPreview(next);}
  else if(quest)enterJourneyNode(next,quest.id);
  else if(region){if(next.rpgRun!.journey!.location!=='map')returnJourneyMap(next);}
  else if(target==='mini-round'||target==='mini-final'){enterJourneyNode(next,'tavern');startJourneyMini(next);const rounds=target==='mini-final'?3:1;for(let n=0;n<rounds;n++){const child=activeJourneyMini(next)!;child.players[0].hand=[];child.players[1].hand=child.players[1].hand.slice(0,3);child.players[2].hand=child.players[2].hand.slice(0,5);child.winner=0;child.phase='ended';settle(child);settleJourneyMini(next);if(n<rounds-1)nextJourneyMiniRound(next);}}

  else if(target==='tavern')enterJourneyNode(next,'tavern');
  else if(target.startsWith('battle-'))enterJourneyNode(next,target as JourneyNode);
  next.rpgRun!.coins=next.rpgRun!.rework?0:1000;
  return next;
 }
 update(game:Game){
  if(!this.owns(game))return false;
  const run=game.rpgRun!;
  if(game.phase==='playing'){this.gear=this.equipment(game);return false;}
  if(this.mode!=='one-round'||run.journey?.location!=='battle'&&!run.journey?.retryStage||!game.result||this.handled.has(game.result.id)||run.status==='complete')return false;
  this.handled.add(game.result.id);
  if(run.rework){
   if(run.status!=='allocation'){
    const counted=run.roundIds.includes(game.result.id);run.roundIds=run.roundIds.filter(id=>id!==game.result!.id);if(counted)run.rounds=Math.max(0,run.rounds-1);finishPreview(game);
   }
   game.rpgRun=chooseRpgStageReward(game.rpgRun!,'relic',undefined,false,game.rpgRun!.phaseOne!.clear!.relicOffers?.[0]);
   game.log=['TEST · 한 판 완료 · 저장하지 않는 화면 검증',...game.log].slice(0,40);return true;
  }
  if(run.status!=='allocation'){
   // Settlement may already have recorded a losing round and removed its gear.
   // Reuse the real clear/reward routines exactly once in this disposable run.
   const counted=run.roundIds.includes(game.result.id);if(run.journey?.retryStage){run.journey={...run.journey,retryStage:undefined,location:'battle',startedStages:[...new Set([...run.journey.startedStages,run.stage])]};}
   game.rpgRun=settleRpgPhaseOne({...run,...(run.status==='game-over'?this.gear:{}),hp:[100,0,0],status:'playing',
    roundIds:run.roundIds.filter(id=>id!==game.result!.id),rounds:Math.max(0,run.rounds-(counted?1:0)),
    phaseOne:{...run.phaseOne!,eliminated:[1,2]}},counted?{...game.result,players:game.result.players.map(player=>({...player,delta:0}))}:game.result);
  }
  game.rpgRun=chooseRpgStageReward(game.rpgRun!,'all',undefined,false,game.rpgRun!.phaseOne?.clear?.relicOffers?.[0]);
  game.log=['TEST · 한 판 완료 · 승패와 관계없이 다음 여정으로',...game.log].slice(0,40);
  return true;
 }
}
