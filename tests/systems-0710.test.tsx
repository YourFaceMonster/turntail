import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {rpgSettlementPreview,RPG_REWORK_RELICS} from '../lib/rpg-rework';
import {act,room,player,start,type Tile} from '../lib/game';
import {QUICK_PLAY_MS,SMALL_COMBO_REVIEW_MS,FAST_FIVE_PLAY_MS,fastPlayDuration} from '../lib/play-notices';
import RpgCodex,{codexEntries} from '../app/components/RpgCodex';
import TutorialGuide from '../app/components/TutorialGuide';
import MainMenu from '../app/components/MainMenu';
const t=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s}),noop=()=>{};

test('settlement preview matches the real round end, overflow included, from public counts only',()=>{
 // 95/100 with AI hands 6 and 4: +10 caps at +5, the overflow 5 returns as 3 and 2.
 assert.deepEqual(rpgSettlementPreview({hp:[95,50,50],equipped:[]},[0,6,4]),[5,-15,0]);
 // Mid-round counts work the same way (3 tiles still in my hand: +6 from AI 1, +4 from AI 2).
 assert.deepEqual(rpgSettlementPreview({hp:[95,50,50],equipped:[]},[3,6,4]),[5,-15,0]);
 // A fallen seat neither pays nor receives.
 assert.deepEqual(rpgSettlementPreview({hp:[60,0,50],equipped:[]},[2,5,4]),[4,0,-4],'AI 2 pays its own 4 tiles; seat 1 is out');
 // Cracked heart raises the player's cap to 120, so nothing overflows here.
 assert.deepEqual(rpgSettlementPreview({hp:[110,50,50],equipped:['cracked-heart']},[0,6,4]),[10,-12,2]);
});

test('fast pacing skips the combo announcement on local games only',()=>{
 const make=(fast:boolean)=>{const g=room('PACE01',player('나'),true);g.players.push(player('달빛',true),player('해솔',true));start(g,1000);g.turn=0;g.trick=[];g.lastBy=null;g.turnReadyAt=0;g.players[0].hand=[t(3),t(9)];if(fast)g.fastPace=true;act(g,0,'play',[t(3).id],-1,5000);return g;};
 const normal=make(false),fast=make(true);
 assert.equal(normal.lastEvent?.showNotice,true);assert.equal(normal.lastEvent?.reviewMs,SMALL_COMBO_REVIEW_MS);
 assert.equal(fast.lastEvent?.showNotice,false);assert.equal(fast.lastEvent?.reviewMs,QUICK_PLAY_MS);assert.equal(fast.turnReadyAt,5000+QUICK_PLAY_MS);
 assert.equal(fastPlayDuration(5),FAST_FIVE_PLAY_MS);assert.ok(FAST_FIVE_PLAY_MS>500,'longer than the 0.5s flight');
});

test('codex lists all sixteen journey relics (four forged) and four story cards, hiding the unfound ones',()=>{
 const data=codexEntries(['gamblers-gloves','cracked-heart','sun-sigil'],['crown-two','iron-gate-two']);
 assert.equal(data.relics.length,RPG_REWORK_RELICS.length);assert.equal(data.relicCount,2,'legacy relic ids are ignored');assert.equal(data.storyCount,2);
 const html=renderToStaticMarkup(<RpgCodex discovered={['gamblers-gloves']} storyCards={['crown-two']} close={noop}/>);
 assert.match(html,/여정 도감/);assert.match(html,/승부사의 장갑/);assert.match(html,/\?\?\?/);assert.match(html,/1\/16/);assert.doesNotMatch(html,/금이 간 심장/,'unfound relic names stay hidden');
 const menu=renderToStaticMarkup(<MainMenu single={noop} multi={noop} tutorial={noop} scores={noop} achievements={noop} codex={noop} settings={noop} profile={noop} resume={noop} canResume={false} name="" avatar=""/>);
 assert.match(menu,/menu-tool-codex/);assert.match(menu,/스토리모드 정산까지/);assert.doesNotMatch(menu,/직업·주화|아이템전/,'the hidden item battle is not advertised');
});

test('tutorial second chapter teaches the RPG journey, not the hidden item battle',()=>{
 const html=renderToStaticMarkup(<TutorialGuide close={noop}/>);
 assert.match(html,/스토리모드 규칙/);assert.doesNotMatch(html,/아이템전/);
});
