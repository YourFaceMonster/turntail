import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {existsSync} from 'node:fs';
import {platformGeometry,stageSetting} from '../lib/stage-setting';
import {tileBodyDepth} from '../lib/tile-body';
import {shuffleDepth} from '../lib/shuffle-motion';
import {tableCircle} from '../lib/table-world';
import EntranceWorld from '../app/components/EntranceWorld';
import {measureSavedTable} from '../lib/saved-table';
for(let stage=1;stage<=10;stage++){
 assert.ok(existsSync(`public/environments/stage-${stage}-055.webp`));
 const {setting,vertices,sides,clip}=platformGeometry(1200,stage),html=renderToStaticMarkup(<EntranceWorld diameter={1200} cx={600} cy={500} stage={stage}/>);
 assert.equal(vertices.length,sides.length);assert.ok(clip.startsWith('polygon('));
 assert.ok(html.includes(`data-world-kind="${setting.kind}"`));
 assert.equal((html.match(/data-support=/g)||[]).length,setting.kind==='table'?4:0,'rocks and altars must not grow furniture legs');
 for(let i=0;i<sides.length;i++){const a=sides[i],b=vertices[(i+1)%vertices.length],angle=a.angle*Math.PI/180;assert.ok(Math.abs(a.x+Math.cos(angle)*a.width-b.x)<1e-7);assert.ok(Math.abs(a.y+Math.sin(angle)*a.width-b.y)<1e-7);}
}
assert.equal(stageSetting(3).kind,'rock');assert.equal(stageSetting(6).kind,'altar');assert.equal(stageSetting(10).kind,'stump');
for(const h of [32,50,80,100]){assert.equal(shuffleDepth(h),tileBodyDepth(h));assert.equal(tileBodyDepth(h),3*Math.max(2.5,Math.min(7.5,h*.075)),'both opening paths use the requested threefold body thickness');}
const bounds={left:280,top:90,width:780,height:820},world=tableCircle(bounds,1363,935);assert.ok(world.diameter>1600,'overhead surface covers the desktop background');assert.equal(tableCircle(bounds,1363,935,world.diameter+200).diameter,world.diameter+200,'large physical shuffle can reserve the same permanent surface');
const game={me:0,players:[{hand:[]}],stacks:[{upper:true,lowerPresent:true}],trick:[]},rows=measureSavedTable(game,0,s=>s.includes('upper')?{left:100,top:100,width:40,height:53}:{left:103,top:104,width:40,height:53});assert.equal(rows[0].baseTarget?.x,123);assert.equal(rows[0].target.x,120,'resume preserves the measured offset between covered lower and upper tile bodies');
console.log('PASS: ten atmospheric assets, joined solid side geometry, region-specific rock/altar/root supports, thin shared tile bodies, matched permanent surface size and measured two-piece resume stacks.');
