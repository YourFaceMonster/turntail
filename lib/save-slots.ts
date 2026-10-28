import {readHpItemArchive} from './hp-item-mode.ts';
import type {Game} from './game.ts';
import {readRpgArchive} from './rpg-storage.ts';
import {readRpgTestGame} from './rpg-test-storage.ts';
export type Session={code:string,token:string,local?:boolean};
export type SaveSlot={mode:'single'|'item'|'stage'|'rpg'|'rpg-test'|'hp-item'|'hp-item-2'|'multi',title:string,detail:string,game?:Game,session:Session};
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
export const SINGLE_GAME_KEY='jangseong-practice-game';
export const ITEM_GAME_KEY='turntale-item-game-v1';
function json<T>(storage:StoragePort,key:string):T|null{const raw=storage.getItem(key);if(!raw)return null;return JSON.parse(raw);}
/** A session pointer never decides which local saves exist. Each slot is discovered independently. */
export function readSaveSlots(storage:StoragePort){
 const slots:SaveSlot[]=[],errors:string[]=[];
 try{const g=json<Game>(storage,SINGLE_GAME_KEY);if(g&&g.capacity!==2&&!g.challenge&&!g.stageRun&&!g.itemRun){if(!g.practice||g.rpgRun||!g.players?.[0]?.token)throw Error('저장 형식을 확인해 주세요.');slots.push({mode:'single',title:'일반모드 · AI 대전',detail:`${g.players[0].name} · ${g.capacity}인전 · ${g.round}번째 판 · ${g.players[0].points||0}점`,game:g,session:{code:g.code,token:g.players[0].token,local:true}});}}catch{errors.push('일반모드 저장을 읽지 못했어요. 기존 데이터는 보존했어요.');}
 try{const g=readRpgArchive(storage).active;if(g)slots.push({mode:'rpg',title:'RPG 모드 · 여정',detail:`${g.players[0].name} · STAGE ${g.rpgRun!.stage}/10 · HP ${g.rpgRun!.hp[0]} · 운명 ${g.rpgRun!.fate}`,game:g,session:{code:g.code,token:g.players[0].token,local:true}});}catch{errors.push('RPG 여정 저장을 읽지 못했어요. 기존 데이터는 보존했어요.');}
 try{const g=readRpgTestGame(storage);if(g&&['playing','allocation','relic','ready'].includes(g.rpgRun!.status))slots.push({mode:'rpg-test',title:'이전 RPG 장비 테스트',detail:`${g.players[0].name} · STAGE ${g.rpgRun!.stage}/3 · 유물 ${g.rpgRun!.relics.length}개 · 아이템 ${g.rpgRun!.consumables.length}개`,game:g,session:{code:g.code,token:g.players[0].token,local:true}});}catch{errors.push('RPG 테스트 저장을 읽지 못했어요. 기존 데이터는 보존했어요.');}
 // Retired item-mode-1 archives remain untouched and never produce a resume slot.
 try{const g=readHpItemArchive(storage,2).active;if(g)slots.push({mode:'hp-item-2',title:`아이템전 · ${g.hpItemRules===4?'포인트 상점·전투·스킬':'이전 규칙'}`,detail:`${g.players[0].name} · 라운드 ${g.round} · HP ${g.rpgRun!.hp[0]}/100`,game:g,session:{code:g.code,token:g.players[0].token,local:true}});}catch{errors.push('HP 아이템전 저장을 읽지 못했어요. 기존 데이터는 보존했어요.');}
 try{const s=json<Session>(storage,'jangseong-session');if(s&&!s.local&&s.code&&s.token)slots.push({mode:'multi',title:'멀티플레이',detail:`방 코드 ${s.code} · 방 상태 확인 후 이어하기`,session:s});}catch{errors.push('멀티플레이 연결 정보를 읽지 못했어요.');}
 return {slots,errors};
}
/** No silent storage failures: publish the new live state only after persistence succeeds. */
export function saveSingleGame(storage:StoragePort,game:Game){
 if(!game.practice||game.stageRun||game.rpgRun)throw Error('일반모드 저장 대상이 아니에요.');
 try{storage.setItem(game.itemRun?ITEM_GAME_KEY:SINGLE_GAME_KEY,JSON.stringify(game));}catch{throw Error('일반모드를 저장하지 못해 이번 동작을 적용하지 않았어요. 브라우저 저장 공간을 확인해 주세요.');}
}

/** Delete only the explicitly selected progress; preserve archive records and unlocks. */
export function deleteSaveSlot(storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>,slot:SaveSlot){
 const keys:Partial<Record<SaveSlot['mode'],string>>={single:SINGLE_GAME_KEY,rpg:'turntale-rpg-state-v1','rpg-test':'turntale-rpg-test-v1','hp-item-2':'turntale-hp-items-2-v1',multi:'jangseong-session'};
 const key=keys[slot.mode];if(!key)throw Error('삭제할 저장을 다시 선택해 주세요.');
 const raw=storage.getItem(key);if(raw===null)return;
 let value:any;try{value=JSON.parse(raw);}catch{throw Error('저장이 변경됐어요. 목록을 다시 열어 주세요.');}
 const archive=slot.mode==='rpg'||slot.mode==='hp-item-2',current=archive?value?.active:value;
 const code=current?.code;
 if(code!==slot.session.code)throw Error('저장이 변경됐어요. 목록을 다시 열어 주세요.');
 if(archive&&(!Array.isArray(value.records)||value.version!==1))throw Error('기록을 보존할 수 없어 삭제하지 않았어요.');
 const before=new Map<string,string|null>([[key,raw]]),after=new Map<string,string|null>([[key,archive?JSON.stringify({...value,active:null}):null]]);
 if(slot.mode!=='multi'){
  const sessionRaw=storage.getItem('jangseong-session');let pointer:Session|null=null;try{pointer=sessionRaw?JSON.parse(sessionRaw):null;}catch{}
  if(pointer?.local&&pointer.code===slot.session.code){before.set('jangseong-session',sessionRaw);after.set('jangseong-session',null);}
 }
 try{for(const [target,next] of after)next===null?storage.removeItem(target):storage.setItem(target,next);}
 catch{for(const [target,previous] of before){try{previous===null?storage.removeItem(target):storage.setItem(target,previous);}catch{}}throw Error('저장을 삭제하지 못했어요. 기존 진행을 다시 확인해 주세요.');}
}

/** Validate every checked slot first; commit the entire selection or restore it all. */
export function deleteSaveSlots(storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>,slots:SaveSlot[]){
 if(!slots.length)throw Error('삭제할 저장을 선택해 주세요.');
 const changes=new Map<string,string|null>(),staging={getItem:(key:string)=>changes.has(key)?changes.get(key)!:storage.getItem(key),setItem:(key:string,value:string)=>{changes.set(key,value);},removeItem:(key:string)=>{changes.set(key,null);}};
 for(const slot of new Map(slots.map(slot=>[slot.mode,slot])).values())deleteSaveSlot(staging,slot);
 const before=new Map([...changes.keys()].map(key=>[key,storage.getItem(key)]));
 try{for(const [key,value] of changes)value===null?storage.removeItem(key):storage.setItem(key,value);}
 catch{for(const [key,value] of before){try{value===null?storage.removeItem(key):storage.setItem(key,value);}catch{}}throw Error('선택한 저장을 삭제하지 못했어요. 기존 진행을 다시 확인해 주세요.');}
}
