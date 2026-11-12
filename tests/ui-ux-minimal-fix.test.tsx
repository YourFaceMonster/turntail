import assert from 'node:assert/strict';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {tileLayout,playedTileLayout,LANDSCAPE_PLAYED_SCALE} from '../lib/layout.ts';
import {createHpItemGame} from '../lib/hp-item-mode.ts';
import {buyHpItemLoadout,HP_ITEM_PRICES} from '../lib/hp-item-shop.ts';
import {view} from '../lib/game.ts';
import {HpItemShop} from '../app/components/HpItemShop';

// Budget the actual rendered classic column, including the enlarged played face.
for(const [width,height,floorWidth,handWidth,desktop] of [
 [826,348,446,334,false], [649,333,348,260,false],
 [1260,754,690,504,true], [620,243,330,247,false],
] as const)for(const players of [3,4]){
 const input={width,height,floorWidth,handWidth,handCount:10,cols:players===4?4:5,rows:3,players,landscape:true,rpg:true,desktop};
 const base=tileLayout(input),fixed=tileLayout({...input,classicLandscape:true});
 // 2026-11-12: the side-by-side landscape shows played tiles at the floor tile size.
 const played=playedTileLayout(fixed.floorHeight,floorWidth-fixed.playedLabelWidth-18,5,true,LANDSCAPE_PLAYED_SCALE);
 const available=height-4-12-6-(played.height+fixed.trickChrome+2)-8-4-fixed.seatHeight;
 assert.ok(3*fixed.floorHeight+8+4<=available+.01,'all floor faces, gaps and outlines fit the actual floor track');
 assert.equal(fixed.height,base.height,'do not shrink the independent hand');
 assert.equal(fixed.handSpaceHeight,base.handSpaceHeight,'keep the hand reservation');
 for(const handCount of [1,18,30,40])assert.equal(tileLayout({...input,handCount,classicLandscape:true}).floorHeight,fixed.floorHeight,'selection/hand count cannot move the floor');
 const portrait={...input,landscape:false};
 assert.deepEqual(tileLayout({...portrait,classicLandscape:true}),tileLayout(portrait),'portrait geometry is unchanged');
}

// A native enabled button remains reachable by keyboard even when buying is impossible.
const empty=createHpItemGame('검토','',Date.now(),2,undefined,'mage',180);
empty.hpItemMatch!.points[0]=0;
const markup=renderToStaticMarkup(h(HpItemShop,{game:view(empty,empty.players[0].token),busy:false,error:'',buy:()=>{},exit:()=>{}}));
const cards=[...markup.matchAll(/<button\b[^>]*data-shop-card="([^"]+)"[^>]*>/g)];
assert.equal(cards.length,6);
for(const [tag,id] of cards){
 assert.ok(!/\sdisabled(?:=|\s|>)/.test(tag),'0P blocks buying, not inspection');
 assert.match(tag,/type="button"/);
 assert.match(tag,/is-unaffordable/,'unaffordable presentation remains');
 assert.match(tag,/눌러서 설명 보기/);
 assert.ok(tag.includes(`${HP_ITEM_PRICES[id]}P`));
}
assert.ok(markup.includes('빠르게 두 번 누르면 구매 목록에 담아요.'));
const before=JSON.stringify(empty);
assert.throws(()=>buyHpItemLoadout(empty,['scout-lens']),/부족/);
assert.equal(JSON.stringify(empty),before,'unaffordable purchase must be atomic');
const funded=createHpItemGame('검토','',Date.now(),2,undefined,'mage',180);
assert.throws(()=>buyHpItemLoadout(funded,['scout-lens','scout-lens']),/1개씩/);
buyHpItemLoadout(funded,['ember-bomb','emergency-herb']);
assert.equal(funded.hpItemMatch!.points[0],5);
assert.deepEqual(funded.rpgRun!.consumables,['ember-bomb','emergency-herb']);
console.log('PASS: classic floor/played bounds, unchanged hand and portrait, keyboard-reachable 0P inspection, atomic purchase limits and normal purchase.');
