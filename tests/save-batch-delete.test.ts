// Explicit 100 HP fixtures also cover compatibility with pre-0.6.44 saved matches.
import assert from 'node:assert/strict';
import {createHpItemGame,saveHpItemGame} from '../lib/hp-item-mode.ts';
import {createRpgGame} from '../lib/rpg-game.ts';
import {saveRpgGame} from '../lib/rpg-storage.ts';
import {readSaveSlots,deleteSaveSlots} from '../lib/save-slots.ts';
const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);}};
saveRpgGame(storage,createRpgGame('기록 유지'));saveHpItemGame(storage,createHpItemGame('선택 삭제','',Date.now(),2,'toto','rogue',100));values.set('settings','keep');
for(const key of ['turntale-rpg-state-v1','turntale-hp-items-2-v1']){const archive=JSON.parse(values.get(key)!);archive.records=[{id:'record-'+key}];archive.unlocked=['sun'];values.set(key,JSON.stringify(archive));}
const slots=readSaveSlots(storage).slots,before=[...values.entries()];assert.throws(()=>deleteSaveSlots(storage,[]),/선택/);assert.throws(()=>deleteSaveSlots(storage,[slots[0],{...slots[1],session:{...slots[1].session,code:'stale'}}]),/변경/);assert.deepEqual([...values.entries()],before,'a stale second selection cannot delete the first');
let fail=true;assert.throws(()=>deleteSaveSlots({...storage,setItem(key,value){if(key==='turntale-hp-items-2-v1'&&fail){fail=false;throw Error('quota');}storage.setItem(key,value);}},slots),/삭제하지 못/);assert.deepEqual([...values.entries()],before,'a failed second archive write restores the first archive too');
deleteSaveSlots(storage,slots);for(const key of ['turntale-rpg-state-v1','turntale-hp-items-2-v1']){const archive=JSON.parse(values.get(key)!);assert.equal(archive.active,null);assert.deepEqual(archive.records,[{id:'record-'+key}]);assert.deepEqual(archive.unlocked,['sun']);}assert.equal(values.get('settings'),'keep');assert.equal(readSaveSlots(storage).slots.length,0);
console.log('PASS: checked save selection is all-or-nothing, stale selection prevents every deletion, write failures roll back all archives, records/settings/unlocks preserved');
