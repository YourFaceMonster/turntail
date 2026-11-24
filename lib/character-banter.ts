import {isHiboringji,hiboringjiLine} from './hiboringji';
import {combo,isRedTwoSingle,type Tile,type GameEvent} from './game.ts';
import {STAGE_THEMES} from './stage-theme.ts';
import {twinIndex} from './rpg-twins.ts';
import {tr} from './i18n/index.ts';

export type BanterKind='confident'|'beaten'|'power'|'draw'|'idle'|'finish';
export type Banter={who:number,kind:BanterKind,text:string,id:string};
// Public counts and submitted tiles only. Never pass an opponent's hand here.
export type BanterTable={code:string,round:number,phase:string,me:number,turn:number,lastBy:number|null,trick:Tile[],lastEvent?:GameEvent,roundActions?:number,players:{name:string,avatar?:string,bot?:boolean,replaced?:boolean,count:number}[]};
type Lines=Record<BanterKind,string>;
const korean:Lines[]=[
 {confident:tr('이 판 장사는 내가 잘했네!'),beaten:tr('어머나, 내 흥정을 받아쳤어?'),power:tr('밑지는 장사는 안 하지! 받아봐!'),draw:tr('좋은 물건 하나 골라볼까.'),idle:tr('아이고, 장 다 서겠다! 한 수 둬봐~'),finish:tr('오늘 장사, 아주 잘됐네!')},
 {confident:tr('이 물살이면 내 쪽으로 흐르겠네.'),beaten:tr('허허, 물살이 바뀌었구먼.'),power:tr('큰 물살 간다. 꽉 잡으시게!'),draw:tr('노 젓기 전에 한 장 건져보세.'),idle:tr('노는 내가 젓나? 출발 좀 하세~'),finish:tr('허허, 먼저 나루에 닿았구먼.')},
 {confident:tr('이 수로 흐름을 잡아보지요.'),beaten:tr('제 수를 읽으셨군요. 흥미롭습니다.'),power:tr('지금이 승부수를 둘 때로군요.'),draw:tr('잠시 물러나 다음 수를 보겠습니다.'),idle:tr('장고 끝에 묘수, 기대해도 되겠지요?'),finish:tr('마지막 수까지, 좋은 승부였습니다.')},
 {confident:tr('이 정도면 잘 듣는 약이겠지?'),beaten:tr('앗, 내 약발이 안 통하네!'),power:tr('아껴 둔 비방, 지금 써야지!'),draw:tr('산에 들른 김에 한 장 캐볼까.'),idle:tr('약 달이는 것보다 오래 걸리겠어~'),finish:tr('휴, 오늘은 내가 한발 빨랐네!')},
 {confident:tr('자, 이 힘 한번 받아봐!'),beaten:tr('어이쿠! 되치기를 당했네!'),power:tr('이번엔 제대로 한판승 간다!'),draw:tr('숨 한번 고르고 다시 붙자고.'),idle:tr('샅바만 잡고 있을 거야? 덤벼 봐!'),finish:tr('좋았어! 멋진 한판이었다!')},
 {confident:tr('모양이 딱 맞게 나왔네.'),beaten:tr('앗, 내가 빚은 흐름이 깨졌어.'),power:tr('가마에서 아껴 꺼낸 한 수야!'),draw:tr('흙부터 고르듯, 천천히 한 장.'),idle:tr('그러다 가마 불 다 꺼지겠어~'),finish:tr('이번 판은 아주 잘 구워졌네!')},
 {confident:tr('이 수를 잘 보거라. 허허.'),beaten:tr('허허, 배움에는 끝이 없구나.'),power:tr('자, 오늘의 특별 수업이다!'),draw:tr('한 장 더 보고 복습해야겠구나.'),idle:tr('답안지 백지로 낼 셈이더냐? 허허.'),finish:tr('수고했네. 오늘 수업은 여기까지!')},
 {confident:tr('좋아, 이제 내 장단이네!'),beaten:tr('엇, 장단을 쏙 빼앗겼네?'),power:tr('이 대목에서 한 번 몰아쳐야지!'),draw:tr('잠깐 쉼표 하나 찍고 갈게.'),idle:tr('내 장단 다 끝나겠어! 한 수 줘~'),finish:tr('얼쑤! 마지막 장단까지 딱 맞네!')}
];
// Defeat and waiting responses are specific to all 30 challenge characters.
const stageReactions=[
 [tr('관문이 뚫렸군. 아직 승부는 남았네.'),tr('문 열어놓고 기다리고 있네. 한 수 두게.')],
 [tr('앗, 내 등불보다 눈이 밝네!'),tr('길 잃었어? 네 차례는 여기야~')],
 [tr('으앗, 내 배달보다 빠르잖아!'),tr('편지 배달 늦겠다! 얼른 한 수!')],
 [tr('이런, 흥정에서 내가 밀렸군!'),tr('손님, 구경만 하실 건 아니죠?')],
 [tr('어머, 내 한 상을 엎어버렸네!'),tr('국 식겠다! 얼른 한 수 둬봐~')],
 [tr('허허, 짐 하나 더 얹혔네.'),tr('짐은 내가 들 테니 패는 자네가 내게~')],
 [tr('단단히 다졌는데 틈이 있었군.'),tr('돌도 깎겠네. 다음 수는 정했나?')],
 [tr('앗, 내 발밑 돌이 흔들렸어!'),tr('이끼 자라겠다! 한 수만 더~')],
 [tr('흐름이 바뀌었군. 다시 살피겠다.'),tr('계단은 한 걸음씩. 이제 네 걸음이다.')],
 [tr('물결을 거슬러 올라오는군!'),tr('물이 다 흘러가겠다. 한 수 두게.')],
 [tr('내 물길을 바꿔 놓았네.'),tr('물안개 걷힐 때까지 고민할 거야?')],
 [tr('뽀글! 내 물방울이 터졌어!'),tr('똑, 똑! 네 차례라구~')],
 [tr('이런, 실타래가 꼬여버렸네!'),tr('실 한 타래 다 감겠다. 어서~')],
 [tr('구름 너머까지 읽었구나.'),tr('바람이 기다려 주진 않아. 한 수 둘래?')],
 [tr('허허, 바람을 정면으로 맞았군!'),tr('다리 건널 준비 됐나? 한 수 가세!')],
 [tr('내 방어를 넘어섰군. 인정하지.'),tr('수호자는 기다린다만, 네 수가 궁금하군.')],
 [tr('내 빈틈을 정확히 짚었네.'),tr('다음 수를 보여줘. 지켜보고 있어.')],
 [tr('계산 수정. 예상 밖의 반격이다.'),tr('대기 시간 증가 중. 다음 수를 요청한다.')],
 [tr('오래된 가지도 휘어지는 법이지.'),tr('달이 기울기 전에 한 수 두게나.')],
 [tr('달빛 사이의 틈을 찾았구나.'),tr('고요하네. 이제 네 패 소리를 들려줘.')],
 [tr('앗, 내 날갯짓보다 가볍네!'),tr('한 바퀴 더 날고 와도 될까? 네 차례야~')],
 [tr('별의 궤적을 바꾸었군.'),tr('네 별은 어디로 향하지? 보여주렴.')],
 [tr('궤도 이탈! 다시 맞춰봐야겠어.'),tr('별 한 바퀴 돌겠다! 다음 수는?')],
 [tr('별빛도 네 수는 못 가렸네.'),tr('천천히 해도 좋아. 이제 빛을 보여줘.')],
 [tr('내 불길을 눌렀단 말인가!'),tr('잿불이 식기 전에 승부하자.')],
 [tr('하, 제법 뜨거운 반격이군!'),tr('불씨만 보고 있을 거야? 패를 내봐!')],
 [tr('이런, 재 속에 복병이 있었군.'),tr('연기 다 빠지겠어. 이제 움직여 볼까?')],
 [tr('나의 한 수를 넘어서다니, 훌륭하군.'),tr('오랜 세월을 기다렸으나, 다음 수는 궁금하군.')],
 [tr('어둠의 틈을 베었군. 다음은 다르다.'),tr('그림자도 움직이는데, 네 수는 아직인가?')],
 [tr('뿌리 깊은 수로구나. 기억하겠다.'),tr('세계수의 잎이 흔들린다. 이제 네 차례야.')]
] as const;
export function characterLine(player:{name:string,avatar?:string},kind:BanterKind,actions=0,key=''):string{
 if(isHiboringji(player))return hiboringjiLine(kind,actions,key);
 const avatar=player.avatar||'';
 const twin=twinIndex(avatar);
 if(twin!==null){
  const lines:Lines[]=[
   {confident:tr('이번 자리는 내가 차지하겠어.'),beaten:tr('내 수를 넘겼군. 다시 보지.'),power:tr('이 패라면 먼저 끝낼 수 있어.'),draw:tr('한 수 물러서서 다시 계산하지.'),idle:tr('생각은 끝났나? 네 차례야.'),finish:tr('이번에는 내가 먼저야.')},
   {confident:tr('아직 승부는 모르지.'),beaten:tr('재미있어. 예상 밖이야.'),power:tr('자, 이번엔 내 차례야!'),draw:tr('조금 더 볼게. 네 패는 아니고.'),idle:tr('기다리는 것도 승부의 일부야.'),finish:tr('끝까지 재밌었어.')},
  ];return lines[twin][kind];
 }
 if(avatar.startsWith('korean-monster:')){
  const lines:Lines[]=[
   {confident:tr('허허, 이 판은 내 방망이 장단이로군!'),beaten:tr('어이쿠! 내 방망이보다 한 수 빠르네.'),power:tr('금 나와라 뚝딱! 승부수 나간다!'),draw:tr('허허, 복 주머니에 한 장 더 넣어볼까.'),idle:tr('방망이 닳도록 기다리겠네. 한 수 두게~'),finish:tr('허허! 오늘 복은 내 쪽으로 왔구먼!')},
   {confident:tr('좋아! 이번엔 내 불씨가 먼저야!'),beaten:tr('앗 뜨거! 내 불씨를 덮었잖아!'),power:tr('아껴 둔 불꽃 한 수! 받아봐!'),draw:tr('잠깐 쉼표 하나 찍고 갈게!'),idle:tr('불씨 다 꺼지겠다! 얼른 한 수 줘~'),finish:tr('얼쑤! 마지막까지 화끈했지?')},
   {confident:tr('이 흐름은 내가 지켜보겠다.'),beaten:tr('묵직한 수로구나. 인정하겠다.'),power:tr('수호자의 한 수, 받아 보아라.'),draw:tr('한 걸음 물러나 더 깊이 보겠다.'),idle:tr('돌이 될 때까지 기다릴 셈인가? 허허.'),finish:tr('좋은 승부였다. 다음에도 지켜보겠다.')}
  ];return lines[Number(avatar.split(':')[1])]?.[kind]||lines[0][kind];
 }
 if(avatar.startsWith('korean-portrait:'))return korean[Number(avatar.split(':')[1])]?.[kind]||korean[0][kind];
 const person=STAGE_THEMES.flatMap(s=>s.opponents).find(p=>p.name===player.name);
 if(person){const response=stageReactions[person.portrait];return kind==='beaten'?response[0]:kind==='idle'?response[1]:kind==='draw'?tr('잠시 물러나, 다음 수를 준비하지.'):kind==='finish'?tr('{0}의 승부, 여기까지다.',{0:person.title}):person.quote;}
 return ({confident:tr('이번 흐름은 내가 가져가 볼까?'),beaten:tr('앗, 내 패를 넘겼네! 제법인데?'),power:tr('아껴 둔 승부수다! 받아봐!'),draw:tr('한 장 더 보고 가야겠네.'),idle:tr('고민이 깊구먼! 한 수 보여줘~'),finish:tr('좋은 승부였어! 다음에 또 하자.')})[kind];
}
function ai(g:BanterTable,i:number){return i!==g.me&&!!g.players[i]&&(g.players[i].bot||g.players[i].replaced);}
export function eventBanter(before:BanterTable,next:BanterTable):Banter[]{
 const e=next.lastEvent;if(!e||before.code!==next.code||before.round!==next.round||e.id===before.lastEvent?.id)return [];
 const result:Banter[]=[],add=(who:number,kind:BanterKind)=>{if(ai(next,who))result.push({who,kind,text:characterLine(next.players[who],kind,next.roundActions,`${next.code}:${next.round}:${e.id}:${who}`),id:`${e.id}:${who}:${kind}`});};
 if(e.type==='play'){
  if(before.trick.length&&before.lastBy!==null&&before.lastBy!==e.who)add(before.lastBy,'beaten');
  const power=isRedTwoSingle(e.tiles||[])||(combo(e.tiles||[])?.key[0]||0)>=2||(e.tiles||[]).some(t=>t.n===2);
  add(e.who,next.phase==='ended'?'finish':power?'power':'confident');
 }else if(e.type==='draw'||e.type==='pass')add(e.who,'draw');
 return result;
}
export function idleBanter(g:BanterTable,waitedMs:number):Banter|null{
 if(g.phase!=='playing'||g.turn!==g.me||waitedMs<18000)return null;
 const featured=g.players.findIndex((p,i)=>ai(g,i)&&isHiboringji(p)),who=featured>=0?featured:g.players.findIndex((_,i)=>ai(g,i));
 return who<0?null:{who,kind:'idle',text:characterLine(g.players[who],'idle',g.roundActions,`${g.code}:${g.round}:${g.lastEvent?.id}`),id:`idle:${g.code}:${g.round}:${g.lastEvent?.id}`};
}
