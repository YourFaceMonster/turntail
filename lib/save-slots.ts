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
 for(const variant of [1,2] as const)try{const g=readHpItemArchive(storage,variant).active;if(g)slots.push({mode:variant===2?'hp-item-2':'hp-item',title:`아이템전${variant} · ${g.hpItemRules===3?'싸움 공격·돈 상점':g.hpItemRules===2?'이전 테스트 규칙':variant===2?'이전 포인트 상점':'기본 HP 대전'}`,detail:`${g.players[0].name} · 라운드 ${g.round} · HP ${g.rpgRun!.hp[0]}/100`,game:g,session:{code:g.code,token:g.players[0].token,local:true}});}catch{errors.push('HP 아이템전 저장을 읽지 못했어요. 기존 데이터는 보존했어요.');}
 try{const s=json<Session>(storage,'jangseong-session');if(s&&!s.local&&s.code&&s.token)slots.push({mode:'multi',title:'멀티플레이',detail:`방 코드 ${s.code} · 방 상태 확인 후 이어하기`,session:s});}catch{errors.push('멀티플레이 연결 정보를 읽지 못했어요.');}
 return {slots,errors};
}
/** No silent storage failures: publish the new live state only after persistence succeeds. */
export function saveSingleGame(storage:StoragePort,game:Game){
 if(!game.practice||game.stageRun||game.rpgRun)throw Error('일반모드 저장 대상이 아니에요.');
 try{storage.setItem(game.itemRun?ITEM_GAME_KEY:SINGLE_GAME_KEY,JSON.stringify(game));}catch{throw Error('일반모드를 저장하지 못해 이번 동작을 적용하지 않았어요. 브라우저 저장 공간을 확인해 주세요.');}
}
