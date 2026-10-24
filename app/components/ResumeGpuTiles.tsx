'use client';
import {memo,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {EntranceGpu,entranceTileAtlas,GPU_TILE_STRIDE} from '../../lib/entrance-gpu';
import {entranceFrameCamera} from '../../lib/entrance-frame';
import {entranceDuration,type EntrancePhase} from '../../lib/atmosphere';
import {resumeRenderPlan,writeResumeFrame,resumeHandoffProgress,type ResumeRow} from '../../lib/resume-scene';
import {MATERIAL_COLORS,useStageVisual} from './StageVisuals';
import type {SavedTableItem} from '../../lib/saved-table';
import type {DealTarget} from '../../lib/deal-animation';
type Props={rows:ResumeRow[],width:number,height:number,overview:number,phase:EntrancePhase,visible:boolean,onStatus:(status:'ready'|'fallback')=>void};
/** Resume uses the same bevelled mesh and floor shadows as the new-game shuffle. */
function ResumeGpuTiles({rows,width,height,overview,phase,visible,onStatus}:Props){
 const stage=useStageVisual(),canvas=useRef<HTMLCanvasElement>(null),engine=useRef<EntranceGpu|null>(null),[ready,setReady]=useState(false),callbacks=useRef(onStatus);callbacks.current=onStatus;
 const clock=useRef({phase,elapsed:0}),tiles=useMemo(()=>resumeRenderPlan(rows),[rows]);
 const data=useMemo(()=>new Float32Array(tiles.length*GPU_TILE_STRIDE),[tiles]);
 const write=(progress=0)=>writeResumeFrame(data,tiles,progress);
 useEffect(()=>{
  let cancelled=false;setReady(false);const node=canvas.current;if(!node||!rows.length)return;
  const lost=(e:Event)=>{e.preventDefault();setReady(false);callbacks.current('fallback');};node.addEventListener('webglcontextlost',lost);
  void (async()=>{try{
   const faces=rows.filter(row=>row.item.tile&&!row.item.back).map(row=>document.querySelector<SVGSVGElement>(`${row.item.selector} svg`));if(faces.some(f=>!f))throw Error('Saved faces pending');
   const back=document.querySelector<SVGSVGElement>('.active-table .floor-stage .tile.back svg'),atlas=await entranceTileAtlas(faces,back);if(cancelled)return;
   const color=stage?MATERIAL_COLORS[stage-1]:null,body=color?[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255) as [number,number,number]:undefined;
   engine.current=new EntranceGpu(node,atlas,tiles.length,width,height,body);engine.current.draw(write(),{width,height,...entranceFrameCamera('prepare',0,overview,true)});setReady(true);callbacks.current('ready');
  }catch(error){if(!cancelled){console.warn('Resume tile renderer fell back:',error);callbacks.current('fallback');}}})();
  return()=>{cancelled=true;node.removeEventListener('webglcontextlost',lost);engine.current?.destroy();engine.current=null;};
 },[rows,tiles,width,height,overview,data,stage]);
 useLayoutEffect(()=>{if(clock.current.phase!==phase)clock.current={phase,elapsed:0};},[phase]);
 useEffect(()=>{
  if(!ready||!visible)return;let frame=0,last=performance.now();
  const motion=document.querySelector('.entry-camera')?.getAnimations().find(a=>a.id==='turntale-observer');
  const draw=(now:number)=>{clock.current.elapsed+=Math.max(0,now-last);last=now;const elapsed=clock.current.elapsed;
   const cameraTime=motion&&typeof motion.currentTime==='number'?motion.currentTime:elapsed;
   try{engine.current?.draw(write(resumeHandoffProgress(phase,cameraTime)),{width,height,...entranceFrameCamera(phase,cameraTime,overview,true)});}catch{callbacks.current('fallback');return;}
   if(['rise','focus'].includes(phase)&&elapsed<entranceDuration(phase,true))frame=requestAnimationFrame(draw);
  };draw(last);return()=>cancelAnimationFrame(frame);
 },[ready,visible,phase,rows,tiles,width,height,overview,data]);
 return <canvas className="entry-gpu-tiles entry-resume-gpu" ref={canvas} aria-hidden="true" style={{visibility:ready?'visible':'hidden'}}/>;
}
export default memo(ResumeGpuTiles);
