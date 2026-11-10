import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createHpItemGame} from '../lib/hp-item-mode';
import {buyHpItemLoadout} from '../lib/hp-item-shop';
import {act,view,assertTurnReady,advanceRoom,type Tile} from '../lib/game';
import {resolveHpItemBattle} from '../lib/hp-item-battle';
import {professionEffectText} from '../lib/rpg-profession-combat';
import {itemBattleRelicWin} from '../lib/item-battle-relics';
import {publicCoinEvents,queueCoinPresentation,nextCoinPresentationAt,coinEventDuration} from '../lib/coin-presentation';
import {COIN_EVENT_GAP_MS,COIN_TURN_READY_MS,COIN_PRESENTATION_MS} from '../lib/pickup-presentation';
import {CoinArtwork,CoinNoticeBody} from '../app/components/FloorCoins';
import {RpgProfessionStatus} from '../app/components/RpgProfessions';
import {RpgEquippedRelics} from '../app/components/RpgEquippedRelics';
import {test as retiredTest} from 'node:test';
// Retired 2026-11-10: hidden item battle / job system, delete together with that code (user decision 2026-11-10). Run with RUN_RETIRED_TESTS=1 to execute.
if(!process.env.RUN_RETIRED_TESTS){retiredTest('retired: feedback-polish-0645',{skip:'hidden item battle / job system, delete together with that code (user decision 2026-11-10)'},()=>{});}else{
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
function fresh(){const g=createHpItemGame('검증','',Date.now(),2,'toto','mage');buyHpItemLoadout(g,[]);g.turn=0;g.turnReadyAt=0;g.completedBattles=1;g.rpgRun!.consumables=[];g.rpgRun!.enemyConsumables={1:[],2:[]};g.rpgRun!.equipped=['warrior-crest'];return g;}
const four=[tile(7),tile(7,1),tile(7,2),tile(7,3),tile(9)],triple=four.slice(0,3);
assert.equal(itemBattleRelicWin(['warrior-crest'],'포카드',four).damage,0);
assert.equal(itemBattleRelicWin(['warrior-crest'],'풀하우스',[...triple,tile(9),tile(9,1)]).damage,0);
assert.equal(itemBattleRelicWin(['warrior-crest'],'트리플',triple).damage,2);
const g=fresh();g.trick=four;g.lastBy=0;const event=resolveHpItemBattle(g)!;assert.equal(event.relicDamage,undefined);assert.ok(!event.relics?.some(effect=>effect.relicId==='warrior-crest'));assert.equal(event.damageTaken![1],15,'five submitted + mage four-of-kind six + mage five-card four');
const boost=event.professions!.find(effect=>effect.trait==='5장 족보 강화')!;assert.equal(boost.damage,4);assert.ok(professionEffectText(boost).includes('5장 족보 강화'));assert.ok(!professionEffectText(boost).includes('비전 증폭'));
const t=fresh();t.trick=triple;t.lastBy=0;const tw=resolveHpItemBattle(t)!;assert.equal(tw.relicDamage,2);assert.equal(tw.damageTaken![1],7,'triple 3 + mage passive 2 + actual relic 2');
const status=renderToStaticMarkup(<RpgProfessionStatus game={view(g,g.players[0].token)} seat={0} detail/>);assert.ok(status.includes('5장 족보'));assert.ok(status.includes('추가 피해 +4'));assert.ok(status.includes('모두 피해'));assert.ok(!status.includes('상대 각각'));
const art=renderToStaticMarkup(<CoinArtwork/>);assert.ok(art.includes('coin-art-fallback'));assert.ok(art.includes('coin-gold-v1.png'));assert.ok(art.includes('data-image-ready="false"'));
const pickup={id:'p1',round:1,who:0,index:0,layer:2 as const,amount:3,kind:'random' as const,at:1000};
const discovery={id:'d1',round:1,index:0,at:1000};const events=publicCoinEvents({events:[pickup],lastDiscovery:discovery,discoveries:[discovery]});assert.equal(events.length,1,'legacy lower-floor discoveries no longer create a popup or queue delay');
const second={...pickup,id:'p2',who:1,layer:1 as const,at:1100,kind:'last' as const,amount:5};const a=queueCoinPresentation(pickup,1800),b=queueCoinPresentation(second,1900,a.end);assert.equal(a.start,1800,'late render receives the full effect');assert.equal(a.end-a.start,COIN_PRESENTATION_MS);assert.ok(b.start>=a.end+COIN_EVENT_GAP_MS);assert.equal(b.end-b.start,coinEventDuration(second));
assert.ok(nextCoinPresentationAt([pickup],second.id,1100)>=pickup.at+COIN_PRESENTATION_MS+COIN_EVENT_GAP_MS);
for(const [event,text] of [[pickup,'2층 패에서 획득'],[second,'마지막 패 보너스']] as const){const html=renderToStaticMarkup(<CoinNoticeBody event={event} players={[{name:'나'},{name:'상대'}]}/>);assert.ok(html.includes(text));assert.ok(html.includes(event.layer===2?'주화 발견':'주화 획득'));}
const relicHtml=renderToStaticMarkup(<RpgEquippedRelics run={{...g.rpgRun!,equipped:['sun-sigil']}}/>);assert.ok(relicHtml.includes('플러시 승리'));assert.ok(relicHtml.includes('추가 피해 +3'));
// Consecutive upper random coin -> lower last coin keeps separate source timelines.
const coins=fresh();coins.floorCoins!.randomTileId=coins.stacks[0][1]!.id;coins.stacks=coins.stacks.map((stack,i)=>i===0?stack:[null,null]);coins.trick=[tile(15)];coins.lastBy=2;const now=Date.now();act(coins,0,'draw',[],0,now);const first=coins.floorCoins!.events[0];assert.equal(first.layer,2);assert.equal(first.amount,3);assert.throws(()=>assertTurnReady(coins,first.at+COIN_TURN_READY_MS-1));
const lock=structuredClone(coins);lock.practice=false;lock.players[lock.turn].bot=true;assert.equal(advanceRoom(lock,first.at+COIN_PRESENTATION_MS+100),false);
coins.turn=1;coins.turnReadyAt=0;coins.lastBy=0;act(coins,1,'draw',[],0,first.at+COIN_TURN_READY_MS);const last=coins.floorCoins!.events[1];assert.equal(last.amount,5);assert.equal(last.layer,1);assert.ok(last.at>=first.at+COIN_TURN_READY_MS);assert.ok(coins.turnReadyAt!>=last.at+COIN_TURN_READY_MS);
console.log('PASS: mage five-card +4 is separate from triple-only relic; source-specific serial coin presentation, late-render hold, fallback art, next-turn lock and readable relic bonus.');
}
