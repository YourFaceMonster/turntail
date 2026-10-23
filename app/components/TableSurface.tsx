"use client";
import {useId} from 'react';
import {useStageVisual} from './StageVisuals';
import {stagePalette} from '../../lib/stage-presentation';
import {stageSetting} from '../../lib/stage-setting';
/** Native-size photographed grain is mirrored across repeat seams, never stretched from tile art. */
export default function TableSurface({withRim=false,stage:explicitStage}:{withRim?:boolean,stage?:number}){
 const contextualStage=useStageVisual(),stage=explicitStage??contextualStage??0,id=useId().replace(/:/g,''),setting=stageSetting(stage);
 const wood=setting.wood,palette=stagePalette(stage||2),size=1254,src=wood?'/turntale-walnut-051.webp':'/turntale-stone-material-055.webp';
 return <div className={`table-surface ${wood?'surface-wood':'surface-stone'} surface-region-${stage}`} data-surface-stage={stage} aria-hidden="true">
  <svg className="table-surface-material"><defs><pattern id={`${id}-surface`} patternUnits="userSpaceOnUse" width={size*2} height={size*2}>
   {['',`translate(${size*2} 0) scale(-1 1)`,`translate(0 ${size*2}) scale(1 -1)`,`translate(${size*2} ${size*2}) scale(-1 -1)`].map((transform,i)=><image key={i} href={src} width={size} height={size} transform={transform||undefined}/>)}
  </pattern></defs><rect width="100%" height="100%" fill={`url(#${id}-surface)`}/>{stage>0&&<rect width="100%" height="100%" fill={palette.floor} opacity={wood?.24:stage===6||stage===9?.7:.25}/>}
  {stage===10&&<path d="M180 0Q290 260 180 560T220 1254" stroke="#b77b45" strokeWidth="3" fill="none" opacity=".15"/>}
  </svg>{withRim&&wood&&<div className="table-surface-rim"/>}<div className="table-surface-light"/><div className="table-surface-bevel"/>
 </div>;
}
