import type {CSSProperties} from 'react';
import type {SavedTableItem} from '../../lib/saved-table';
import type {DealTarget} from '../../lib/deal-animation';
import {tileBodyDepth} from '../../lib/tile-body';
import TileFace from './TileFace';
import TileBack from './TileBack';
/** Solid two-piece fallback: the covered lower face is always blank. */
export default function EntranceSavedTile({item,target:t,baseTarget}:{item:SavedTableItem,target:DealTarget,baseTarget?:DealTarget}){
 const layer=tileBodyDepth(t.height),level=item.level||1,a=t.angle*Math.PI/180,dx=(baseTarget?.x??t.x)-t.x,dy=(baseTarget?.y??t.y)-t.y,offset={x:dx*Math.cos(a)+dy*Math.sin(a),y:-dx*Math.sin(a)+dy*Math.cos(a)};
 return <div className="entry-saved-tile" data-saved-key={item.key} data-stack-level={level} style={{left:t.x-t.width/2,top:t.y-t.height/2,width:t.width,height:t.height,transform:`rotate(${t.angle}deg)`,'--saved-depth':`${layer*level}px`,'--saved-layer':`${layer}px`} as CSSProperties}>
  {Array.from({length:level},(_,i)=>{const lower=i<level-1;return <div key={i} className={`saved-piece ${lower?'saved-covered-base':''}`} style={{transform:`translate3d(${lower&&baseTarget?offset.x:0}px,${lower&&baseTarget?offset.y:0}px,calc(${layer*i}px * var(--saved-body-factor,1)))`,'--saved-depth':`${layer}px`} as CSSProperties}>
   <i className="saved-side saved-side-bottom"/><i className="saved-side saved-side-left"/><i className="saved-side saved-side-right"/>
   <div className="saved-top">{lower?<span className="tile covered-face"/>:item.back?<TileBack flat/>:item.tile?<TileFace tile={item.tile}/>:null}</div>
  </div>;})}
 </div>;
}
