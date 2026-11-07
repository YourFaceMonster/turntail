import {validateStoryCards,type StoryCardId} from './rpg-story-cards.ts';
import {refundLegacyEmbers} from './rpg-items.ts';
import {validateJourneySave} from './rpg-journey.ts';
import type {Game} from './game.ts';
import type {RpgRun} from './rpg.ts';
export const RPG_PHASE_ONE_STORAGE_KEY='turntale-rpg-journey-phase1-v1';
export const RPG_REWORK_BACKUP_KEY='turntale-rpg-before-rework-v2';
export const RPG_STORAGE_KEY='turntale-rpg-state-v1';
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
export type RpgRecord={id:string,name:string,stage:number,status:RpgRun['status'],rounds:number,startedAt:number,updatedAt:number};
export type RpgArchive={lastCompleted?:Game,storyCards?:StoryCardId[],rumors?:string[],version:1,active:Game|null,records:RpgRecord[],discovered:string[],unlocked:string[]};
const empty=():RpgArchive=>({version:1,active:null,records:[],discovered:[],unlocked:[]});
export function readRpgArchive(storage:StoragePort):RpgArchive{
 const raw=storage.getItem(RPG_PHASE_ONE_STORAGE_KEY)??storage.getItem(RPG_STORAGE_KEY);if(!raw)return empty();
 let saved:RpgArchive;try{saved=JSON.parse(raw);}catch{throw Error('RPG 저장 데이터를 읽지 못했어요. 기존 데이터는 보존했어요.');}
 if(saved?.version!==1||!Array.isArray(saved.records)||saved.active&&(!saved.active.rpgRun||saved.active.players?.length!==3))throw Error('RPG 저장 형식을 확인해 주세요. 기존 데이터는 보존했어요.');
 if(saved.storyCards!==undefined)validateStoryCards(saved.storyCards);
 if(saved.active?.rpgRun?.rework&&saved.active.rpgRun.rework.version!==2)throw Error('지원하지 않는 RPG 규칙 버전이에요. 원본 저장을 보존했어요.');
 if(saved.active){validateJourneySave(saved.active);refundLegacyEmbers(saved.active);if(saved.active.rpgRun&&!saved.active.rpgRun.rework&&!saved.active.hpItemMode&&!saved.active.rpgTest)saved.active.rpgRun.pendingRework=true;}
 return {...saved,storyCards:[...new Set([...(saved.storyCards||[]),...(saved.active?.rpgRun?.storyCards||[])])],rumors:Array.isArray(saved.rumors)?saved.rumors:[],discovered:Array.isArray(saved.discovered)?saved.discovered:[],unlocked:Array.isArray(saved.unlocked)?saved.unlocked:[]};
}
export function saveRpgGame(storage:StoragePort,game:Game,replace=false):RpgArchive{
 const run=game.rpgRun;if(!run||game.hpItemMode)throw Error('RPG 여정 데이터가 없어요.');
 validateJourneySave(game);
 const old=readRpgArchive(storage);
 if(old.active&&!old.active.rpgRun?.rework&&!storage.getItem(RPG_REWORK_BACKUP_KEY)){
  const raw=storage.getItem(RPG_PHASE_ONE_STORAGE_KEY)??storage.getItem(RPG_STORAGE_KEY);
  try{if(raw)storage.setItem(RPG_REWORK_BACKUP_KEY,raw);}catch{throw Error('이전 RPG 저장 백업에 실패했어요. 원본을 보존하고 전환을 중단했어요.');}
 }
 const records=old.records.filter(row=>row.id!==run.id);
 if(old.active?.rpgRun?.id!==run.id&&old.active){
  if(!replace)throw Error('저장된 RPG 여정이 있어요. 새 여정으로 교체할지 선택해 주세요.');
  const prior=old.active.rpgRun!;records.push({id:prior.id,name:old.active.players[0].name,stage:prior.stage,status:'abandoned',rounds:prior.rounds,startedAt:prior.startedAt,updatedAt:run.startedAt});
 }
 records.push({id:run.id,name:game.players[0].name,stage:run.stage,status:run.status,rounds:run.rounds,startedAt:run.startedAt,updatedAt:run.updatedAt});
 records.sort((a,b)=>b.updatedAt-a.updatedAt);records.splice(10);
 const saved:RpgArchive={...(run.rework&&run.status==='complete'?{lastCompleted:structuredClone(game)}:old.lastCompleted?{lastCompleted:old.lastCompleted}:{}),storyCards:[...new Set([...(old.storyCards||[]),...(run.storyCards||[])])],rumors:[...new Set([...(old.rumors||[]),...(run.journey?.rumors||[])])],version:1,active:['playing','allocation','relic','ready'].includes(run.status)?game:null,records,discovered:[...new Set([...(old.discovered||[]),...run.discovered])],unlocked:[...new Set([...(old.unlocked||[]),...(run.unlocked||[])])]};
 try{storage.setItem(run.phaseOne?RPG_PHASE_ONE_STORAGE_KEY:RPG_STORAGE_KEY,JSON.stringify(saved));}catch{throw Error('RPG 여정을 저장하지 못해 이번 행동을 적용하지 않았어요.');}
 return saved;
}
