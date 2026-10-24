import type {CSSProperties} from 'react';
import type {DealItem,DealTarget} from '../../lib/deal-animation';
import TileFace from './TileFace';
import TileBack from './TileBack';
/** The overhead camera has stopped: render the final screen-size SVG faces directly.
 * Covered tiles and other hands never enter this presentation layer. */
export default function EntranceSharpTiles({rows}:{rows:{item:DealItem,target:DealTarget}[]}){
 return <div className="entry-sharp-tiles" aria-hidden="true">{rows.filter(({item})=>item.kind==='own'||item.kind==='upper').map(({item,target:t})=><div className={`entry-sharp-tile sharp-${item.kind}`} data-sharp-tile={item.key} key={item.key} style={{left:t.x-t.width/2,top:t.y-t.height/2,width:t.width,height:t.height,transform:`rotate(${t.angle}deg)`} as CSSProperties}>{item.kind==='own'&&item.tile?<TileFace tile={item.tile}/>:<TileBack/>}</div>)}</div>;
}
