"use client";
import {monsterCharacter} from '../../lib/korean-opponents';
export default function MonsterPortrait({index}:{index:number}){
 const p=monsterCharacter(index),c=p.crop;
 return <span className="monster-portrait portrait" role="img" aria-label={`${p.name} 아바타`} style={{backgroundImage:`url('${p.src}')`,backgroundSize:`${p.width/c.size*100}% ${p.height/c.size*100}%`,backgroundPosition:`${c.x/(p.width-c.size)*100}% ${c.y/(p.height-c.size)*100}%`}}/>;
}
