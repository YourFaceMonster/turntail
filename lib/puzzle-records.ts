import {tr} from './i18n/index.ts';
/** 한 수 퍼즐 records on this device: cleared puzzles and the fewest tries. No currency, no game progress. */
export const PUZZLE_RECORDS_KEY='turntale-puzzles-v1';
export type PuzzleRecords={cleared:Record<string,{tries:number,at:number}>};
type StoragePort={getItem(key:string):string|null,setItem(key:string,value:string):void};
export const PUZZLE_TITLE=tr('한 수의 달인');
export function readPuzzleRecords(storage:StoragePort):PuzzleRecords{
 try{const raw=JSON.parse(storage.getItem(PUZZLE_RECORDS_KEY)||'null');if(raw&&typeof raw==='object'&&raw.cleared&&typeof raw.cleared==='object')return {cleared:Object.fromEntries(Object.entries(raw.cleared).filter(([,v])=>v&&typeof v==='object'&&Number.isInteger((v as {tries:number}).tries)))} as PuzzleRecords;}catch{}
 return {cleared:{}};
}
/** Keeps the fewest tries; returns the new records (the caller saves them). */
export function recordPuzzleClear(records:PuzzleRecords,id:string,tries:number,at=Date.now()):PuzzleRecords{
 const old=records.cleared[id];if(old&&old.tries<=tries)return records;
 return {cleared:{...records.cleared,[id]:{tries,at:old?.at??at}}};
}
export function savePuzzleRecords(storage:StoragePort,records:PuzzleRecords){try{storage.setItem(PUZZLE_RECORDS_KEY,JSON.stringify(records));}catch{}}
export const allPuzzlesCleared=(records:PuzzleRecords,ids:readonly string[])=>ids.every(id=>records.cleared[id]);
