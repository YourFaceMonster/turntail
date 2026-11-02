import type {CSSProperties} from 'react';
import {RPG_CAST_ART} from '../../lib/rpg-cast-art';
import {STAGE_THEMES} from '../../lib/stage-theme';
import {StagePortrait} from './StagePortrait';
export default function RpgCastPortrait({index}:{index:number}){
 const art=RPG_CAST_ART[index];if(!art)return <StagePortrait index={index}/>;
 const [x,y,size]=art.face,name=STAGE_THEMES.flatMap(stage=>stage.opponents).find(person=>person.portrait===index)?.name||'상대';
 return <span className="stage-portrait portrait rpg-cast-portrait" data-rpg-cast={index} role="img" aria-label={`${name} 아바타`} style={{backgroundImage:`url('${art.src}')`,backgroundSize:`${art.width/size*100}% ${art.height/size*100}%`,backgroundPosition:`${x/(art.width-size)*100}% ${y/(art.height-size)*100}%`} as CSSProperties}/>;
}
