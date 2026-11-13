import {RPG_CONNECTION_SCENES} from './rpg-connection-scenes.ts';
import {storyReadingDuration,type PrologueCut} from './rpg-prologue.ts';
import {JOURNEY_STAGE_NAMES,chapterArt,stageRegion,storyState,type StoryEventId} from './rpg-chapters.ts';
import type {RpgRun} from './rpg.ts';

/**
 * ST4~10 connection scenes and endings from story bible v1.4. ST1~3 keep their approved cuts;
 * a second journey only appends the bible's short variant lines. Lines are data, never combat.
 */
import type {StoryCardId} from './rpg-story-cards.ts';
type Beat={line:string,speaker?:string,art?:string,keepsake?:[StoryCardId,'front'|'back'],cue?:PrologueCut['cue'],camera?:PrologueCut['camera'],interaction?:PrologueCut['interaction']};
const N=(line:string,art?:string):Beat=>({line,art});
const S=(speaker:string,line:string,art?:string):Beat=>({speaker,line,art});
/** The keepsake is painted at real card size, so its first sight also shows the card itself up close. */
const K=(line:string,art:string,card:StoryCardId,face:'front'|'back'):Beat=>({line,art,keepsake:[card,face]});
/** Adds rhythm to one beat: a sound, a camera move, or a hands-on event that holds the cut. */
const X=(beat:Beat,extra:Pick<Beat,'cue'|'camera'|'interaction'>):Beat=>({...beat,...extra});
/** visited: the stage's side quest was opened (read or skip), so its NPC must not repeat the quest's opening line. */
type Ctx={second:boolean,read:(id:string)=>boolean,visited:(id:string)=>boolean,solved:(id:StoryEventId)=>boolean,secondPlace:boolean,letterReturned:boolean};

function cuts(stage:number,phase:'before'|'after'|'ending',beats:readonly (Beat|false|undefined)[],defaultArt:string):PrologueCut[]{
 return beats.filter((beat):beat is Beat=>!!beat).map((beat,index)=>({
  id:`ST${stage}_${phase==='before'?'PRE':phase==='after'?'POST':'END'}_${index+1}`,scene:'stone',audio:'quiet',
  speaker:beat.speaker,line:beat.line,duration:storyReadingDuration(beat.line),art:chapterArt(beat.art||defaultArt),focus:'50% 45%',...(beat.keepsake?{keepsakeCard:beat.keepsake[0],keepsakeFace:beat.keepsake[1]}:{}),...(beat.cue?{cue:beat.cue}:{}),...(beat.camera?{camera:beat.camera}:{}),...(beat.interaction?{interaction:beat.interaction}:{}),
  location:stage<=10?`STAGE ${stage} · ${JOURNEY_STAGE_NAMES[stage]}`:undefined,
 }));
}

/**
 * 2026-11-13 workorder (docs/story-st4-10-analysis-2026-11-13.md, approved): each stage gives a reason to play,
 * quest choices echo back, ST9 no longer pre-tells the ending, and both endings pay off earlier clues.
 */
const SCRIPTS:Record<number,{before:(c:Ctx)=>(Beat|false)[],after:(c:Ctx)=>(Beat|false)[]}>={
 4:{
  before:c=>[X(N('철문을 벗어난 길은 구름 아래로 쏟아지는 폭포에 닿았다.'),{camera:'pan'}),c.visited('quest-4')?S('네아','아까 그 기록 말이야. 글은 번졌어도 문양만은 또렷하더라.'):S('네아','위쪽에서 떠내려온 기록이 있어. 문양이 네 패랑 닮았더라.'),S('수리','떠내려오는 것들은 대개 어디선가 흘려보낸 거야. 거슬러 올라가 봐.'),S('수리','위쪽 길은 안개가 걷혀야 보여. 기다리는 동안 한 판 하자. 이기면 길목을 알려 주지.')],
  after:c=>[X(N('승부가 끝날 무렵, 볕에 마른 기록 위로 겹친 왕관 흔적이 떠올랐다.'),{camera:'push'}),S('방랑자','주점에서 받은 패의 문양과… 같아.'),c.read('quest-4')&&S('방랑자',c.solved('quest-4')?'“둘이… 한 문을… 나누어 맡았다.” 둘이라니, 누구와 누구일까.':'“둘이… 한 문을…”. 둘이라니, 누구와 누구일까.'),S('수리','약속대로 길목을 알려 주지. 봐, 안개가 걷혔어.'),S('네아','마지막 줄은 읽을 수 없네. 하지만 이 기록이 끝나는 곳은 위쪽 다리야.'),S('방랑자','누가 이 패들을 이렇게 흩어 놓은 걸까.'),c.second&&N('기록의 여백에, 누군가 같은 문양을 따라 그린 흔적이 있었다.')],
 },
 5:{
  before:c=>[X(N('바람이 다리를 흔들었다. 다리의 한쪽 매듭이 닳아 있었다.'),{camera:'pan'}),c.read('quest-5')?S('타래','같이 엮은 매듭, 오늘은 좀 버텨 주려나.'):c.visited('quest-5')?S('타래','봤지? 이쪽 매듭은 오늘도 먼저 끊어질 것 같아.'):S('타래','또 이쪽이야. 꼭 이쪽 매듭만 먼저 끊어진다니까.'),S('하온','그런데 다른 쪽이 매번 버텨 줘. 왜 그런지는 아무도 모르지.'),S('하온','이 다리는 한 번에 한 사람만 건너. 누가 먼저 건너고 누가 남을지, 패로 정하자.')],
  after:c=>[S('하온','예전에는 이 다리를 두 사람이 지켰대. 먼저 길을 여는 사람과, 뒤에 남아 기다리는 사람.'),S('방랑자','나중에 남은 사람이… 더 힘들었겠군.'),c.read('quest-5')?S('타래','같이 엮은 매듭, 방금 바람에도 버텼어. 너는 먼저 가. 나는 남아서 지킬게.'):c.visited('quest-5')&&S('타래','다음엔 좀 도와줘. 혼자 남아 버티는 건 생각보다 힘들거든.'),c.second&&S('타래','전에 왔던 여행자도 매듭 고치는 걸 도와줬어. 너랑 비슷한 패를 갖고 있었지.'),N('다리 건너편, 무너진 기둥 사이로 오래된 회랑이 보였다.')],
 },
 6:{
  before:c=>[S('카르덴','이 회랑은 끝까지 자리를 지킨 자만 지나간다. 패로 증명해라.'),S('세라','물가의 기록, 다리의 매듭. 이곳에 닿는 이야기는 늘 같아. 먼저 간 자와, 남은 자.'),S('세라','누가 내렸는지 기억 못 하는 명령인데도, 우리는 지키고 있지.'),c.read('quest-6')?S('태엽','방문자 기록: 장부 열람 완료. 수행할 의무: 정상.'):c.visited('quest-6')?S('태엽','방문자 기록: 재방문. 수행할 의무: 정상.'):S('태엽','이름 필드: 손상. 수행할 의무: 정상.'),S('카르덴','테이블에 앉아라. 예법대로 겨룬다.')],
  after:c=>[S('카르덴','우리가 섬기던 이는 이기지 못했다. 하지만 마지막까지 자리를 떠나지 않았다.'),S('방랑자','누구를 지키고 있었던 거죠?'),S('카르덴','기억나지 않는다. 다만 불꽃이 꺼지지 않아야 한다는 것만은 안다.'),c.read('quest-6')&&S('방랑자','“뒤에 남은 자에게 맡긴다.” 장부의 그 문장이군.'),
   X(N('달빛이 떨어지는 오래된 받침대 위에 패 한 장이 놓여 있었다.','st6-flame-two'),{camera:'push'}),N('회랑이 고요해졌다.','st6-flame-two'),
   X(K('성화 문양과 숫자 2가 새겨진 패였다.','st6-flame-two','sacred-flame-two','front'),{cue:'storyCard'}),X(K('패를 뒤집자 꺼지지 않은 두 겹의 불꽃이 새겨져 있었다.','st6-flame-two-back','sacred-flame-two','back'),{cue:'pass'}),
   N('왕관, 철문, 그리고 성화. 테두리도 새김도 꼭 같았다.','st6-flame-two'),c.second&&S('태엽','기록 추가 발견: “첫 번째 승부사, 이곳을 방문.” 이후 기록: 손상.'),N('회랑 끝, 달빛이 고목 위로 길을 비추고 있었다.')],
 },
 7:{
  before:()=>[S('루엔','승자의 이름을 적는 것은 쉬워. 하지만 패한 사람의 선택을 기록하기란 어렵지.'),X(S('시온','이 승부 기록 좀 봐 줄래? 이상한 데가 있는데, 난 못 찾겠어.'),{interaction:'st7-ledger'}),S('루엔','자, 한 판 하세. 자네가 어느 자리에 앉게 될지 보지.')],
  after:c=>[S('루엔','모두가 첫 번째만 기억하려 할 때, 누군가는 두 번째를 기록했네.'),S('방랑자','왜 두 번째였을까요?'),S('루엔','그 답을 안다면, 이 기록이 왜 남았는지도 알겠지.'),c.solved('st7-ledger')&&S('시온','1등 칸이 비어 있던 거, 일부러 지운 걸까?'),c.secondPlace&&S('루엔','자네도 두 번째 자리에 앉아 봤군. 그 자리에서만 보이는 것이 있지.'),c.second&&N('기록 끝의 주석: “최초”란 놀이를 처음 만든 이가 아니라, 규칙에 뜻을 남긴 이를 부르는 말이다.'),N('고목 너머, 별빛이 모이는 성소가 보였다.')],
 },
 8:{
  before:c=>[c.read('quest-8')?S('엘라','그 편지를 읽었구나. 이름은 없어도, 길은 그렇게 남는 법이란다.'):c.visited('quest-8')?S('엘라','봉인한 편지는 내가 잘 맡아 두마. 언젠가 주인이 찾아오겠지.'):S('엘라','별을 보러 온 건 아닌 얼굴이구나. 무늬를 따라왔니?'),S('아스텔','몇 년 전에도 같은 무늬를 가진 여행자가 있었어.'),S('아스텔','그 사람이 남긴 별자리 기록은, 나를 이긴 사람에게만 보여 주기로 약속했거든.')],
  after:c=>[S('아스텔','약속은 약속이지. 이게 그 사람이 남긴 별자리 기록이야.'),c.letterReturned?S('방랑자','이 봉인… 모르가 돌려받은 편지의 인장과 모양이 같다.'):S('엘라','노르문에서도 비슷한 봉인을 쓴 기록이 있구나.'),S('엘라','이 사람은 마지막 왕좌 앞에 섰다가 돌아왔다는 기록이 없단다.'),S('방랑자','끝에 무엇이 있었던 걸까요?'),c.read('quest-8')&&S('방랑자','편지에 적힌 그 여행자… 끝까지 갔던 걸까.'),c.solved('quest-8')&&S('방랑자','그 사람도 이 문양을 따라왔구나. 나처럼.'),c.second&&S('엘라','그 기록을 남긴 사람도, 지금 네 손에 있는 그 왕관 2를 쥐고 있었단다.'),N('성소 아래, 검은 잿불이 타오르는 제단으로 길이 이어졌다.')],
 },
 9:{
  before:c=>[c.read('quest-9')?S('재온','흔적은 봤겠지. 맞물린 무늬가 무슨 뜻인지는 아직 몰라도.'):c.visited('quest-9')?S('재온','바로 승부를 원한다고 했지. 좋아, 이야기는 끝나고 해도 늦지 않아.'):S('재온','누군가 문을 닫았다는 얘기쯤은 들었겠지. 그런데 불은 왜 꺼지지 않을까.'),S('오닉','이 제단의 돌은 두 개의 문양이 맞물릴 때만 온전한 무늬가 돼.'),S('재온','패를 내라. 불씨는 승부 끝에 답을 보여 주곤 하지.')],
  after:c=>[S('재온','철문을 닫은 사람이 있었어. 그리고 그 문 곁에 끝까지 남은 사람도.'),S('방랑자','그래서 이름까지 남지 않은 건가요?'),S('재온','모른다. 다만 누군가 두 사람을 잊지 않으려 했다는 흔적은 있어.'),c.read('quest-9')&&S('오닉','자네가 본 그 무늬, 맞물린 두 문양 말이야. 그게 이 제단의 전부지.'),
   X(N('검게 그을린 받침대 안, 꺼져 가는 불씨 사이에서 패 한 장이 드러났다.','st9-key-two'),{camera:'push'}),N('불씨가 잦아들고, 제단이 조용해졌다.','st9-key-two'),
   X(K('비밀의 열쇠 2. 불길 속에 있었는데도 그을린 자국 하나 없었다.','st9-key-two','secret-key-two','front'),{cue:'storyCard'}),X(K('뒷면에는 하나로 포개지는 두 열쇠가 새겨져 있었다.','st9-key-two-back','secret-key-two','back'),{cue:'pass'}),
   c.second&&S('재온','숫자 2를 가장 높이 친 사람이 있었다더군. 이유는… 이제 알 것 같지 않나?'),N('네 장의 패가 가리키는 곳, 붉은 세계수가 구름 위로 솟아 있었다.')],
 },
 10:{
  before:c=>[K('주점에서 건네받은 붉은 왕관 2.','st10-before','crown-two','front'),K('성채의 쌍둥이가 맡긴 검은 철문 2.','st10-before','iron-gate-two','front'),K('회랑의 받침대에 놓여 있던 성화 2.','st10-before','sacred-flame-two','front'),K('잿불 속에서 드러난 비밀의 열쇠 2.','st10-before','secret-key-two','front'),
   N('네 장의 패에 남은 문양이 하나의 기록을 가리켰다.'),S('첫 번째 수호자','너는 무엇을 얻기 위해 여기까지 왔는가?'),S('두 번째 수호자','그리고 무엇을 남기고 떠날 것인가?'),S('첫 번째 수호자','답은 패로 해라. 이 테이블에서 진 자는 기록을 읽지 못한다.'),c.second&&S('두 번째 수호자','…같은 패를 든 사람이 또 왔군.')],
  after:c=>c.second?[
   N('두 수호자의 마지막 패가 테이블에 놓였다.','st10-after'),
   N('이번에는 두 왕의 목소리 대신, 낡은 테이블 위에 적힌 기록이 들려왔다.','true-ending-record'),
   S('기록','나는 두 사람과 패를 두던 평범한 승부사였다.','true-ending-record'),
   S('기록','그날의 승패는 이제 기억나지 않는다. 다만 두 사람 모두 돌아오지 않았다는 사실을 기억한다.','ending-kings'),
   S('기록','이름을 쓰면 지워졌다. 그림을 그려도 얼굴은 흐려졌다.','true-ending-record'),
   S('기록','그래서 나는 이름을 남기는 일을 멈추고, 규칙을 바꾸었다.','true-ending-record'),
   S('기록','가장 약해 보이는 숫자 2를, 가장 높은 자리에 두었다.','true-ending-record'),
   S('기록','두 번째 자리를 지킨 이가 있었음을, 모두가 승부할 때마다 떠올리도록.','true-ending-record'),
   (c.secondPlace||c.solved('st7-ledger'))&&N('고목의 기록, 비어 있던 1등 칸과 왕관 표식만 남은 2등 칸. 그 기록도 이 사람이 남긴 것이었다.','true-ending-record'),
   c.read('quest-5')&&N('먼저 끊어지는 매듭과, 끝까지 버티는 매듭. 다리의 이야기도 같은 뜻이었다.','true-ending-record'),
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
   S('두 번째 수호자','우리 둘은 그들이 남긴 그림자일 뿐이다.','st10-after'),
   X(S('방랑자','여기엔 왕이 두 사람 있었다.','ending-thrones'),{camera:'push'}),
   S('형','문을 닫는 건 내가 하겠다.','ending-kings'),
   S('아우','그럼 나는, 그 문이 열리지 않게 할게.','ending-kings'),
   S('형','돌아가라. 모두가 널 기다리고 있다.','ending-kings'),
   S('아우','누군가는 여기 남아야 하잖아.','ending-kings'),
   N('두 왕은 돌아오지 않았다. 세상에는 문과 불꽃만 남았다.','ending-kings'),
   N('두 사람의 이름은 기록에서 지워졌지만, 문은 닫혀 있었고 불꽃은 꺼지지 않았다.','ending-thrones'),
   c.read('quest-4')&&N('“둘이 한 문을…” 그 뒤의 글을 이제야 알 것 같았다.','ending-thrones'),
   c.read('quest-5')&&N('다리의 매듭이 떠올랐다. 먼저 끊어지는 쪽과, 끝까지 버티는 쪽.','ending-thrones'),
   c.read('quest-6')&&N('뒤에 남은 자에게 맡긴다. 회랑의 장부가 떠올랐다.','ending-thrones'),
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

/**
 * 2026-11-13 region crossings (ST3→4, ST6→7, ST9→10): a short road scene played before the first stage of a
 * new region. It carries the keepsakes forward, explains the region rule in-story (HP restored, only the
 * last guardian's relic keeps its light) and hands off to the stage's opening line without repeating it.
 * Paintings: placeholders are the region maps until the requested art arrives (docs/codex-art-request-2026-11-13-region-crossings.md).
 */
type Frame={landscape:string,portrait:string};
const REGION_ONE_MAP:Frame={landscape:'/prologue/iron-gate-village-map-portrait-v3.webp',portrait:'/prologue/iron-gate-village-map-portrait-v3.webp'};
const regionMap=(region:number):Frame=>region===1?REGION_ONE_MAP:chapterArt(`region-${region}-map`);
/** Add a key here once /story/<key>-portrait-v1.webp exists; until then the placeholder map is shown. */
export const CROSSING_ART_READY=new Set<string>(['cross-4-depart','cross-4-border','cross-7-depart','cross-7-border','cross-10-depart','cross-10-border']);
export const CROSSING_ART_SLOTS:Record<string,{placeholder:Frame,note:string}>={
 'cross-4-depart':{placeholder:regionMap(1),note:'철문의 영역을 떠나는 길 · 등 뒤로 멀어지는 성채와 노르문'},
 'cross-4-border':{placeholder:regionMap(2),note:'물안개 경계 · 안개 너머로 보이는 성화의 영역(폭포·구름다리·회랑)'},
 'cross-7-depart':{placeholder:regionMap(2),note:'회랑을 나서는 길 · 달빛 아래 멀어지는 폭포와 구름다리'},
 'cross-7-border':{placeholder:regionMap(3),note:'달빛 경계 · 고목·성소·잿불 제단이 보이는 열쇠의 영역'},
 'cross-10-depart':{placeholder:regionMap(3),note:'잿불이 잦아든 제단을 떠나는 길 · 구름 속으로 가라앉는 고목과 성소'},
 'cross-10-border':{placeholder:regionMap(4),note:'구름 위 마지막 경계 · 붉은 세계수로 이어지는 하나뿐인 길'},
};
export function crossingArt(key:string):Frame{const slot=CROSSING_ART_SLOTS[key];if(!slot)throw Error(`Unknown crossing art: ${key}`);if(!CROSSING_ART_READY.has(key))return slot.placeholder;const path=`/story/${key}-portrait-v1.webp`;return {landscape:path,portrait:path};}
const REGION_NAMES:Record<number,string>={2:'성화의 영역',3:'열쇠의 영역',4:'왕관의 영역'};
type CrossBeat=Beat&{frame:string|Frame,focus?:string};
const CROSSINGS:Record<number,(c:Ctx)=>(CrossBeat|false)[]>={
 4:c=>[
  {...N('성채의 성벽이 등 뒤로 멀어졌다. 노르문의 지붕들은 어느새 발아래 작은 점이 되어 있었다.'),frame:'cross-4-depart',camera:'pan'},
  {...N('품속에는 두 장의 패가 있었다. 주점에서 받은 붉은 왕관 2, 그리고 성채의 쌍둥이가 맡긴 검은 철문 2.'),frame:'cross-4-depart'},
  {...S('방랑자','성채의 기록은 성화의 영역에서 끊겼어. 이 패들의 이야기도 거기서 이어지겠지.'),frame:'cross-4-depart'},
  {...N('물소리를 따라 내려가자 짙은 안개가 길을 막아섰다. 그 너머로 폭포와 구름다리, 오래된 회랑이 어렴풋이 보였다.'),frame:'cross-4-border',camera:'pan',cue:'step'},
  {...N('안개를 지나자 지친 숨이 가라앉고 상처가 아물었다. 대신 품속 유물들은 빛을 잃었다. 쌍둥이와의 마지막 승부에서 얻은 하나만이 온기를 지켰다.'),frame:'cross-4-border',camera:'push',cue:'heal'},
  {...S('방랑자','새 땅에서는 새로 얻으라는 뜻인가. …좋아, 몸은 가볍군.'),frame:'cross-4-border'},
  c.second&&{...N('안개 속 바위에, 누군가 같은 문양을 따라 새긴 흔적이 있었다.'),frame:'cross-4-border'},
 ],
 7:c=>[
  {...N('회랑의 문이 등 뒤에서 닫혔다. 폭포와 구름다리가 달빛 아래 멀어져 갔다.'),frame:'cross-7-depart',camera:'pan'},
  {...N('성화 2는 아직 따뜻했다. 왕관, 철문, 성화. 세 장의 패가 품속에서 나란히 잠들어 있었다.'),frame:'cross-7-depart'},
  {...S('방랑자','“뒤에 남은 자에게 맡긴다.” 카르덴은 누구를 기다리며 그 자리를 지킨 걸까.'),frame:'cross-7-depart'},
  {...N('달빛이 가리킨 길은 고목과 별빛 성소, 그리고 잿불이 타는 제단으로 이어졌다. 사람들은 그곳을 열쇠의 영역이라 불렀다.'),frame:'cross-7-border',camera:'pan',cue:'step'},
  {...S('방랑자','왕관, 철문, 성화… 그리고 열쇠. 남은 문양은 하나야.'),frame:'cross-7-border'},
  {...N('달빛의 경계를 넘자 몸이 다시 가벼워졌다. 회랑의 수호자에게 받은 유물 하나만이 빛을 잃지 않았다.'),frame:'cross-7-border',camera:'push',cue:'heal'},
  c.second&&{...S('방랑자','…이 달빛 길, 처음 걷는 것 같지 않아.'),frame:'cross-7-border'},
  {...N('고목 아래, 누군가 등불을 켜 둔 채 낡은 승부 기록을 넘기고 있었다.'),frame:'st7-before'},
 ],
 10:c=>[
  {...N('제단의 잿불이 잦아들었다. 고목과 성소가 발아래 구름 속으로 가라앉았다.'),frame:'cross-10-depart',camera:'pan'},
  {...S('방랑자','주점의 작은 기념품이 네 장이 됐어. 왕관, 철문, 성화, 열쇠. 모두 숫자 2.'),frame:'cross-10-depart'},
  {...S('방랑자','가장 약한 숫자만 골라 흩어 놓은 사람이 있다면… 이유도 남겨 두었겠지.'),frame:'cross-10-depart'},
  {...N('구름 위로 붉은 세계수가 솟아 있었다. 그곳으로 가는 길은 하나뿐이었다.'),frame:'cross-10-border',camera:'pan',cue:'step'},
  {...N('마지막 경계를 넘자 상처가 모두 아물었다. 잿불의 제단에서 얻은 유물 하나만이 품속에서 희미하게 빛났다.'),frame:'cross-10-border',camera:'push',cue:'heal'},
  c.second&&{...N('세계수 뿌리에 감긴 낡은 끈. 지난 여정에서 묶어 둔 매듭이 그대로였다.'),frame:'cross-10-border'},
  {...N('세계수 뿌리 사이, 빈 테이블 하나가 누군가를 기다리고 있었다.'),frame:'st10-before'},
 ],
};
function crossingCuts(stage:number,c:Ctx):PrologueCut[]{
 const script=CROSSINGS[stage];if(!script)return [];
 return script(c).filter((beat):beat is CrossBeat=>!!beat).map((beat,index)=>({
  id:`ST${stage}_CROSS_${index+1}`,scene:'road',audio:'quiet',speaker:beat.speaker,line:beat.line,duration:storyReadingDuration(beat.line),
  art:typeof beat.frame!=='string'?beat.frame:CROSSING_ART_SLOTS[beat.frame]?crossingArt(beat.frame):chapterArt(beat.frame),focus:beat.focus||'50% 45%',
  ...(beat.cue?{cue:beat.cue}:{}),...(beat.camera?{camera:beat.camera}:{}),location:`${REGION_NAMES[stageRegion(stage)]}으로 가는 길`,
 }));
}
/** First entry into a region's opening stage plays the crossing; retries and replays of the single stage skip it. */
const crossingDue=(stage:number,run:RpgRun)=>!!CROSSINGS[stage]&&!run.journey?.startedStages.includes(stage);

function context(run:RpgRun):Ctx{
 const story=storyState(run);
 return {second:story.runNumber>=2,read:id=>story.quests[id as keyof typeof story.quests]==='read',visited:id=>story.quests[id as keyof typeof story.quests]!==undefined,solved:id=>story.events?.[id]==='solved',secondPlace:!!story.secondPlaceSeen,letterReturned:run.journey?.letterQuest?.step==='complete'};
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
/** Event results only change later lines; the opening list keeps its identity so recording the ST7 ledger mid-scene never restarts it. */
const beforeCache=new Map<string,readonly PrologueCut[]>();
const eventKey=(run:RpgRun)=>Object.entries(storyState(run).events||{}).sort().map(([id,result])=>`${id}:${result}`).join(',');
/** crossing: 'due' adds the region crossing only on the first entry (map play); 'always' is for story replays. */
export function journeyScenes(stage:number,run:RpgRun,crossing:'due'|'always'|'never'='due'):Scenes{
 const withCrossing=crossing==='always'?!!CROSSINGS[stage]:crossing==='due'&&crossingDue(stage,run);
 const base=`${sceneKey(stage,run)}|${withCrossing?'x':''}`,key=`${base}|${eventKey(run)}`,hit=sceneCache.get(key);if(hit)return hit;
 const built=buildScenes(stage,run),before=beforeCache.get(base)??(withCrossing?[...crossingCuts(stage,context(run)),...built.before]:built.before);beforeCache.set(base,before);
 const scenes={before,after:built.after};sceneCache.set(key,scenes);return scenes;
}
function buildScenes(stage:number,run:RpgRun):Scenes{
 if(stage<=3){const base=RPG_CONNECTION_SCENES[String(stage)];if(!base)return {before:[],after:[]};return {before:base.before,after:earlyVariant(stage,'after',base.after,run)};}
 const script=SCRIPTS[stage];if(!script)return {before:[],after:[]};
 const c=context(run);
 return {before:cuts(stage,'before',script.before(c),`st${stage}-before`),after:cuts(stage,stage===10?'ending':'after',script.after(c),`st${stage}-after`)};
}
/** Full story reel for the replay menu: every scene the run has reached. */
export function journeyStoryReel(run:RpgRun,upTo:number):readonly PrologueCut[]{
 const key=`${upTo}|${sceneKey(0,run)}|${eventKey(run)}`,hit=reelCache.get(key);if(hit)return hit;
 const reel=[1,2,3,4,5,6,7,8,9,10].filter(stage=>stage<=upTo).flatMap(stage=>{const s=journeyScenes(stage,run,'always');return [...s.before,...s.after];});reelCache.set(key,reel);return reel;
}
