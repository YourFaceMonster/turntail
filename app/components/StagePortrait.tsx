import type {CSSProperties} from 'react';
import {stageModel} from '../../lib/stage-models';
import {STAGE_THEMES} from '../../lib/stage-theme';
/** Portraits are face crops of the exact figures seated in the opening. */
export function StagePortrait({index}:{index:number}){
 const model=stageModel(index),[x,y,size]=model.face,{width,height}=model.size,name=STAGE_THEMES.flatMap(stage=>stage.opponents).find(person=>person.portrait===index)?.name||'상대';
 return <span className="stage-portrait portrait" data-stage-portrait={index} role="img" aria-label={`${name} 아바타`} style={{backgroundImage:`url('${model.src}')`,backgroundSize:`${width/size*100}% ${height/size*100}%`,backgroundPosition:`${x/(width-size)*100}% ${y/(height-size)*100}%` } as CSSProperties}/>;
}
