import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {BombTable,PixelBombTile} from '../app/components/BombMarket';
import {SinglePlayerMenu} from '../app/components/SinglePlayer';
import {createBombGame,transitionBomb} from '../lib/bomb-market';
const noop=()=>{};
test('pixel tile preserves number/color/suit, scoped accessible market + separate hand',()=>{const game=createBombGame();const html=renderToStaticMarkup(h(BombTable,{game,selected:[],marketId:null,onSelect:noop,onMarket:noop,onAction:noop,now:0,paused:false,onPause:noop,onRecommend:noop}));assert.match(html,/공개 시장/);assert.match(html,/시장 적립금/);assert.match(html,/1 \/ 5판/);assert.match(html,/aria-label="내 손패"/);assert.equal((html.match(/aria-label="市场/g)||[]).length,0);// Four seats since 2026-11-03: 11-tile hands and a 16-card market.
assert.equal((html.match(/aria-label="시장 [^"]+ 선택"/g)||[]).length,16);assert.equal((html.match(/aria-label="손패 [^"]+ 선택"/g)||[]).length,11);const tile=renderToStaticMarkup(h(PixelBombTile,{tile:{id:59,n:15,s:3}}));assert.match(tile,/shape-rendering="crispEdges"/);assert.match(tile,/빨강 왕관 15/,'suit names unified on 2026-11-04');assert.match(tile,/#de1734/);});
test('menu adds Bomb Market while preserving classic, items, RPG callbacks',()=>{const html=renderToStaticMarkup(h(SinglePlayerMenu,{normal:noop,yacht:noop,rpg:noop,close:noop}));for(const text of ['일반모드','요트다이스','RPG 모드','폭탄시장전'])assert.ok(html.includes(text));});
test('reaction timer renders and disables regular buying/passing',()=>{// Since 0.7.7 the 3s window opens only when someone can bomb, so the player holds four 4s.
let game=createBombGame();game.turn=1;game.players.slice(1).forEach(p=>p.hand=p.hand.filter(t=>t.n!==4));game.market=game.market.map(t=>t&&t.n===4?null:t);game.players[0].hand=[0,1,2,3].map(s=>({id:12+s,n:4,s}));game=transitionBomb(game,1,{type:'play',ids:[game.players[1].hand[0].id]},game.revision,100);assert.ok(game.reaction,'a possible bomb keeps the reaction window open');const html=renderToStaticMarkup(h(BombTable,{game,selected:[],marketId:null,onSelect:noop,onMarket:noop,onAction:noop,now:1100,paused:false,onPause:noop,onRecommend:noop}));assert.match(html,/2\.0초/);assert.match(html,/disabled="">패스/);assert.match(html,/disabled="">선택한 패 구매/);});
