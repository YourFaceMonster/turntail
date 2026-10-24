import {combo,type Tile} from './game';
export type ImpactTier='single'|'combo'|'power'|'finish';
/** Feedback follows the visible combination, never a concealed tile. */
export function playImpact(tiles:readonly Tile[],phase:string):ImpactTier{
 if(phase==='ended')return 'finish';
 if(tiles.length===5)return (combo([...tiles])?.key[0]||0)>=4?'finish':'power';
 if(tiles.some(t=>t.n===2))return 'power';
 return tiles.length>1?'combo':'single';
}
export function impactVibration(tier:ImpactTier):number|number[]{
 return tier==='finish'?[38,28,68,32,90]:tier==='power'?[24,22,40]:tier==='combo'?[12,18,18]:6;
}
