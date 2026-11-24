import type {RoundResult} from './game';
import {tr} from './i18n/index.ts';

/**
 * 여관 토너먼트 (turntail_claude.md 6.2): three classic matches in a region inn against the Mor family's circle.
 * Each match swaps the challenger seat; seat 2 is the same quiet guest. Winning two of three matches wins the cup.
 * No currency, HP, relic or stage change: rewards are a record, a title and a short closing scene.
 */
export type TournamentChallenger={name:string,avatar:string,title:string,level:number,goal:string,intro:readonly string[],win:string,lose:string,
 /** The other inn member sitting at seat 2 for this match. */guest:{name:string,avatar:string,level:number}};
export type TournamentRegion=2|3;
/**
 * 2026-11-16 user feedback: the opponents are the people in that inn's painting, not a fixed travelling lineup.
 * Each inn: its pet first, then the regular, then the owner; the seat-2 guest is another member of the same inn.
 * The pet portraits are Codex profiles drawn from the inn paintings (the earlier crops stay on disk).
 */
const OTTER='/story/inn-portrait-otter-v1.webp',CAT='/story/inn-portrait-cat-v1.webp',DOKAN='/story/inn-portrait-dokan-v1.webp',RINE='/story/inn-portrait-rine-v1.webp';
const GOAL_1=tr('이 판을 1등으로 마치고, 두 상대 모두 6장 이상 남기기'),GOAL_3=tr('이 판을 1등으로 마치기');
export const INN_TOURNAMENTS:Record<TournamentRegion,readonly TournamentChallenger[]>={
 2:[
  {name:tr('수달'),avatar:OTTER,title:tr('안개 나루 주점 식구'),level:2,goal:GOAL_1,guest:{name:tr('도칸'),avatar:DOKAN,level:3},
   intro:[tr('(바 위에 엎드려 있던 수달이 앞발로 패 한 장을 툭 밀어 냈다.)'),tr('모란: 첫 판은 우리 수달이야. 얕보다간 큰코다쳐!')],win:tr('(수달이 시무룩하게 꼬리를 내리고 바 위로 돌아갔다.)'),lose:tr('(수달이 이긴 패를 품에 안고 데굴데굴 굴렀다.)')},
  {name:tr('도칸'),avatar:DOKAN,title:tr('화로 대장장이 · 단골'),level:4,goal:tr('도칸을 3등으로 만들기'),guest:{name:tr('수달'),avatar:OTTER,level:3},
   intro:[tr('불 앞에서는 쇠도 패도 정직해지지. 망치 내리치듯 내 보마.'),tr('둘째 판이다. 식기 전에 두드려야지.')],win:tr('허, 쇠가 식기도 전에 졌군. 주인장은 나보다 훨씬 독하다.'),lose:tr('두드린 만큼 단단해지는 법이지. 한 번 더 달궈 와.')},
  {name:tr('모란'),avatar:'/story/inn-portrait-moran-v1.webp',title:tr('안개 나루 주점 주인'),level:7,goal:GOAL_3,guest:{name:tr('도칸'),avatar:DOKAN,level:3},
   intro:[tr('뱃사람들은 페어를 아껴 두지. 끝에 가서 한꺼번에 쏟아붓거든.'),tr('마지막 판. 화로만큼 뜨겁게 해 보자.')],win:tr('하하, 내 페어가 다 막혔네! 오늘 챔피언은 너야. 막내한테 가서도 이렇게 해 봐.'),lose:tr('봤지? 아껴 둔 패가 마지막에 빛나는 법이야.')},
 ],
 3:[
  {name:tr('검은 고양이'),avatar:CAT,title:tr('달빛 등불 주점 식구'),level:3,goal:GOAL_1,guest:{name:tr('리네'),avatar:RINE,level:4},
   intro:[tr('(장부 위에서 내려온 검은 고양이가 앞발로 패 한 장을 골라 냈다.)'),tr('모로: 첫 판은 이 녀석입니다. 장부를 지키는 만큼 패도 잘 지키지요.')],win:tr('(고양이가 하품을 하고 장부 위로 돌아가 몸을 말았다.)'),lose:tr('(고양이가 꼬리로 패를 쓸어 모았다. 어딘가 뿌듯해 보인다.)')},
  {name:tr('리네'),avatar:RINE,title:tr('별지기 · 단골'),level:6,goal:tr('리네를 3등으로 만들기'),guest:{name:tr('검은 고양이'),avatar:CAT,level:4},
   intro:[tr('오늘 밤 별이 내 패를 골라 줬어. 별자리를 믿어 볼게.'),tr('둘째 판이야. 별은 늘 같은 자리에 뜨지만, 패는 아니지.')],win:tr('별이 오늘은 네 편이었나 봐. 모로한테도 그렇게 해 봐.'),lose:tr('봐, 별자리는 거짓말을 안 한다니까.')},
  {name:tr('모로'),avatar:'/story/inn-portrait-moro-v1.webp',title:tr('달빛 등불 주점 주인'),level:9,goal:GOAL_3,guest:{name:tr('리네'),avatar:RINE,level:4},
   intro:[tr('마지막 판입니다. 오늘 오간 패는 모두 장부에 적어 두었지요.'),tr('기록을 이기는 건 쉽지 않을 겁니다.')],win:tr('…장부에 적겠습니다. 오늘의 챔피언, 당신의 이름으로.'),lose:tr('기록대로 흘러갔군요. 그래도 좋은 승부였습니다.')},
 ],
};
/** The inn the player stands in (journey node inn-2 / inn-3); anything else falls back to the first region inn. */
export const tournamentRegionOf=(node:unknown):TournamentRegion=>node==='inn-3'?3:2;
export const innTournament=(node:unknown)=>INN_TOURNAMENTS[tournamentRegionOf(node)];
export const TOURNAMENT_ROUNDS=3;
export const TOURNAMENT_TITLE=tr('여관 챔피언');
export type TournamentState={wins:number[],goals:number[],finished?:boolean,champion?:boolean,/** Tournaments finished this journey. */played:number};
/** Did this match's special goal succeed? Seat 0 = me, seat 1 = the challenger. */
export function tournamentGoalMet(round:number,result:Pick<RoundResult,'players'>):boolean{
 const me=result.players[0],challenger=result.players[1],others=result.players.slice(1);
 if(!me||!challenger)return false;
 if(round===1)return me.place===1&&others.every(p=>p.count>=6);
 if(round===2)return challenger.place===3;
 return me.place===1;
}
export const tournamentMatchWon=(result:Pick<RoundResult,'players'>)=>result.players[0]?.place===1;

/** Device record of the title, kept apart from journey saves. */
export const TOURNAMENT_RECORD_KEY='turntale-inn-tournament-v1';
type StoragePort={getItem(key:string):string|null,setItem(key:string,value:string):void};
export type TournamentRecord={champion:number,bestGoals:number};
export function readTournamentRecord(storage:StoragePort):TournamentRecord{
 try{const raw=JSON.parse(storage.getItem(TOURNAMENT_RECORD_KEY)||'null');if(raw&&Number.isInteger(raw.champion)&&Number.isInteger(raw.bestGoals))return {champion:raw.champion,bestGoals:raw.bestGoals};}catch{}
 return {champion:0,bestGoals:0};
}
export function noteTournament(storage:StoragePort,state:TournamentState):TournamentRecord{
 const before=readTournamentRecord(storage),next={champion:before.champion+(state.champion?1:0),bestGoals:Math.max(before.bestGoals,state.goals.length)};
 try{storage.setItem(TOURNAMENT_RECORD_KEY,JSON.stringify(next));}catch{}return next;
}
