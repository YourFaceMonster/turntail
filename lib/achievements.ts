import {combo,type GameEvent,type RoundResult,type Tile} from './game';
import {isHiboringji} from './hiboringji';

export const ACHIEVEMENTS_KEY='turntale-achievements-v1';
export type AchievementStats={rounds:number,wins:number,streak:number,bestStreak:number,tiles:number,sizes:number[],patterns:Record<string,number>,cleared:number,noDrawWin:number,redFinish:number,hiboWin:number};
export type Achievement={id:string,title:string,description:string,icon:string,goal:number,hidden?:boolean,value:(s:AchievementStats)=>number};
const pattern=(label:string)=>(s:AchievementStats)=>s.patterns[label]||0;
export const ACHIEVEMENTS:Achievement[]=[
 {id:'first-round',title:'이야기의 첫 장',description:'유효한 라운드 1판 완료',icon:'✧',goal:1,value:s=>s.rounds},
 {id:'first-win',title:'첫 번째 빈손',description:'손패를 모두 비워 첫 승리',icon:'♜',goal:1,value:s=>s.wins},
 {id:'ten-wins',title:'승부의 감각',description:'누적 10승 달성',icon:'♛',goal:10,value:s=>s.wins},
 {id:'regular',title:'늘 앉던 자리',description:'누적 25판 완료',icon:'◈',goal:25,value:s=>s.rounds},
 {id:'streak',title:'세 번의 흐름',description:'3연승 달성',icon:'⚑',goal:3,value:s=>s.bestStreak},
 {id:'all-seats',title:'어떤 자리에서도',description:'3인·4인전 각각 1판 완료',icon:'♧',goal:2,value:s=>s.sizes.filter(n=>n===3||n===4).length},
 {id:'pairs',title:'둘이서 한 수',description:'페어 누적 10회 제출',icon:'Ⅱ',goal:10,value:pattern('페어')},
 {id:'triple',title:'셋의 약속',description:'트리플 1회 제출',icon:'Ⅲ',goal:1,value:pattern('트리플')},
 {id:'straight',title:'이어지는 이야기',description:'스트레이트 1회 제출',icon:'↗',goal:1,value:pattern('스트레이트')},
 {id:'flush',title:'같은 빛으로',description:'플러시 1회 제출',icon:'✦',goal:1,value:pattern('플러시')},
 {id:'full-house',title:'빈틈없는 한 패',description:'풀하우스 1회 제출',icon:'⌂',goal:1,value:pattern('풀하우스')},
 {id:'four-kind',title:'넷의 위력',description:'포카드 1회 제출',icon:'Ⅳ',goal:1,value:pattern('포카드')},
 {id:'hundred-tiles',title:'백 장의 선택',description:'패 누적 100장 제출',icon:'▥',goal:100,value:s=>s.tiles},
 {id:'stage-one',title:'여정의 문턱',description:'도전모드 스테이지 1 클리어',icon:'⚐',goal:1,value:s=>s.cleared},
 {id:'stage-five',title:'여정의 한가운데',description:'도전모드 스테이지 5 클리어',icon:'◇',goal:5,value:s=>s.cleared},
 {id:'stage-ten',title:'마지막 전설',description:'도전모드 스테이지 10 클리어',icon:'♔',goal:10,value:s=>s.cleared},
 {id:'secret-line',title:'한 줄의 기적',description:'스트레이트 플러시 제출',icon:'✺',goal:1,hidden:true,value:pattern('스트레이트 플러시')},
 {id:'secret-clean',title:'빌리지 않은 승리',description:'바닥 패를 한 장도 가져오지 않고 승리',icon:'☽',goal:1,hidden:true,value:s=>s.noDrawWin},
 {id:'secret-sun',title:'태양이 지는 순간',description:'해 문양 2 싱글로 마지막 패를 내며 승리',icon:'☀',goal:1,hidden:true,value:s=>s.redFinish},
 {id:'secret-temper',title:'분노는 패착을 남긴다',description:'라운드 72행동 이상인 장기전에서 히보를 상대로 승리',icon:'♨',goal:1,hidden:true,value:s=>s.hiboWin},
];
type TrackedRound={seen:string[],complete:boolean,draws:number,tiles:number,patterns:Record<string,number>};
export type AchievementState={version:1,stats:AchievementStats,unlocked:Record<string,number>,settled:string[],active:Record<string,TrackedRound>};
export function emptyAchievements():AchievementState{return {version:1,stats:{rounds:0,wins:0,streak:0,bestStreak:0,tiles:0,sizes:[],patterns:{},cleared:0,noDrawWin:0,redFinish:0,hiboWin:0},unlocked:{},settled:[],active:{}};}
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
export function readAchievements(storage:StoragePort):AchievementState{
 try{const raw=JSON.parse(storage.getItem(ACHIEVEMENTS_KEY)||'null');if(raw?.version!==1||!raw.stats||!Array.isArray(raw.settled)||!raw.active||!raw.unlocked)return emptyAchievements();return {...raw,stats:{...emptyAchievements().stats,...raw.stats}};}catch{return emptyAchievements();}
}
type AchievementView={code:string,round:number,me:number,phase:string,capacity?:number,players:{id:string,bot?:boolean,replaced?:boolean,name:string,avatar?:string}[],lastEvent?:GameEvent,result?:RoundResult|null,roundActions?:number,items?:unknown};
/** Commit progress only on valid results: an eventual AI takeover never earns awards. */
export function observeAchievements(before:AchievementState,game:AchievementView):{state:AchievementState,earned:Achievement[]}{
 const key=JSON.stringify([game.code,game.players.map(p=>p.id),game.round,game.me]);
 if(game.items)return {state:before,earned:[]};
 if(!game.round||game.phase==='lobby'||before.settled.includes(key)||!game.players[game.me]||game.players[game.me].bot)return {state:before,earned:[]};
 const ev=game.lastEvent,prior=before.active[key];
 if(game.phase!=='ended'&&(!ev||prior?.seen.includes(ev.id)))return {state:before,earned:[]};
 const state=structuredClone(before),round=state.active[key]||{seen:[],complete:ev?.type==='deal',draws:0,tiles:0,patterns:{}};
 if(ev&&!round.seen.includes(ev.id)){
  round.seen.push(ev.id);
  if(ev.who===game.me){if(ev.type==='draw')round.draws++;if(ev.type==='play'){const label=combo(ev.tiles||[])?.label;if(label){round.patterns[label]=(round.patterns[label]||0)+1;round.tiles+=ev.tiles!.length;}}}
 }
 state.active[key]=round;
 // Retain separate practice, challenge and friend tables across saves and reloads.
 const activeKeys=Object.keys(state.active);if(activeKeys.length>12)delete state.active[activeKeys[0]];
 const result=game.phase==='ended'?game.result:null;
 if(!result)return {state,earned:[]};
 state.settled.push(key);delete state.active[key];
 if(result.voided||game.players[game.me].replaced)return {state,earned:[]};
 const mine=result.players[game.me];if(!mine)return {state:before,earned:[]};
 const s=state.stats,won=mine.winner;
 s.rounds++;s.wins+=Number(won);s.streak=won?s.streak+1:0;s.bestStreak=Math.max(s.bestStreak,s.streak);
 s.sizes=[...new Set([...s.sizes,game.capacity||game.players.length])].filter(n=>[2,3,4].includes(n));
 s.tiles+=round.tiles;for(const [label,count] of Object.entries(round.patterns))s.patterns[label]=(s.patterns[label]||0)+count;
 s.cleared=Math.max(s.cleared,result.stageRun?.cleared||0);
 if(won){
  if(round.complete&&round.draws===0)s.noDrawWin++;
  const last:Tile[]|undefined=ev?.who===game.me&&ev.type==='play'?ev.tiles:undefined;
  if(last?.length===1&&last[0].n===2&&last[0].s===3)s.redFinish++;
  if((game.roundActions||0)>=72&&game.players.some((p,i)=>i!==game.me&&isHiboringji(p)))s.hiboWin++;
 }
 const earned=ACHIEVEMENTS.filter(a=>!state.unlocked[a.id]&&a.value(s)>=a.goal);
 for(const a of earned)state.unlocked[a.id]=result.at||Date.now();
 return {state,earned};
}
