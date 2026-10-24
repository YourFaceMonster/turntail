import type {Tile} from '../../lib/game';
/** Stage buttons state only the pattern and its number; cycling stays available. */
export default function LegalOptionContents({label,tiles,title,stage,index,total}:{label:string,tiles:Tile[],title:string,stage:boolean,index:number,total:number}){
 return <><b>{label}{!stage&&<em>{tiles.length}장</em>}</b><span>{tiles.length<5?tiles[0].n:title}</span>{stage?(total>1&&<small aria-hidden="true">↻</small>):<small>{index>=0?`${index+1}/`:''}{total} {total>1?'↻':''}</small>}</>;
}
