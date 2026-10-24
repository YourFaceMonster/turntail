import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {StageVisuals,StageMotif} from '../app/components/StageVisuals';
import TileFace from '../app/components/TileFace';
import TableSurface from '../app/components/TableSurface';
import {furnitureDimensions,furnitureGeometry,projectedFurniture} from '../lib/entrance-furniture';
import {platformGeometry} from '../lib/stage-setting';
import {entranceSeatLayout} from '../lib/entrance-company';
import {SEATED_TILT,seatedScale} from '../lib/entrance-camera';
import {stageTableCell,STAGE_TABLE_ATLAS} from '../lib/stage-table-material';
import {paintFurnitureFace} from '../lib/furniture-paint';
import MapAtmosphere from '../app/components/MapAtmosphere';
import {tileSwipeReady,isTileDoubleTap} from '../lib/tile-gestures';
const emblems=new Set<string>(),frames=new Set<string>();
for(let stage=1;stage<=10;stage++){
 const surface=renderToStaticMarkup(<TableSurface stage={stage}/>);assert.ok(surface.includes(STAGE_TABLE_ATLAS)&&surface.includes(`data-painted-table="${stage}"`));
 const cell=stageTableCell(stage,1983,793);assert.ok(cell.x>=0&&cell.y>=0&&cell.x+cell.width<=1983.001&&cell.y+cell.height<=793.001);
 const geometry=furnitureGeometry(1900,681,468,stage),platform=platformGeometry(1900,stage);assert.equal(geometry.cap.length,platform.vertices.length);assert.ok(geometry.depth>=25);assert.ok(geometry.faces.every(f=>f.points.every(p=>p.z<0)));
 if(platform.setting.kind!=='table'){assert.ok(geometry.depth>=platform.setting.height&&geometry.depth===geometry.height,'regional rock/root supports extend to the ground at their authored height');assert.equal(geometry.legs.length,0);}if(platform.setting.kind==='stump')assert.ok(geometry.faces.some(f=>f.part==='root'));if(platform.setting.kind==='altar')assert.ok(geometry.faces.some(f=>f.part==='plinth'));
 const camera={width:1363,height:936,tilt:SEATED_TILT,scale:seatedScale(.38)},projected=projectedFurniture(1900,681,468,stage,camera);for(const f of projected.faces)assert.ok(f.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
 for(const s of [0,1,2,3]){const svg=renderToStaticMarkup(<StageMotif stage={stage} s={s}/>);emblems.add(svg.replace(/data-regional-suit="[^"]+"/g,''));const tile=renderToStaticMarkup(<StageVisuals stage={stage}><TileFace tile={{id:28+s,n:8,s}}/></StageVisuals>);assert.ok(tile.includes(`data-region-engraving="${stage}:${s}"`)&&tile.includes('data-tile-finish="cartoon"'));frames.add(tile.match(/data-region-engraving[\s\S]*?<\/g>/)?.[0]||'');}
 for(const index of [0,1]){const seat=entranceSeatLayout(1900,681,468,index,2,true,stage,{width:1363,height:936,overview:.38}),reference=entranceSeatLayout(1900,681,468,index,2,true,1,{width:1363,height:936,overview:.38});assert.equal(seat.height,reference.height);assert.ok(Math.abs(seat.top+seat.height-(468-1900*.44))<1e-9);}
}
assert.equal(emblems.size,40);assert.equal(frames.size,40);
const map=renderToStaticMarkup(<MapAtmosphere/>);assert.equal((map.match(/data-map-bridge=/g)||[]).length,4);assert.equal((map.match(/data-flock=/g)||[]).length,3);assert.equal((map.match(/class="map-lantern-flame"/g)||[]).length,18);assert.equal((map.match(/class="map-firefly"/g)||[]).length,24);
for(const y of [-500,-60,60,500])assert.equal(tileSwipeReady('floor',{x:0,y},60,200),false);assert.ok(tileSwipeReady('hand',{x:0,y:-70},60,200));assert.ok(isTileDoubleTap({id:1,x:0,y:0,at:10},{id:1,x:0,y:0,at:210}));
let triangles=0;const ctx={save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},transform(...args:number[]){assert.ok(args.every(Number.isFinite));},drawImage(){triangles++;}} as unknown as CanvasRenderingContext2D;paintFurnitureFace(ctx,{} as CanvasImageSource,[{x:10,y:10},{x:100,y:30},{x:90,y:230},{x:14,y:220}]);assert.equal(triangles,2);
const css=fs.readFileSync('app/globals.css','utf8');assert.ok(css.includes('word-break:keep-all;overflow-wrap:normal'));assert.ok(fs.existsSync('public'+STAGE_TABLE_ATLAS));
console.log('PASS: 40 distinct regional suits and number engravings, ten painted top/body materials, rock/root/altar supports, finite perspective painting, seated region geometry, four moving bridges + three bird flocks + 18 flames + 24 fireflies, floor slide removal and preserved hand swipe/double tap.');
