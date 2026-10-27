"use client";
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {itemSceneTiming} from '../../lib/rpg-item-motion.ts';
import TileFace from './TileFace';
export default function RpgHandIntel({game}:{game:ReturnType<typeof view>}){
 const event=game.rpgRun?.lastItem,peek=game.rpgRun?.tactics?.[game.me]?.handPeek,seen=useRef(event?.id),button=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null);
 const [open,setOpen]=useState(false),[position,setPosition]=useState({left:0,top:0});
 useEffect(()=>{if(!event||seen.current===event.id)return;seen.current=event.id;if(event.kind!=='reveal'||event.actor!==game.me)return;const timer=setTimeout(()=>setOpen(true),Math.max(0,event.at+itemSceneTiming(event,game.me).duration-Date.now()));return()=>clearTimeout(timer);},[event?.id]);
 useEffect(()=>{setOpen(false);},[peek?.tile.id,peek?.target]);
 useEffect(()=>{
  if(!open)return;
  const timer=setTimeout(()=>setOpen(false),3200);
  const dismiss=(event:PointerEvent)=>{if(!panel.current?.contains(event.target as Node)&&!button.current?.contains(event.target as Node))setOpen(false);};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};
  document.addEventListener('pointerdown',dismiss);document.addEventListener('keydown',escape);
  return()=>{clearTimeout(timer);document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape);};
 },[open]);
 useLayoutEffect(()=>{
  if(!open||!peek)return;
  const measure=()=>{const rect=button.current?.getBoundingClientRect();if(rect)setPosition({left:Math.max(8,Math.min(innerWidth-184,rect.left+rect.width/2-88)),top:Math.max(8,Math.min(innerHeight-96,rect.top-102))});};
  measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);
 },[open,peek?.tile.id]);
 return <>{peek&&<button ref={button} className="private-intel-button" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>엿본 패</button>}{open&&peek&&createPortal(<section ref={panel} className="hand-intel-glimpse" style={position} aria-label="나만 아는 상대 손패" role="status"><TileFace tile={peek.tile} small/><span><strong>{game.players[peek.target].name}</strong><small>나만 확인한 패</small></span><button onClick={()=>setOpen(false)} aria-label="엿본 패 닫기">×</button></section>,document.body)}</>;
}
