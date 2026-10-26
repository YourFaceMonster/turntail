"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {itemImage,rpgItemNoticeText,type RpgItemEvent} from '../../lib/rpg-items.ts';
export function RpgItemNotice({game}:{game:ReturnType<typeof view>}){
 const event=game.rpgRun?.lastItem,seen=useRef(event?.id),[queue,setQueue]=useState<RpgItemEvent[]>([]),shown=queue[0];
 useEffect(()=>{if(!event||seen.current===event.id)return;seen.current=event.id;if(event.kind==='cancel'||event.kind==='armed')return;setQueue(old=>[...old,event].slice(-6));},[event?.id]);
 useEffect(()=>{if(!shown)return;const timer=setTimeout(()=>setQueue(old=>old.slice(1)),1900);return()=>clearTimeout(timer);},[shown?.id]);
 if(!shown||typeof document==='undefined')return null;
 const message=rpgItemNoticeText(shown,game.players),opponents=game.players.map((_,seat)=>seat).filter(seat=>seat!==game.me);
 const positions=game.players.map((player,seat)=>({name:player.name,seat,x:seat===game.me?120:opponents.indexOf(seat)===0?43:197,y:seat===game.me?110:20}));
 const source=positions[shown.actor],directed=['damage','exchange','blocked'].includes(shown.kind),target=directed?positions[shown.target]:source;
 const dx=(target?.x||0)-(source?.x||0),dy=(target?.y||0)-(source?.y||0),distance=Math.hypot(dx,dy)||1,trim=27;
 const marker=`item-arrow-${shown.id}`;
 return createPortal(<div key={shown.id} className={`rpg-item-notice spatial-item-notice item-notice-${shown.kind}`} role="status" aria-live="polite" aria-atomic="true" aria-label={`${message.title} · ${message.route} · ${message.detail}`}><header><img src={itemImage(shown.kind==='blocked'?'ward-seal':shown.itemId)} alt=""/><strong>{message.title}</strong></header><div className="item-seat-map"><svg className="item-route-svg" viewBox="0 0 240 132" preserveAspectRatio="none" aria-hidden="true"><defs><marker id={marker} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8 2 4Z" fill="#fff0ad"/></marker></defs>{directed&&source&&target&&<line x1={source.x+dx/distance*trim} y1={source.y+dy/distance*trim} x2={target.x-dx/distance*trim} y2={target.y-dy/distance*trim} markerEnd={`url(#${marker})`} stroke="#ffe39a" strokeWidth="4"/>}{!directed&&source&&<circle cx={source.x} cy={source.y} r="23" fill="none" stroke="#ffe39a" strokeWidth="3"/>}</svg>{positions.map(position=><span key={position.seat} className={`item-seat-label ${position.seat===shown.actor?'is-source':''} ${position.seat===target?.seat?'is-target':''}`} style={{left:`${position.x/2.4}%`,top:`${position.y/1.32}%`}}><small>{position.seat===game.me?'나':opponents.indexOf(position.seat)===0?'왼쪽 상대':'오른쪽 상대'}</small><b>{position.name}</b></span>)}</div><footer>{message.detail}</footer></div>,document.body);
}
