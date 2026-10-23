"use client";
import {useId} from 'react';
import {useStageVisual} from './StageVisuals';
import {stagePalette} from '../../lib/stage-presentation';
import {stageSetting} from '../../lib/stage-setting';
/** Native-size photographed grain is mirrored across repeat seams, never stretched from tile art. */
export default function TableSurface({withRim=false,stage:explicitStage}:{withRim?:boolean,stage?:number}){
 const contextualStage=useStageVisual(),stage=explicitStage??contextualStage??0,id=useId().replace(/:/g,''),setting=stageSetting(stage);
 const wood=setting.wood,palette=stagePalette(stage||2),size=wood?1254:627,src=wood?'/turntale-walnut-051.webp':'/turntale-stone-material-055.webp';
 return <div className={`table-surface ${wood?'surface-wood':'surface-stone'} surface-region-${stage}`} data-surface-stage={stage} aria-hidden="true">
  <svg className="table-surface-material"><defs><pattern id={`${id}-surface`} patternUnits="userSpaceOnUse" width={size*2} height={size*2}>
   {['',`translate(${size*2} 0) scale(-1 1)`,`translate(0 ${size*2}) scale(1 -1)`,`translate(${size*2} ${size*2}) scale(-1 -1)`].map((transform,i)=><image key={i} href={src} width={size} height={size} transform={transform||undefined}/>)}
  </pattern></defs><rect width="100%" height="100%" fill={`url(#${id}-surface)`}/>{stage>0&&<rect width="100%" height="100%" fill={palette.floor} opacity={wood?.24:stage===6||stage===9?.7:.25}/>}
  {stage===10&&<path d="M180 0Q290 260 180 560T220 1254" stroke="#b77b45" strokeWidth="3" fill="none" opacity=".15"/>}
  </svg><svg className="table-surface-patina" viewBox="0 0 1000 1000" preserveAspectRatio="none">
   <defs><radialGradient id={`${id}-patina`}><stop offset=".56" stopColor="#f9dfa8" stopOpacity=".025"/><stop offset=".88" stopColor="#160e08" stopOpacity=".08"/><stop offset="1" stopColor="#020711" stopOpacity=".32"/></radialGradient></defs>
   <rect width="1000" height="1000" fill={`url(#${id}-patina)`}/>
   <g fill="none" stroke={wood?'#d7b680':'#cbd4c8'} strokeWidth={wood?.6:1.1} opacity={wood?.16:.12}>
    {Array.from({length:16},(_,i)=>{const a=(i*137.5+stage*11)*Math.PI/180,x=500+Math.cos(a)*(421+i%3*12),y=500+Math.sin(a)*(421+i%3*12);return <path key={i} d={wood?`M${x} ${y}l${4+i%6} ${-1-i%3}`:`M${x} ${y}l${Math.cos(a)*-12} ${Math.sin(a)*-14}l${Math.sin(a)*7} ${Math.cos(a)*9}`}/>;})}
   </g>{wood&&<g fill="none" stroke="#211309" strokeWidth="1.2" opacity=".16"><path d="M289 55Q283 430 290 945M712 55Q704 540 711 945"/></g>}
  </svg>{withRim&&wood&&<div className="table-surface-rim"/>}<div className="table-surface-light"/><div className="table-surface-bevel"/>
 </div>;
}
