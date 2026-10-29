import TileFace from './TileFace';
import TileBack from './TileBack';

/** Reuse the game's bevelled tile artwork on menu plaques and saved tables. */
export default function MenuTableArt({kind='single'}:{kind?:'single'|'resume'|'multi'}){
 return <span className={`menu-table-art is-${kind}`} aria-hidden="true"><span>{kind==='resume'?<TileBack/>:<TileFace tile={{id:27,n:7,s:3}}/>}</span><span>{kind==='resume'?<TileBack/>:<TileFace tile={{id:kind==='multi'?25:26,n:7,s:kind==='multi'?1:2}}/>}</span></span>;
}
