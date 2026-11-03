import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {existsSync} from 'node:fs';
import {RPG_CONNECTION_SCENES} from '../lib/rpg-connection-scenes';
import {RPG_CAST_ART} from '../lib/rpg-cast-art';
import {FIRST_PROLOGUE} from '../lib/rpg-prologue';
import {prologueArt} from '../lib/rpg-prologue-art';
import {createRpgJourneyGame} from '../lib/rpg-game';
import {JourneyTavernView} from '../app/components/RpgJourneyScene';
import {SinglePlayerMenu} from '../app/components/SinglePlayer';
import RpgCastPortrait from '../app/components/RpgCastPortrait';
const noop=()=>{};
test('ST2 story and RPG portraits use the same fox merchant and woman cook painting',()=>{
 const art=RPG_CAST_ART[3];assert.equal(art.src,RPG_CAST_ART[4].src);
 for(const cut of [...RPG_CONNECTION_SCENES[2].before,...RPG_CONNECTION_SCENES[2].after]){
  assert.equal(cut.art?.landscape,art.src);
  if(cut.speaker)assert.ok(['포코','밀라'].includes(cut.speaker));
 }
 for(const index of [0,1,3,4]){const entry=RPG_CAST_ART[index],[x,y,size]=entry.face;assert.ok(x>=0&&y>=0&&x+size<=entry.width&&y+size<=entry.height);assert.ok(existsSync('public'+entry.src));const markup=renderToStaticMarkup(h(RpgCastPortrait,{index}));assert.ok(markup.includes(entry.src));}
});
test('handover tile and departure castle images exist in both orientations',()=>{
 for(const id of ['P05','P07']){const art=prologueArt(FIRST_PROLOGUE.find(c=>c.id===id)!);assert.ok(art);assert.ok(existsSync('public'+art!.landscape));assert.ok(existsSync('public'+art!.portrait));assert.match(art!.landscape,id==='P05'?/wager-speaking-wide-v3/:/castle-road-v2/);}
});
test('tavern retains accessible character actions without the repeated conversation label',()=>{
 const game=createRpgJourneyGame('검증','',0,'cleric'),markup=renderToStaticMarkup(h(JourneyTavernView,{run:game.rpgRun!,busy:false,error:'',action:noop,exit:noop}));
 assert.ok(!markup.includes('<small>대화</small>'));assert.ok(markup.includes('피오 · 여우 여행자 · 이야기'));assert.equal((markup.match(/aria-haspopup="dialog"/g)||[]).length,3);assert.ok(markup.includes('tavern-living-art'));
});
test('single menu exposes three match choices and a separate RPG entry',()=>{
 const markup=renderToStaticMarkup(h(SinglePlayerMenu,{normal:noop,items:noop,rpg:noop,close:noop}));
 for(const name of ['일반모드','아이템전','폭탄시장전','RPG 모드'])assert.ok(markup.includes(`aria-label="${name}"`));
});
