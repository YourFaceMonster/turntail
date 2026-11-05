/** Break at authored lines and sentence boundaries, never in the middle of a Korean word. */
import {Fragment} from 'react';
import {RPG_CONSUMABLES,RPG_RELICS} from '../../lib/rpg.ts';
import {itemImage} from '../../lib/rpg-items.ts';
import {relicImage} from '../../lib/item-battle-relics.ts';
const items=[...RPG_CONSUMABLES.map(item=>({...item,relic:false})),...RPG_RELICS.map(item=>({...item,relic:true}))];
const itemPattern=new RegExp(`(${[...new Set(items.map(item=>item.name))].sort((a,b)=>b.length-a.length).map(name=>name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s*')).join('|')})`,'g');
export function QuestItemText({text}:{text:string}){
 return <>{text.split(itemPattern).map((part,index)=>{const item=items.find(item=>item.name.replace(/\s/g,'')===part.replace(/\s/g,''));return item?<strong key={index} className="quest-item-mention">{part}<img src={item.relic?relicImage(item.id):itemImage(item.id)} alt=""/></strong>:part;})}</>;
}
export default function DialogueText({text,questItems=false}:{text:string,questItems?:boolean}){
 return <>{text.split('\n').map((sentence,index)=><Fragment key={index}>{index>0&&<br/>}<span className="dialogue-sentence">{questItems?<QuestItemText text={sentence}/>:sentence}</span></Fragment>)}</>;
}

/** Account for inline quest-item icons when fitting a page to its actual text column. */
export function measureDialogueText(text:string,measure:(text:string)=>number,iconWidth:number){
 return text.split(itemPattern).reduce((width,part)=>width+measure(part)+(items.some(item=>item.name.replace(/\s/g,'')===part.replace(/\s/g,''))?iconWidth:0),0);
}
