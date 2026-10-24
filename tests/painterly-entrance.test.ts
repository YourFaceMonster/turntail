import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {entranceFrameCamera} from '../lib/entrance-frame';
import {environmentTransform,environmentCameraFrames,observerCameraFrames} from '../lib/entrance-camera';
import {ENTRANCE_MS,nextEntrance,type EntrancePhase} from '../lib/atmosphere';
import {stageEnvironmentImage} from '../lib/stage-art';
import {STAGE_TILE_DESIGNS} from '../lib/stage-tile-design';
import {furnitureDimensions,projectedFurniture} from '../lib/entrance-furniture';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-9);
assert.equal(new Set(STAGE_TILE_DESIGNS.map(d=>d.panel)).size,10);
for(const overview of [.16,.3,.6]){
 let phase:EntrancePhase='approach';
 while(phase!=='idle'){
  const next=nextEntrance(phase),end=entranceFrameCamera(phase,ENTRANCE_MS[phase],overview,false,true),start=entranceFrameCamera(next,0,overview,false,true);near(end.tilt,start.tilt);near(end.scale,start.scale);phase=next;
 }
 for(const phase of ['focus','rise'] as const){
  const frames=observerCameraFrames(overview,ENTRANCE_MS[phase],phase,true),background=environmentCameraFrames(overview,ENTRANCE_MS[phase],false,phase,true);assert.equal(frames.length,background.length);
  let lastScale=0,lastTilt=2;
  for(let step=0;step<=100;step++){
   const camera=entranceFrameCamera(phase,ENTRANCE_MS[phase]*step/100,overview,false,true);assert.ok(camera.scale>=lastScale-1e-9&&camera.tilt<=lastTilt+1e-9);lastScale=camera.scale;lastTilt=camera.tilt;
   const scale=Number(environmentTransform(camera,overview,false,true).match(/scale\(([^)]+)\)/)![1]);assert.ok(scale>=1&&scale<=1.061,'painted plate never grows into a blurry 4x crop');
   const geometry=projectedFurniture(1900,640,360,4,{width:1280,height:720,...camera});assert.ok(geometry.faces.every(f=>f.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))));
  }
 }
}
for(let stage=1;stage<=10;stage++)assert.ok(existsSync('public'+stageEnvironmentImage(stage)));
assert.ok(furnitureDimensions(1900,640,360,4).height<furnitureDimensions(1900,640,360,10).height,'water terrace stays lower than the world-tree stump');
console.log('PASS: ten silhouettes and painted assets, continuous stage camera boundaries, monotonic motion, bounded background magnification, finite furniture projections, and region-proportional supports.');
