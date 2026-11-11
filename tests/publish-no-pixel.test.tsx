import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync,readFileSync} from 'node:fs';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {SinglePlayerMenu} from '../app/components/SinglePlayer';
import Face from '../app/components/TileFace';
import Back from '../app/components/TileBack';
import {StageVisuals} from '../app/components/StageVisuals';

test('publication contains classic/Bomb/items/RPG menu without a pixel route or public assets',()=>{
 const menu=renderToStaticMarkup(h(SinglePlayerMenu,{normal:()=>{},yacht:()=>{},rpg:()=>{},close:()=>{}}));
 for(const text of ['일반모드','폭탄시장전','요트다이스','스토리모드','/bomb-market'])assert.ok(menu.includes(text));
 assert.ok(!menu.includes('픽셀'));assert.ok(!menu.includes('/classic-pixel'));
 for(const path of ['app/classic-pixel','public/pixel-classic','app/classic-pixel-menu.css'])assert.equal(existsSync(new URL('../'+path,import.meta.url)),false);
 for(const path of ['app/page.tsx','app/layout.tsx','app/components/TileFace.tsx','app/components/TileBack.tsx','app/components/MonsterPortrait.tsx','app/components/EntranceEnvironment.tsx','app/components/TableMaterialGrain.tsx'])assert.doesNotMatch(readFileSync(new URL('../'+path,import.meta.url),'utf8'),/ClassicPixel|classic-pixel|pixel-classic|classicEditionStorage/);
});
test('all eleven native styles (classic plus ten materials) render without deferred pixel atlases',()=>{
 for(let stage=0;stage<=10;stage++)for(let s=0;s<4;s++){
  const tile={id:4+s,n:2,s},html=renderToStaticMarkup(h(StageVisuals,{stage:stage||undefined,children:h('div',null,h(Face,{tile}),h(Back,{}))}));
  assert.ok(html.includes('data-number="2"'));assert.ok(html.includes(`suit${s}`));
  assert.ok(!html.includes('pixel-classic'));assert.ok(!html.includes('data-pixel-art'));
  if(stage)assert.ok(html.includes('stage-material-tile'));
 }
});
