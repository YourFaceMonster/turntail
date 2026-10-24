import {monsterCharacter} from '../../lib/korean-opponents';
/** Full-body rendered model and avatar share this exact asset. */
export default function MonsterModel({index}:{index:number}){
 const p=monsterCharacter(index);
 return <div className="monster-model" data-monster={p.portrait}><img src={p.src} alt={p.name} draggable={false}/></div>;
}
