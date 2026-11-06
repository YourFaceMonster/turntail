"use client";
import {hasRoundCombat} from '../../lib/profession-round-rules';
import {useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import type {RpgItemEvent} from '../../lib/rpg-items.ts';
import {isBattleItemMode} from '../../lib/hp-item-battle.ts';
import {itemSceneTiming} from '../../lib/rpg-item-motion.ts';
export type ItemHpPresentation={id:string,target:number,before:number};
export function RpgCombatEffects({game,onHit,onGuard,onAttack,onHpPresentation}:{game:ReturnType<typeof view>,onHit:(who:number,itemId:string)=>void,onGuard?:(itemId:string)=>void,onAttack?:(id:string)=>void,onHpPresentation?:(held:ItemHpPresentation|null)=>void}){
 const event=game.rpgRun?.lastItem,seen=useRef(event?.id),callback=useRef({onHit,onGuard,onAttack,onHpPresentation});callback.current={onHit,onGuard,onAttack,onHpPresentation};
 const [hit,setHit]=useState<{event:RpgItemEvent,anchor:HTMLElement}|null>(null);
 useLayoutEffect(()=>{
  if(!event||event.id===seen.current)return;seen.current=event.id;if(!['damage','blocked','heal'].includes(event.kind))return;
  const anchor=document.querySelector<HTMLElement>(event.target===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${event.target}"] .seat-card`);if(!anchor)return;
  if(event.hpBefore!==undefined&&(event.kind==='damage'||event.kind==='heal'))callback.current.onHpPresentation?.({id:event.id,target:event.target,before:event.hpBefore});
  const timing=itemSceneTiming(event,game.me),delay=Math.max(0,event.at+timing.impact-Date.now()),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let animation:Animation|undefined;
  const impact=setTimeout(()=>{callback.current.onHpPresentation?.(null);if(event.kind==='blocked')callback.current.onGuard?.(event.itemId);else{setHit({event,anchor});if(event.kind==='damage'){callback.current.onAttack?.(event.itemId);if(event.amount)callback.current.onHit(event.target,event.itemId);}}
   if(!reduced&&event.kind!=='heal')animation=anchor.animate([{translate:'0px'},{translate:'-7px 1px'},{translate:'5px -1px'},{translate:'-3px'},{translate:'0px'}],{duration:event.kind==='blocked'?250:400,easing:'ease-out'});
  },delay);
  const timer=setTimeout(()=>setHit(null),delay+(event.kind==='heal'?1100:650));return()=>{clearTimeout(impact);clearTimeout(timer);animation?.cancel();callback.current.onHpPresentation?.(null);};
 },[event?.id,game.me]);
 if(!hit)return null;
 const healing=hit.event.kind==='heal',deferred=hasRoundCombat(game)||game.hpItemMode&&!isBattleItemMode(game);
 return createPortal(<span key={hit.event.id} className={`rpg-hit-overlay ${healing?'is-heal':'is-damage'}`} role="status" aria-label={`${game.players[hit.event.target].name} HP ${hit.event.amount} ${healing?'회복':'피해'}${deferred?' 정산 예정':''}`}><span className="rpg-hit-flash"/>{healing&&<span className="rpg-healing-rings" aria-hidden="true"/>}<b className="rpg-hit-number">{healing?'+':'−'}{hit.event.amount}{deferred&&<small>정산 예정</small>}</b></span>,hit.anchor);
}
