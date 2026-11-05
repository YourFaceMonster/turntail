/** Break at authored lines and sentence boundaries, never in the middle of a Korean word. */
import {RPG_CONSUMABLES,RPG_RELICS} from '../../lib/rpg.ts';
import {itemImage} from '../../lib/rpg-items.ts';
import {relicImage} from '../../lib/item-battle-relics.ts';
const items=[...RPG_CONSUMABLES.map(item=>({...item,relic:false})),...RPG_RELICS.map(item=>({...item,relic:true}))];
const itemPattern=new RegExp(`(${[...new Set(items.map(item=>item.name))].sort((a,b)=>b.length-a.length).map(name=>name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s*')).join('|')})`,'g');
export function QuestItemText({text}:{text:string}){
 return <>{text.split(itemPattern).map((part,index)=>{const item=items.find(item=>item.name.replace(/\s/g,'')===part.replace(/\s/g,''));return item?<strong key={index} className="quest-item-mention">{part}<img src={item.relic?relicImage(item.id):itemImage(item.id)} alt=""/></strong>:part;})}</>;
}
export default function DialogueText({text,questItems=false}:{text:string,questItems?:boolean}){
 return <>{text.split(/\n|(?<=[.!?])\s+/u).filter(Boolean).map((sentence,index)=><span className="dialogue-sentence" key={index}>{questItems?<QuestItemText text={sentence}/>:sentence}</span>)}</>;
}
