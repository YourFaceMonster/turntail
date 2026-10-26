"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import type {RpgItemEvent} from '../../lib/rpg-items.ts';
import {isBattleItemMode} from '../../lib/hp-item-battle.ts';
import {itemSceneTiming} from '../../lib/rpg-item-motion.ts';
export function RpgCombatEffects({game,onHit,onGuard,onAttack}:{game:ReturnType<typeof view>,onHit:(who:number,itemId:string)=>void,onGuard?:(itemId:string)=>void,onAttack?:(id:string)=>void}){
 const event=game.rpgRun?.lastItem,seen=useRef(event?.id),callback=useRef({onHit,onGuard,onAttack});callback.current={onHit,onGuard,onAttack};
 const [hit,setHit]=useState<{event:RpgItemEvent,anchor:HTMLElement}|null>(null);
 useEffect(()=>{
  if(!event||event.id===seen.current)return;seen.current=event.id;if(event.kind!=='damage'&&event.kind!=='blocked')return;
  const anchor=document.querySelector<HTMLElement>(event.target===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${event.target}"] .seat-card`);if(!anchor)return;
  const timing=itemSceneTiming(event,game.me),delay=Math.max(0,event.at+timing.impact-Date.now()),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,small=event.itemId==='spark-dart';let animation:Animation|undefined;
  const impact=setTimeout(()=>{if(event.kind==='blocked')callback.current.onGuard?.(event.itemId);else{setHit({event,anchor});callback.current.onAttack?.(event.itemId);if(event.amount)callback.current.onHit(event.target,event.itemId);}
   if(!reduced)animation=anchor.animate(small?[{translate:'0px'},{translate:'-2px'},{translate:'1px'},{translate:'0px'}]:[{translate:'0px'},{translate:'-7px 1px'},{translate:'5px -1px'},{translate:'-3px'},{translate:'0px'}],{duration:small?190:event.kind==='blocked'?250:400,easing:'ease-out'});
  },delay);
  const timer=setTimeout(()=>setHit(null),delay+650);return()=>{clearTimeout(impact);clearTimeout(timer);animation?.cancel();};
 },[event?.id,game.me]);
 if(!hit)return null;
 return createPortal(<span key={hit.event.id} className={`rpg-hit-overlay is-damage ${hit.event.itemId==='spark-dart'?'is-small-impact':''}`} role="status" aria-label={`${game.players[hit.event.target].name} HP ${hit.event.amount} 피해${game.hpItemMode&&!isBattleItemMode(game)?' 정산 예정':''}`}><span className="rpg-hit-flash"/><b className="rpg-hit-number">−{hit.event.amount}{game.hpItemMode&&!isBattleItemMode(game)&&<small>정산 예정</small>}</b></span>,hit.anchor);
}
