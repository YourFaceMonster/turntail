import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import ClassicTileOrnament from '../app/components/ClassicTileOrnament';
import TileFace from '../app/components/TileFace';
import {StageVisuals} from '../app/components/StageVisuals';

// The 2026-11-04 suit redesign replaces old celestial engravings, while every
// material and compact tile must still embed the same shared identity/frame.
const symbols=['iron-gate','secret-key','sacred-flame','crown'];
for(let special=0;special<2;special++)for(let s=0;s<4;s++){
 const art=renderToStaticMarkup(<ClassicTileOrnament s={s} special={!!special}/>);
 assert.ok(art.includes(`data-suit-symbol="${symbols[s]}"`),'new suit identity is present in the engraving');
 for(let stage=0;stage<=10;stage++)for(const small of [false,true]){
  const n=special?2:15,face=<TileFace tile={{id:(n-1)*4+s,n,s}} small={small}/>;
  const html=renderToStaticMarkup(stage?<StageVisuals stage={stage}>{face}</StageVisuals>:face);
  assert.ok(html.includes(art),'every material and compact tile embeds the shared suit artwork');
 }
}
console.log('PASS: all eight redesigned suit/frame variants remain consistent in eleven materials at normal and compact sizes.');
