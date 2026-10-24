import type {Tile} from './game';
export type TablePlay={tiles:Tile[],who:number,id:string};
/** Draws retain the active combination; confirmation of a new lead clears it. */
export function tablePresentation(game:{trick:Tile[],lastBy:number|null,tablePlay?:TablePlay|null}){
 if(game.trick.length)return {tiles:game.trick,who:game.lastBy??game.tablePlay?.who??0,previous:false};
 return null;
}
