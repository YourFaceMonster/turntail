import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import TileFace from '../app/components/TileFace';
import {StageVisuals} from '../app/components/StageVisuals';
import {STAGE_THEMES} from '../lib/stage-theme';
import {TILE_ATLAS_CELL} from '../lib/entrance-gpu';
for(const theme of STAGE_THEMES){
 for(const s of [0,1,2,3]){const two=renderToStaticMarkup(<StageVisuals stage={theme.stage}><TileFace tile={{id:s+4,n:2,s}}/></StageVisuals>),normal=renderToStaticMarkup(<StageVisuals stage={theme.stage}><TileFace tile={{id:s+28,n:8,s}}/></StageVisuals>);assert.ok(two.includes('data-special-two=')&&!normal.includes('data-special-two='));assert.ok(two.includes('translate(51 85) scale(0.98)'));assert.ok(two.includes('micrograin'));}
}
assert.ok(TILE_ATLAS_CELL.width>=512&&TILE_ATLAS_CELL.height>=704);assert.ok(TILE_ATLAS_CELL.columns*TILE_ATLAS_CELL.width<=4096);
console.log('PASS: forty dedicated number-two faces, vector micrograin, a high-resolution tile atlas within a 4096px GPU width.');
