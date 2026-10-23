import type {Tile} from './game';
export type ImpactTier='single'|'power'|'finish';
/** Final play wins precedence over a two or combination. Counts never depend on suit. */
export function playImpact(tiles:readonly Tile[],phase:string):ImpactTier{
 return phase==='ended'?'finish':tiles.length>1||tiles.some(t=>t.n===2)?'power':'single';
}
export function impactVibration(tier:ImpactTier):number|number[]{
 return tier==='finish'?[45,35,80,45,120]:tier==='power'?[20,24,32]:6;
}
