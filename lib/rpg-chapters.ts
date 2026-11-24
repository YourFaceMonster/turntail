import type {RpgRun} from './rpg.ts';
import {stageTheme} from './stage-theme.ts';
import {STORY_CARD_CHAPTER_ART} from './rpg-story-card-art.ts';
import {tr} from './i18n/index.ts';

/**
 * RPG journey ST4~10 (story bible v1.4, 2026-11-08). Story/cast/quests only:
 * gameplay numbers and rules stay with rpg-rework.ts (the bible's HP/1v1 notes are obsolete).
 */
export type JourneyRegion=1|2|3|4;
export const JOURNEY_REGIONS:Record<JourneyRegion,{name:string,stages:readonly number[]}>={
 1:{name:tr('철문의 영역'),stages:[1,2,3]},
 2:{name:tr('성화의 영역'),stages:[4,5,6]},
 3:{name:tr('열쇠의 영역'),stages:[7,8,9]},
 4:{name:tr('왕관의 영역'),stages:[10]},
};
export const JOURNEY_STAGE_NAMES:Record<number,string>={1:tr('마을 관문'),2:tr('마을 광장'),3:tr('북쪽 성채'),4:tr('물안개 폭포'),5:tr('구름다리 쉼터'),6:tr('수호자의 회랑'),7:tr('달빛 고목'),8:tr('별빛 성소'),9:tr('잿불 제단'),10:tr('붉은 세계수')};
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
/** Keep saved avatar IDs and combat professions; the ST10 portrait is display-only. */
export const RPG_GUARDIAN_ART='/story/st10-guardian-v1.webp';
/** RPG seat picks per stage (indices into stage-theme opponents). ST3 twins and ST10 guardians are separate. */
const RPG_CAST_PICKS:Record<number,readonly [number,number]>={4:[0,1],5:[0,1],6:[0,1],7:[0,1],8:[2,0],9:[1,0]};
export function rpgStageCast(stage:number){
 const picks=RPG_CAST_PICKS[stage];if(!picks)return null;
 const cast=stageTheme(stage).opponents;return picks.map(index=>cast[index]);
}

export type StoryQuestId='quest-4'|'quest-5'|'quest-6'|'quest-8'|'quest-9';
export type StoryQuestChoice='read'|'skip';
/** Short hands-on story events (2026-11-13 workorder): quest puzzles plus the ST7 ledger inside its cutscene. */
export type StoryEventId='quest-4'|'quest-5'|'st7-ledger'|'quest-8'|'quest-9';
export type StoryEventResult='solved'|'skipped';
export const STORY_EVENT_IDS:readonly StoryEventId[]=['quest-4','quest-5','st7-ledger','quest-8','quest-9'];
export function isStoryEventId(id:unknown):id is StoryEventId{return typeof id==='string'&&(STORY_EVENT_IDS as readonly string[]).includes(id);}
export type StoryQuestState={runNumber:number,quests:Partial<Record<StoryQuestId,StoryQuestChoice>>,secondPlaceSeen?:boolean,events?:Partial<Record<StoryEventId,StoryEventResult>>};
/** Extra quest result lines once the hands-on event was solved (never a reward). */
export const STORY_EVENT_RESULT_LINES:Partial<Record<StoryEventId,readonly string[]>>={
 'quest-4':[tr('세 조각을 이어 붙이자 한 줄이 이어졌다.'),tr('“둘이… 한 문을… 나누어 맡았다.”'),tr('누가 무엇을 맡았는지는, 아직 알 수 없었다.')],
 'quest-5':[tr('세 매듭이 단단히 조여졌다. 다리가 한결 덜 흔들렸다.')],
 'quest-8':[tr('편지함, 별자리판, 봉인된 상자. 세 곳 모두에 같은 문양이 남아 있었다.'),tr('먼저 지나간 여행자는 문양을 따라 여기까지 온 것이다.')],
 'quest-9':[tr('왕관과 철문이 맞물리자 제단 앞면의 새김과 똑같은 무늬가 되었다.')],
};
type QuestDef={id:StoryQuestId,stage:number,name:string,speaker:string,title:string,intro:readonly string[],choices:Record<StoryQuestChoice,string>,results:Record<StoryQuestChoice,readonly string[]>,resultSpeakers?:Partial<Record<StoryQuestChoice,readonly string[]>>};
/** Optional quests: no HP, relic or currency rewards; skipping never blocks the main story. */
export const STORY_QUESTS:readonly QuestDef[]=[
 {id:'quest-4',stage:4,name:tr('물에 젖은 기록'),speaker:'네아',title:tr('물에 젖은 기록'),
  intro:[tr('물길에서 건진 낡은 기록이 있어. 글은 다 번졌지만 문양만 남았지.'),tr('말려서 살펴보면 몇 글자쯤은 읽힐지도 몰라. 시간을 좀 쓸 텐데, 어때?')],
  choices:{read:tr('기록을 말려 살핀다'),skip:tr('계속 길을 간다')},
  results:{read:[tr('젖은 종이 끝자락에서 겨우 몇 글자가 읽혔다.'),tr('“둘이… 한 문을…”'),tr('글은 거기서 끊겨 있었다. 물길은 위쪽 구름다리로 이어진다.')],skip:[tr('기록은 네아에게 맡겨 두었다.'),tr('물길은 위쪽 구름다리로 이어진다.')]}},
 {id:'quest-5',stage:5,name:tr('끊긴 매듭'),speaker:'타래',title:tr('끊긴 매듭'),
  intro:[tr('날마다 고치는데도 이쪽 매듭만 먼저 끊어져.'),tr('손이 하나 더 있으면 금방인데… 좀 도와줄래?')],
  choices:{read:tr('다리 수선을 돕는다'),skip:tr('그냥 지나간다')},
  results:{read:[tr('타래와 함께 닳은 매듭을 다시 엮었다.'),tr('반대편 매듭은 손도 대지 않았는데 여전히 단단했다.'),tr('“고마워. 이상하지? 저쪽은 매번 버텨 준다니까.”')],skip:[tr('다리는 바람에 크게 흔들렸다.'),tr('그래도 반대편 매듭이 끝까지 버텨 주었다.')]},resultSpeakers:{read:['','','타래']}},
 {id:'quest-6',stage:6,name:tr('잊힌 맹세'),speaker:'태엽',title:tr('잊힌 맹세'),
  intro:[tr('이름 필드: 손상. 수행할 의무: 정상.'),tr('열람 가능한 장부: 한 권. 열람하시겠습니까?')],
  choices:{read:tr('낡은 장부를 확인한다'),skip:tr('카르덴에게 곧장 간다')},
  results:{read:[tr('장부의 이름 칸은 모두 긁혀 지워져 있었다.'),tr('마지막 장에 한 줄만 남아 있었다.'),tr('“뒤에 남은 자에게 맡긴다.”')],skip:[tr('태엽은 장부를 조용히 덮었다.'),tr('“열람 기록: 없음. 의무 수행: 계속.”')]},resultSpeakers:{skip:['','태엽']}},
 {id:'quest-8',stage:8,name:tr('전해지지 못한 편지'),speaker:'엘라',title:tr('전해지지 못한 편지'),
  intro:[tr('사람의 이름은 잊혀도, 누군가 걸었던 길은 남는 법이란다.'),tr('보관함에 아직 주인을 찾지 못한 편지가 하나 있어. 읽어 보겠니?')],
  choices:{read:tr('편지를 읽는다'),skip:tr('봉인한 채 둔다')},
  results:{read:[tr('편지에는 먼저 이 길을 지난 여행자의 짧은 기록이 적혀 있었다.'),tr('“문양을 따라 여기까지 왔다. 끝에 무엇이 있든, 누군가에게는 전해야겠다.”')],skip:[tr('편지는 봉인된 채 보관함으로 돌아갔다.'),tr('엘라는 아무것도 묻지 않았다.')]}},
 {id:'quest-9',stage:9,name:tr('마지막 불씨'),speaker:'재온',title:tr('마지막 불씨'),
  intro:[tr('첫 번째가 문을 닫았다는 말은 들었지. 하지만 불이 왜 꺼지지 않는지는 아무도 몰라.'),tr('제단에 남은 흔적을 같이 보겠나? 아니면 바로 승부로 가도 좋아.')],
  choices:{read:tr('흔적을 살핀다'),skip:tr('바로 승부한다')},
  results:{read:[tr('제단의 물빛 기록과 성화의 재가 같은 무늬를 그리고 있었다.'),tr('두 문양이 맞물릴 때에만 온전한 그림이 되었다.')],skip:[tr('재온은 어깨를 으쓱하고 제단 앞 테이블을 가리켰다.')]}},
];
export function storyQuest(id:string){return STORY_QUESTS.find(quest=>quest.id===id);}
export function isStoryQuestId(id:unknown):id is StoryQuestId{return typeof id==='string'&&STORY_QUESTS.some(quest=>quest.id===id);}
export function storyState(run:Pick<RpgRun,'journey'>):StoryQuestState{return run.journey?.story||{runNumber:1,quests:{}};}

/**
 * Art slots. Each key has a final responsive pair (to be generated in the approved cartoon tone)
 * and a placeholder from existing assets. Add a key to READY once its final files exist.
 * The app references WebP only; keep the generated PNG beside it in public/story as the original.
 */
/** Region maps were redrawn at 1024×1600 (v2) to fill the space between the map HUD and dock on phones. */
/** v2 recolours the painted emblems to the game tile colours (crown red, iron navy, flame orange, key green). */
/** v3 (2026-11-13): region 2·3 maps gain the inn buildings (local patch only; every other pixel unchanged). */
/** 2026-11-16 Codex repaint: cutscene tiles now show number+emblem faces and each stage's own back (docs/codex-art-request-2026-11-16-cutscene-tiles.md). */
const ART_VERSION:Record<string,number>={'region-2-map':3,'region-3-map':3,'region-4-map':2,'st4-after':2,'st6-before':3,'st7-after':2,'st8-after':2,'st9-after':4,'quest-9':2,'st4-before':2,'st5-before':2,'st7-before':2,'st8-before':2,'st9-before':2,'st10-after':2,'st4-duel':2,'st5-duel':2,'st6-duel':2,'st7-duel':2,'st8-duel':2,'st9-duel':2,'st10-duel':2};
const WIDE_VERSION:Record<string,number>={'st4-before':2,'st5-before':2,'st6-before':2,'st7-before':2,'st8-before':2,'st9-before':2,'st9-after':2,'st10-after':2,'st4-duel':2,'st5-duel':2,'st6-duel':2,'st7-duel':2,'st8-duel':2,'st9-duel':2,'st10-duel':2};
const FINAL=(key:string)=>STORY_CARD_CHAPTER_ART[key]||({landscape:`/story/${key}-wide-v${WIDE_VERSION[key]||1}.webp`,portrait:`/story/${key}-portrait-v${ART_VERSION[key]||1}.webp`});
/**
 * 2026-11-17 Codex batch 4: one character alone, upper body, per mood (docs/codex-art-delivery-2026-11-17-cutscene-tiles-batch4.md).
 * A spoken line by one of these speakers shows their own painting; a mood they have no painting for falls back to calm.
 */
export type TalkMood='calm'|'smile'|'serious';
export const TALK_CAST:Record<string,{key:string,stage:number,moods:readonly TalkMood[]}>={
 '네아':{key:'nea',stage:4,moods:['calm','smile']},'수리':{key:'suri',stage:4,moods:['calm','smile','serious']},
 '타래':{key:'tarae',stage:5,moods:['calm','serious']},'하온':{key:'haon',stage:5,moods:['calm','smile','serious']},
 '카르덴':{key:'karden',stage:6,moods:['calm','serious','smile']},'세라':{key:'sera',stage:6,moods:['calm','serious']},'태엽':{key:'taeyeop',stage:6,moods:['calm','serious']},
 '루엔':{key:'ruen',stage:7,moods:['calm','smile','serious']},'시온':{key:'sion',stage:7,moods:['calm','smile']},
 '엘라':{key:'ella',stage:8,moods:['calm','smile']},'아스텔':{key:'astel',stage:8,moods:['calm','smile','serious']},
 '재온':{key:'jaeon',stage:9,moods:['calm','serious','smile']},'오닉':{key:'onik',stage:9,moods:['calm','serious']},
 '첫 번째 수호자':{key:'guardian-1',stage:10,moods:['calm','serious','smile']},'두 번째 수호자':{key:'guardian-2',stage:10,moods:['calm','serious']},
};
export const talkArtKey=(key:string,mood:TalkMood)=>`talk-${key}-${mood}`;
/** Art key for a spoken line, or undefined when the speaker has no talk painting. */
export function talkArt(speaker:string|undefined,mood:TalkMood='calm'){const cast=speaker?TALK_CAST[speaker]:undefined;if(!cast)return undefined;return talkArtKey(cast.key,cast.moods.includes(mood)?mood:'calm');}
const ENV=(stage:number)=>({landscape:`/environments/stage-${stage}-055.webp`,portrait:`/environments/stage-${stage}-055.webp`});
const TAVERN={landscape:'/prologue/tavern-interior-v2.webp',portrait:'/prologue/tavern-interior-portrait-v1.webp'};
export const CHAPTER_ART_SLOTS:Record<string,{placeholder:{landscape:string,portrait:string},note:string}>={
 'region-2-map':{placeholder:ENV(5),note:tr('성화의 영역 지도 (ST4 폭포 · ST5 구름다리 · ST6 회랑)')},
 'region-3-map':{placeholder:ENV(8),note:tr('열쇠의 영역 지도 (ST7 고목 · ST8 성소 · ST9 제단)')},
 'region-4-map':{placeholder:ENV(10),note:tr('왕관의 영역 지도 (붉은 세계수)')},
 ...Object.fromEntries([4,5,6,7,8,9,10].flatMap(stage=>[
  [`st${stage}-before`,{placeholder:ENV(stage),note:tr('ST{0} {1} · 승부 전',{0:stage,1:JOURNEY_STAGE_NAMES[stage]})}],
  [`st${stage}-after`,{placeholder:ENV(stage),note:tr('ST{0} {1} · 승리 후',{0:stage,1:JOURNEY_STAGE_NAMES[stage]})}],
  [`st${stage}-duel`,{placeholder:ENV(stage),note:tr('ST{0} {1} · 승부 직전 클로즈업',{0:stage,1:JOURNEY_STAGE_NAMES[stage]})}],
  [`st${stage}-shuffle`,{placeholder:ENV(stage),note:tr('ST{0} {1} · 패 섞기·나누기',{0:stage,1:JOURNEY_STAGE_NAMES[stage]})}],
  [`st${stage}-result`,{placeholder:ENV(stage),note:tr('ST{0} {1} · 승부 결과',{0:stage,1:JOURNEY_STAGE_NAMES[stage]})}],
 ])),
 ...Object.fromEntries(Object.entries(TALK_CAST).flatMap(([name,cast])=>cast.moods.map(mood=>[talkArtKey(cast.key,mood),{placeholder:ENV(cast.stage),note:tr('ST{0} {1} · 대화 표정 {2}',{0:cast.stage,1:name,2:mood})}]))),
 ...Object.fromEntries(STORY_QUESTS.map(quest=>[quest.id,{placeholder:ENV(quest.stage),note:tr('서브퀘스트 · {0} ({1})',{0:quest.name,1:quest.speaker})}])),
 'dice-den':{placeholder:ENV(4),note:tr('서브퀘스트 · 안개 나루 주사위판 (폭포 아래 나룻배 창고, 노름꾼 하로와 요트다이스)')},
 'st6-flame-two':{placeholder:ENV(6),note:tr('ST6 받침대 위 성화 2 발견')},
 'st6-flame-two-back':{placeholder:ENV(6),note:tr('ST6 성화 2를 뒤집어 두 겹 불꽃 확인')},
 'st9-key-two':{placeholder:ENV(9),note:tr('ST9 그을린 받침대 속 열쇠 2')},
 'st9-key-two-back':{placeholder:ENV(9),note:tr('ST9 열쇠 2를 뒤집어 포개진 열쇠 확인')},
 'ending-thrones':{placeholder:ENV(10),note:tr('ST10 비어 있는 두 왕좌')},
 'ending-kings':{placeholder:ENV(10),note:tr('두 왕의 마지막 순간 (철문 앞의 형 · 성화 앞의 아우)')},
 'ending-handoff':{placeholder:TAVERN,note:tr('노르문 주점 · 여정을 마친 방랑자가 새 방랑자에게 왕관 2를 건넴')},
 'true-ending-record':{placeholder:ENV(10),note:tr('진엔딩 · 낡은 테이블 위 최초의 승부사의 기록')},
 'true-ending-village':{placeholder:TAVERN,note:tr('진엔딩 · 노르문 주점에서 이야기를 전하는 새 방랑자')},
};
/** Portrait and wide (2026-11-14, 1672×941) paintings are both ready for every slot. */
export const CHAPTER_ART_READY=new Set<string>(Object.keys(CHAPTER_ART_SLOTS));
/** Wide screens get the wide painting, tall screens the portrait one. */
export function chapterArt(key:string){const slot=CHAPTER_ART_SLOTS[key];if(!slot)throw Error(`Unknown chapter art: ${key}`);return CHAPTER_ART_READY.has(key)?FINAL(key):slot.placeholder;}
export function chapterArtFinalPaths(key:string){return FINAL(key);}
/**
 * Paintings the player will most likely see next from the map: the stage's "before" scene, its quest
 * (if any) and its "after" scene, in the orientation the screen shows.
 */
export function stageArtToPreload(stage:number,wide=false):string[]{
 if(stage<4||stage>10)return [];
 const talk=Object.values(TALK_CAST).filter(cast=>cast.stage===stage).flatMap(cast=>cast.moods.map(mood=>talkArtKey(cast.key,mood)));
 const keys=[`st${stage}-before`,`st${stage}-shuffle`,`st${stage}-duel`,...STORY_QUESTS.filter(quest=>quest.stage===stage).map(quest=>quest.id),`st${stage}-result`,`st${stage}-after`,...talk];
 return [...new Set(keys.filter(key=>CHAPTER_ART_SLOTS[key]).map(key=>wide?chapterArt(key).landscape:chapterArt(key).portrait))];
}
