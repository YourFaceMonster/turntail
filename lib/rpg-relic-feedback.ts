import type {RpgRun} from './rpg.ts';

export type RpgRelicActivation={seq:number,relicId:string,message:string,at:number};
export type RpgRelicEffect=Pick<RpgRelicActivation,'relicId'|'message'>;

/** Record confirmed bonuses at their source; the UI never infers a proc from unrelated stat changes. */
export function withRelicActivations(run:RpgRun,effects:RpgRelicEffect[],at=Date.now()):RpgRun{
 if(!effects.length)return run;
 let seq=run.relicActivations?.at(-1)?.seq||0;
 return {...run,relicActivations:[...(run.relicActivations||[]),...effects.map(effect=>({...effect,seq:++seq,at}))].slice(-24)};
}

/** First line is the condition, second is the extra benefit; numeric rules remain in rpg.ts. */
export const RPG_RELIC_HINTS:Record<string,{label:string,bonus:string,condition:string}>={
 'recovery-lantern':{label:'완료 회복',bonus:'HP +5',condition:'스테이지를 1·2등으로 마치면 기본 회복이 늘어나요. HP가 가득 찼거나 영역이 바뀔 때는 추가 회복이 없어요.'},
 'cracked-heart':{label:'첫 피해',bonus:'피해 −8',condition:'스테이지마다 처음 HP 피해를 받을 때 최대 8을 막아요.'},
 'final-knot':{label:'운명 구제',bonus:'HP 60',condition:'3등으로 마치고 운명을 소모해 살아나면 구제 HP가 50에서 60으로 늘어나요.'},
 'second-heart':{label:'회복 배분',bonus:'5당 HP +1',condition:'정산 포인트를 HP에 배분할 때 5포인트마다 HP 1을 추가로 회복해요.'},
 'second-ring':{label:'2등 보상',bonus:'주화 +15',condition:'스테이지 최종 2등의 기본 주화 보상에 15를 더해요. 보스의 주화 보상은 한 번만 받아요.'},
 'stopped-hourglass':{label:'한 판 승리',bonus:'포인트 +5',condition:'카드 대전에서 손패를 먼저 모두 내고 승리하면 포인트 5를 더 받아요.'},
 'two-sided-coin':{label:'주화 배분',bonus:'10당 +1',condition:'정산 포인트를 주화에 배분할 때 10포인트마다 주화 1을 추가로 받아요.'},
 'gamblers-gloves':{label:'첫 5장 족보',bonus:'포인트 +2',condition:'카드 한 판마다 처음 5장 족보를 내면 포인트 2를 받아요.'},
 'merchants-scales':{label:'첫 구매',bonus:'20 할인',condition:'영역마다 첫 상점 구매에 20주화 할인이 자동 적용돼요.'},
 'mor-quill':{label:'소문 열람',bonus:'영역당 +1',condition:'영역당 미발견 소문을 하나 더 열람하는 유물이에요. 현재 첫 보스 체험 구간에서는 소문 기능을 준비 중이에요.'},
 'twin-needle-compass':{label:'갈림길 보상',bonus:'미리 보기',condition:'갈림길의 보상 종류를 미리 보는 유물이에요. 현재 첫 보스 체험 구간에서는 갈림길 기능을 준비 중이에요.'},
 'split-mirror':{label:'갈림길 선택',bonus:'후보 2개',condition:'갈림길 이벤트 후보를 둘로 늘리는 유물이에요. 현재 첫 보스 체험 구간에서는 갈림길 기능을 준비 중이에요.'},
};
