import type {CSSProperties} from 'react';
import {STAGE_MODEL_ATLAS,STAGE_MODEL_SIZE,stageModel} from '../../lib/stage-models';
/** Portraits are face crops of the exact figures seated in the opening. */
export function StagePortrait({index}:{index:number}){
 const [x,y,size]=stageModel(index).face,{width,height}=STAGE_MODEL_SIZE;
 return <span className="stage-portrait portrait" role="img" aria-label="도전 상대 아바타" style={{backgroundImage:`url('${STAGE_MODEL_ATLAS}')`,backgroundSize:`${width/size*100}% ${height/size*100}%`,backgroundPosition:`${x/(width-size)*100}% ${y/(height-size)*100}%` } as CSSProperties}/>;
}
