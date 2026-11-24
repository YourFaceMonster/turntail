"use client";
import {monsterCharacter} from '../../lib/korean-opponents';
import {tr} from '../../lib/i18n/index.ts';
export default function MonsterPortrait({index}:{index:number}){
 const p=monsterCharacter(index),c=p.crop;
 return <span className="monster-portrait portrait" role="img" aria-label={tr('{0} 아바타',{0:p.name})} style={{backgroundImage:`url('${p.src}')`,backgroundSize:`${p.width/c.size*100}% ${p.height/c.size*100}%`,backgroundPosition:`${c.x/(p.width-c.size)*100}% ${c.y/(p.height-c.size)*100}%`}}/>;
}
