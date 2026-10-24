import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import TileFace from '../app/components/TileFace';
import {StageVisuals} from '../app/components/StageVisuals';
import StageRegionOutlines from '../app/components/StageRegionOutlines';
import {STAGE_THEMES} from '../lib/stage-theme';
import {STAGE_REGION_BOUNDARIES} from '../lib/stage-map';
import {TILE_ATLAS_CELL} from '../lib/entrance-gpu';
const inside=(p:number[],poly:number[][])=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
for(const theme of STAGE_THEMES){
 assert.ok(inside(theme.position,STAGE_REGION_BOUNDARIES[theme.stage-1]),'each node belongs to its outlined territory');
 for(const s of [0,1,2,3]){const two=renderToStaticMarkup(<StageVisuals stage={theme.stage}><TileFace tile={{id:s+4,n:2,s}}/></StageVisuals>),normal=renderToStaticMarkup(<StageVisuals stage={theme.stage}><TileFace tile={{id:s+28,n:8,s}}/></StageVisuals>);assert.ok(two.includes('data-special-two=')&&!normal.includes('data-special-two='));assert.ok(two.includes('translate(51 85) scale(0.98)'));assert.ok(two.includes('micrograin'));}
}
assert.equal((renderToStaticMarkup(<StageRegionOutlines selected={1}/>).match(/data-map-region=/g)||[]).length,10);
assert.ok(TILE_ATLAS_CELL.width>=512&&TILE_ATLAS_CELL.height>=704);assert.ok(TILE_ATLAS_CELL.columns*TILE_ATLAS_CELL.width<=4096);
console.log('PASS: forty dedicated number-two faces, vector micrograin, ten node-containing dashed territories, and a high-resolution tile atlas within a 4096px GPU width.');
