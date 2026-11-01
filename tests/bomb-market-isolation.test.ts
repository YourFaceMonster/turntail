import assert from 'node:assert/strict';
import {test} from 'node:test';
import {botMove,start,view,type Game} from '../lib/game';
import {seededGame} from './fixtures/strategy-positions';
import {newChallenge} from '../lib/challenge';
import {saveSingleGame,readSaveSlots} from '../lib/save-slots';
import {createStageGame} from '../lib/stage-game';
import {saveStageGame} from '../lib/stage-storage';
import {createRpgJourneyGame} from '../lib/rpg-game';
import {saveRpgGame} from '../lib/rpg-storage';
import {BOMB_SAVE_KEY,saveBombGame,readBombSave} from '../lib/bomb-market-storage';
import {createBombGame} from '../lib/bomb-market';
function finish(g:Game){let now=0,steps=0;while(g.phase==='playing'&&steps++<1200){now=Math.max(now+10000,(g.turnReadyAt||0)+10000);botMove(g,now);}assert.equal(g.phase,'ended');assert.ok(g.result);return steps;}
test('classic 3/4-player seeded rounds complete under current animation clock',()=>{for(const size of [3,4])for(let seed=1;seed<=3;seed++){const g=seededGame(seed*3911,size);assert.deepEqual(g.players.map(p=>p.hand.length),Array(size).fill(size===3?10:9));const v=view(g,g.players[0].token);assert.equal(v.players[1].hand,undefined);finish(g);assert.equal(g.players[g.winner!].hand.length,0);assert.equal(g.players.reduce((sum,p)=>sum+(p.points??0),0),0);}});
test('legacy ten-round challenge completes without Bomb Market fields/rules',()=>{const g=seededGame(42,3);g.challenge=newChallenge('isolation',3);for(let round=1;round<=10;round++){if(round>1)start(g,0);finish(g);assert.equal(g.challenge!.completed,round);assert.equal('market' in g,false);assert.equal('reaction' in g,false);}assert.equal(g.challenge!.complete,true);assert.throws(()=>start(g));});
test('real classic/challenge/RPG saves and prior records remain byte-identical',()=>{const data=new Map<string,string>(),storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};saveSingleGame(storage,seededGame(8,3));saveStageGame(storage,createStageGame('도전 보존'));saveRpgGame(storage,createRpgJourneyGame('RPG 보존'));storage.setItem('turntale-existing-achievements','earned');storage.setItem('turntale-existing-records','history');const before=new Map(data),slots=readSaveSlots(storage);saveBombGame(storage,createBombGame());assert.ok(readBombSave(storage).game);assert.equal(data.size,before.size+1);assert.ok(data.has(BOMB_SAVE_KEY));for(const [key,value] of before)assert.equal(data.get(key),value,key);assert.deepEqual(readSaveSlots(storage),slots);});
