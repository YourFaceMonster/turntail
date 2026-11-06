// Pre-0.7 saved-rule compatibility; new rules have a separate integration suite.
import {createLegacyRpgPhaseOneGame as createRpgPhaseOneGame} from './fixtures/legacy-profession';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

import {beginRpgRoundHealth} from '../lib/rpg-round-health';
import {settleRpgPhaseOne} from '../lib/rpg-phase-one';
import {useRpgTacticalItem} from '../lib/rpg-items';
import {useProfessionActive,ensureProfessionActives} from '../lib/profession-actives';
import {saveRpgGame,readRpgArchive} from '../lib/rpg-storage';
import {HpItemResult} from '../app/components/HpItemMatch';
import {view} from '../lib/game';
const noop=()=>{};
test('round report separates item healing, actual damage and coin shortfall without changing settlement',()=>{
 const g=createRpgPhaseOneGame('정산 검증','',0,'cleric'),run=g.rpgRun!;
 run.hp=[60,100,100];run.coins=2;run.equipped=[];g.turn=0;g.turnReadyAt=0;g.roundActions=3;run.consumables=['emergency-herb'];beginRpgRoundHealth(run,g.round);
 useRpgTacticalItem(g,'emergency-herb');assert.equal(run.hp[0],70);g.turn=1;run.enemyConsumables={1:['ember-bomb']};useRpgTacticalItem(g,'ember-bomb',0,[],1);assert.equal(run.hp[0],62);
 const result={id:'health-report',at:123,players:[{count:4,delta:-9},{count:0,delta:9},{count:2,delta:0}]};g.rpgRun=settleRpgPhaseOne(run,result);
 assert.equal(g.rpgRun.coins,0);assert.equal(g.rpgRun.hp[0],55);const report=g.rpgRun.roundHealth!;assert.equal(report.before[0],60);assert.equal(report.damage[0],15);assert.equal(report.healing[0],10);assert.equal(report.moneyDamage[0],7);
 g.phase='ended';const html=renderToStaticMarkup(h(HpItemResult,{rpg:true,game:view(g,g.players[0].token),busy:false,next:noop,restart:noop,exit:noop}));assert.ok(html.includes('이번 판 피해'));assert.ok(html.includes('주화 부족분'));assert.ok(!html.includes('현재 HP'));
 const coins=g.rpgRun.coins,reportBefore=structuredClone(report);g.rpgRun=settleRpgPhaseOne(g.rpgRun,result);assert.equal(g.rpgRun.coins,coins);assert.deepEqual(g.rpgRun.roundHealth,reportBefore);
 const data=new Map<string,string>(),storage={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);}};saveRpgGame(storage,g);assert.deepEqual(readRpgArchive(storage).active!.rpgRun!.roundHealth,reportBefore);
});
test('active damage records only actual HP loss at the cap, and zero balances never damage opponents',()=>{
 const g=createRpgPhaseOneGame('실피해 검증','',0,'swordsman'),run=g.rpgRun!;run.hp=[100,3,50];run.coins=100;g.turn=0;g.turnReadyAt=0;g.roundActions=3;beginRpgRoundHealth(run,g.round);ensureProfessionActives(g)!.gauge[0]=4;useProfessionActive(g,0,1,0);assert.equal(run.roundHealth!.damage[1],3);assert.equal(run.hp[1],0);
 const result={id:'enemy-shortfall',at:1,players:[{count:0,delta:10},{count:1,delta:-5},{count:1,delta:-5}]};g.rpgRun=settleRpgPhaseOne(run,result);assert.deepEqual(g.rpgRun.roundHealth!.moneyDamage,[0,0,0]);
});
