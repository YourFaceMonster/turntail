import assert from 'node:assert/strict';
import {readSaveSlots,saveSingleGame} from '../lib/save-slots.ts';
import {createStageGame} from '../lib/stage-game.ts';
import {saveStageGame,readStageArchive,STAGE_STORAGE_KEY} from '../lib/stage-storage.ts';
import {player,room,start} from '../lib/game.ts';
const memory=new Map<string,string>(),storage={getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>{memory.set(key,value);}};
const stage=createStageGame('도전 저장');saveStageGame(storage,stage);
assert.deepEqual(readSaveSlots(storage).slots.map(s=>s.mode),['stage'],'stage alone is resumable without a last-session pointer');
const p=player('일반 저장'),normal=room('AI-test',p,true,3);normal.players.push(player('달빛',true),player('해솔',true));start(normal);saveSingleGame(storage,normal);
memory.set('jangseong-session',JSON.stringify({code:normal.code,token:p.token,local:true}));
let slots=readSaveSlots(storage).slots;assert.deepEqual(slots.map(s=>s.mode),['single','stage']);assert.deepEqual(slots.find(s=>s.mode==='stage')!.game,stage);assert.deepEqual(slots.find(s=>s.mode==='single')!.game,normal);
// A new general game and an online room cannot hide the older challenge.
const beforeStage=memory.get(STAGE_STORAGE_KEY);const newNormal=structuredClone(normal);newNormal.code='AI-new';saveSingleGame(storage,newNormal);assert.equal(memory.get(STAGE_STORAGE_KEY),beforeStage);
memory.set('jangseong-session',JSON.stringify({code:'ONLINE',token:'online-token'}));slots=readSaveSlots(storage).slots;assert.deepEqual(slots.map(s=>s.mode),['single','stage','multi']);assert.equal(slots[0].session.code,'AI-new','local resume derives its own session');
// Starting another stage must be explicitly authorized; replacement is atomic.
const fresh=createStageGame('다시 시작');assert.throws(()=>saveStageGame(storage,fresh),/먼저 확인/);assert.equal(memory.get(STAGE_STORAGE_KEY),beforeStage);
const failing={...storage,setItem(){throw Error('quota');}};assert.throws(()=>saveStageGame(failing,fresh,true),/저장하지 못해/);assert.equal(memory.get(STAGE_STORAGE_KEY),beforeStage);
const beforeNormal=memory.get('jangseong-practice-game');saveStageGame(storage,fresh,true);let archive=readStageArchive(storage);assert.equal(archive.active!.stageRun!.id,fresh.stageRun!.id);assert.equal(archive.records.find(r=>r.id===stage.stageRun!.id)!.status,'abandoned');assert.equal(memory.get('jangseong-practice-game'),beforeNormal);
assert.throws(()=>saveSingleGame(failing,newNormal),/저장하지 못해/);assert.equal(memory.get('jangseong-practice-game'),beforeNormal);
// Corruption in one save is visible, preserved and does not hide other modes.
memory.set('jangseong-practice-game','{broken');const found=readSaveSlots(storage);assert.deepEqual(found.slots.map(s=>s.mode),['stage','multi']);assert.equal(found.errors.length,1);assert.equal(memory.get('jangseong-practice-game'),'{broken');
console.log('PASS: independent classic/stage/online resume, exact state recovery after mode switching, replacement confirmation guard, atomic replacement history, write failures and isolated corrupt saves.');
