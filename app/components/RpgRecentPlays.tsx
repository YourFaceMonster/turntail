'use client';
import type {CSSProperties} from 'react';
import {suits,type Tile} from '../../lib/game';
import type {TablePlay} from '../../lib/table-play';
import {TILE_INKS} from '../../lib/tile-palette';
import {seatAccent} from '../../lib/seat-presentation';

/** RPG portrait: this round's last plays (passes excluded), newest first. Empty slots keep the floor grid still. */
export default function RpgRecentPlays({plays,names,rows,limit=3}:{plays:TablePlay[],names:string[],rows:number,limit?:number}){
 const recent=plays.slice(-limit).reverse();
 return <aside className="rpg-recent-plays" aria-label="최근 낸 패" style={{'--recent-rows':rows} as CSSProperties}>
  <small className="rpg-recent-title">최근</small>
  <ol>{Array.from({length:limit},(_,i)=>{const play=recent[i];
   if(!play)return <li key={`empty-${i}`} className="rpg-recent-empty" aria-hidden="true"/>;
   const name=names[play.who]||'';
   return <li key={play.id} className={i===0?'rpg-recent-latest':'rpg-recent-older'} data-age={i} style={{'--seat-ink':seatAccent(play.who)} as CSSProperties} aria-label={`${i===0?'가장 최근 ':''}${name} ${play.tiles.map(tileLabel).join(' ')}`}>
    <b className="rpg-recent-name"><i aria-hidden="true">{i===0?'●':'○'}</i>{name}</b>
    <span className="rpg-recent-tiles">{play.tiles.map(t=><span key={t.id} className="rpg-recent-tile" data-suit={t.s} style={{color:TILE_INKS[t.s]}}>{t.n}</span>)}</span>
   </li>;})}</ol>
 </aside>;
}
function tileLabel(t:Tile){return `${suits[t.s]??''} ${t.n}`;}
