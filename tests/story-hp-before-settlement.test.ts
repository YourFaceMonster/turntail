import assert from 'node:assert/strict';
import test from 'node:test';
import {hpItemDisplayHp} from '../lib/hp-item-shop.ts';

// Story mode: a finished round's HP change is shown only when the settlement screen opens (reveal=true).
test('story round end keeps round-start HP on seats until the settlement screen',()=>{
 const rpgRun={rework:{},hp:[80,30,55],roundHealth:{round:2,before:[90,50,50],damage:[10,20,0],healing:[0,0,5],moneyDamage:[0,0,0],coinsBefore:0}} as never;
 const ended={phase:'ended',round:2,rpgRun} as never,playing={phase:'playing',round:2,rpgRun} as never;
 assert.deepEqual([0,1,2].map(seat=>hpItemDisplayHp(ended,seat,false)),[90,50,50],'before the settlement screen');
 assert.deepEqual([0,1,2].map(seat=>hpItemDisplayHp(ended,seat,true)),[80,30,55],'settlement screen open');
 assert.deepEqual([0,1,2].map(seat=>hpItemDisplayHp(playing,seat,false)),[80,30,55],'during play the real HP shows');
 assert.equal(hpItemDisplayHp({phase:'ended',round:3,rpgRun} as never,1,false),30,'a stale round record is ignored');
});
