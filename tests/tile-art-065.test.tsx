import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import TileFace from '../app/components/TileFace';
import {StageVisuals} from '../app/components/StageVisuals';
import {TILE_INKS} from '../lib/tile-palette';
const ages=new Set<string>();
for(let stage=1;stage<=10;stage++)for(let s=0;s<4;s++)for(const n of [1,2,8,12,15]){
 const id=(n-1)*4+s,html=renderToStaticMarkup(<StageVisuals stage={stage}><TileFace tile={{id,n,s}}/></StageVisuals>);
 assert.ok(html.includes(TILE_INKS[s]),'all regions preserve suit colours');
 assert.ok(html.includes('data-number-outline="dark"')&&html.includes('stroke-width="2.6"')&&html.includes('data-number-halo="true"'),'readable dark contour with a light halo on both light and dark materials');
 assert.ok(html.includes('data-tile-finish="cartoon"')&&html.includes('data-tile-wear="handled"'));
 ages.add(html.match(/data-wear-age="(\d)"/)![1]);
}
assert.equal(ages.size,5,'faces have visibly different degrees of wear');
console.log('PASS: all ten stages, four suit colours, one/two/one-digit/two-digit numbers, contrasting contours and five seeded wear levels.');
