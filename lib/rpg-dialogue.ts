/** Story text only. Rewards, combat and navigation stay in the existing handlers. */
export const QUEST_DIALOGUE={
 morOffer:['자네, 잠깐 시간 있나?','배달 여행자가 편지를 빼앗겼다더군. 시장 뒤 골목에서 말이야.','그냥 편지가 아닐세. 봉인도 뜯지 않은 채 가져갔다지.','되찾아 주겠나? 보상은 섭섭지 않게 하지.'],
 morDirections:['피오가 본 도둑은 시장 뒤 골목에 있네. 지도에서 찾아보게.'],
 morRecovered:['찾아왔군. 편지를 내게 주게. 자네가 원하던 유물 소문도 들려주지.'],
 morComplete:['정말 찾아왔군. 고맙네.','흠… 봉인도 그대로야. 다행이군.','약속한 보상일세. 그리고 자네가 찾던 유물 이야기 말인데…','성 안 북쪽 구역에 오래된 흔적이 있다고 하더군.','다만 조심하게. 오래된 물건에는 이유가 있는 법이니.'],
 morDefeated:['도둑 녀석이 생각보다 만만치 않은가 보군.','괜찮네. 편지는 아직 그놈 손에 있지 않나.','서두르지 말게. 다음 승부에서는 다를 수도 있으니.'],
 morFailed:['그랬군. 약속한 승부라면 어쩔 수 없지.','애써 줘서 고맙네. 편지는 내가 다른 길로 알아보겠네.','자네는 가던 길을 계속 가게.'],
 thief:['골목 끝, 낯선 남자가 봉인된 편지를 손가락 사이에서 빙글빙글 돌리고 있다.','어이, 이걸 찾으러 왔나?','그냥 돌려주면 재미없잖아.','세 판이다. 총점으로 1등 하면 얌전히 돌려주지.'],
 travelerHelped:['정말 고마워. 이 다리로는 마을까지 돌아갈 자신도 없었거든.','참, 성벽 안쪽 파수탑에서 이상한 푸른 빛을 봤어. 혹시 도움이 될까?'],
};
export const PIO_DIALOGUE=['어서 와! 새 얼굴이네? 앉아, 앉아. 추운 날엔 따뜻한 게 최고지.','모르? 말수는 적어도 믿을 만한 사람이야. 과거 얘기는 좀 싫어하지만.','세린이랑 승부할 거면 조심해. 저 사람, 지면 웃는 얼굴이 더 무섭거든.','광장 옆 잡화점에 들러 봐. 난 오늘 장사 생각은 접었어.'];
export const SERIN_INVITATION='한 판 할래?\n세 판이면 네 실력 정도는 알 수 있겠지.';
export const THIEF_RESULTS={win:'쳇, 가져가. 약속은 약속이니까. …다음엔 안 져.',second:'아깝네. 한 번 더 해볼 텐가?',third:'꼴찌로군. 기회는 끝이야. 이 편지는 내가 갖겠어.'};
export const SERIN_RESULTS={win:'제법인데? 오랜만에 손이 좀 풀렸어.',loss:'후후. 아직 배울 게 많겠네. 다음엔 더 재밌게 해 봐.'};
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
