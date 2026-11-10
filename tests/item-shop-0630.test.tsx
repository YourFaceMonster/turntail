// Explicit 100 HP fixtures also cover compatibility with pre-0.6.44 saved matches.
import assert from 'node:assert/strict';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createHpItemGame} from '../lib/hp-item-mode.ts';
import {buyHpItemLoadout,hpItemDisplayHp} from '../lib/hp-item-shop.ts';
import {useRpgTacticalItem} from '../lib/rpg-items.ts';
import {itemScenePoints,itemProjectileFrames,itemSceneTiming} from '../lib/rpg-item-motion.ts';
import {tileLayout} from '../lib/layout.ts';
import {view} from '../lib/game.ts';
import {HpItemShop} from '../app/components/HpItemShop';
import {test as retiredTest} from 'node:test';
// Retired 2026-11-10: hidden item battle / job system, delete together with that code (user decision 2026-11-10). Run with RUN_RETIRED_TESTS=1 to execute.
if(!process.env.RUN_RETIRED_TESTS){retiredTest('retired: item-shop-0630',{skip:'hidden item battle / job system, delete together with that code (user decision 2026-11-10)'},()=>{});}else{
const g=createHpItemGame('나','',Date.now(),2,undefined,'mage',100);
g.hpItemMatch!.points=[100,100,100];g.rpgRun!.consumables=Array(20).fill('ward-seal');
const before=JSON.stringify(g);assert.throws(()=>buyHpItemLoadout(g,['ember-bomb','ember-bomb']),/1개씩/);assert.equal(JSON.stringify(g),before);
buyHpItemLoadout(g,['ember-bomb','emergency-herb']);assert.equal(g.rpgRun!.consumables.length,22);assert.equal(g.hpItemMatch!.points[0],85);assert.throws(()=>buyHpItemLoadout(g,['scout-lens']));
g.turn=0;g.completedBattles=1;g.turnReadyAt=0;g.rpgRun!.equipped=[];useRpgTacticalItem(g,'ember-bomb',1);
const bomb=g.rpgRun!.lastItem!;assert.equal(bomb.hpBefore,100);assert.equal(bomb.hpAfter,92);assert.equal(g.rpgRun!.hp[1],92);
const hold={id:bomb.id,target:1,before:bomb.hpBefore!};assert.equal(hpItemDisplayHp(g,1,false,null,hold),100);assert.equal(hpItemDisplayHp(g,1,false,null,null),92);assert.equal(hpItemDisplayHp(g,1,false,null,{...hold,id:'old'}),92);assert.equal(hpItemDisplayHp(g,0,false,null,hold),100);
g.roundActions=(g.roundActions||0)+1;g.rpgRun!.hp[0]=92;useRpgTacticalItem(g,'emergency-herb');const herb=g.rpgRun!.lastItem!;assert.equal(herb.amount,8);assert.equal(herb.hpBefore,92);assert.equal(herb.hpAfter,100);assert.equal(hpItemDisplayHp(g,0,false,null,{id:herb.id,target:0,before:92}),92);
for(const [width,height] of [[390,700],[844,390],[1100,700]])for(const actor of [0,1,2])for(const target of [0,1,2]){
 if(actor===target)continue;const rect=(seat:number)=>seat===0?{left:width*.35,top:height*.8,width:width*.3,height:45}:{left:seat===1?width*.08:width*.58,top:40,width:width*.3,height:45};
 const points=itemScenePoints(width,height,rect(actor),rect(target),rect(0)),frames=itemProjectileFrames(points,false);
 for(const frame of frames.filter(frame=>(frame.offset as number)>=.1&&(frame.offset as number)<=.68)){const values=/translate3d\(([-\d.]+)px,([-\d.]+)px/.exec(frame.transform as string)!;assert.ok(+values[1]>=0&&+values[1]<=width);assert.ok(+values[2]>=Math.min(64,points.from.y,points.to.y)-.1&&+values[2]<=height,`${width}x${height} ${actor}→${target}: projectile stays visible`);}
 const timing=itemSceneTiming({kind:'damage',actor,target,itemId:'ember-bomb'});assert.equal(timing.shield+80,timing.impact);
}
for(const [width,height] of [[372,633],[824,323]]){
 const input={width,height,floorWidth:width-30,handWidth:width-20,cols:5,rows:3,players:3,landscape:width>height,rpg:true};
 const standard=tileLayout({...input,handCount:10});for(const count of [1,5,18,30,40]){const next=tileLayout({...input,handCount:count});assert.equal(next.floorHeight,standard.floorHeight);assert.equal(next.handSpaceHeight,standard.handSpaceHeight,'the hand reserves identical board space at every count');}
}
const markup=renderToStaticMarkup(h(HpItemShop,{game:view(g,g.players[0].token),busy:false,error:'',buy:()=>{},exit:()=>{}}));assert.equal((markup.match(/data-shop-card=/g)||[]).length,6);assert.ok(!markup.includes('바늘탄'));assert.ok(markup.includes('×20')&&markup.includes('수량 제한 없음'));assert.ok(markup.includes('두 번 누르면 구매 목록'));
console.log('PASS: atomic unique purchase, unlimited retained stock, exact damage/healing presentation, all seat-to-seat flight bounds, shield contact and stable board reservation.');
}
