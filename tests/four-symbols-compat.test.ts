import assert from 'node:assert/strict';
import {test} from 'node:test';
import {suits,suitRank,rank,beats,type Tile} from '../lib/game';
import {bombBeats,createBombGame,BOMB_SUIT_NAMES} from '../lib/bomb-market';
import {readBombSave,BOMB_SAVE_KEY,validateBombSave} from '../lib/bomb-market-storage';
import {ACHIEVEMENTS} from '../lib/achievements';
const tile=(n:number,s:number):Tile=>({id:(n-1)*4+s,n,s});
test('all sixty saved tile identities retain numeric and suit order under new display names',()=>{
 assert.deepEqual(suits,['철문','비밀의 열쇠','성화','왕관']);
 assert.deepEqual(BOMB_SUIT_NAMES,['검정 철문','초록 비밀의 열쇠','주황 성화','빨강 왕관']);
 const deck=Array.from({length:60},(_,id)=>tile(Math.floor(id/4)+1,id%4));
 for(const a of deck)for(const b of deck){
  const oldScore=(t:Tile)=>(t.n===2?17:t.n===1?16:t.n)*4+[0,2,1,3][t.s];
  assert.equal(rank(a)*4+suitRank(a.s),oldScore(a)-4);
  assert.equal(beats([a],[b]),oldScore(a)>oldScore(b));
  assert.equal(bombBeats([a],[b]),oldScore(a)>oldScore(b));
 }
 assert.ok(bombBeats([0,1,2,3].map(s=>tile(3,s)),[tile(2,3)]));
 assert.ok(ACHIEVEMENTS.some(a=>a.id==='secret-sun'&&a.description.includes('왕관')),'saved achievement ID is retained');
});
test('schema-one saved suit IDs load without migration or record mutation',()=>{
 let seed=17;const g=createBombGame('기존 저장',()=>{seed=Math.imul(seed,1664525)+1013904223|0;return (seed>>>0)/4294967296;});
 validateBombSave(g);const raw=JSON.stringify(g),records='{"original":"preserved"}';
 const entries=new Map([[BOMB_SAVE_KEY,raw],['turntale.bomb-market.records.v1',records]]);
 const restored=readBombSave({getItem:key=>entries.get(key)||null,setItem:(key,value)=>{entries.set(key,value);}},200);
 assert.equal(restored.error,null);assert.deepEqual(restored.game,g);
 assert.equal(entries.get(BOMB_SAVE_KEY),raw);assert.equal(entries.get('turntale.bomb-market.records.v1'),records);
});
