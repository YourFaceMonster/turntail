import {tr} from './i18n/index.ts';
/** Story text only. Rewards, combat and navigation stay in the existing handlers. */
export const LETTER_QUEST_COINS=30;
export const QUEST_DIALOGUE={
 morOffer:[tr('자네, 잠깐 시간 있나?'),tr('배달 여행자가 편지를 빼앗겼다더군. 시장 뒤 골목에서 말이야.'),tr('그냥 편지가 아닐세. 봉인도 뜯지 않은 채 가져갔다지.'),tr('되찾아 주겠나? 보상은 섭섭지 않게 하지.'),tr('맡겠다면 수락해 주게. 지도에서 골목으로 갈 수 있네.'),tr('편지를 돌려주면 주화 {0}과 유물 소문을 주겠네.',{0:LETTER_QUEST_COINS})],
 morDirections:[tr('피오가 본 도둑은 시장 뒤 골목에 있네. 지도에서 찾아보게.')],
 morRecovered:[tr('찾아왔군. 편지를 내게 주게. 자네가 원하던 유물 소문도 들려주지.')],
 morComplete:[tr('정말 찾아왔군. 고맙네.'),tr('흠… 봉인도 그대로야. 다행이군.'),tr('약속한 보상일세. 그리고 자네가 찾던 유물 이야기 말인데…'),tr('성 안 북쪽 구역에 오래된 흔적이 있다고 하더군.'),tr('다만 조심하게. 오래된 물건에는 이유가 있는 법이니.')],
 morDefeated:[tr('도둑 녀석이 생각보다 만만치 않은가 보군.'),tr('괜찮네. 편지는 아직 그놈 손에 있지 않나.'),tr('서두르지 말게. 다음 승부에서는 다를 수도 있으니.')],
 morFailed:[tr('그랬군. 약속한 승부라면 어쩔 수 없지.'),tr('애써 줘서 고맙네. 편지는 내가 다른 길로 알아보겠네.'),tr('자네는 가던 길을 계속 가게.')],
 thief:[tr('골목 끝, 낯선 남자가 봉인된 편지를 손가락 사이에서 빙글빙글 돌리고 있다.'),tr('어이, 이걸 찾으러 왔나?'),tr('그냥 돌려주면 재미없잖아.'),tr('세 판이다. 총점 단독 1등이면 편지를 돌려주지.'),tr('2등이나 공동 1등이면 다시 도전해도 좋아.'),tr('하지만 3등이면 끝이야. 편지는 내가 갖는다.')],
 travelerHelped:[tr('정말 고마워. 이 다리로는 마을까지 돌아갈 자신도 없었거든.'),tr('참, 성벽 안쪽 파수탑에서 이상한 푸른 빛을 봤어. 혹시 도움이 될까?')],
 /** New RPG (no consumables): the wayfarer is treated by sharing the player's own HP. */
 travelerInjured:[tr('수레 옆에 주저앉은 여행자가 피 묻은 다리를 감싸 쥐고 있다.'),tr('눈길에서 미끄러졌는데… 피가 멈추질 않아. 이대로는 일어설 수가 없어.')],
 travelerTreated:[tr('망토 자락을 찢어 상처를 동여매고, 남은 기운을 나눠 그를 일으켜 세웠다.'),tr('정말 고마워. 네 기운까지 나눠 주다니… 이 은혜는 꼭 갚을게.'),tr('참, 성벽 안쪽 파수탑에서 이상한 푸른 빛을 봤어. 혹시 도움이 될까?')],
};
/** HP the player gives up to treat the wayfarer in the new RPG. */
export const WAYFARER_AID_HP=5;
export const PIO_DIALOGUE=[tr('어서 와! 새 얼굴이네? 앉아, 앉아. 추운 날엔 따뜻한 게 최고지.'),tr('모르? 말수는 적어도 믿을 만한 사람이야. 과거 얘기는 좀 싫어하지만.'),tr('세린이랑 승부할 거면 조심해. 저 사람, 지면 웃는 얼굴이 더 무섭거든.'),'광장 옆 잡화점에 들러 봐. 난 오늘 장사 생각은 접었어.'];
export const SERIN_INVITATION=tr('한 판 할래?\n세 판이면 네 실력 정도는 알 수 있겠지.');
export const THIEF_RESULTS={win:tr('쳇, 가져가. 약속은 약속이니까. …다음엔 안 져.'),second:tr('아깝네. 한 번 더 해볼 텐가?'),third:tr('꼴찌로군. 기회는 끝이야. 이 편지는 내가 갖겠어.')};
export const SERIN_RESULTS={win:tr('제법인데? 오랜만에 손이 좀 풀렸어.'),loss:tr('후후. 아직 배울 게 많겠네. 다음엔 더 재밌게 해 봐.')};
/** A tied first place does not recover the letter; it receives the second-place reaction. */
export function letterDuelOutcome(players:readonly {points?:number}[]):'win'|'second'|'third'{
 const score=players[0].points||0;
 if(players.slice(1).every(p=>score>(p.points||0)))return 'win';
 return players.slice(1).filter(p=>(p.points||0)>score).length===2?'third':'second';
}

export function morDialogue(quest?:{step:string,defeated?:boolean}):string[]{
 if(quest?.step==='complete')return QUEST_DIALOGUE.morComplete;
 if(quest?.step==='failed')return QUEST_DIALOGUE.morFailed;
 if(quest?.step==='recovered')return QUEST_DIALOGUE.morRecovered;
 if(quest?.step==='alley')return quest.defeated?QUEST_DIALOGUE.morDefeated:QUEST_DIALOGUE.morDirections;
 return QUEST_DIALOGUE.morOffer;
}
