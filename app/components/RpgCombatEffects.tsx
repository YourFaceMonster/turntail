"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import type {RpgItemEvent} from '../../lib/rpg-items.ts';
import {itemSceneTiming} from '../../lib/rpg-item-motion.ts';
export function RpgCombatEffects({game,onHit}:{game:ReturnType<typeof view>,onHit:(who:number)=>void}){
 const event=game.rpgRun?.lastItem,seen=useRef(event?.id),callback=useRef(onHit);callback.current=onHit;
 const [hit,setHit]=useState<{event:RpgItemEvent,anchor:HTMLElement}|null>(null);
 useEffect(()=>{
  if(!event||event.id===seen.current)return;seen.current=event.id;if(event.kind!=='damage')return;
  const anchor=document.querySelector<HTMLElement>(event.target===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${event.target}"] .seat-card`);if(!anchor)return;
  const timing=itemSceneTiming(event,game.me),delay=Math.max(0,event.at+timing.impact-Date.now()),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let animation:Animation|undefined;
  const impact=setTimeout(()=>{setHit({event,anchor});if(event.amount)callback.current(event.target);
   if(!reduced&&event.amount)animation=anchor.animate([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(4px)'},{transform:'translateX(-2px)'},{transform:'translateX(0)'}],{duration:320,easing:'ease-out'});
  },delay);
  const timer=setTimeout(()=>setHit(null),delay+650);return()=>{clearTimeout(impact);clearTimeout(timer);animation?.cancel();};
 },[event?.id,game.me]);
 if(!hit)return null;
 return createPortal(<span key={hit.event.id} className="rpg-hit-overlay is-damage" role="status" aria-label={`${game.players[hit.event.target].name} HP ${hit.event.amount} 피해${game.hpItemMode?' 정산 예정':''}`}><span className="rpg-hit-flash"/><b className="rpg-hit-number">−{hit.event.amount}{game.hpItemMode&&<small>정산 예정</small>}</b></span>,hit.anchor);
}
