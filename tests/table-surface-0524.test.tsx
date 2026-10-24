import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import TableSurface from '../app/components/TableSurface';
import TableSurfaceViewport from '../app/components/TableSurfaceViewport';
import EntranceGreetings from '../app/components/EntranceGreetings';
import {entranceSeatLayout,greetingPlacement} from '../lib/entrance-company';
import {TABLE_GRAIN_ASSETS,TABLE_GRAIN_PITCH,tableViewportOrigin} from '../lib/table-material';
import {stageSceneAssets} from '../lib/scene-assets';
import {tableCircle} from '../lib/table-world';
for(const [width,height] of [[390,844],[844,390],[1366,936]]){
 const viewport={width,height,overview:.38},company=[{name:'왼쪽',avatar:'korean-monster:0',count:10,points:0},{name:'오른쪽',avatar:'korean-monster:1',count:10,points:0}];
 const bubbles=company.map((_,i)=>greetingPlacement(entranceSeatLayout(1900,width/2,height/2,i,2,true,0,viewport).head,viewport,i,2,'한 판 해볼까?',true));
 assert.equal(bubbles[0].tail,24);assert.equal(bubbles[1].tail,bubbles[1].width-24);
 assert.ok(Math.abs(bubbles[0].left+bubbles[1].left+bubbles[1].width-width)<1e-6,'classic speech anchors mirror around the screen centre');
 const html=renderToStaticMarkup(<EntranceGreetings company={company} diameter={1900} cx={width/2} cy={height/2} viewport={viewport}/>);
 assert.ok(html.includes('data-speaker="왼쪽" data-bubble-side="left"')&&html.includes('data-speaker="오른쪽" data-bubble-side="right"'));
 const circle=tableCircle({left:20,top:50,width:width-40,height:height-100},width,height);
 for(const stage of [0,1]){
  const src=stage===0?TABLE_GRAIN_ASSETS.wood:TABLE_GRAIN_ASSETS.stone,moving=renderToStaticMarkup(<TableSurface stage={stage}/>),view=renderToStaticMarkup(<TableSurfaceViewport circle={circle} width={width} height={height} stage={stage}/>),origin=tableViewportOrigin(circle,stage);
  assert.ok(existsSync('public'+src));assert.ok(moving.includes(src)&&view.includes(src));
  assert.ok(view.includes(`viewBox="${origin.x} ${origin.y} ${width} ${height}"`));
  assert.ok(moving.includes(`data-grain-pitch="${TABLE_GRAIN_PITCH}"`)&&view.includes(`data-grain-pitch="${TABLE_GRAIN_PITCH}"`));
  assert.ok(!moving.includes('stage-table-materials-0518.webp'),'neither corrected tabletop stretches an atlas cell');
 }
}
assert.ok(stageSceneAssets(1).includes(TABLE_GRAIN_ASSETS.stone),'stone is decoded before scene entry');
assert.equal(renderToStaticMarkup(<TableSurfaceViewport circle={{cx:10,cy:10,diameter:100}} width={300} height={300} stage={11}/>),'','invalid regions have no material');
console.log('PASS: mirrored left/right classic speech, native-pitch wood and sandstone in camera/live surfaces, viewport-aligned origins in three orientations, and decoded stage-one material readiness.');
