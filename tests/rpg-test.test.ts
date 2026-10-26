import assert from 'node:assert/strict';
import {createRpgTestGame,startRpgRound} from '../lib/rpg-game.ts';
import {settle} from '../lib/game.ts';
import {RPG_CONSUMABLES,RPG_RELICS,newRpgRun,settleRpgRound} from '../lib/rpg.ts';
import {readRpgTestGame,saveRpgTestGame,RPG_TEST_STORAGE_KEY} from '../lib/rpg-test-storage.ts';
import {readRpgArchive,RPG_STORAGE_KEY} from '../lib/rpg-storage.ts';
import {RPG_BASIC_ITEMS} from '../lib/rpg-items.ts';
import {readSaveSlots} from '../lib/save-slots.ts';

for(let n=0;n<20;n++){
 const game=createRpgTestGame('장비 테스트');const run=game.rpgRun!;
 assert.equal(game.rpgTest,true);assert.equal(game.phase,'playing');assert.equal(run.stage,1);
 assert.equal(run.relics.length,3);assert.equal(new Set(run.relics).size,3);
 assert.deepEqual(run.equipped,run.relics);
 assert.ok(run.relics.every(id=>RPG_RELICS.some(item=>item.id===id)&&!['mor-quill','twin-needle-compass','split-mirror'].includes(id)));
 assert.equal(run.consumables.length,10);
 assert.equal(new Set(run.consumables).size,5);
 assert.ok(run.consumables.every(id=>RPG_CONSUMABLES.some(item=>item.id===id)));
 assert.ok(run.consumables.includes('scout-lens'));
 assert.deepEqual(new Set(run.consumables),new Set(RPG_BASIC_ITEMS));
 for(const id of RPG_BASIC_ITEMS)assert.equal(run.consumables.filter(held=>held===id).length,2);
 for(const seat of [1,2])assert.deepEqual(run.enemyConsumables?.[seat],RPG_BASIC_ITEMS.flatMap(id=>[id,id]),'test opponents receive the same ten items');
 assert.ok(!run.consumables.includes('fates-scales'),'two-card exchange remains an additional item, outside the five-item test kit');
}
const values=new Map<string,string>();
const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
const game=createRpgTestGame('저장 테스트');saveRpgTestGame(storage,game);
assert.ok(values.has(RPG_TEST_STORAGE_KEY));assert.equal(values.has(RPG_STORAGE_KEY),false);
assert.equal(readRpgArchive(storage).active,null);
assert.equal(readRpgTestGame(storage)?.code,game.code);
assert.equal(readSaveSlots(storage).slots.find(slot=>slot.mode==='rpg-test')?.game?.code,game.code);
for(let round=1;round<=5;round++){
 game.round=round;game.phase='ended';game.winner=0;game.result=null;
 game.players[0].hand=[];
 settle(game);
 assert.equal(game.rpgRun?.rounds,round);
 assert.equal(game.rpgRun?.status,round===5?'complete':'playing');
}
assert.throws(()=>startRpgRound(game));
const bossRun={...newRpgRun('test-boss'),stage:3,hp:[100,1,1]};
const bossResult={id:'test-boss-round',at:Date.now(),players:[{count:0,delta:10},{count:1,delta:-5},{count:1,delta:-5}]};
assert.equal(settleRpgRound(bossRun,bossResult,0,true).reward?.reason,'clear');
assert.equal(settleRpgRound(bossRun,bossResult,0).reward?.reason,'end');
console.log('PASS: random RPG kit, scout lens, separate save and five-round limit');
