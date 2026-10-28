"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {isAttackItem,itemImage,rpgItemNoticeText,type RpgItemEvent} from '../../lib/rpg-items.ts';
import {itemScenePoints,itemSceneTiming,itemProjectileFrames,dartFacingFrames} from '../../lib/rpg-item-motion.ts';
import TileFace from './TileFace';
import TileBack from './TileBack';
type View=ReturnType<typeof view>;
type Scene={points:ReturnType<typeof itemScenePoints>,source:DOMRect,target:DOMRect,badge:{left:number,top:number},elapsed:number};
export function RpgItemNotice({game}:{game:View}){
 const event=game.rpgRun?.lastItem,seen=useRef(event?.id),[shown,setShown]=useState<RpgItemEvent|null>(null),[scene,setScene]=useState<Scene|null>(null),projectile=useRef<HTMLSpanElement>(null);
 useEffect(()=>{if(!event||event.id===seen.current)return;seen.current=event.id;if(event.kind==='cancel'||event.kind==='armed')return;setShown(event);},[event?.id]);
 const timing=shown?itemSceneTiming(shown,game.me):null;
 useEffect(()=>{if(!shown||!timing)return;const timer=setTimeout(()=>setShown(null),Math.max(0,shown.at+timing.duration-Date.now()));return()=>clearTimeout(timer);},[shown?.id]);
 useLayoutEffect(()=>{
  if(!shown){setScene(null);return;}
  const measure=()=>{
   const seat=(who:number)=>document.querySelector<HTMLElement>(who===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${who}"] .seat-card`);
   const source=seat(shown.actor)?.getBoundingClientRect(),target=seat(shown.target)?.getBoundingClientRect()||source;if(!source||!target)return;
   const board=document.querySelector('.rpg-mode .floor-stage')?.getBoundingClientRect()||source;
   const counter=shown.actor!==game.me?seat(shown.actor)?.querySelector('.rpg-seat-count')?.getBoundingClientRect():null,right=seat(shown.actor)?.closest('.opponent')?.classList.contains('is-right-side');
   const badge={left:Math.max(5,Math.min(innerWidth-33,counter?(right?counter.right+3:counter.left-31):source.right-25)),top:Math.max(5,counter?counter.top+counter.height/2-14:source.top-12)};
   setScene({points:itemScenePoints(innerWidth,innerHeight,source,target,board,{impact:'center'}),source,target,badge,elapsed:Math.max(0,Date.now()-shown.at)});
  };measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);
 },[shown?.id,game.me]);
 useLayoutEffect(()=>{
  if(!shown||!scene||!projectile.current)return;
  const timing=itemSceneTiming(shown,game.me),duration=timing.duration,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frames=itemProjectileFrames(scene.points,shown.kind==='blocked',!isAttackItem(shown.itemId),{dart:shown.itemId==='spark-dart',contact:timing.impact/timing.duration,reduced});
  const animation=projectile.current.animate(frames,{duration,easing:'linear',fill:'both'});animation.currentTime=Math.max(0,Date.now()-shown.at);
  const dart=shown.itemId==='spark-dart'&&!reduced?projectile.current.querySelector('img')?.animate(dartFacingFrames(),{duration,easing:'linear',fill:'both'}):null;
  if(dart)dart.currentTime=animation.currentTime;return()=>{animation.cancel();dart?.cancel();};
 },[shown?.id,scene,game.me]);
 if(!shown||!scene||!timing||!timing.duration)return null;
 const {points,source,target,elapsed}=scene,blocked=shown.kind==='blocked',offensive=shown.kind==='damage'||blocked,ownExchange=shown.kind==='exchange'&&(shown.actor===game.me||shown.target===game.me),message=rpgItemNoticeText(shown,game.players);
 const style={'--ember-baseline-x':`${target.left+target.width/2}px`,'--ember-baseline-y':`${target.bottom}px`,'--fx-ms':`${timing.duration}ms`,'--fx-delay':`-${elapsed}ms`,'--impact-ms':`${Math.max(0,timing.impact-elapsed)}ms`,'--impact-life':`${timing.duration-timing.impact-30}ms`,'--shield-ms':`${Math.max(0,timing.shield-elapsed)}ms`,'--to-x':`${points.to.x}px`,'--to-y':`${points.to.y}px`,'--center-x':`${points.center.x}px`,'--center-y':`${points.center.y}px`,'--shield-w':`${target.width+24}px`,'--shield-h':`${target.height+30}px`} as CSSProperties;
 return createPortal(<div key={shown.id} className={`item-fx-scene smooth-item-scene fx-${shown.kind} ${shown.itemId==='ember-bomb'?'fx-ember':shown.itemId==='spark-dart'?'fx-dart':blocked?'fx-blocked-exchange':''}`} style={style} role="status" aria-live="polite" aria-label={`${message.title} · ${message.route} · ${message.detail}`}>
  <span className="item-seat-badge" style={scene.badge} title={`${game.players[shown.actor]?.name} · ${message.title}`} aria-label={`${game.players[shown.actor]?.name} · ${message.title}`}><img src={itemImage(shown.itemId)} alt=""/></span>
  {offensive&&<span className={`item-fx-projectile ${!isAttackItem(shown.itemId)?'is-tile-projectile':''}`} ref={projectile}>{blocked&&!isAttackItem(shown.itemId)?shown.tiles?.[0]?<TileFace tile={shown.tiles[0]}/>:<TileBack/>:<img src={itemImage(shown.itemId)} alt="" loading="eager" decoding="sync" fetchPriority="high"/>}</span>}
  {shown.kind==='damage'&&(shown.itemId==='ember-bomb'?<span className="ember-impact-visual" aria-hidden="true"><span className="ember-impact-sheet"/><i className="ember-impact-shockwave"/></span>:<><span className="item-fx-impact"/><svg className="item-impact-burst dart-contact-spark" viewBox="0 0 100 100" aria-hidden="true"><path d="M49 47L31 17L45 43L52 49L72 31L57 50L77 64L54 56L45 80L48 57L21 63Z" fill="#ffdf9c"/><path d="M46 45L53 48L56 55L48 57L44 52Z" fill="#fff7df"/></svg></>)}
  {blocked&&<><span className="item-character-shield"><i/><img src={itemImage('ward-seal')} alt=""/></span><span className="item-guard-contact"><i/><b/></span></>}
  {!offensive&&!ownExchange&&<><strong className="item-emblem-owner">{game.players[shown.actor]?.name}</strong><span className="item-fx-emblem"><img src={itemImage(shown.itemId)} alt=""/></span></>}
  {shown.kind==='failed'&&<span className="item-failed-caption">교환할 수 없습니다<small>1·2를 제외한 교환 가능한 패가 없어요.</small></span>}
 </div>,document.body);
}
