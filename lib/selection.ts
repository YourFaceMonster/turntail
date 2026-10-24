import type {LegalOption} from './game.ts';
/** A chosen recommendation constrains both tap eligibility and auto-selection. */
export function patternOptions(options:LegalOption[],label:string|null){return label?options.filter(o=>o.label===label):options;}
export function nextRecommendation(options:LegalOption[],selectionKey:string){const at=options.findIndex(o=>o.id===selectionKey);return options.length?options[(at+1)%options.length]:undefined;}
export function recommendationNumbers(options:LegalOption[]){
 const groups=new Map<number,LegalOption[]>();
 for(const o of options){const n=o.tiles[0].n,group=groups.get(n);if(group)group.push(o);else groups.set(n,[o]);}
 return [...groups.entries()];
}
/** Restrict taps to a subset of an actual legal move. Singles replace the prior tile. */
export function toggleTileSelection(selected:number[],id:number,options:LegalOption[],wanted:number):number[]{
 if(selected.includes(id))return selected.filter(x=>x!==id);
 const next=wanted===1?[id]:[...selected,id];
 if(wanted&&next.length>wanted)return selected;
 return options.some(o=>next.every(x=>o.tiles.some(t=>t.id===x)))?next:selected;
}
export function selectableTileIds(selected:number[],options:LegalOption[],wanted:number){
 const candidates=wanted===1?options:options.filter(o=>o.tiles.length>selected.length&&selected.every(id=>o.tiles.some(t=>t.id===id)));
 return new Set([...selected,...candidates.flatMap(o=>o.tiles.map(t=>t.id))]);
}

/** One tap selects a whole pair/triple; five-tile patterns retain manual control. */
export function tapTileSelection(selected:number[],id:number,options:LegalOption[],wanted:number,mode=0):number[]{
 const count=wanted||mode;
 if(count===5){
  const old=options.find(o=>o.id===[...selected].sort((a,b)=>a-b).join(','));
  if(old?.label==='포카드'&&!selected.includes(id)){
   const numbers=new Map<number,number>();for(const t of old.tiles)numbers.set(t.n,(numbers.get(t.n)||0)+1);
   const four=old.tiles.filter(t=>numbers.get(t.n)===4).map(t=>t.id),replacement=[...four,id];
   if(options.some(o=>o.tiles.length===5&&replacement.every(x=>o.tiles.some(t=>t.id===x))))return replacement;
  }
  return toggleTileSelection(selected,id,options,5);
 }
 if(count===1)return toggleTileSelection(selected,id,options,1);
 if(selected.includes(id))return selected.filter(x=>x!==id);
 if(!count){
  const next=[...selected,id];
  if(options.some(o=>next.every(x=>o.tiles.some(t=>t.id===x))))return next;
  return options.some(o=>o.tiles.length===1&&o.tiles[0].id===id)?[id]:selected;
 }
 const choices=options.filter(o=>o.tiles.length===count&&o.tiles.some(t=>t.id===id));
 if(!selected.length){const number=choices[0]?.tiles.find(t=>t.id===id)?.n;return (options.find(o=>o.tiles.length===count&&o.tiles.every(t=>t.n===number))||choices[0])?.tiles.map(t=>t.id)||selected;}
 const keep=selected.length>=count?selected.slice(1):selected;
 const preferred=choices.find(o=>keep.every(x=>o.tiles.some(t=>t.id===x)));
 return (preferred||choices[0])?.tiles.map(t=>t.id)||selected;
}

export function tapSelectableTileIds(selected:number[],options:LegalOption[],wanted:number,mode=0){
 const count=wanted||mode;
 if(count===5){const old=options.find(o=>o.id===[...selected].sort((a,b)=>a-b).join(','));
  if(old?.label==='포카드'){const numbers=new Map<number,number>();for(const t of old.tiles)numbers.set(t.n,(numbers.get(t.n)||0)+1);const four=old.tiles.filter(t=>numbers.get(t.n)===4).map(t=>t.id);return new Set(options.filter(o=>four.every(id=>o.tiles.some(t=>t.id===id))).flatMap(o=>o.tiles.map(t=>t.id)));}
  return selectableTileIds(selected,options,5);
 }
 return new Set(options.filter(o=>count?o.tiles.length===count:true).flatMap(o=>o.tiles.map(t=>t.id)));
}
