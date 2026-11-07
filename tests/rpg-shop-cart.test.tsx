// Pre-rework journey save compatibility; current RPG rules: rpg-rework.test.tsx.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {createRpgJourneyGame} from './fixtures/legacy-rpg-journey';
import {buyRpgCart,quoteRpgCart} from '../lib/rpg-shop-cart.ts';
import {QuestItemText} from '../app/components/DialogueText.tsx';
const fresh=()=>{const run=createRpgJourneyGame('잡화점 검사').rpgRun!;run.journey=undefined;run.status='ready';run.coins=200;run.shops=[{area:1,stock:[{id:'emergency-herb',kind:'consumable',price:20,quantity:1},{id:'merchants-scales',kind:'relic',price:60,quantity:1},{id:'mor-quill',kind:'relic',price:20,quantity:1}]}];return run;};
test('cart quote is side effect free, supports repeated consumables, and checkout grants everything together',()=>{
 const run=fresh(),before=JSON.stringify(run),cart=['emergency-herb','emergency-herb','merchants-scales'];
 const quote=quoteRpgCart(run,cart);assert.equal(JSON.stringify(run),before);assert.equal(quote.coins,100);
 const purchased=buyRpgCart(run,cart);assert.equal(purchased.coins,100);assert.equal(purchased.consumables.filter(id=>id==='emergency-herb').length,run.consumables.filter(id=>id==='emergency-herb').length+2);assert.equal(purchased.relics.filter(id=>id==='merchants-scales').length,1);
 assert.equal(JSON.stringify(run),before);
});
test('failed later items, duplicate relics, locked items and insufficient funds leave the entire original purchase untouched',()=>{
 const run=fresh(),before=JSON.stringify(run);
 for(const cart of [['emergency-herb','missing'],['merchants-scales','merchants-scales'],['emergency-herb','mor-quill'],Array(11).fill('emergency-herb'),[],null,[5]]){assert.throws(()=>buyRpgCart(run,cart));assert.equal(JSON.stringify(run),before);}
});
test('a one-use merchant discount is charged once and cart cancellation restores the quote',()=>{
 const run=fresh();run.relics.push('merchants-scales');run.equipped.push('merchants-scales');
 assert.equal(quoteRpgCart(run,['emergency-herb','emergency-herb']).coins,180);
 assert.equal(quoteRpgCart(run,[]).coins,200);assert.deepEqual(run.scaleUsed,[]);
 const bought=buyRpgCart(run,['emergency-herb','emergency-herb']);assert.deepEqual(bought.scaleUsed,[1]);assert.equal(quoteRpgCart(bought,['emergency-herb']).coins,160);
});
test('quest item names include a bold inline image and preserve the surrounding dialogue',()=>{
 const html=render(h(QuestItemText,{text:'응급 약초 1개를 건넨다'}));assert.match(html,/<strong class="quest-item-mention">응급 약초<img/);assert.ok(html.includes('1개를 건넨다'));
 assert.equal(render(h(QuestItemText,{text:'다음에 다시 온다'})),'다음에 다시 온다');
});
