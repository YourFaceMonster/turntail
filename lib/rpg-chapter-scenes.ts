import {RPG_CONNECTION_SCENES} from './rpg-connection-scenes.ts';
import {storyReadingDuration,type PrologueCut} from './rpg-prologue.ts';
import {JOURNEY_STAGE_NAMES,chapterArt,storyState} from './rpg-chapters.ts';
import type {RpgRun} from './rpg.ts';

/**
 * ST4~10 connection scenes and endings from story bible v1.4. ST1~3 keep their approved cuts;
 * a second journey only appends the bible's short variant lines. Lines are data, never combat.
 */
import type {StoryCardId} from './rpg-story-cards.ts';
type Beat={line:string,speaker?:string,art?:string,keepsake?:[StoryCardId,'front'|'back']};
const N=(line:string,art?:string):Beat=>({line,art});
const S=(speaker:string,line:string,art?:string):Beat=>({speaker,line,art});
/** The keepsake is painted at real card size, so its first sight also shows the card itself up close. */
const K=(line:string,art:string,card:StoryCardId,face:'front'|'back'):Beat=>({line,art,keepsake:[card,face]});
/** visited: the stage's side quest was opened (read or skip), so its NPC must not repeat the quest's opening line. */
type Ctx={second:boolean,read:(id:string)=>boolean,visited:(id:string)=>boolean,secondPlace:boolean,letterReturned:boolean};

function cuts(stage:number,phase:'before'|'after'|'ending',beats:readonly (Beat|false|undefined)[],defaultArt:string):PrologueCut[]{
 return beats.filter((beat):beat is Beat=>!!beat).map((beat,index)=>({
  id:`ST${stage}_${phase==='before'?'PRE':phase==='after'?'POST':'END'}_${index+1}`,scene:'stone',audio:'quiet',
  speaker:beat.speaker,line:beat.line,duration:storyReadingDuration(beat.line),art:chapterArt(beat.art||defaultArt),focus:'50% 45%',...(beat.keepsake?{keepsakeCard:beat.keepsake[0],keepsakeFace:beat.keepsake[1]}:{}),
  location:stage<=10?`STAGE ${stage} · ${JOURNEY_STAGE_NAMES[stage]}`:undefined,
 }));
}

const SCRIPTS:Record<number,{before:(c:Ctx)=>(Beat|false)[],after:(c:Ctx)=>(Beat|false)[]}>={
 4:{
  before:c=>[N('철문을 벗어난 길은 구름 아래로 쏟아지는 폭포에 닿았다.'),c.visited('quest-4')?S('네아','아까 그 기록 말이야. 글은 번졌어도 문양만은 또렷하더라.'):S('네아','물길에서 건진 낡은 기록이 있어. 글은 다 번졌지만 문양만 남았지.'),S('수리','떠내려오는 것들은 대개 어디선가 흘려보낸 거야. 거슬러 올라가 봐.'),S('수리','그 전에 한 판 어때? 물가에선 기다리는 것도 실력이거든.')],
  after:c=>[N('젖은 기록의 표면에 겹친 왕관 흔적이 희미하게 남아 있었다.'),S('방랑자','주점에서 받은 패의 문양과… 같아.'),c.read('quest-4')&&S('방랑자','“둘이… 한 문을…”. 둘이라니, 누구와 누구일까.'),S('네아','마지막 줄은 읽을 수 없네. 하지만 이 기록이 끝나는 곳은 위쪽 다리야.'),S('방랑자','첫 패를 얻은 뒤로, 우연이라고 넘길 일이 많아졌군.'),c.second&&N('기록의 여백에, 누군가 같은 문양을 따라 그린 흔적이 있었다.')],
 },
 5:{
  before:c=>[N('바람이 다리를 흔들었다. 다리의 한쪽 매듭이 닳아 있었다.'),c.read('quest-5')?S('타래','같이 엮은 매듭, 오늘은 좀 버텨 주려나.'):c.visited('quest-5')?S('타래','봤지? 이쪽 매듭은 오늘도 먼저 끊어질 것 같아.'):S('타래','날마다 고치는데도 이쪽만 먼저 끊어져.'),S('하온','그런데 다른 쪽이 매번 버텨 줘. 왜 그런지는 아무도 모르지.'),S('하온','건너기 전에 한 판 하자. 흔들리는 데서 하는 승부도 재밌거든.')],
  after:c=>[S('하온','예전에는 이 다리를 두 사람이 지켰대. 먼저 길을 여는 사람과, 뒤에 남아 기다리는 사람.'),S('방랑자','나중에 남은 사람이… 더 힘들었겠군.'),c.second&&S('타래','전에 왔던 여행자도 매듭 고치는 걸 도와줬어. 너랑 비슷한 패를 갖고 있었지.'),N('다리 건너편, 무너진 기둥 사이로 오래된 회랑이 보였다.')],
 },
 6:{
  before:c=>[S('카르덴','규칙은 단순하다. 마지막까지 지켜내라.'),S('세라','누가 내렸는지 기억 못 하는 명령인데도, 우리는 지키고 있지.'),c.read('quest-6')?S('태엽','방문자 기록: 장부 열람 완료. 수행할 의무: 정상.'):c.visited('quest-6')?S('태엽','방문자 기록: 재방문. 수행할 의무: 정상.'):S('태엽','이름 필드: 손상. 수행할 의무: 정상.'),S('카르덴','테이블에 앉아라. 예법대로 겨룬다.')],
  after:c=>[S('카르덴','그분은 이기지 못했다. 하지만 마지막까지 자리를 떠나지 않았다.'),S('방랑자','누구를 지키고 있었던 거죠?'),S('카르덴','기억나지 않는다. 다만 불꽃이 꺼지지 않아야 한다는 것만은 안다.'),c.read('quest-6')&&S('방랑자','“뒤에 남은 자에게 맡긴다.” 장부의 그 문장이군.'),N('달빛이 떨어지는 오래된 받침대 위에 패 한 장이 놓여 있었다.','st6-flame-two'),K('성화 문양과 숫자 2가 새겨진 패였다.','st6-flame-two','sacred-flame-two','front'),K('패를 뒤집자 꺼지지 않은 두 겹의 불꽃이 새겨져 있었다.','st6-flame-two-back','sacred-flame-two','back'),N('왕관, 철문, 그리고 성화. 테두리도 새김도 꼭 같았다.','st6-flame-two'),c.second&&S('태엽','기록 추가 발견: “첫 번째 승부사, 이곳을 방문.” 이후 기록: 손상.'),N('회랑 끝, 달빛이 고목 위로 길을 비추고 있었다.')],
 },
 7:{
  before:()=>[S('루엔','승자의 이름을 적는 것은 쉬워. 하지만 패한 사람의 선택을 기록하기란 어렵지.'),S('시온','이상한 기록이 하나 있어. 승부에서 두 번째를 한 사람의 자리만 남아 있거든. 이름도 없이.'),N('기록의 2등 자리 옆에는 이름 없이 왕관 표식과 빛바랜 문장만 남아 있었다.'),S('루엔','자, 한 판 하세. 자네가 어느 자리에 앉게 될지 보지.')],
  after:c=>[S('루엔','모두가 첫 번째만 기억하려 할 때, 누군가는 두 번째를 기록했네.'),S('방랑자','왜 두 번째였을까요?'),S('루엔','그 답을 안다면, 이 기록이 왜 남았는지도 알겠지.'),c.secondPlace&&S('루엔','자네도 두 번째 자리에 앉아 봤군. 그 자리에서만 보이는 것이 있지.'),c.second&&N('기록 끝의 주석: “최초”란 놀이를 처음 만든 이가 아니라, 규칙에 뜻을 남긴 이를 부르는 말이다.'),N('고목 너머, 별빛이 모이는 성소가 보였다.')],
 },
 8:{
  before:c=>[c.read('quest-8')?S('엘라','그 편지를 읽었구나. 이름은 없어도, 길은 그렇게 남는 법이란다.'):c.visited('quest-8')?S('엘라','봉인한 편지는 내가 잘 맡아 두마. 언젠가 주인이 찾아오겠지.'):S('엘라','사람의 이름은 잊혀도, 누군가 걸었던 길은 남는 법이란다.'),S('아스텔','몇 년 전에도 같은 무늬를 가진 여행자가 있었어.'),S('아스텔','그 사람도 여기서 한 판 하고 갔지. 너도 그럴 거지?')],
  after:c=>[c.letterReturned?S('방랑자','이 봉인… 모르가 돌려받은 편지의 인장과 모양이 같다.'):S('엘라','노르문에서도 비슷한 봉인을 쓴 기록이 있구나.'),S('엘라','이 사람은 마지막 왕좌 앞에 섰다가 돌아왔다는 기록이 없단다.'),S('방랑자','끝에 무엇이 있었던 걸까요?'),c.read('quest-8')&&S('방랑자','편지에 적힌 그 여행자… 끝까지 갔던 걸까.'),c.second&&S('엘라','그 기록을 남긴 사람은, 지금 네 손에 있는 왕관 2를 가진 사람이란다.'),N('성소 아래, 검은 잿불이 타오르는 제단으로 길이 이어졌다.')],
 },
 9:{
  before:c=>[c.read('quest-9')?S('재온','흔적은 봤겠지. 맞물린 무늬가 무슨 뜻인지는 아직 몰라도.'):c.visited('quest-9')?S('재온','바로 승부를 원한다고 했지. 좋아, 이야기는 끝나고 해도 늦지 않아.'):S('재온','첫 번째가 문을 닫았다는 말은 들었지. 하지만 불이 왜 꺼지지 않는지는 아무도 몰라.'),S('오닉','이 제단의 돌은 두 개의 문양이 맞물릴 때만 온전한 무늬가 돼.'),S('재온','패를 내라. 불씨는 승부 끝에 답을 보여 주곤 하지.')],
  after:c=>[S('재온','첫 번째 왕은 철문을 닫았어.'),S('재온','두 번째 왕은 그 문이 다시 열리지 않도록 자신을 남겼지.'),S('방랑자','그래서 이름까지 남지 않은 건가요?'),S('재온','모른다. 다만 누군가 두 사람을 잊지 않으려 했다는 흔적은 있어.'),c.read('quest-9')&&S('오닉','자네가 본 그 무늬, 맞물린 두 문양 말이야. 그게 이 제단의 전부지.'),N('검게 그을린 받침대 안, 꺼져 가는 불씨 사이에서 패 한 장이 드러났다.','st9-key-two'),K('비밀의 열쇠 2. 불길 속에 있었는데도 그을린 자국 하나 없었다.','st9-key-two','secret-key-two','front'),K('뒷면에는 하나로 포개지는 두 열쇠가 새겨져 있었다.','st9-key-two-back','secret-key-two','back'),c.second&&S('재온','숫자 2를 가장 높이 친 사람이 있었다더군. 이유는… 이제 알 것 같지 않나?'),N('네 장의 패가 가리키는 곳, 붉은 세계수가 구름 위로 솟아 있었다.')],
 },
 10:{
  before:c=>[N('왕관, 철문, 성화, 열쇠. 네 장의 패에 남은 문양이 하나의 기록을 가리켰다.'),S('첫 번째 수호자','너는 무엇을 얻기 위해 여기까지 왔는가?'),S('두 번째 수호자','그리고 무엇을 남기고 떠날 것인가?'),c.second&&S('두 번째 수호자','…같은 패를 든 사람이 또 왔군.')],
  after:c=>c.second?[
   N('두 수호자의 마지막 패가 테이블에 놓였다.','st10-after'),
   N('이번에는 두 왕의 목소리 대신, 낡은 테이블 위에 적힌 기록이 들려왔다.','true-ending-record'),
   S('기록','나는 두 사람과 패를 두던 평범한 승부사였다.','true-ending-record'),
   S('기록','그날의 승패는 이제 기억나지 않는다. 다만 두 사람 모두 돌아오지 않았다는 사실을 기억한다.','ending-kings'),
   S('기록','이름을 쓰면 지워졌다. 그림을 그려도 얼굴은 흐려졌다.','true-ending-record'),
   S('기록','그래서 나는 이름을 남기는 일을 멈추고, 규칙을 바꾸었다.','true-ending-record'),
   S('기록','두 번째 자리를 지킨 이가 있었음을, 모두가 승부할 때마다 떠올리도록.','true-ending-record'),
   S('기록','언젠가 그 이유를 잊더라도, 규칙은 누군가의 손에 남기를.','true-ending-record'),
   S('방랑자','그럼 이 패는 왕들의 것만이 아니었군.','true-ending-record'),
   N('먼저 걸었던 이는 답을 찾아내고도, 자기 혼자만 알고 있어선 안 된다고 생각했다.','true-ending-village'),
   S('주민','그런데 왜 2가 제일 센 거야?','true-ending-village'),
   S('다른 주민','원래 그런 거 아닌가?','true-ending-village'),
   S('방랑자','아주 오래전에, 두 왕이 있었어.','true-ending-village'),
   N('그날 밤, 낡은 규칙은 처음으로 이야기가 되었다.','true-ending-village'),
   N('이야기는 승부가 끝나도 남는다.','true-ending-village'),
  ]:[
   N('두 수호자의 마지막 패가 테이블에 놓였다.','st10-after'),
   S('방랑자','여기엔 왕이 두 사람 있었다.','ending-thrones'),
   S('형','문을 닫는 건 내가 하겠다.','ending-kings'),
   S('아우','그럼 나는, 그 문이 열리지 않게 할게.','ending-kings'),
   S('형','돌아가라. 모두가 널 기다리고 있다.','ending-kings'),
   S('아우','누군가는 여기 남아야 하잖아.','ending-kings'),
   N('두 왕은 돌아오지 않았다. 세상에는 문과 불꽃만 남았다.','ending-kings'),
   N('두 사람의 이름은 기록에서 지워졌지만, 문은 닫혀 있었고 불꽃은 꺼지지 않았다.','ending-thrones'),
   c.read('quest-5')&&N('다리의 매듭이 떠올랐다. 먼저 끊어지는 쪽과, 끝까지 버티는 쪽.','ending-thrones'),
   c.read('quest-8')&&S('방랑자','편지의 여행자도 이 자리에 섰겠지.','ending-thrones'),
   S('방랑자','누군가는… 알고 있어야 해.','ending-thrones'),
   N('방랑자는 세 증표를 각자의 장소에 되돌리고, 왕관 2만 지닌 채 노르문으로 돌아갔다.','ending-handoff'),
   N('처음 패를 건네받았던 주점에서, 새로운 길손을 만났다.','ending-handoff'),
   S('방랑자','오래된 물건이오.','ending-handoff'),
   S('새 방랑자','문양이 독특하군요.','ending-handoff'),
   S('방랑자','마음에 들면 가져가시오.','ending-handoff'),
   N('이야기를 전하는 길은 아직 끝나지 않았다.','ending-handoff'),
  ],
 },
};

function context(run:RpgRun):Ctx{
 const story=storyState(run);
 return {second:story.runNumber>=2,read:id=>story.quests[id as keyof typeof story.quests]==='read',visited:id=>story.quests[id as keyof typeof story.quests]!==undefined,secondPlace:!!story.secondPlaceSeen,letterReturned:run.journey?.letterQuest?.step==='complete'};
}
/** Second-journey variant lines for the approved ST1~3 scenes (appended, never replacing). */
function earlyVariant(stage:number,phase:'before'|'after',base:readonly PrologueCut[],run:RpgRun):readonly PrologueCut[]{
 if(!context(run).second||phase!=='after')return base;
 const extra:Record<number,{at:number,beats:Beat[]}>={
  1:{at:2,beats:[S('로웬','그 표식… 전에 본 적이 있는 것 같은데. 아니, 신경 쓰지 마.')]},
  2:{at:base.length,beats:[S('피오','전에 비슷한 패를 가진 여행자가 있었어. 모르에게 물어봐도 딴청만 부리더라.')]},
  3:{at:5,beats:[S('첫째','이번에는… 그 패를 건네받은 사람이 다른가.'),S('둘째','형. 이제 그 정도는 말해 줘도 되잖아.')]},
 };
 const add=extra[stage];if(!add)return base;
 const template=base[Math.max(0,Math.min(base.length-1,add.at-1))];
 const lines=add.beats.map((beat,index)=>({...template,id:`ST${stage}_POST_R2_${index+1}`,speaker:beat.speaker,line:beat.line,duration:storyReadingDuration(beat.line),poseArt:undefined,keepsakeFace:undefined,keepsakeCard:undefined}));
 return [...base.slice(0,add.at),...lines,...base.slice(add.at)];
}
type Scenes={before:readonly PrologueCut[],after:readonly PrologueCut[]};
/**
 * Scene lists must keep their identity between renders: the cutscene player restarts (and reloads
 * its art) whenever it receives a new array. Cache by every input that can change the lines.
 */
const sceneCache=new Map<string,Scenes>(),reelCache=new Map<string,readonly PrologueCut[]>();
function sceneKey(stage:number,run:RpgRun){const c=context(run),story=storyState(run);return `${stage}|${c.second?2:1}|${c.secondPlace?1:0}|${c.letterReturned?1:0}|${Object.entries(story.quests).sort().map(([id,choice])=>`${id}:${choice}`).join(',')}`;}
export function journeyScenes(stage:number,run:RpgRun):Scenes{
 const key=sceneKey(stage,run),hit=sceneCache.get(key);if(hit)return hit;
 const built=buildScenes(stage,run);sceneCache.set(key,built);return built;
}
function buildScenes(stage:number,run:RpgRun):Scenes{
 if(stage<=3){const base=RPG_CONNECTION_SCENES[String(stage)];if(!base)return {before:[],after:[]};return {before:base.before,after:earlyVariant(stage,'after',base.after,run)};}
 const script=SCRIPTS[stage];if(!script)return {before:[],after:[]};
 const c=context(run);
 return {before:cuts(stage,'before',script.before(c),`st${stage}-before`),after:cuts(stage,stage===10?'ending':'after',script.after(c),`st${stage}-after`)};
}
/** Full story reel for the replay menu: every scene the run has reached. */
export function journeyStoryReel(run:RpgRun,upTo:number):readonly PrologueCut[]{
 const key=`${upTo}|${sceneKey(0,run)}`,hit=reelCache.get(key);if(hit)return hit;
 const reel=[1,2,3,4,5,6,7,8,9,10].filter(stage=>stage<=upTo).flatMap(stage=>{const s=journeyScenes(stage,run);return [...s.before,...s.after];});reelCache.set(key,reel);return reel;
}
