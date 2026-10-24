import {STAGE_MODEL_ATLAS,STAGE_MODEL_SIZE,stageModel} from '../../lib/stage-models';
/** A source-cell viewport preserves the drawing's proportions and never stretches or cuts the torso. */
export default function StageModel({index,facing='right'}:{index:number,facing?:'left'|'right'}){
 const [x,y,w,h]=stageModel(index).rect;
 return <div className="stage-painted-model" data-stage-model={index} data-facing={facing}><svg viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMax meet" width="100%" height="100%" aria-hidden="true" focusable="false" style={{transform:facing==='left'?'scaleX(-1)':undefined}}><image href={STAGE_MODEL_ATLAS} width={STAGE_MODEL_SIZE.width} height={STAGE_MODEL_SIZE.height}/></svg></div>;
}
