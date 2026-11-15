import {animalFace} from '../../lib/animal-faces';

/** Default seat face: the hand-drawn animal for an emoji persona (fills its round frame like a photo). */
export default function AnimalFace({emoji,label}:{emoji:string,label?:string}){
 const face=animalFace(emoji);
 return <img className="animal-face" src={face.src} alt={label??`${face.name} 아바타`} draggable={false}/>;
}
