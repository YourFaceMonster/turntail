import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import TileFace from '../app/components/TileFace';
import {StageVisuals} from '../app/components/StageVisuals';
import {CARTOON_TILE_PATH} from '../app/components/TileCartoon';
import {TILE_INKS} from '../lib/tile-palette';

test('muted classic and stage faces paint a shade above numbers but below suit identity',()=>{
 for(let stage=0;stage<=10;stage++)for(let s=0;s<4;s++)for(const n of [1,2,7,15])for(const small of [false,true]){
  const render=(muted:boolean)=>renderToStaticMarkup(<StageVisuals stage={stage||undefined}><TileFace tile={{id:(n-1)*4+s,n,s}} muted={muted} small={small}/></StageVisuals>);
  const normal=render(false),muted=render(true);
  assert.ok(!normal.includes('data-tile-muted-shade'));
  const shade=muted.match(/<path data-tile-muted-shade="true"[^>]*>/g)||[];
  assert.equal(shade.length,1);assert.ok(shade[0].includes(`d="${CARTOON_TILE_PATH}"`));
  assert.ok(shade[0].includes('fill="#cfcfc8"'));assert.ok(shade[0].includes('opacity=".38"'));
  assert.ok(muted.lastIndexOf('</text>')<muted.indexOf(shade[0]));
  assert.ok(muted.indexOf(shade[0])<muted.indexOf('tile-suit-identity'));
  const motif=(html:string)=>html.match(/<g class="[^"]*tile-suit-identity"[^>]*>[\s\S]*?<\/g>/)?.[0];
  assert.equal(motif(muted),motif(normal),'suit art stays unchanged and above the shade');
  assert.ok(motif(muted)?.includes(`fill="${TILE_INKS[s]}"`));
  assert.ok(!/<(?:g|svg)[^>]*(?:filter=|opacity=)/.test(muted.match(/<g class="tile-main-art"[^>]*>/)![0]));
 }
});

test('hand state styling has no dimming filters, group opacity or forced back faces',()=>{
 for(const name of readdirSync('app').filter(name=>name.endsWith('.css'))){
  const css=readFileSync(`app/${name}`,'utf8');
  for(const [,selector,body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
   if(!selector.includes('.hand-tile'))continue;
   if(selector.includes('.tile-suit-identity'))continue;
   if(selector.includes('.tile-main-art'))assert.ok(!/(?:filter|opacity)\s*:/.test(body),`${name}: ${selector}`);
   if(selector.includes('.tile-art'))assert.ok(!/backface-visibility\s*:\s*hidden/.test(body),`${name}: ${selector}`);
   if(selector.includes('.unplayable')||selector.includes(':disabled')){
    assert.ok(!/filter\s*:\s*(?!none)[^;}]+/.test(body),`${name}: ${selector}`);
    assert.ok(!/opacity\s*:\s*(?:0?\.|0\s*[;}])/.test(body),`${name}: ${selector}`);
   }
  }
 }
});
