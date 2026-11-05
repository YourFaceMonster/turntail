import {questDialoguePages} from './quest-dialogue-pages.ts';
import {storyReadingDuration,type PrologueCut} from './rpg-prologue.ts';

/** ST3 epilogue only. Later regions, card locations and the ultimate purpose stay unknown. */
const beats=[
 {speaker:'첫째',line:'이건 가져가라. 이 성채에 오래 남아 있던 패다.'},
 {line:'방랑자가 받아 든 낡은 패의 앞면에는\n검은 철문과 숫자 2가 새겨져 있었다.'},
 {line:'패를 뒤집자 두 개의 철문이 새겨진 뒷면이 드러났다.'},
 {line:'방랑자는 주점에서 받은 붉은 왕관 2를 꺼내 나란히 놓았다. 겹쳐진 두 왕관과 두 철문. 서로 다른 표식인데도 낡은 테두리와 새김은 어딘가 닮아 있었다.'},
 {speaker:'방랑자',line:'혹시… 같은 묶음에서 나온 패들일까?'},
 {line:'성채의 오래된 기록에는 성화의 영역이라는 이름이 남아 있었다. 그 곁에는 닮은 표식에 관한 짧은 글이 적혀 있었다.'},
 {line:'하지만 글은 거기서 끊겨 있었다. 어디에서 이어지는 이야기인지, 두 패가 무엇을 뜻하는지는 알 수 없었다.'},
 {line:'방랑자는 두 패를 조심스럽게 챙겼다. 주점에서 얻은 작은 기념품은 이제 새로운 물음이 되어 있었다.'},
 {line:'왜 서로 다른 곳에 같은 흔적이 남아 있는 걸까? 노르문에서 시작된 물음은, 아직 가 보지 못한 길 너머로 이어지고 있었다.'},
];
export const DEMO_ENDING:readonly PrologueCut[]=beats.flatMap((beat,index)=>questDialoguePages([beat.line]).map(({text},page)=>({
 id:`ST3_POST_${index+6}${page?`_${page+1}`:''}`,scene:'stone' as const,audio:'quiet' as const,speaker:beat.speaker,line:text,duration:storyReadingDuration(text),
})));
