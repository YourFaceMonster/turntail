import {refundLegacyEmbers} from './rpg-items.ts';
import type {Game} from './game.ts';

export const RPG_TEST_STORAGE_KEY='turntale-rpg-test-v1';
type StoragePort=Pick<Storage,'getItem'|'setItem'>;

export function readRpgTestGame(storage:StoragePort):Game|null{
 const raw=storage.getItem(RPG_TEST_STORAGE_KEY);if(!raw)return null;
 let game:Game;
 try{game=JSON.parse(raw);}catch{throw Error('RPG 테스트 저장을 읽지 못했어요. 기존 데이터는 보존했어요.');}
 if(!game?.rpgTest||!game.rpgRun||!game.practice||game.players?.length!==3||!game.players[0]?.token)throw Error('RPG 테스트 저장 형식을 확인해 주세요. 기존 데이터는 보존했어요.');
 refundLegacyEmbers(game);return game;
}

export function saveRpgTestGame(storage:StoragePort,game:Game){
 if(!game.rpgTest||!game.rpgRun||!game.practice)throw Error('RPG 테스트 저장 대상이 아니에요.');
 try{storage.setItem(RPG_TEST_STORAGE_KEY,JSON.stringify(game));}catch{throw Error('RPG 테스트를 저장하지 못해 이번 행동을 적용하지 않았어요.');}
 return game;
}
