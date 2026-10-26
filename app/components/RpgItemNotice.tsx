"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {itemImage,rpgItemNoticeText,type RpgItemEvent} from '../../lib/rpg-items.ts';
import {itemScenePoints,RPG_ITEM_SCENE_MS} from '../../lib/rpg-item-motion.ts';

type View=ReturnType<typeof view>;
type Points=ReturnType<typeof itemScenePoints>;
export function RpgItemNotice({game}:{game:View}){
 const event=game.rpgRun?.lastItem,seen=useRef(event?.id),[queue,setQueue]=useState<RpgItemEvent[]>([]),shown=queue[0];
 const [points,setPoints]=useState<Points|null>(null);
 useEffect(()=>{if(!event||seen.current===event.id)return;seen.current=event.id;
  if(event.kind==='cancel'||event.kind==='armed'||event.kind==='exchange'&&(event.actor===game.me||event.target===game.me))return;
  setQueue(old=>[...old,event].slice(-6));
 },[event?.id,game.me]);
 useEffect(()=>{if(!shown)return;const timer=setTimeout(()=>setQueue(old=>old.slice(1)),shown.kind==='scout'?1250:RPG_ITEM_SCENE_MS);return()=>clearTimeout(timer);},[shown?.id]);
 useLayoutEffect(()=>{
  if(!shown){setPoints(null);return;}
  const measure=()=>{
   const seat=(who:number)=>document.querySelector<HTMLElement>(who===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${who}"] .seat-card`);
   const fallback=(who:number)=>({left:who===game.me?innerWidth/2-24:who<2?30:innerWidth-78,top:who===game.me?innerHeight-130:70,width:48,height:40});
   const source=seat(shown.actor)?.getBoundingClientRect()||fallback(shown.actor),target=seat(shown.target)?.getBoundingClientRect()||source;
   const board=document.querySelector('.rpg-mode .floor-stage')?.getBoundingClientRect()||{left:0,top:100,width:innerWidth,height:innerHeight*.45};
   setPoints(itemScenePoints(innerWidth,innerHeight,source,target,board));
  };
  measure();window.addEventListener('resize',measure);window.addEventListener('scroll',measure,true);
  return()=>{window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true);};
 },[shown?.id,game.me]);
 if(!shown||!points||typeof document==='undefined')return null;
 const message=rpgItemNoticeText(shown,game.players),actor=game.players[shown.actor]?.name||'상대',target=game.players[shown.target]?.name||'상대';
 const style={'--from-x':`${points.from.x}px`,'--from-y':`${points.from.y}px`,'--to-x':`${points.to.x}px`,'--to-y':`${points.to.y}px`,'--apex-y':`${points.apex.y}px`,'--center-x':`${points.center.x}px`,'--center-y':`${points.center.y}px`,'--block-x':`${points.blockHit.x}px`,'--block-y':`${points.blockHit.y}px`,'--recoil-x':`${points.recoil.x}px`,'--recoil-y':`${points.recoil.y}px`} as CSSProperties;
 const offensive=['damage','blocked'].includes(shown.kind),blocked=shown.kind==='blocked';
 const caption=blocked?`${target} · ${shown.itemId==='ember-bomb'?'작열탄':'패 교환'} 차단`:shown.kind==='heal'?`${actor} · HP +${shown.amount}`:shown.kind==='seal'?'수호의 봉인 · 방어 준비':shown.kind==='exchange'?`${actor} ↔ ${target}`:'';
 return createPortal(<div key={shown.id} className={`item-fx-scene fx-${shown.kind} ${shown.itemId==='ember-bomb'?'fx-ember':''}`} style={style} role="status" aria-live="polite" aria-atomic="true" aria-label={`${message.title} · ${message.route} · ${message.detail}`}>
  {offensive&&<><small className="item-fx-source">{actor}</small><span className="item-fx-projectile">{shown.itemId==='ember-bomb'&&<i className="ember-flight-flame"/>}<img src={itemImage(shown.itemId)} alt=""/></span></>}
  {shown.kind==='damage'&&<span className="item-fx-impact"/>}
  {blocked?<span className="item-fx-shield"><img src={itemImage('ward-seal')} alt=""/><i className="item-fx-barrier"/></span>:!offensive&&<span className="item-fx-emblem"><i className="item-fx-aura"/><img src={itemImage(shown.itemId)} alt=""/></span>}
  {caption&&<small className="item-fx-caption">{caption}</small>}
 </div>,document.body);
}
