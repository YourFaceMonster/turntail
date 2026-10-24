import type {Game,RoundResult} from './game';
export const ITEM_RECORDS_KEY='turntale-item-records-v1';
type ItemRound={id:string,at:number,win:boolean,points:number,size:number};
type ItemMatch={id:string,at:number,score:number,size:number};
export type ItemArchive={version:1,games:number,wins:number,points:number,rounds:ItemRound[],matches:ItemMatch[],seen:string[]};
export function emptyItemArchive():ItemArchive{return {version:1,games:0,wins:0,points:0,rounds:[],matches:[],seen:[]};}
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
export function readItemArchive(storage:StoragePort):ItemArchive{const raw=storage.getItem(ITEM_RECORDS_KEY);if(!raw)return emptyItemArchive();let x:ItemArchive;try{x=JSON.parse(raw);}catch{throw Error('아이템전 전적을 읽지 못했어요. 기존 기록을 보존했어요.');}if(x.version!==1||!Array.isArray(x.rounds)||!Array.isArray(x.matches)||!Array.isArray(x.seen))throw Error('아이템전 전적 형식을 확인해 주세요.');return x;}
export function recordItemGame(storage:StoragePort,game:Game):ItemArchive{
 const old=readItemArchive(storage),r=game.result,c=r?.challenge;
 if(!game.itemRun||!c?.itemMode||!r||r.voided||old.seen.includes(r.id))return old;
 const mine=r.players[0],next:ItemArchive={...old,games:old.games+1,wins:old.wins+Number(mine.winner),points:old.points+mine.delta,seen:[...old.seen,r.id],rounds:[{id:r.id,at:r.at,win:mine.winner,points:mine.delta,size:game.players.length},...old.rounds].slice(0,10),matches:[...old.matches]};
 if(c.complete&&!c.abandoned&&!next.matches.some(m=>m.id===c.id))next.matches=[{id:c.id,at:r.at,score:c.scores[0],size:c.size},...next.matches].sort((a,b)=>b.score-a.score||a.at-b.at).slice(0,10);
 storage.setItem(ITEM_RECORDS_KEY,JSON.stringify(next));return next;
}
