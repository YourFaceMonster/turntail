import type {LegalOption} from './game.ts';
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
