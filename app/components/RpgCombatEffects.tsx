"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {itemImage,type RpgItemEvent} from '../../lib/rpg-items.ts';
import {RPG_ITEM_IMPACT_MS} from '../../lib/rpg-item-motion.ts';
export function RpgCombatEffects({game,onHit}:{game:ReturnType<typeof view>,onHit:(who:number)=>void}){
 const event=game.rpgRun?.lastItem,seen=useRef(event?.id),callback=useRef(onHit);callback.current=onHit;
 const [hit,setHit]=useState<{event:RpgItemEvent,anchor:HTMLElement}|null>(null);
 useEffect(()=>{
  if(!event||event.id===seen.current)return;seen.current=event.id;if(event.kind!=='damage'&&event.kind!=='blocked')return;
  const anchor=document.querySelector<HTMLElement>(event.target===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${event.target}"] .seat-card`);if(!anchor)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animation:Animation|null=null;
  const impact=setTimeout(()=>{setHit({event,anchor});if(event.amount)callback.current(event.target);
   if(!reduced&&typeof anchor.animate==='function')animation=anchor.animate([{transform:'translate(0,0)'},{transform:'translate(-8px,2px)'},{transform:'translate(7px,-2px)'},{transform:'translate(-6px,1px)'},{transform:'translate(5px,-1px)'},{transform:'translate(-3px,0)'},{transform:'translate(0,0)'}],{duration:520,easing:'ease-out'});
  },reduced?0:RPG_ITEM_IMPACT_MS);
  const timer=setTimeout(()=>setHit(null),(reduced?0:RPG_ITEM_IMPACT_MS)+1100);return()=>{clearTimeout(impact);clearTimeout(timer);animation?.cancel();};
 },[event?.id,game.me]);
 if(!hit)return null;
 const guarded=hit.event.kind==='blocked',damaged=!!hit.event.amount,line=['으윽!','아윽!','윽!'][hit.event.target%3];
 return createPortal(<span key={hit.event.id} className={`rpg-hit-overlay ${guarded?'is-guard-block':damaged?'is-damage':'is-blocked'}`} role="status" aria-live="polite" aria-label={`${game.players[hit.event.target].name} ${damaged?`HP ${hit.event.amount} 피해`:'피해 방어'}`}><span className="rpg-hit-flash" aria-hidden="true"/>{guarded&&<img className="rpg-guard-impact" src={itemImage('ward-seal')} alt=""/>}<b className="rpg-hit-number">{damaged?`−${hit.event.amount}`:'방어'}</b>{damaged&&<small className="rpg-hurt-line">{line}</small>}</span>,hit.anchor);
}
