"use client";
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import type {Tile} from '../../lib/game.ts';
import TileFace from './TileFace';
import TileBack from './TileBack';

function ScoutProjection({tile}:{tile:Tile}){
 return <span className="scout-projection"><TileBack/><span className="scout-projected-face"><TileFace tile={tile} small/></span><small className="scout-projection-badge">투시</small></span>;
}

export default function RpgScoutReveal({tile,revealKey}:{tile:Tile,revealKey:string}){
 const [enlarged,setEnlarged]=useState(true);
 useEffect(()=>{setEnlarged(true);const timer=setTimeout(()=>setEnlarged(false),1450);return()=>clearTimeout(timer);},[revealKey]);
 return <><span className="scout-revealed"><ScoutProjection tile={tile}/></span>{enlarged&&typeof document!=='undefined'&&createPortal(<div className="scout-lens-preview" role="status" aria-label={`정찰 렌즈 · 2층 패 ${tile.n} 확인`}><ScoutProjection tile={tile}/><span className="scout-lens-preview-caption">정찰 렌즈 · 2층 투시</span></div>,document.body)}</>;
}
