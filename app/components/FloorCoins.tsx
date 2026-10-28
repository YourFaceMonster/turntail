'use client';
import {useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {Coins} from 'lucide-react';
import type {view} from '../../lib/game.ts';
import type {FloorCoinPickup} from '../../lib/floor-coins.ts';
type View=ReturnType<typeof view>;
export function FloorCoinMarker({amount=0}:{amount?:number}){return amount>0?<span className="floor-coin-marker" aria-label={`획득 주화 ${amount}P`} title={`가져오면 +${amount}P`}><Coins aria-hidden="true"/><b>{amount}</b></span>:null;}
export function FloorCoinEffects({game}:{game:View}){
 const event=game.floorCoins?.events.at(-1),seen=useRef(event?.id),flight=useRef<HTMLSpanElement>(null),[shown,setShown]=useState<{event:FloorCoinPickup,from:{x:number,y:number},to:{x:number,y:number}}|null>(null);
 useLayoutEffect(()=>{
  if(!event){setShown(null);return;}if(seen.current===event.id)return;seen.current=event.id;
  const source=document.querySelector(`[data-stack="${event.index}"]`)?.getBoundingClientRect(),target=document.querySelector(event.who===game.me?'.own-wallet':`.opponents [data-seat="${event.who}"] .seat-card`)?.getBoundingClientRect();if(!source||!target)return;
  setShown({event,from:{x:source.left+source.width/2,y:source.top+source.height/2},to:{x:target.left+target.width/2,y:target.top+target.height/2}});const timer=setTimeout(()=>setShown(null),1500);return()=>clearTimeout(timer);
 },[event?.id,game.me]);
 useLayoutEffect(()=>{if(!shown||!flight.current)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,{from,to}=shown,move=(x:number,y:number)=>`translate(${x}px,${y}px) translate(-50%,-50%)`;
  const animation=flight.current.animate(reduced?[{transform:move(to.x,to.y),opacity:1},{transform:move(to.x,to.y),opacity:0}]:[{transform:move(from.x,from.y),opacity:1},{transform:move((from.x+to.x)/2,Math.min(from.y,to.y)-45),opacity:1,offset:.5},{transform:move(to.x,to.y),opacity:0}],{duration:reduced?180:750,easing:'ease-in-out',fill:'both'});return()=>animation.cancel();
 },[shown]);
 if(!shown)return null;const {event:pickup,to}=shown;
 return createPortal(<div className="floor-coin-pickup" role="status" aria-label={`${game.players[pickup.who].name} ${pickup.kind==='random'?'주화':'마지막 바닥 주화'} +${pickup.amount}P`}><span className="floor-coin-flight" ref={flight} aria-hidden="true"><Coins/></span><strong className="floor-coin-credit" style={{left:Math.min(innerWidth-38,Math.max(38,to.x)),top:Math.max(12,to.y-27)} as CSSProperties}>+{pickup.amount}P</strong></div>,document.body);
}
