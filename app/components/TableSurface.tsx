"use client";
import {useId} from 'react';
import {useStageVisual} from './StageVisuals';
import {stagePalette} from '../../lib/stage-presentation';
/** Native-size material repeats avoid magnifying one small texture over the camera. */
export default function TableSurface({withRim=false,stage:explicitStage}:{withRim?:boolean,stage?:number}){
 const contextualStage=useStageVisual(),stage=explicitStage||contextualStage,id=useId().replace(/:/g,'');
 return <div className="table-surface" data-surface-stage={stage} aria-hidden="true">{stage&&<svg className="table-surface-material"><defs><pattern id={`${id}-surface`} patternUnits="userSpaceOnUse" width="384" height="384"><svg width="384" height="384" viewBox="0 0 100 132" preserveAspectRatio="none"><image href="/turntale-stage-materials-v2.webp" x={-((stage-1)%5)*100} y={-Math.floor((stage-1)/5)*132} width="500" height="264" preserveAspectRatio="none"/></svg></pattern></defs><rect width="100%" height="100%" fill={`url(#${id}-surface)`}/><rect width="100%" height="100%" fill={stagePalette(stage).floor} opacity=".55"/></svg>}{withRim&&<div className="table-surface-rim"/>}<div className="table-surface-light"/></div>;
}
