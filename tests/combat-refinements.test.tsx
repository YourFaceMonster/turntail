import assert from 'node:assert/strict';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createHpItemGame} from '../lib/hp-item-mode.ts';
import {hpItemDisplayHp} from '../lib/hp-item-shop.ts';
import {hpBattleSummary} from '../lib/hp-battle-summary.ts';
import {RPG_PROFESSIONS,rpgProfessionTriggers,rpgProfessionHeal} from '../lib/rpg-professions.ts';
import TileFace from '../app/components/TileFace.tsx';
import {StageVisuals} from '../app/components/StageVisuals.tsx';
import {combo} from '../lib/game.ts';
import type {HpBattleEvent} from '../lib/hp-item-battle.ts';
const game=createHpItemGame('나','',Date.now(),2),event:HpBattleEvent={id:'review',round:1,actor:0,label:'페어',damage:4,playedCount:4,hpBefore:[100,100,100],hpAfter:[100,95,97],at:Date.now(),skills:[{id:'attack',actor:0,character:'toto',round:1,at:0,outcome:'attack',amount:1},{id:'guard',actor:2,character:'rowen',round:1,at:0,outcome:'guard',amount:2}]};
game.hpItemMatch!.lastBattle=event;game.rpgRun!.hp=[...event.hpAfter];
assert.equal(hpItemDisplayHp(game,1,false,event),100,'hold only the displayed bar until the result presentation');
assert.equal(game.rpgRun!.hp[1],95,'game rules still see immediate authoritative HP');
assert.equal(hpItemDisplayHp(game,1,false,null),95,'result and status bar can reveal in the same React commit');
assert.equal(hpItemDisplayHp(game,1,false,{...event,id:'previous'}),95,'stale display events do not hide a later result');
const summary=hpBattleSummary(event,game.players.map(player=>({name:player.name,count:player.hand.length})));
assert.deepEqual(summary.calculation,{count:4,base:4});
assert.equal(summary.rows.find(row=>row.seat===2)!.note,'기본 −4 · 추가 −1 · 방어 +2 → 실제 −3');
for(let stage=1;stage<=10;stage++)for(let suit=0;suit<4;suit++)for(const number of [2,10]){
 const tile={id:(number-1)*4+suit,n:number,s:suit},html=renderToStaticMarkup(h(StageVisuals,{stage,children:h(TileFace,{tile})}));
 assert.ok(html.includes('data-number-layout="classic"')&&html.includes('data-material-finish=')&&html.includes('Trebuchet MS,Arial,sans-serif'));
 assert.ok(html.includes(`data-number="${number}"`)&&html.includes(`data-suit="${suit}"`));
}
const t=(n:number,s=0)=>({id:(n-1)*4+s,n,s});
const combinations=[{tiles:[t(7)],label:'싱글'},{tiles:[t(7),t(7,1)],label:'페어'},{tiles:[t(7),t(7,1),t(7,2)],label:'트리플'},{tiles:[t(3),t(4,1),t(5,2),t(6,3),t(7)],label:'스트레이트'},{tiles:[t(7),t(7,1),t(7,2),t(8),t(8,1)],label:'풀하우스'},{tiles:[t(7),t(7,1),t(7,2),t(7,3),t(8)],label:'포카드'}];
for(const combination of combinations)assert.equal(combo(combination.tiles)?.label,combination.label);
for(const profession of RPG_PROFESSIONS){assert.ok(rpgProfessionTriggers(profession.id,profession.passive.label,true).passive);assert.ok(rpgProfessionTriggers(profession.id,profession.active.label,false).active);assert.equal(rpgProfessionTriggers(profession.id,profession.active.label,true).active,null);assert.deepEqual(rpgProfessionTriggers(profession.id,'플러시',false),{passive:null,active:null});}
assert.equal(rpgProfessionHeal(98,5),100);assert.equal(rpgProfessionHeal(60,5),65);
console.log('PASS: HP presentation hold preserves immediate rules, cumulative damage explanation, ten material sets with shared classic layout and handoff skill triggers against existing combos.');
