import {STAGE_MODEL_ATLAS,STAGE_MODEL_SIZE,stageModel} from '../../lib/stage-models';
/** The tabletop occludes the lower half of a whole illustrated figure. */
export default function StageModel({index}:{index:number}){
 const [x,y,w,h]=stageModel(index).rect;
 return <div className="stage-painted-model" data-stage-model={index} style={{aspectRatio:`${w}/${h}`}}><img src={STAGE_MODEL_ATLAS} alt="" draggable={false} decoding="async" style={{width:`${STAGE_MODEL_SIZE.width/w*100}%`,height:`${STAGE_MODEL_SIZE.height/h*100}%`,left:`${-x/w*100}%`,top:`${-y/h*100}%`}}/></div>;
}
