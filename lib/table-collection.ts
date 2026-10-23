import type {StageRecord,StageRun} from './stage-challenge';
export const TABLE_COLLECTION_KEY='turntale-table-collection';
export type TableCollection={version:1,selected:number,unlocked:number[]};
type Storage={getItem:(key:string)=>string|null,setItem:(key:string,value:string)=>void};
const valid=(n:unknown):n is number=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=10;
export function defaultCollection():TableCollection{return {version:1,selected:0,unlocked:[0]};}
export function readTableCollection(storage:Pick<Storage,'getItem'>):TableCollection{
 let value;try{value=JSON.parse(storage.getItem(TABLE_COLLECTION_KEY)||'null');}catch{return defaultCollection();}
 if(value?.version!==1||!Array.isArray(value.unlocked))return defaultCollection();
 const unlocked=[...new Set<number>([0,...value.unlocked.filter(valid)])].sort((a,b)=>a-b);
 return {version:1,selected:valid(value.selected)&&unlocked.includes(value.selected)?value.selected:0,unlocked};
}
/** Clear history restores old rewards; a fresh run never relocks an earned set. */
export function reconcileTableCollection(collection:TableCollection,archive:{active:{stageRun?:StageRun|null}|null,records:Pick<StageRecord,'cleared'>[]}):TableCollection{
 const cleared=Math.max(0,...archive.records.map(r=>valid(r.cleared)?r.cleared:0),archive.active?.stageRun?.cleared||0);
 const unlocked=[...new Set([...collection.unlocked,...Array.from({length:Math.min(10,cleared)+1},(_,i)=>i)])].sort((a,b)=>a-b);
 return {...collection,unlocked};
}
export function selectTableSet(collection:TableCollection,set:number):TableCollection{
 if(!valid(set)||!collection.unlocked.includes(set))throw Error('해당 스테이지를 클리어하면 선택할 수 있어요.');
 return {...collection,selected:set};
}
export function saveTableCollection(storage:Pick<Storage,'setItem'>,collection:TableCollection){storage.setItem(TABLE_COLLECTION_KEY,JSON.stringify(collection));}
