import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRpgJourneyGame,createRpgPhaseOneGame,enterJourneyNode} from '../lib/rpg-game.ts';
import {RPG_DEMO_PRICES} from '../lib/rpg-demo-catalog.ts';
import {saveRpgGame,readRpgArchive} from '../lib/rpg-storage.ts';
import {reconcileRpgEliminations} from '../lib/rpg-phase-one.ts';
const memory=()=>{const data=new Map<string,string>();return {getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);}};};
test('each profession starts a new journey with two of every demo consumable and 50 coins',()=>{
 for(const profession of ['swordsman','rogue','cleric','mage'] as const){
  const g=createRpgJourneyGame('시작 지급','',0,profession),run=g.rpgRun!;
  assert.equal(run.coins,50);assert.equal(run.consumables.length,12);
  for(const id of Object.keys(RPG_DEMO_PRICES))assert.equal(run.consumables.filter(held=>held===id).length,2,id);
  assert.equal(run.hp[0],100);assert.equal(run.fate,3);assert.deepEqual(run.enemyConsumables,{1:[],2:[]});
 }
});
test('spending, saving, entering ST1 and retrying cannot grant starting supplies a second time',()=>{
 let g=createRpgJourneyGame('중복 방지');g.rpgRun!.coins=17;g.rpgRun!.consumables.splice(0,1);const items=[...g.rpgRun!.consumables],store=memory();
 saveRpgGame(store,g);g=readRpgArchive(store).active!;assert.equal(g.rpgRun!.coins,17);assert.deepEqual(g.rpgRun!.consumables,items);
 enterJourneyNode(g,'battle-1');g.rpgRun!.hp[0]=0;reconcileRpgEliminations(g);enterJourneyNode(g,'battle-1');
 assert.equal(g.rpgRun!.coins,17);assert.deepEqual(g.rpgRun!.consumables,items);assert.equal(g.rpgRun!.fate,2);
});
test('existing empty saves and non-journey phase-one games do not receive a retroactive grant',()=>{
 const old=createRpgJourneyGame('기존 저장');old.rpgRun!.coins=0;old.rpgRun!.consumables=[];const store=memory();saveRpgGame(store,old);
 for(let i=0;i<2;i++){const run=readRpgArchive(store).active!.rpgRun!;assert.equal(run.coins,0);assert.deepEqual(run.consumables,[]);}
 const legacy=createRpgPhaseOneGame('이전 RPG').rpgRun!;assert.equal(legacy.coins,0);assert.deepEqual(legacy.consumables,[]);
});
