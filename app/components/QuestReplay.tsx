'use client';
import {QUEST_DIALOGUE} from '../../lib/rpg-dialogue';
import QuestCutscene from './QuestCutscene';
import type {QuestArtKey} from '../../lib/rpg-quest-art';
import type {PrologueCut} from '../../lib/rpg-prologue';
type Story={title:string,speaker:string,scene:PrologueCut['scene'],lines:string[],paintings:QuestArtKey[],speakers?:string[]};
const TOWER_ARRIVAL='성벽 안쪽 파수탑에 도착했다. 무너진 돌계단 옆의 잘 보이지 않는 틈에서 푸른 빛이 희미하게 샌다.';
const TOWER_FOUND='몸을 낮춰 돌틈 안으로 손을 뻗었다. 안쪽에 쓰러진 낡은 등잔에서 푸른 유리를 조심스럽게 꺼냈다.';
/** Replays follow the rules of the journey being played: the new RPG has no coins or herbs (same wording as the live scenes). */
function stories(rework:boolean):Record<string,Story>{
 return {
  'quest-mor':{title:'사라진 봉인 편지',speaker:'모르',scene:'room',lines:rework?QUEST_DIALOGUE.morOffer.map(line=>line.replace(/주화 \d+과/,'HP 5 회복과')):QUEST_DIALOGUE.morOffer,paintings:['mor-request']},
  'quest-thief':{title:'시장 뒤 골목',speaker:'편지 도둑',scene:'road',lines:QUEST_DIALOGUE.thief,speakers:['','낯선 도둑','낯선 도둑','낯선 도둑'],paintings:['alley-thief-spin','alley-thief']},
  'quest-traveler':rework
   ?{title:'길가의 여행자',speaker:'여행자',scene:'snow',lines:[...QUEST_DIALOGUE.travelerInjured,...QUEST_DIALOGUE.travelerTreated],speakers:['','여행자','','여행자','여행자'],paintings:['traveler-injured','traveler-injured','traveler-aided']}
   :{title:'길가의 여행자',speaker:'여행자',scene:'snow',lines:['눈길에서 넘어져 다리를 다쳤어. 응급 약초가 있으면 조금 나눠줄 수 있을까?',...QUEST_DIALOGUE.travelerHelped],paintings:['traveler-injured','traveler-aided']},
  'quest-tower':{title:'검은 소나무 파수탑',speaker:'파수꾼의 푸른 유리',scene:'stone',lines:[TOWER_ARRIVAL,`${TOWER_FOUND} ${rework?'장착하면 판이 시작될 때마다 바닥 패 1장을 몰래 볼 수 있다.':'장착하면 응급 약초의 회복량이 10에서 15로 늘어난다.'}`],paintings:['watchtower-arrival','blue-glass-discovery']},
 };
}
export default function QuestReplay({id,close,rework=false}:{id:string,close:()=>void,rework?:boolean}){
 const story=stories(rework)[id];if(!story)return null;
 return <QuestCutscene {...story} busy={false} close={close} choices={[{label:'지도로 돌아가기',choose:close}]}/>;
}
