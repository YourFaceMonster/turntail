import TileFace,{SuitEmblem} from './TileFace';
import TileBack from './TileBack';

function SmoothMenuFace({s}:{s:number}){return <span className={`menu-smooth-face menu-smooth-suit-${s}`}><SuitEmblem s={s}/><b>7</b></span>;}

/** Smooth decorative preview faces; saved-table illustrations retain their tile backs. */
export default function MenuTableArt({kind='single'}:{kind?:'single'|'resume'|'multi'}){
 return <span className={`menu-table-art is-${kind}`} aria-hidden="true"><span>{kind==='resume'?<TileBack/>:kind==='single'?<SmoothMenuFace s={3}/>:<TileFace tile={{id:27,n:7,s:3}}/>}</span><span>{kind==='resume'?<TileBack/>:kind==='single'?<SmoothMenuFace s={2}/>:<TileFace tile={{id:25,n:7,s:1}}/>}</span></span>;
}
