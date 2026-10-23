"use client";
import {useId} from 'react';
import {useStageVisual} from './StageVisuals';
import {stagePalette} from '../../lib/stage-presentation';
/** Tabletop-sized art and vector veins, never an enlarged crop of the tile atlas. */
export default function TableSurface({withRim=false,stage:explicitStage}:{withRim?:boolean,stage?:number}){
 const contextualStage=useStageVisual(),stage=explicitStage||contextualStage,id=useId().replace(/:/g,'');
 const wood=!stage||[2,5,7,10].includes(stage),palette=stagePalette(stage||2);
 return <div className={`table-surface ${wood?'surface-wood':'surface-stone'}`} data-surface-stage={stage||0} aria-hidden="true">
  <svg className="table-surface-material"><defs><pattern id={`${id}-surface`} patternUnits="userSpaceOnUse" width={wood?1254:768} height={wood?1254:768}>
   {wood?<image href="/turntale-walnut-051.webp" width="1254" height="1254"/>:<><rect width="768" height="768" fill={palette.floor}/>{Array.from({length:24},(_,i)=><path key={i} d={`M${-80+i*49} -20Q${250+i*13} ${120+i*9} ${-70+i*49} 788`} fill="none" stroke={i%3?'#d6f3ec':'#060d1a'} strokeWidth={i%5===0?3:.65} opacity={i%5===0?.045:.08}/>)}</>}
   {Array.from({length:80},(_,i)=><path key={i} d={`M${(i*197)%768} ${(i*317)%768}l${2+i%7} ${i%3-1}`} stroke={i%2?'#fff7d5':'#070c13'} strokeWidth=".6" opacity={wood?.1:.15}/>)}</pattern></defs>
   <rect width="100%" height="100%" fill={`url(#${id}-surface)`}/>{stage&&<rect width="100%" height="100%" fill={palette.floor} opacity={wood?.2:.12}/>}
  </svg>{withRim&&<div className="table-surface-rim"/>}<div className="table-surface-light"/>
 </div>;
}
