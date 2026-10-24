import type {Tile} from './game';
export type TablePlay={tiles:Tile[],who:number,id:string};
/** Taking a floor tile or passing changes the turn, never the last public play. */
export function tablePresentation(game:{trick:Tile[],lastBy:number|null,tablePlay?:TablePlay|null}){
 if(game.trick.length)return {tiles:game.trick,who:game.lastBy??game.tablePlay?.who??0,previous:false};
 return game.tablePlay?.tiles.length?{...game.tablePlay,previous:true}:null;
}
