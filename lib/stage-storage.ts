import type {Game} from './game.ts';
import {stageRecord,stageRecordOrder,type StageRecord} from './stage-challenge.ts';
export const STAGE_STORAGE_KEY='turntale-stage-state-v1';
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
export type StageArchive={version:1,active:Game|null,records:StageRecord[]};
export function readStageArchive(storage:StoragePort):StageArchive{
 const raw=storage.getItem(STAGE_STORAGE_KEY);if(!raw)return {version:1,active:null,records:[]};
 let saved:StageArchive;try{saved=JSON.parse(raw);}catch{throw Error('도전 저장 데이터를 읽지 못했어요. 기존 데이터는 보존했어요.');}
 if(!saved||saved.version!==1||!Array.isArray(saved.records)||saved.active&&(!saved.active.stageRun||saved.active.stageRun.rulesVersion!==1||saved.active.players.length!==4))throw Error('도전 저장 데이터의 형식을 확인해 주세요.');
 return saved;
}
/** Full game and its separate run record are one atomic localStorage write. */
export function saveStageGame(storage:StoragePort,game:Game):StageArchive{
 if(!game.stageRun)throw Error('스테이지 도전 데이터가 없어요.');
 const old=readStageArchive(storage),row=stageRecord(game.stageRun,game.players[0].name),records=old.records.filter(r=>r.id!==row.id);
 records.push(row);records.sort(stageRecordOrder);
 const saved:StageArchive={version:1,active:['playing','stage-clear'].includes(game.stageRun.status)?game:null,records};
 try{storage.setItem(STAGE_STORAGE_KEY,JSON.stringify(saved));}catch{throw Error('도전을 저장하지 못해 이번 동작을 적용하지 않았어요. 브라우저 저장 공간을 확인해 주세요.');}
 return saved;
}
