import {useEffect,useRef,useState} from 'react';
import {STAGE_MODEL_ATLAS,STAGE_MODEL_SIZE,stageModel,paintStageModel} from '../../lib/stage-models';
import {sceneImage} from '../../lib/scene-assets';
/** A source-cell viewport preserves the drawing's proportions and never stretches or cuts the torso. */
export default function StageModel({index,facing='right'}:{index:number,facing?:'left'|'right'}){
 const [x,y,w,h]=stageModel(index).rect;
 const canvas=useRef<HTMLCanvasElement>(null),[ready,setReady]=useState(false);
 useEffect(()=>{let cancelled=false;setReady(false);void sceneImage(STAGE_MODEL_ATLAS).then(image=>{if(cancelled||!canvas.current)return;const ctx=canvas.current.getContext('2d');if(!ctx)return;paintStageModel(ctx,image,index);setReady(true);}).catch(()=>{});return()=>{cancelled=true;};},[index]);
 const transform=facing==='left'?'scaleX(-1)':undefined;
 return <div className="stage-painted-model" data-stage-model={index} data-facing={facing}><div className="stage-character-motion" style={{animationDuration:`${3.2+index%4*.3}s`,animationDelay:`${-index*.37}s`}}><div className="stage-character-art" style={{transform}}><canvas ref={canvas} className="stage-character-bitmap" aria-hidden="true" style={{display:ready?'block':'none'}}/>{!ready&&<svg viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMax meet" width="100%" height="100%" aria-hidden="true" focusable="false"><image href={STAGE_MODEL_ATLAS} width={STAGE_MODEL_SIZE.width} height={STAGE_MODEL_SIZE.height}/></svg>}</div></div></div>;
}
