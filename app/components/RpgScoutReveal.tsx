"use client";
import type {Tile} from '../../lib/game.ts';
import TileFace from './TileFace';
import TileBack from './TileBack';

function ScoutProjection({tile}:{tile:Tile}){
 return <span className="scout-projection"><TileBack/><span className="scout-projected-face"><TileFace tile={tile} small/></span><small className="scout-projection-badge">투시</small></span>;
}

export default function RpgScoutReveal({tile}:{tile:Tile,revealKey:string}){
 return <span className="scout-revealed" role="img" aria-label={`2층 투시 · ${tile.n}`}><ScoutProjection tile={tile}/></span>;
}
