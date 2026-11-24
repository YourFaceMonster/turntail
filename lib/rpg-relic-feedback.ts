import type {RpgRun} from './rpg.ts';
import {tr} from './i18n/index.ts';

export type RpgRelicActivation={seq:number,relicId:string,message:string,at:number};
export type RpgRelicEffect=Pick<RpgRelicActivation,'relicId'|'message'>;

/** Record confirmed bonuses at their source; the UI never infers a proc from unrelated stat changes. */
export function withRelicActivations(run:RpgRun,effects:RpgRelicEffect[],at=Date.now()):RpgRun{
 if(!effects.length)return run;
 let seq=run.relicActivations?.at(-1)?.seq||0;
 return {...run,relicActivations:[...(run.relicActivations||[]),...effects.map(effect=>({...effect,seq:++seq,at}))].slice(-24)};
}

/** First line is the condition, second is the extra benefit; numeric rules remain in rpg.ts. */
export const ITEM_BATTLE_RELIC_HINTS:Record<string,{label:string,bonus:string,condition:string}>={
 'wind-sigil':{label:tr('페어 승리'),bonus:tr('피해 +1'),condition:tr('승리를 확정한 마지막 족보가 페어이면 상대 각각에게 추가 피해 1. 직업과 중첩돼요.')},
 'warrior-crest':{label:tr('트리플 승리'),bonus:tr('피해 +2'),condition:tr('승리를 확정한 마지막 족보가 트리플이면 상대 각각에게 추가 피해 2.')},
 'life-sigil':{label:tr('트리플 승리'),bonus:'HP +2',condition:tr('트리플로 싸움에서 이기면 자신의 HP 2 회복. 대전의 최대 HP까지 회복해요.')},
 'sun-sigil':{label:tr('플러시 승리'),bonus:tr('피해 +3'),condition:tr('플러시로 싸움에서 이기면 상대 각각에게 추가 피해 3. 스트레이트 플러시는 별도 족보예요.')},
 'crimson-fang':{label:tr('해 포함 승리'),bonus:tr('피해 +1'),condition:tr('마지막 승리 족보에 해 문양이 하나 이상 있으면 추가 피해 1. 해의 장수와 관계없이 한 번 적용해요.')},
 'cloud-blessing':{label:tr('철문 포함 승리'),bonus:'HP +1',condition:tr('마지막 승리 족보에 철문 문양이 하나 이상 있으면 HP 1 회복. 붉은 송곳니와 함께 발동할 수 있어요.')},
 'pioneers-eye':{label:tr('첫 분배'),bonus:tr('철문 3 · 첫 선'),condition:tr('새 아이템전의 첫 분배에만 적용해요. 기존 패와 교체해 손패 수를 유지하며 다음 라운드는 일반 분배예요.')},
};
export const RPG_RELIC_HINTS:Record<string,{label:string,bonus:string,condition:string}>={
 'watchkeepers-blue-glass':{label:tr('응급 약초'),bonus:tr('회복 +5'),condition:tr('장착 중 자신이 사용하는 응급 약초의 회복량이 10에서 15로 늘어나요. 최대 HP를 넘지 않으며, 여행자에게 건네는 약초에는 적용되지 않아요.')},
 'recovery-lantern':{label:tr('완료 회복'),bonus:'HP +5',condition:tr('스테이지를 1·2등으로 마치면 기본 회복이 늘어나요. HP가 가득 찼거나 영역이 바뀔 때는 추가 회복이 없어요.')},
 'cracked-heart':{label:tr('첫 피해'),bonus:tr('피해 −8'),condition:tr('스테이지마다 처음 HP 피해를 받을 때 최대 8을 막아요.')},
 'final-knot':{label:tr('운명 구제'),bonus:'HP 60',condition:tr('3등으로 마치고 운명을 소모해 살아나면 구제 HP가 50에서 60으로 늘어나요.')},
 'second-heart':{label:tr('회복 배분'),bonus:tr('5당 HP +1'),condition:tr('정산 포인트를 HP에 배분할 때 5포인트마다 HP 1을 추가로 회복해요.')},
 'second-ring':{label:tr('2등 보상'),bonus:tr('주화 +15'),condition:tr('스테이지 최종 2등의 기본 주화 보상에 15를 더해요. 보스의 주화 보상은 한 번만 받아요.')},
 'stopped-hourglass':{label:tr('한 판 승리'),bonus:tr('포인트 +5'),condition:tr('카드 대전에서 손패를 먼저 모두 내고 승리하면 포인트 5를 더 받아요.')},
 'two-sided-coin':{label:tr('주화 배분'),bonus:tr('10당 +1'),condition:tr('정산 포인트를 주화에 배분할 때 10포인트마다 주화 1을 추가로 받아요.')},
 'gamblers-gloves':{label:tr('첫 5장 족보'),bonus:tr('포인트 +2'),condition:tr('카드 한 판마다 처음 5장 족보를 내면 포인트 2를 받아요.')},
 'merchants-scales':{label:tr('첫 구매'),bonus:tr('20 할인'),condition:tr('영역마다 첫 상점 구매에 20주화 할인이 자동 적용돼요.')},
 'mor-quill':{label:tr('소문 열람'),bonus:tr('영역당 +1'),condition:tr('영역당 미발견 소문을 하나 더 열람하는 유물이에요. 현재 첫 보스 체험 구간에서는 소문 기능을 준비 중이에요.')},
 'twin-needle-compass':{label:tr('갈림길 보상'),bonus:tr('미리 보기'),condition:tr('갈림길의 보상 종류를 미리 보는 유물이에요. 현재 첫 보스 체험 구간에서는 갈림길 기능을 준비 중이에요.')},
 'split-mirror':{label:tr('갈림길 선택'),bonus:tr('후보 2개'),condition:tr('갈림길 이벤트 후보를 둘로 늘리는 유물이에요. 현재 첫 보스 체험 구간에서는 갈림길 기능을 준비 중이에요.')},
};
export const ALL_RELIC_HINTS={...RPG_RELIC_HINTS,...ITEM_BATTLE_RELIC_HINTS};
