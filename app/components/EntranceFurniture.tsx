'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {sceneImage} from '../../lib/scene-assets';
import {STAGE_TABLE_ATLAS,stageTableCell} from '../../lib/stage-table-material';
import {nativeTableMaterial} from '../../lib/table-material';
import {projectedFurniture} from '../../lib/entrance-furniture';
import {paintFurnitureScene} from '../../lib/furniture-renderer';
import {entranceFrameCamera} from '../../lib/entrance-frame';
import {ENTRANCE_MS,type EntrancePhase} from '../../lib/atmosphere';
const materialTiles=new Map<number,HTMLCanvasElement>();
/** One projected drawing keeps the legs and slab visible without CSS 3D flattening artifacts. */
export default function EntranceFurniture({diameter,cx,cy,stage=0,width,height,phase,visible,overview,cameraOverride}:{diameter:number,cx:number,cy:number,stage?:number,width:number,height:number,phase:EntrancePhase,visible:boolean,overview:number,cameraOverride?:{tilt:number,scale:number}}){
 const [texture,setTexture]=useState<HTMLCanvasElement|null>(null);
 useEffect(()=>{let stopped=false;const cached=materialTiles.get(stage);if(cached){setTexture(cached);return;}const source=nativeTableMaterial(stage);void sceneImage(source||STAGE_TABLE_ATLAS).then(image=>{if(stopped)return;const cell=source?{x:0,y:0,width:image.naturalWidth,height:image.naturalHeight}:stageTableCell(stage,image.naturalWidth,image.naturalHeight),tile=document.createElement('canvas');tile.width=tile.height=768;const ctx=tile.getContext('2d');if(ctx){ctx.imageSmoothingQuality='high';ctx.drawImage(image,cell.x,cell.y,cell.width,cell.height,0,0,768,768);}materialTiles.set(stage,tile);if(materialTiles.size>2)materialTiles.delete(materialTiles.keys().next().value!);setTexture(tile);}).catch(()=>{});return()=>{stopped=true;};},[stage]);
 const canvas=useRef<HTMLCanvasElement>(null),clock=useRef({phase,elapsed:0});
 useLayoutEffect(()=>{
  if(clock.current.phase!==phase)clock.current={phase,elapsed:0};
  const node=canvas.current,ctx=node?.getContext('2d');if(!node||!ctx||!width||!height||!visible)return;
  const ratio=Math.min(devicePixelRatio||1,2);node.width=Math.round(width*ratio);node.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
  let frame=0,last=performance.now();

  const draw=(now:number)=>{
   clock.current.elapsed+=Math.max(0,now-last);last=now;
   const animation=document.querySelector('.entry-camera')?.getAnimations().find(a=>a.id===`turntale-observer-${phase}`);
   const elapsed=Math.min(ENTRANCE_MS[phase],['focus','rise'].includes(phase)&&typeof animation?.currentTime==='number'?animation.currentTime:clock.current.elapsed);
   const camera={width,height,...(cameraOverride||entranceFrameCamera(phase,elapsed,overview,false,stage>0))},g=projectedFurniture(diameter,cx,cy,stage,camera);
   paintFurnitureScene(ctx,texture,g,{stage,cx,cy,diameter,width,height,camera});if(!cameraOverride&&['shuffle','deal','focus','rise','opponent-out'].includes(phase)&&clock.current.elapsed<ENTRANCE_MS[phase])frame=requestAnimationFrame(draw);
  };
  draw(last);return()=>cancelAnimationFrame(frame);
 },[diameter,cx,cy,stage,width,height,phase,visible,overview,texture,cameraOverride]);
 return <canvas ref={canvas} className="entry-furniture" data-furniture="solid-legs-and-slab" aria-hidden="true"/>;
}
