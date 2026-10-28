import type {Tile} from './game';
import type {HpBattleEvent} from './hp-item-battle';
import {HP_BATTLE_REVIEW_MS} from './hp-item-battle';
export type TablePlay={tiles:Tile[],who:number,id:string};
/** Draws retain the active combination; confirmation of a new lead clears it. */
export function tablePresentation(game:{trick:Tile[],lastBy:number|null,tablePlay?:TablePlay|null}){
 if(game.trick.length)return {tiles:game.trick,who:game.lastBy??game.tablePlay?.who??0,previous:false};
 return null;
}
/** A resolved combination stays visible through its victory glow and review. */
export function battleTablePresentation(game:{trick:Tile[],lastBy:number|null,tablePlay?:TablePlay|null,round:number},event:HpBattleEvent|undefined,now:number,pending=false){
 const active=tablePresentation(game);if(active)return active;
 return event?.round===game.round&&event.winningTiles?.length&&(pending||now<event.at+HP_BATTLE_REVIEW_MS)?{tiles:event.winningTiles,who:event.actor,previous:false}:null;
}
