import {animalFace} from '../../lib/animal-faces';
import {tr} from '../../lib/i18n/index.ts';

/** Default seat face: the hand-drawn animal for an emoji persona (fills its round frame like a photo). */
export default function AnimalFace({emoji,label}:{emoji:string,label?:string}){
 const face=animalFace(emoji);
 return <img className="animal-face" src={face.src} alt={label??tr('{0} 아바타',{0:face.name})} draggable={false}/>;
}
