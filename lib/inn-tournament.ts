import type {RoundResult} from './game';

/**
 * 여관 토너먼트 (turntail_claude.md 6.2): three classic matches in a region inn against the Mor family's circle.
 * Each match swaps the challenger seat; seat 2 is the same quiet guest. Winning two of three matches wins the cup.
 * No currency, HP, relic or stage change: rewards are a record, a title and a short closing scene.
 */
export type TournamentChallenger={name:string,avatar:string,title:string,level:number,goal:string,intro:readonly string[],win:string,lose:string};
export const TOURNAMENT_GUEST={name:'단골 손님',avatar:'animal:🐼',level:3};
export const INN_TOURNAMENT:readonly TournamentChallenger[]=[
 {name:'피오',avatar:'animal:🦊',title:'눈길의 주점 이야기꾼',level:2,goal:'이 판을 1등으로 마치고, 두 상대 모두 6장 이상 남기기',
  intro:['첫 판은 나야! 걱정 마, 살살 할게. 아마도.','작은 패부터 술술 내는 게 내 방식이야.'],win:'와, 한 장도 못 따라갔네. 다음 상대는 만만치 않을걸?',lose:'헤헤, 이번엔 내가 이겼다! 이야깃거리 하나 생겼네.'},
 {name:'모란',avatar:'/story/inn-portrait-moran-v1.webp',title:'안개 나루 주점 주인',level:5,goal:'모란을 3등으로 만들기',
  intro:['뱃사람들은 페어를 아껴 두지. 끝에 가서 한꺼번에 쏟아붓거든.','자, 둘째 판. 화로만큼 뜨겁게 해 보자.'],win:'흐음, 내 페어가 다 막혔네. 막내한테 가서도 이렇게 해 봐.',lose:'봤지? 아껴 둔 패가 마지막에 빛나는 법이야.'},
 {name:'모로',avatar:'/story/inn-portrait-moro-v1.webp',title:'달빛 등불 주점 주인',level:9,goal:'이 판을 1등으로 마치기',
  intro:['마지막 판입니다. 오늘 오간 패는 모두 장부에 적어 두었지요.','기록을 이기는 건 쉽지 않을 겁니다.'],win:'…장부에 적겠습니다. 오늘의 챔피언, 당신의 이름으로.',lose:'기록대로 흘러갔군요. 그래도 좋은 승부였습니다.'},
];
export const TOURNAMENT_ROUNDS=INN_TOURNAMENT.length;
export const TOURNAMENT_TITLE='여관 챔피언';
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
