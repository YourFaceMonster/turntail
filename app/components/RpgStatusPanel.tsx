"use client";
import {hpLimit} from '../../lib/hp-limit';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {RpgProfessionStatus} from './RpgProfessions';

type View=ReturnType<typeof view>;

export function RpgStatusPanel({game,seat,close}:{game:View,seat:number,close:()=>void}){
 const run=game.rpgRun;
 const panelRef=useRef<HTMLElement>(null);
 const [position,setPosition]=useState<CSSProperties>();
 useLayoutEffect(()=>{
  const mine=seat===game.me;
  const anchor=document.querySelector<HTMLElement>(mine?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${seat}"] .seat-card`);
  if(!anchor)return;
  const fallback=mine?document.querySelector<HTMLElement>('.rpg-mode .own-avatar'):null;
  const place=()=>{const original=anchor.getBoundingClientRect(),useFallback=mine&&(original.bottom<0||original.top>innerHeight),bounds=useFallback&&fallback?fallback.getBoundingClientRect():original,width=Math.min(mine?280:300,innerWidth-16),height=panelRef.current?.offsetHeight||120,rightSide=!mine&&bounds.left+bounds.width/2>=innerWidth/2,left=Math.max(8,Math.min(innerWidth-width-8,rightSide?bounds.right-width:bounds.left)),preferred=mine&&!useFallback?bounds.top-height-6:bounds.bottom+4;setPosition({left,top:Math.max(8,Math.min(innerHeight-height-8,preferred)),right:'auto',width,visibility:bounds.bottom<0||bounds.top>innerHeight?'hidden':'visible'});};
  place();const observer=new ResizeObserver(place);observer.observe(anchor);if(fallback)observer.observe(fallback);if(panelRef.current)observer.observe(panelRef.current);window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
  return()=>{observer.disconnect();window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);};
 },[seat,game.me]);
 useEffect(()=>{const outside=(event:PointerEvent)=>{if(!panelRef.current?.contains(event.target as Node))close();};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[close]);
 if(!run||typeof document==='undefined')return null;
 const mine=seat===game.me,player=game.players[seat];
 return createPortal(<div className="rpg-status-popover-layer"><section ref={panelRef} className={`modal rpg-status-panel ${mine?'is-own':'is-opponent'}`} style={position||{visibility:'hidden'}} role="dialog" aria-label={`${player.name} ${game.hpItemMode?"아이템전":"RPG"} 상태`}>
  <header className="rpg-status-heading"><h2>{player.name}</h2><span className="rpg-status-hp">HP <b>{run.hp[seat]}</b><small>/{hpLimit(run)}</small></span><button className="close" aria-label="상태창 닫기" onClick={close}>×</button></header>
  <RpgProfessionStatus game={game} seat={seat} detail/>
 </section></div>,document.body);
}
