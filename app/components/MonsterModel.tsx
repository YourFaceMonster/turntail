import {monsterCharacter} from '../../lib/korean-opponents';
/** A separate full-body cutout can extend a portrait without changing its face crop. */
export default function MonsterModel({index}:{index:number}){
 const p=monsterCharacter(index);
 return <div className="monster-model" data-monster={p.portrait}><img src={'modelSrc' in p?p.modelSrc:p.src} alt={p.name} draggable={false}/></div>;
}
