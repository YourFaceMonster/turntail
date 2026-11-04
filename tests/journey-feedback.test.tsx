import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import TurntaleWordmark from '../app/components/TurntaleWordmark';
import {JourneyMapView,JourneyShopContent} from '../app/components/RpgJourneyScene';
import {createRpgJourneyGame} from '../lib/rpg-game';
const noop=()=>{};
test('multiple logo instances use independent clip paths even when another header is hidden',()=>{
 const html=render(h('div',null,h(TurntaleWordmark,{plain:true}),h(TurntaleWordmark,{plain:true})));
 const ids=[...html.matchAll(/<clipPath id="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,2);assert.notEqual(ids[0],ids[1]);
 for(const id of ids)assert.ok(html.includes(`url(#${id})`));
});
test('avatar exposes profile action, while shop items expose only purchase actions',()=>{
 const g=createRpgJourneyGame('검토','',0,'cleric'),run=g.rpgRun!;run.status='ready';run.shops=[{area:1,stock:[]}];run.coins=1000;
 const map=render(h(JourneyMapView,{run,busy:false,error:'',action:noop,exit:noop}));assert.ok(map.includes('aria-label="내 캐릭터 정보"'));assert.ok(map.indexOf('성직자')<map.indexOf('journey-coins'));
 const shop=render(h(JourneyShopContent,{run,busy:false,error:'',action:noop}));assert.ok(shop.includes('shop-product-effect'));assert.ok(!shop.includes('aria-haspopup="dialog"'));assert.ok(!shop.includes('shop-detail-art'));
});
