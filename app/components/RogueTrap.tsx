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
 return <button type="button" className={`text-btn rogue-trap-control ${targeting?'is-targeting':''}`} disabled={!availability.usable||!hasFloor} title={hasFloor?availability.reason:'남은 바닥패 없음'} aria-pressed={targeting} onClick={choose}>✹ {state.itemBattle.trapUsed[game.me]?'함정 사용함':'함정 설치'}</button>;
}
export function RogueTrapEffects({game,onHit,onHpPresentation}:{game:View,onHit:()=>void,onHpPresentation:(value:TrapHpPresentation|null)=>void}){
 const event=game.rpgRun?.combat?.itemBattle?.lastTrap,seen=useRef(event?.id),callbacks=useRef({onHit,onHpPresentation});callbacks.current={onHit,onHpPresentation};
 const [burst,setBurst]=useState<{event:TrapBurst,floor:HTMLElement|null,target:HTMLElement|null}|null>(null);
 useLayoutEffect(()=>{
  if(!event||event.id===seen.current)return;seen.current=event.id;if(event.safe)return;
  const target=document.querySelector<HTMLElement>(event.target===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${event.target}"] .seat-card`),floor=document.querySelector<HTMLElement>(`[data-stack="${event.index}"]`);
  callbacks.current.onHpPresentation({id:event.id,target:event.target,before:event.hpBefore});
  const delay=Math.max(0,event.at-Date.now()),impact=setTimeout(()=>{callbacks.current.onHpPresentation(null);setBurst({event,floor,target});callbacks.current.onHit();},delay),done=setTimeout(()=>setBurst(null),delay+1100);
  return()=>{clearTimeout(impact);clearTimeout(done);callbacks.current.onHpPresentation(null);};
 },[event?.id,game.me]);
 if(!burst)return null;
 return <>{burst.floor&&createPortal(<span className="rogue-floor-explosion" aria-hidden="true"><img src="/rpg-items-v1/consumables/ember-bomb-v2.webp" alt=""/><i/><i/><i/></span>,burst.floor)}{burst.target&&createPortal(<span className="rogue-trap-hit" role="status"><small>{(burst.event.owners||[burst.event.owner]).map(owner=>game.players[owner].name).join('·')}의 함정!</small><b>{burst.event.damage?`−${burst.event.damage}`:'방어'}</b></span>,burst.target)}</>;
}
