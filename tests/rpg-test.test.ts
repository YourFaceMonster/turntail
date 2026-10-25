import assert from 'node:assert/strict';
import {createRpgTestGame} from '../lib/rpg-game.ts';
import {RPG_CONSUMABLES,RPG_RELICS} from '../lib/rpg.ts';
import {readRpgTestGame,saveRpgTestGame,RPG_TEST_STORAGE_KEY} from '../lib/rpg-test-storage.ts';
import {readRpgArchive,RPG_STORAGE_KEY} from '../lib/rpg-storage.ts';
import {readSaveSlots} from '../lib/save-slots.ts';

for(let n=0;n<20;n++){
 const game=createRpgTestGame('장비 테스트');const run=game.rpgRun!;
 assert.equal(game.rpgTest,true);assert.equal(game.phase,'playing');assert.equal(run.stage,1);
 assert.equal(run.relics.length,3);assert.equal(new Set(run.relics).size,3);
 assert.deepEqual(run.equipped,run.relics);
 assert.ok(run.relics.every(id=>RPG_RELICS.some(item=>item.id===id)&&!['mor-quill','twin-needle-compass','split-mirror'].includes(id)));
 assert.equal(run.consumables.length,3);
 assert.ok(run.consumables.every(id=>RPG_CONSUMABLES.some(item=>item.id===id)));
 assert.ok(run.consumables.some(id=>['swapped-fate','fates-scales','scout-lens'].includes(id)));
}
const values=new Map<string,string>();
const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
const game=createRpgTestGame('저장 테스트');saveRpgTestGame(storage,game);
assert.ok(values.has(RPG_TEST_STORAGE_KEY));assert.equal(values.has(RPG_STORAGE_KEY),false);
assert.equal(readRpgArchive(storage).active,null);
assert.equal(readRpgTestGame(storage)?.code,game.code);
assert.equal(readSaveSlots(storage).slots.find(slot=>slot.mode==='rpg-test')?.game?.code,game.code);
console.log('PASS: random RPG test kit, active relics, tactical item guarantee and separate save');
