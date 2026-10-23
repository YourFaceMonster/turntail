import type {Game} from './game.ts';
import {readStageArchive} from './stage-storage.ts';
export type Session={code:string,token:string,local?:boolean};
export type SaveSlot={mode:'single'|'stage'|'multi',title:string,detail:string,game?:Game,session:Session};
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
export const SINGLE_GAME_KEY='jangseong-practice-game';
function json<T>(storage:StoragePort,key:string):T|null{const raw=storage.getItem(key);if(!raw)return null;return JSON.parse(raw);}
/** A session pointer never decides which local saves exist. Each slot is discovered independently. */
export function readSaveSlots(storage:StoragePort){
 const slots:SaveSlot[]=[],errors:string[]=[];
 try{const g=json<Game>(storage,SINGLE_GAME_KEY);if(g){if(!g.practice||g.stageRun||!g.players?.[0]?.token)throw Error('일반모드 저장 형식을 확인해 주세요.');slots.push({mode:'single',title:g.challenge?'일반모드 · 10판 도전':'일반모드 · AI 대전',detail:`${g.players[0].name} · ${g.capacity}인전 · ${g.round}번째 판 · ${g.players[0].points||0}점`,game:g,session:{code:g.code,token:g.players[0].token,local:true}});}}catch{errors.push('일반모드 저장을 읽지 못했어요. 기존 데이터는 보존했어요.');}
 try{const g=readStageArchive(storage).active;if(g)slots.push({mode:'stage',title:'도전모드 · 스테이지 여정',detail:`${g.players[0].name} · STAGE ${g.stageRun!.stage}/10 · ${g.stageRun!.score}점`,game:g,session:{code:g.code,token:g.players[0].token,local:true}});}catch{errors.push('도전모드 저장을 읽지 못했어요. 기존 데이터는 보존했어요.');}
 try{const s=json<Session>(storage,'jangseong-session');if(s&&!s.local&&s.code&&s.token)slots.push({mode:'multi',title:'멀티플레이',detail:`방 코드 ${s.code} · 방 상태 확인 후 이어하기`,session:s});}catch{errors.push('멀티플레이 연결 정보를 읽지 못했어요.');}
 return {slots,errors};
}
/** No silent storage failures: publish the new live state only after persistence succeeds. */
export function saveSingleGame(storage:StoragePort,game:Game){
 if(!game.practice||game.stageRun)throw Error('일반모드 저장 대상이 아니에요.');
 try{storage.setItem(SINGLE_GAME_KEY,JSON.stringify(game));}catch{throw Error('일반모드를 저장하지 못해 이번 동작을 적용하지 않았어요. 브라우저 저장 공간을 확인해 주세요.');}
}
