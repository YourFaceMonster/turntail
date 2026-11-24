"use client";
import type {Tile} from '../../lib/game.ts';
import TileFace from './TileFace';
import {tr} from '../../lib/i18n/index.ts';

function ScoutProjection({tile}:{tile:Tile}){
 return <span className="scout-clear-face"><TileFace tile={tile} small/><small className="scout-projection-badge">{tr('투시')}</small></span>;
}

export default function RpgScoutReveal({tile}:{tile:Tile,revealKey:string}){
 return <span className="scout-revealed" role="img" aria-label={tr('2층 투시 · {0}',{0:tile.n})}><ScoutProjection tile={tile}/></span>;
}
