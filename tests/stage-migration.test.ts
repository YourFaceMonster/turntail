import assert from 'node:assert/strict';
import {player,room,start,settle} from '../lib/game.ts';
import {newStageRun} from '../lib/stage-challenge.ts';
import {migrateStageGame,startStageRound} from '../lib/stage-game.ts';
import {readStageArchive,saveStageGame} from '../lib/stage-storage.ts';
import {stageMapScrollTop} from '../lib/stage-map.ts';
const human=player('기존 도전자'),old=room('OLD-STAGE',human,true,4);
old.players.push(player('AI1',true),player('AI2',true),player('AI3',true));
old.stageRun={...newStageRun('KEEP-RUN',100),rulesVersion:1,stage:5,cleared:4,score:1100,peakScore:1250,rounds:8,stageRounds:2,roundIds:['kept-result']};
old.players.forEach((p,i)=>p.points=i===0?1100:200+i*10);start(old,1000);
const untouched=structuredClone(old),migrated=migrateStageGame(old,2000);
assert.deepEqual(old,untouched,'conversion never edits a read-only save in place');
assert.equal(migrated.capacity,3);assert.equal(migrated.players.length,3);assert.equal(migrated.stageRun!.rulesVersion,2);
assert.equal(migrated.players[0].points,1100);assert.equal(migrated.stageRun!.stage,5);assert.equal(migrated.stageRun!.cleared,4);assert.equal(migrated.stageRun!.peakScore,1250);
assert.deepEqual(migrated.stageRun!.roundIds,['kept-result']);assert.equal(migrated.stageRun!.rounds,8);assert.equal(migrated.round,old.round);
assert.ok(migrated.players.every(p=>p.hand.length===10));assert.equal(migrated.stacks.length,15);
assert.equal(new Set([...migrated.players.flatMap(p=>p.hand),...migrated.stacks.flat().filter(Boolean)].map(t=>t!.id)).size,60,'re-deal preserves a complete, unique sixty-tile deck');
assert.equal(migrateStageGame(migrated),migrated,'conversion is idempotent');
const memory=new Map<string,string>(),storage={getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>{memory.set(k,v);}};
saveStageGame(storage,old);assert.equal(readStageArchive(storage).active!.players.length,4,'legacy saves remain readable');
saveStageGame(storage,migrated);assert.equal(readStageArchive(storage).active!.players.length,3);assert.equal(readStageArchive(storage).records.length,1);
const ended=structuredClone(old);ended.players[0].hand=[];ended.phase='ended';ended.winner=0;settle(ended);
const prior=structuredClone(ended.result);assert.equal(migrateStageGame(ended),ended,'an already-settled result remains intact');
assert.deepEqual(ended.result,prior);startStageRound(ended,3000);assert.equal(ended.players.length,3);assert.equal(ended.result,null);
for(const [node,viewport,content] of [[100,400,1600],[800,400,1600],[1350,400,1600],[60,800,600]]){
 const top=stageMapScrollTop(node,viewport,content);assert.ok(top>=0&&top<=Math.max(0,content-viewport));
 if(node>=viewport/2&&node<=content-viewport/2)assert.equal(node-top,viewport/2);
}
console.log('PASS: old 4-seat saves convert once to 3 seats, retain stage/balances/records, re-deal all 60 unique tiles, preserve settled results, and center the active map node within scroll bounds.');
