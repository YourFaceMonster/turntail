"use client";
import {memo,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {EntranceGpu,entranceTileAtlas,GPU_TILE_STRIDE} from '../../lib/entrance-gpu';
import {entranceFrameCamera,writeEntranceFrame,type EntranceRenderTile} from '../../lib/entrance-frame';
import type {ShufflePose} from '../../lib/shuffle-motion';
import type {DealRoute} from '../../lib/deal-motion';
import type {DealItem,DealTarget} from '../../lib/deal-animation';
import {useStageVisual,MATERIAL_COLORS} from './StageVisuals';
import {ENTRANCE_MS,entranceDuration,type EntrancePhase} from '../../lib/atmosphere';
type Card={width:number,height:number,depth:number,poses?:ShufflePose[],landing:{item:DealItem,target:DealTarget}};
type Props={cards:Card[],routes:DealRoute[],phase:EntrancePhase,visible:boolean,width:number,height:number,overview:number,onStatus:(status:'ready'|'fallback')=>void};
function EntranceGpuTiles({cards,routes,phase,visible,width,height,overview,onStatus}:Props){
 const stage=useStageVisual();
 const canvas=useRef<HTMLCanvasElement>(null),engine=useRef<EntranceGpu|null>(null),[ready,setReady]=useState(false);
 const latest=useRef({phase,onStatus});latest.current={phase,onStatus};
 const clock=useRef({phase,elapsed:0}),tiles=useMemo<EntranceRenderTile[]>(()=>{let faceSlot=2;return cards.map(card=>({...card,poses:card.poses!,kind:card.landing.item.kind,target:card.landing.target,faceSlot:card.landing.item.kind==='own'?faceSlot++:1}));},[cards]);
 const data=useMemo(()=>new Float32Array(tiles.length*GPU_TILE_STRIDE),[tiles]);
 useEffect(()=>{
  let cancelled=false;setReady(false);
  const node=canvas.current;if(!node)return;
  const lost=(event:Event)=>{event.preventDefault();setReady(false);latest.current.onStatus('fallback');};node.addEventListener('webglcontextlost',lost);
  void (async()=>{
   try{
    const faces=cards.filter(card=>card.landing.item.kind==='own').map(card=>document.querySelector<SVGSVGElement>(`${card.landing.item.selector} svg`));
    if(faces.some(face=>!face))throw Error('Tile faces not ready');
    const stageBack=document.querySelector<SVGSVGElement>('.active-table .floor-stage .tile.back svg');
    const atlas=await entranceTileAtlas(faces,stageBack);if(cancelled)return;
    const color=stage?MATERIAL_COLORS[stage-1]:null,body=color?[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255) as [number,number,number]:undefined;
    const gpu=new EntranceGpu(node,atlas,tiles.length,width,height,body);engine.current=gpu;
    gpu.draw(writeEntranceFrame(data,tiles,routes,'prepare',0,width/2,height/2),{width,height,...entranceFrameCamera('prepare',0,overview)});
    setReady(true);latest.current.onStatus('ready');
   }catch(error){if(!cancelled){console.warn('Opening tile renderer fell back:',error);latest.current.onStatus('fallback');}}
  })();
  return()=>{cancelled=true;node.removeEventListener('webglcontextlost',lost);engine.current?.destroy();engine.current=null;};
 },[cards,tiles,routes,width,height,overview,data,stage]);
 useLayoutEffect(()=>{if(clock.current.phase!==phase)clock.current={phase,elapsed:0};},[phase]);
 useEffect(()=>{
  if(!ready||!visible)return;
  let frame=0,last=performance.now();
  // The DOM table's animation clock keeps both projections in the same frame.
  const cameraAnimation=document.querySelector('.entry-camera')?.getAnimations().find(animation=>animation.id==='turntale-observer');
  const moving=['shuffle','rise','deal','focus'].includes(phase);
  function draw(now:number){
   clock.current.elapsed+=Math.max(0,now-last);last=now;
   const elapsed=clock.current.elapsed;
   let camera=entranceFrameCamera(phase,elapsed,overview);
   if(cameraAnimation&&typeof cameraAnimation.currentTime==='number'&&['rise','focus'].includes(phase))camera=entranceFrameCamera(phase,cameraAnimation.currentTime,overview);
   try{engine.current?.draw(writeEntranceFrame(data,tiles,routes,phase,cameraAnimation&&typeof cameraAnimation.currentTime==='number'&&['rise','focus'].includes(phase)?cameraAnimation.currentTime:elapsed,width/2,height/2),{width,height,...camera});}
   catch{latest.current.onStatus('fallback');return;}
   // Never quantise to 16.7ms: the display's rAF clock may be 60/90/120/144Hz.
   if(moving&&elapsed<ENTRANCE_MS[phase])frame=requestAnimationFrame(draw);
  }
  draw(last);return()=>cancelAnimationFrame(frame);
 },[ready,visible,phase,data,tiles,routes,width,height,overview]);
 return <canvas className="entry-gpu-tiles" ref={canvas} aria-hidden="true" style={{visibility:ready?'visible':'hidden'}}/>;
}
export default memo(EntranceGpuTiles);
