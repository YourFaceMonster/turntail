'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {trapAvailability,type TrapBurst} from '../../lib/item-battle-rules.ts';
type View=ReturnType<typeof view>;
export type TrapHpPresentation={id:string,target:number,before:number};
export function RogueTrapControl({game,enabled,targeting,choose}:{game:View,enabled:boolean,targeting:boolean,choose:()=>void}){
 const state=game.rpgRun?.combat;if(!state?.itemBattle||state.professions[game.me]!=='rogue')return null;
 const availability=trapAvailability(game,game.me,enabled),hasFloor=game.stacks.some(stack=>stack.trapAvailable);
 return <button type="button" className={`text-btn rogue-trap-control ${targeting?'is-targeting':''}`} disabled={!availability.usable||!hasFloor} title={hasFloor?availability.reason:'남은 바닥패 없음'} aria-label={state.itemBattle.trapUsed[game.me]?'함정 사용함':'함정 설치'} aria-pressed={targeting} onClick={choose}><img src="/item-battle-v1/trap-v1.webp" alt=""/><span>{state.itemBattle.trapUsed[game.me]?'사용함':'함정'}</span></button>;
}
export function FloorTrapMarker({game,index}:{game:View,index:number}){
 const state=game.rpgRun?.combat?.itemBattle,own=state?.traps.some(trap=>trap.index===index),intel=state?.trapIntel[game.me]?.find(value=>value.index===index);
 if(!own&&!intel)return null;
 const label=own?'내 함정':intel?.trapped?'함정 발견':'확인 시 함정 없음';
 return <span className={`floor-trap-inset ${own?'is-own':intel?.trapped?'is-detected':'is-clear'}`} aria-label={label} title={label}>{own||intel?.trapped?<img src="/item-battle-v1/trap-v1.webp" alt=""/>:'✓'}</span>;
}
export function RogueTrapEffects({game,onHit,onHpPresentation}:{game:View,onHit:()=>void,onHpPresentation:(value:TrapHpPresentation|null)=>void}){
 const event=game.rpgRun?.combat?.itemBattle?.lastTrap,seen=useRef(event?.id),callbacks=useRef({onHit,onHpPresentation});callbacks.current={onHit,onHpPresentation};
 const [burst,setBurst]=useState<{event:TrapBurst,floor:HTMLElement|null,target:HTMLElement|null}|null>(null),[safe,setSafe]=useState(false);
 useLayoutEffect(()=>{
  if(!event||event.id===seen.current)return;seen.current=event.id;if(event.safe){setSafe(true);const timer=setTimeout(()=>setSafe(false),2300);return()=>clearTimeout(timer);}setSafe(false);
  const target=document.querySelector<HTMLElement>(event.target===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${event.target}"] .seat-card`),floor=document.querySelector<HTMLElement>(`[data-stack="${event.index}"]`);
  callbacks.current.onHpPresentation({id:event.id,target:event.target,before:event.hpBefore});
  const delay=Math.max(0,event.at-Date.now()),impact=setTimeout(()=>{callbacks.current.onHpPresentation(null);setBurst({event,floor,target});callbacks.current.onHit();},delay),done=setTimeout(()=>setBurst(null),delay+1100);
  return()=>{clearTimeout(impact);clearTimeout(done);callbacks.current.onHpPresentation(null);};
 },[event?.id,game.me]);
 if(safe)return createPortal(<div className="trap-recovery-notice" role="status">내 함정을 안전하게 회수했어요 · 피해 없음</div>,document.body);
 if(!burst)return null;
 return <>{burst.floor&&createPortal(<span className="rogue-floor-explosion" aria-hidden="true"><img src="/rpg-items-v1/consumables/ember-bomb-v2.webp" alt=""/><i/><i/><i/></span>,burst.floor)}{burst.target&&createPortal(<span className="rogue-trap-hit" role="status"><small>{(burst.event.owners||[burst.event.owner]).map(owner=>game.players[owner].name).join('·')}의 함정 발동!</small><b>{burst.event.damage?`HP −${burst.event.damage}`:'함정 피해 방어'}</b></span>,burst.target)}</>;
}
