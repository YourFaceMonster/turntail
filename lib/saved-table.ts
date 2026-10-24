import {dealTarget,type DealTarget} from './deal-animation.ts';
import type {Tile} from './game';
export type SavedTableView={me:number,players:{hand?:Tile[]}[],stacks:{upper:boolean,lowerPresent:boolean,lower?:Tile|null}[],trick?:Tile[],tablePlay?:{tiles:Tile[]}|null};
export type SavedTableItem={key:string,selector:string,tile?:Tile,back:boolean,level?:number};
/** Copy public visible surfaces only: covered lower tiles and AI hands never enter. */
export function savedTablePlan(game:SavedTableView):SavedTableItem[]{
 const rows:SavedTableItem[]=[];
 game.stacks.forEach((s,i)=>{
  if(s.upper)rows.push({key:`upper-${i}`,selector:`[data-stack="${i}"] .upper-tile .tile`,back:true,level:s.lowerPresent?2:1});
  else if(s.lowerPresent&&s.lower)rows.push({key:`lower-${i}`,selector:`[data-stack="${i}"] .lower-tile .tile`,tile:s.lower,back:false,level:1});
 });
 for(const tile of game.players[game.me]?.hand||[])rows.push({key:`own-${tile.id}`,selector:`[data-hand="${tile.id}"] .tile.face`,tile,back:false});
 for(const tile of game.trick?.length?game.trick:game.tablePlay?.tiles||[])rows.push({key:`trick-${tile.id}`,selector:`[data-arrival="${tile.id}"] .tile.face`,tile,back:false});
 return rows;
}
export function measureSavedTable(game:SavedTableView,rotation:number,read:(selector:string)=>{left:number,top:number,width:number,height:number}|null):{item:SavedTableItem,target:DealTarget,baseTarget?:DealTarget}[]{
 return savedTablePlan(game).map(item=>{const rect=read(item.selector);if(!rect||rect.width<=0||rect.height<=0)throw Error('Saved table layout pending');const base=item.back&&item.level===2?read(item.selector.replace('.upper-tile','.lower-tile')):null;return {item,target:dealTarget(rect,rotation),...(base&&base.width>0?{baseTarget:dealTarget(base,rotation)}:{})};});
}
