import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {hpRoundTotals} from '../lib/hp-round-totals';
import type {HpItemRoundReport} from '../lib/hp-item-shop';
import {createHpItemGame} from '../lib/hp-item-mode';
import {buyHpItemLoadout} from '../lib/hp-item-shop';
import {view} from '../lib/game';
import {analyzeItemBattleTurn} from '../lib/item-battle-plan';
import {PROFESSION_ACTIVES} from '../lib/profession-actives';
import {TILE_INKS} from '../lib/tile-palette';
import TileFace from '../app/components/TileFace';
import {StageVisuals} from '../app/components/StageVisuals';
import {ProfessionGauge,MageSpellImpact,SwordsmanSlash} from '../app/components/ProfessionActives';
import {HpItemResult} from '../app/components/HpItemMatch';
import {test as retiredTest} from 'node:test';
// Retired 2026-11-10: hidden item battle / job system, delete together with that code (user decision 2026-11-10). Run with RUN_RETIRED_TESTS=1 to execute.
if(!process.env.RUN_RETIRED_TESTS){retiredTest('retired: interaction-polish-0650',{skip:'hidden item battle / job system, delete together with that code (user decision 2026-11-10)'},()=>{});}else{

// Every stage/material and special motif keeps suit identity when disabled.
for(let stage=0;stage<=10;stage++)for(let suit=0;suit<4;suit++)for(const n of [2,7,15]){
 const markup=renderToStaticMarkup(<StageVisuals stage={stage||undefined}><TileFace muted tile={{id:(n-1)*4+suit,n,s:suit}}/></StageVisuals>);
 const motif=markup.match(/<g class="[^"]*tile-suit-identity"[^>]*>/)?.[0];
 assert.ok(motif,`suit motif stage ${stage}`);assert.ok(motif.includes(`fill="${TILE_INKS[suit]}"`));assert.ok(motif.includes(`color="${TILE_INKS[suit]}"`));
}
const report:HpItemRoundReport={round:1,hpBefore:[180],hpAfter:[150],earned:[0],items:[],cardDamage:[20],itemDamage:[8],moneyDamage:[4],trapDamage:[4],ambushDamage:[1],activeDamage:[6],itemHealing:[5],professionHealing:[1],relicHealing:[2],activeHealing:[5]};
assert.deepEqual(hpRoundTotals(report,0,180,150),{damage:43,healing:13});
assert.deepEqual(hpRoundTotals({...report,hpAfter:[180],cardDamage:[0],itemDamage:[5],moneyDamage:[0],trapDamage:[0],ambushDamage:[0],activeDamage:[0],professionHealing:[0],relicHealing:[0],activeHealing:[0]},0,180,180),{damage:5,healing:5});
const legacy:HpItemRoundReport={round:1,hpBefore:[100],hpAfter:[90],earned:[0],items:[{actor:0,target:0,id:'emergency-herb',kind:'heal',amount:5},{actor:1,target:0,id:'ember-bomb',kind:'damage',amount:8}]};
assert.deepEqual(hpRoundTotals(legacy,0,100,90),{damage:15,healing:5});
assert.deepEqual(hpRoundTotals(undefined,0,100,80),{damage:20,healing:0});
const g=createHpItemGame('검증','',Date.now(),2,'toto','swordsman');buyHpItemLoadout(g,[]);
for(const profession of ['swordsman','rogue','cleric','mage'] as const){
 g.rpgRun!.combat!.professions[0]=profession;const max=PROFESSION_ACTIVES[profession].maxGauge;
 g.rpgRun!.combat!.actives!.gauge[0]=max;
 assert.ok(renderToStaticMarkup(<ProfessionGauge game={view(g,g.players[0].token)}/>).includes('profession-gauge is-full'));
 g.rpgRun!.combat!.actives!.gauge[0]=max-1;
 assert.ok(!renderToStaticMarkup(<ProfessionGauge game={view(g,g.players[0].token)}/>).includes('profession-gauge is-full'));
}
g.hpItemMatch!.report={...report,hpBefore:[180,180,180],hpAfter:[150,180,180]};g.rpgRun!.hp=[150,180,180];
const result=renderToStaticMarkup(<HpItemResult game={view(g,g.players[0].token)} busy={false} next={()=>{}} restart={()=>{}} exit={()=>{}}/>);
assert.ok(result.includes('이번 판 총피해 43, 총회복 13'));assert.ok(result.includes('hp-round-summary'));
assert.ok(renderToStaticMarkup(<SwordsmanSlash impact/>).includes('steel-blade'));
assert.ok(renderToStaticMarkup(<MageSpellImpact spent={5}/>).includes('firewall-embers'));

// With an opponent nearly out, the existing AI can spend an eye for information.
g.rpgRun!.hp=[180,180,180];g.rpgRun!.combat!.professions[0]='swordsman';g.rpgRun!.combat!.actives!.gauge=[0,0,0];g.rpgRun!.consumables=['whisper-eye'];g.rpgRun!.tactics={};
g.turn=0;g.turnReadyAt=0;g.completedBattles=1;g.players[1].hand=g.players[1].hand.slice(0,2);
const p=view(g,g.players[0].token),decision=analyzeItemBattleTurn(p);
assert.ok(decision.action.type==='item'&&decision.action.id==='whisper-eye',JSON.stringify(decision));
console.log('PASS: 132 muted suit/material renders; gross HP totals including recovery/legacy reports; all full profession gauges; result summary, steel slash and firewall art; existing eye AI use near opponent finish.');
}
