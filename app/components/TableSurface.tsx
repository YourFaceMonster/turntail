"use client";
import {useId} from 'react';
import StageTableMaterial from './StageTableMaterial';
import TableMaterialGrain from './TableMaterialGrain';
import {useStageVisual} from './StageVisuals';
import {stageSetting} from '../../lib/stage-setting';
/** Native-size photographed grain is mirrored across repeat seams, never stretched from tile art. */
export default function TableSurface({withRim=false,stage:explicitStage}:{withRim?:boolean,stage?:number}){
 const contextualStage=useStageVisual(),stage=explicitStage??contextualStage??0,id=useId().replace(/:/g,''),setting=stageSetting(stage);
 if(stage>0)return <StageTableMaterial stage={stage}/>;
 const wood=setting.wood;
 return <div className={`table-surface ${wood?'surface-wood':'surface-stone'} surface-region-${stage}`} data-surface-stage={stage} aria-hidden="true">
  <TableMaterialGrain stage={0}/><svg className="table-surface-patina" viewBox="0 0 1000 1000" preserveAspectRatio="none">
   <defs><radialGradient id={`${id}-patina`}><stop offset=".56" stopColor="#f9dfa8" stopOpacity=".025"/><stop offset=".88" stopColor="#160e08" stopOpacity=".08"/><stop offset="1" stopColor="#020711" stopOpacity=".32"/></radialGradient></defs>
   <rect width="1000" height="1000" fill={`url(#${id}-patina)`}/>
   <g fill="none" stroke={wood?'#d7b680':'#cbd4c8'} strokeWidth={wood?.6:1.1} opacity={wood?.16:.12}>
    {Array.from({length:16},(_,i)=>{const a=(i*137.5+stage*11)*Math.PI/180,x=500+Math.cos(a)*(421+i%3*12),y=500+Math.sin(a)*(421+i%3*12);return <path key={i} d={wood?`M${x} ${y}l${4+i%6} ${-1-i%3}`:`M${x} ${y}l${Math.cos(a)*-12} ${Math.sin(a)*-14}l${Math.sin(a)*7} ${Math.cos(a)*9}`}/>;})}
   </g>{wood&&<g fill="none" stroke="#211309" strokeWidth="1.2" opacity=".16"><path d="M289 55Q283 430 290 945M712 55Q704 540 711 945"/></g>}
  </svg>{withRim&&wood&&<div className="table-surface-rim"/>}<div className="table-surface-light"/><div className="table-surface-bevel"/>
 </div>;
}
