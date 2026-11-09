import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createHpItemGame} from '../lib/hp-item-mode';
import {buyHpItemLoadout} from '../lib/hp-item-shop';
import {act,view} from '../lib/game';
import {publicCoinEvents,nextCoinPresentationAt} from '../lib/coin-presentation';
import {mageSpellFlightOrientation} from '../lib/item-battle-visuals';
import {resolveHpItemBattle} from '../lib/hp-item-battle';
import type {ProfessionActiveEvent} from '../lib/profession-actives';
import {CoinNoticeBody} from '../app/components/FloorCoins';
import {HpRoundTotals} from '../app/components/HpRoundBreakdown';
import {DuelResultBody} from '../app/components/HpBattleReview';
import {MageSpellImpact,MageSpellFlight,SwordsmanSlash,ProfessionSkillNotice} from '../app/components/ProfessionActives';
function fresh(){const g=createHpItemGame('로컬 검증','',Date.now(),2,'toto','swordsman');buyHpItemLoadout(g,[]);g.turn=0;g.turnReadyAt=0;g.completedBattles=1;g.rpgRun!.equipped=[];g.trick=[g.players[2].hand.pop()!];g.lastBy=2;return g;}
const now=Date.now(),lower=fresh();lower.floorCoins!.randomTileId=lower.stacks[0][0]!.id;
const ordinary=structuredClone(lower);ordinary.floorCoins!.randomTileId=null;const wallet=[...lower.hpItemMatch!.points];
act(lower,0,'draw',[],0,now);act(ordinary,0,'draw',[],0,now);
assert.equal(lower.turnReadyAt,ordinary.turnReadyAt,'uncovering a first-floor coin adds no popup hold');
assert.equal(lower.floorCoins!.lastDiscovery,undefined);assert.equal(lower.floorCoins!.events.length,0);assert.deepEqual(lower.hpItemMatch!.points,wallet);
assert.ok(view(lower,lower.players[1].token).stacks[0].coinAmount);
lower.turn=1;lower.turnReadyAt=0;lower.lastBy=0;act(lower,1,'draw',[],0,now+10000);
const first=lower.floorCoins!.events[0];assert.equal(first.layer,1);assert.ok(lower.hpItemMatch!.points[1]>wallet[1]);
const firstNotice=renderToStaticMarkup(<CoinNoticeBody event={first} players={lower.players}/>);assert.ok(firstNotice.includes('주화 획득'));assert.ok(firstNotice.includes('1층'));assert.ok(!firstNotice.includes('주화 발견'));
const upper=fresh();upper.floorCoins!.randomTileId=upper.stacks[0][1]!.id;act(upper,0,'draw',[],0,now);
const upperNotice=renderToStaticMarkup(<CoinNoticeBody event={upper.floorCoins!.events[0]} players={upper.players}/>);assert.ok(upperNotice.includes('주화 발견'));assert.ok(upperNotice.includes('2층'));assert.ok(upperNotice.includes('뒷면 패'));
const oldDiscovery={id:'old-lower',round:1,index:0,at:now+50000},legacy={events:[first],lastDiscovery:oldDiscovery,discoveries:[oldDiscovery]},saved=JSON.stringify(legacy);
assert.deepEqual(publicCoinEvents(legacy),[first]);assert.equal(JSON.stringify(legacy),saved);assert.equal(renderToStaticMarkup(<CoinNoticeBody event={oldDiscovery} players={lower.players}/>),'');
assert.ok(nextCoinPresentationAt(publicCoinEvents(legacy),'next',now)<oldDiscovery.at);
for(const x of [-120,120]){const from={x:0,y:180},to={x,y:0},orientation=mageSpellFlightOrientation(from,to),theta=orientation.angle*Math.PI/180,a=-Math.SQRT1_2*orientation.mirror,b=Math.SQRT1_2,dx=Math.cos(theta)*a-Math.sin(theta)*b,dy=Math.sin(theta)*a+Math.cos(theta)*b,length=Math.hypot(x,-180);assert.ok(Math.abs(dx-x/length)<1e-9);assert.ok(Math.abs(dy+180/length)<1e-9);assert.equal(orientation.mirror,x>0?-1:1);const markup=renderToStaticMarkup(<MageSpellFlight from={from} to={to} spent={3}/>);assert.ok(markup.includes(`data-flight-direction="${x>0?'right':'left'}"`));}
for(const spent of [1,3,4]){const impact=renderToStaticMarkup(<MageSpellImpact spent={spent}/>);assert.ok(impact.includes('mage-explosion-sprite'));assert.ok(!impact.includes('mage-fireball-v1.webp'));}
assert.ok(renderToStaticMarkup(<MageSpellImpact spent={5}/>).includes('mage-firewall-v1.webp'));assert.ok(renderToStaticMarkup(<SwordsmanSlash impact/>).includes('steel-impact-flare'));
const g=fresh();g.rpgRun!.hp=[154,180,180];g.hpItemMatch!.report={round:1,hpBefore:[180,180,180],hpAfter:[154,180,180],earned:[0,0,0],items:[],cardDamage:[12,0,0],itemDamage:[20,0,0],itemHealing:[6,0,0]};
const totals=renderToStaticMarkup(<HpRoundTotals game={view(g,g.players[0].token)} seat={0} before={180}/>);assert.ok(totals.includes('피해 −32'));assert.ok(totals.includes('회복 +6'));assert.ok(totals.includes('최종 −26'));
for(const [hp,expected] of [[180,'±0'],[175,'+5'],[150,'−20']] as const){g.rpgRun!.hp[0]=hp;assert.ok(renderToStaticMarkup(<HpRoundTotals game={view(g,g.players[0].token)} seat={0} before={hp===180?180:170}/>).includes('최종 '+expected));}
g.trick=[{id:20,n:6,s:0}];g.lastBy=0;const battle=resolveHpItemBattle(g,now)!;const duel=renderToStaticMarkup(<DuelResultBody event={battle} players={view(g,g.players[0].token).players}/>);assert.ok(!duel.includes('battle-hp-transition'));assert.ok(!duel.includes(' → '));assert.ok(duel.includes('hp-maximum'));
const event:ProfessionActiveEvent={id:'steel-preview',round:1,actor:0,profession:'swordsman',spent:4,gaugeBefore:4,gaugeAfter:0,target:1,damage:[0,6,0],healing:[0,0,0],hpBefore:[180,180,180],hpAfter:[180,174,180],at:now};
const notice=renderToStaticMarkup(<ProfessionSkillNotice event={event} players={g.players} impact/>);assert.ok(notice.includes('skill-notice'));assert.ok(notice.includes('강타'));assert.ok(notice.includes('−6 HP'));
console.log('PASS: first-floor marker without discovery/extra hold, layer-specific collection, old event preservation without queuing, mirrored flame vectors, explosion-only hits, signed settlement totals, clean duel rows and steel notice.');
