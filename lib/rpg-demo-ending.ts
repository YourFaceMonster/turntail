import {storyReadingDuration,type PrologueCut} from './rpg-prologue.ts';
import {tr} from './i18n/index.ts';

/** ST3 epilogue: points the journey on to ST4 (물안개 폭포); card locations and the ultimate purpose stay unknown. */
const beats=[
 {speaker:tr('첫째'),line:tr('이건 가져가라. 이 성채에 오래 남아 있던 패다.')},
 {line:tr('방랑자가 받아 든 낡은 패의 앞면에는 검은 철문과 숫자 2가 새겨져 있었다.')},
 {line:tr('패를 뒤집자 두 개의 철문이 새겨진 뒷면이 드러났다.')},
 {line:tr('방랑자는 주점에서 받은 붉은 왕관 2를 꺼내 나란히 놓았다. 겹쳐진 두 왕관과 두 철문. 서로 다른 표식인데도 낡은 테두리와 새김은 어딘가 닮아 있었다.')},
 {speaker:tr('방랑자'),line:tr('혹시… 같은 묶음에서 나온 패들일까?')},
 {line:tr('성채의 오래된 기록에는 성화의 영역이라는 이름이 남아 있었다. 그 곁에는 닮은 표식에 관한 짧은 글이 적혀 있었다.')},
 {line:tr('글은 거기서 끊겨 있었다. 다만 성화의 영역으로 가는 길이 성채 너머 물안개 폭포에서 시작된다는 것만은 알 수 있었다.')},
 {line:tr('방랑자는 두 패를 조심스럽게 챙겼다. 주점에서 얻은 작은 기념품은 이제 새로운 물음이 되어 있었다.')},
 {line:tr('왜 서로 다른 곳에 같은 흔적이 남아 있는 걸까? 답을 찾아, 방랑자는 성채 너머 물안개 폭포로 향했다.')},
];
// 2026-11-19 (QA TXT-3): these are full-width captions (three lines fit), so split only between sentences, never mid-phrase.
const sentences=(line:string)=>line.split(/\n|(?<=[.!?])\s+/u).map(text=>text.trim()).filter(Boolean).map(text=>({text}));
export const DEMO_ENDING:readonly PrologueCut[]=beats.flatMap((beat,index)=>sentences(beat.line).map(({text},page)=>({
 id:`ST3_POST_${index+6}${page?`_${page+1}`:''}`,scene:'stone' as const,audio:'quiet' as const,speaker:beat.speaker,line:text,duration:storyReadingDuration(text),
})));
