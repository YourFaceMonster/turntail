import type {CSSProperties} from 'react';
import type {SavedTableItem} from '../../lib/saved-table';
import type {DealTarget} from '../../lib/deal-animation';
import TileFace from './TileFace';
import TileBack from './TileBack';
/** Covered stacks expose only an unmarked side wall, never the hidden face. */
export default function EntranceSavedTile({item,target:t}:{item:SavedTableItem,target:DealTarget}){
 const layer=Math.max(3.5,Math.min(8,t.height*.105)),depth=layer*(item.level||1);
 return <div className="entry-saved-tile" data-saved-key={item.key} data-stack-level={item.level||1} style={{left:t.x-t.width/2,top:t.y-t.height/2,width:t.width,height:t.height,transform:`rotate(${t.angle}deg)`,'--saved-depth':`${depth}px`,'--saved-layer':`${layer}px`} as CSSProperties}>
  <i className="saved-side saved-side-bottom"/><i className="saved-side saved-side-left"/><i className="saved-side saved-side-right"/>
  <div className="saved-top">{item.back?<TileBack flat/>:item.tile?<TileFace tile={item.tile}/>:null}</div>
 </div>;
}
