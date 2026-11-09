import type {RpgRun} from './rpg.ts';
import {stageTheme} from './stage-theme.ts';

/**
 * RPG journey ST4~10 (story bible v1.4, 2026-11-08). Story/cast/quests only:
 * gameplay numbers and rules stay with rpg-rework.ts (the bible's HP/1v1 notes are obsolete).
 */
export type JourneyRegion=1|2|3|4;
export const JOURNEY_REGIONS:Record<JourneyRegion,{name:string,stages:readonly number[]}>={
 1:{name:'철문의 영역',stages:[1,2,3]},
 2:{name:'성화의 영역',stages:[4,5,6]},
 3:{name:'열쇠의 영역',stages:[7,8,9]},
 4:{name:'왕관의 영역',stages:[10]},
};
export const JOURNEY_STAGE_NAMES:Record<number,string>={1:'마을 관문',2:'마을 광장',3:'북쪽 성채',4:'물안개 폭포',5:'구름다리 쉼터',6:'수호자의 회랑',7:'달빛 고목',8:'별빛 성소',9:'잿불 제단',10:'붉은 세계수'};
export function stageRegion(stage:number):JourneyRegion{return stage<=3?1:stage<=6?2:stage<=9?3:4;}
/** The stage the map is heading to (or fighting) decides which region map is shown. */
export function journeyTargetStage(run:Pick<RpgRun,'stage'|'status'|'journey'>){
 const retry=run.journey?.retryStage;if(retry)return retry;
 return Math.min(10,run.status==='ready'?run.stage+1:run.stage);
}
export function journeyRegion(run:Pick<RpgRun,'stage'|'status'|'journey'>):JourneyRegion{return stageRegion(journeyTargetStage(run));}

/** ST10's two identical guardians are story-only aliases; the challenge-mode cast is untouched. */
export const RPG_GUARDIANS=[
 {name:'첫 번째 수호자',avatar:'stage-portrait:15'},
 {name:'두 번째 수호자',avatar:'stage-portrait:15'},
] as const;
/** RPG seat picks per stage (indices into stage-theme opponents). ST3 twins and ST10 guardians are separate. */
const RPG_CAST_PICKS:Record<number,readonly [number,number]>={4:[0,1],5:[0,1],6:[0,1],7:[0,1],8:[2,0],9:[1,0]};
export function rpgStageCast(stage:number){
 const picks=RPG_CAST_PICKS[stage];if(!picks)return null;
 const cast=stageTheme(stage).opponents;return picks.map(index=>cast[index]);
}

export type StoryQuestId='quest-4'|'quest-5'|'quest-6'|'quest-8'|'quest-9';
export type StoryQuestChoice='read'|'skip';
export type StoryQuestState={runNumber:number,quests:Partial<Record<StoryQuestId,StoryQuestChoice>>,secondPlaceSeen?:boolean};
type QuestDef={id:StoryQuestId,stage:number,name:string,speaker:string,title:string,intro:readonly string[],choices:Record<StoryQuestChoice,string>,results:Record<StoryQuestChoice,readonly string[]>,resultSpeakers?:Partial<Record<StoryQuestChoice,readonly string[]>>};
/** Optional quests: no HP, relic or currency rewards; skipping never blocks the main story. */
export const STORY_QUESTS:readonly QuestDef[]=[
 {id:'quest-4',stage:4,name:'물에 젖은 기록',speaker:'네아',title:'물에 젖은 기록',
  intro:['물길에서 건진 낡은 기록이 있어. 글은 다 번졌지만 문양만 남았지.','말려서 살펴보면 몇 글자쯤은 읽힐지도 몰라. 시간을 좀 쓸 텐데, 어때?'],
  choices:{read:'기록을 말려 살핀다',skip:'계속 길을 간다'},
  results:{read:['젖은 종이 끝자락에서 겨우 몇 글자가 읽혔다.','“둘이… 한 문을…”','글은 거기서 끊겨 있었다. 물길은 위쪽 구름다리로 이어진다.'],skip:['기록은 네아에게 맡겨 두었다.','물길은 위쪽 구름다리로 이어진다.']}},
 {id:'quest-5',stage:5,name:'끊긴 매듭',speaker:'타래',title:'끊긴 매듭',
  intro:['날마다 고치는데도 이쪽 매듭만 먼저 끊어져.','손이 하나 더 있으면 금방인데… 좀 도와줄래?'],
  choices:{read:'다리 수선을 돕는다',skip:'그냥 지나간다'},
  results:{read:['타래와 함께 닳은 매듭을 다시 엮었다.','반대편 매듭은 손도 대지 않았는데 여전히 단단했다.','“고마워. 이상하지? 저쪽은 매번 버텨 준다니까.”'],skip:['다리는 바람에 크게 흔들렸다.','그래도 반대편 매듭이 끝까지 버텨 주었다.']},resultSpeakers:{read:['','','타래']}},
 {id:'quest-6',stage:6,name:'잊힌 맹세',speaker:'태엽',title:'잊힌 맹세',
  intro:['이름 필드: 손상. 수행할 의무: 정상.','열람 가능한 장부: 한 권. 열람하시겠습니까?'],
  choices:{read:'낡은 장부를 확인한다',skip:'카르덴에게 곧장 간다'},
  results:{read:['장부의 이름 칸은 모두 긁혀 지워져 있었다.','마지막 장에 한 줄만 남아 있었다.','“뒤에 남은 자에게 맡긴다.”'],skip:['태엽은 장부를 조용히 덮었다.','“열람 기록: 없음. 의무 수행: 계속.”']},resultSpeakers:{skip:['','태엽']}},
 {id:'quest-8',stage:8,name:'전해지지 못한 편지',speaker:'엘라',title:'전해지지 못한 편지',
  intro:['사람의 이름은 잊혀도, 누군가 걸었던 길은 남는 법이란다.','보관함에 아직 주인을 찾지 못한 편지가 하나 있어. 읽어 보겠니?'],
  choices:{read:'편지를 읽는다',skip:'봉인한 채 둔다'},
  results:{read:['편지에는 먼저 이 길을 지난 여행자의 짧은 기록이 적혀 있었다.','“문양을 따라 여기까지 왔다. 끝에 무엇이 있든, 누군가에게는 전해야겠다.”'],skip:['편지는 봉인된 채 보관함으로 돌아갔다.','엘라는 아무것도 묻지 않았다.']}},
 {id:'quest-9',stage:9,name:'마지막 불씨',speaker:'재온',title:'마지막 불씨',
  intro:['첫 번째가 문을 닫았다는 말은 들었지. 하지만 불이 왜 꺼지지 않는지는 아무도 몰라.','제단에 남은 흔적을 같이 보겠나? 아니면 바로 승부로 가도 좋아.'],
  choices:{read:'흔적을 살핀다',skip:'바로 승부한다'},
  results:{read:['제단의 물빛 기록과 성화의 재가 같은 무늬를 그리고 있었다.','두 문양이 맞물릴 때에만 온전한 그림이 되었다.'],skip:['재온은 어깨를 으쓱하고 제단 앞 테이블을 가리켰다.']}},
];
export function storyQuest(id:string){return STORY_QUESTS.find(quest=>quest.id===id);}
export function isStoryQuestId(id:unknown):id is StoryQuestId{return typeof id==='string'&&STORY_QUESTS.some(quest=>quest.id===id);}
export function storyState(run:Pick<RpgRun,'journey'>):StoryQuestState{return run.journey?.story||{runNumber:1,quests:{}};}

/**
 * Art slots. Each key has a final responsive pair (to be generated in the approved cartoon tone)
 * and a placeholder from existing assets. Add a key to READY once its final files exist.
 */
const FINAL=(key:string)=>({landscape:`/story/${key}-wide-v1.png`,portrait:`/story/${key}-portrait-v1.png`});
const ENV=(stage:number)=>({landscape:`/environments/stage-${stage}-055.webp`,portrait:`/environments/stage-${stage}-055.webp`});
const TAVERN={landscape:'/prologue/tavern-interior-v2.webp',portrait:'/prologue/tavern-interior-portrait-v1.webp'};
export const CHAPTER_ART_SLOTS:Record<string,{placeholder:{landscape:string,portrait:string},note:string}>={
 'region-2-map':{placeholder:ENV(5),note:'성화의 영역 지도 (ST4 폭포 · ST5 구름다리 · ST6 회랑)'},
 'region-3-map':{placeholder:ENV(8),note:'열쇠의 영역 지도 (ST7 고목 · ST8 성소 · ST9 제단)'},
 'region-4-map':{placeholder:ENV(10),note:'왕관의 영역 지도 (붉은 세계수)'},
 ...Object.fromEntries([4,5,6,7,8,9,10].flatMap(stage=>[
  [`st${stage}-before`,{placeholder:ENV(stage),note:`ST${stage} ${JOURNEY_STAGE_NAMES[stage]} · 승부 전`}],
  [`st${stage}-after`,{placeholder:ENV(stage),note:`ST${stage} ${JOURNEY_STAGE_NAMES[stage]} · 승리 후`}],
 ])),
 ...Object.fromEntries(STORY_QUESTS.map(quest=>[quest.id,{placeholder:ENV(quest.stage),note:`서브퀘스트 · ${quest.name} (${quest.speaker})`}])),
 'dice-den':{placeholder:ENV(4),note:'서브퀘스트 · 안개 나루 주사위판 (폭포 아래 나룻배 창고, 노름꾼 하로와 요트다이스)'},
 'st6-flame-two':{placeholder:ENV(6),note:'ST6 받침대 위 성화 2 발견'},
 'st9-key-two':{placeholder:ENV(9),note:'ST9 그을린 받침대 속 비밀의 열쇠 2'},
 'ending-thrones':{placeholder:ENV(10),note:'ST10 비어 있는 두 왕좌'},
 'ending-kings':{placeholder:ENV(10),note:'두 왕의 마지막 순간 (철문 앞의 형 · 성화 앞의 아우)'},
 'ending-handoff':{placeholder:TAVERN,note:'노르문 주점 · 첫 방랑자가 새 방랑자에게 왕관 2를 건넴'},
 'true-ending-record':{placeholder:ENV(10),note:'진엔딩 · 낡은 테이블 위 최초의 승부사의 기록'},
 'true-ending-village':{placeholder:TAVERN,note:'진엔딩 · 노르문 주점에서 이야기를 전하는 새 방랑자'},
};
export const CHAPTER_ART_READY=new Set<string>([]);
export function chapterArt(key:string){const slot=CHAPTER_ART_SLOTS[key];if(!slot)throw Error(`Unknown chapter art: ${key}`);return CHAPTER_ART_READY.has(key)?FINAL(key):slot.placeholder;}
export function chapterArtFinalPaths(key:string){return FINAL(key);}
