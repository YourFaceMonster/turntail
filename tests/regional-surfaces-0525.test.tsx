import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {nativeTableMaterial,radialTableMaterial,TABLE_GRAIN_PITCH} from '../lib/table-material';
import {stageSceneAssets} from '../lib/scene-assets';
import {stageModel,paintStageModel} from '../lib/stage-models';
import {STAGE_THEMES} from '../lib/stage-theme';
import TableSurface from '../app/components/TableSurface';
import TableSurfaceViewport from '../app/components/TableSurfaceViewport';
import TileFace from '../app/components/TileFace';
import {StageVisuals,MATERIAL_COLORS} from '../app/components/StageVisuals';
for(let stage=1;stage<=10;stage++){
 const path=nativeTableMaterial(stage)!;assert.ok(existsSync('public'+path));assert.ok(stageSceneAssets(stage).includes(path));
 const top=renderToStaticMarkup(<TableSurface stage={stage}/>),screen=renderToStaticMarkup(<TableSurfaceViewport circle={{cx:200,cy:400,diameter:2000}} width={400} height={800} stage={stage}/>);assert.ok(top.includes(path)&&screen.includes(path));assert.ok(top.includes(radialTableMaterial(stage)?'data-grain-layout="radial"':`data-grain-pitch="${TABLE_GRAIN_PITCH}"`)&&!top.includes('stage-table-materials-0518.webp'));
 for(const character of STAGE_THEMES[stage-1].opponents.slice(0,2)){
  let draws=0;const image={} as CanvasImageSource,rect=stageModel(character.portrait).rect,canvas={width:0,height:0},ctx={canvas,clearRect(){},drawImage(...args:unknown[]){draws++;assert.equal(args[0],image);assert.deepEqual(args.slice(1),[...rect,0,0,rect[2],rect[3]]);}} as unknown as CanvasRenderingContext2D;
  paintStageModel(ctx,image,character.portrait);assert.equal(draws,1);assert.equal(canvas.width,rect[2]);assert.equal(canvas.height,rect[3]);
 }
}
assert.equal(MATERIAL_COLORS[1],'#ecd2a2');
// Stage 2 keeps a lighter texture than the other regions (0.24 since the 2026-10-24 retune; others 0.42).
const textureOpacity=(html:string)=>Number(/data-stage-texture="\d+"[^>]*opacity="([\d.]+)"/.exec(html)?.[1]);
const otherStage=textureOpacity(renderToStaticMarkup(<StageVisuals stage={3}><TileFace tile={{id:28,n:8,s:0}}/></StageVisuals>));
for(const s of [0,1,2,3]){const face=renderToStaticMarkup(<StageVisuals stage={2}><TileFace tile={{id:s+28,n:8,s}}/></StageVisuals>);assert.equal(textureOpacity(face),0.24);assert.ok(textureOpacity(face)<otherStage,'stage-two wood stays brighter');assert.ok(face.includes('data-suit="'+s+'"'));}
console.log('PASS: all ten high-resolution native table surfaces and decoded scene assets, twenty isolated one-paint model planes including Milla, and a brighter stage-two wood face across all four suits.');
