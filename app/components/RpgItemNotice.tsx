"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {isAttackItem,itemImage,rpgItemNoticeText,type RpgItemEvent} from '../../lib/rpg-items.ts';
import {isBattleItemMode} from '../../lib/hp-item-battle.ts';
import {itemScenePoints,itemSceneTiming,itemProjectileFrames} from '../../lib/rpg-item-motion.ts';
import TileFace from './TileFace';
import TileBack from './TileBack';
type View=ReturnType<typeof view>;
type Scene={points:ReturnType<typeof itemScenePoints>,source:DOMRect,target:DOMRect,elapsed:number};
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
   setScene({points:itemScenePoints(innerWidth,innerHeight,source,target,board),source,target,elapsed:Math.max(0,Date.now()-shown.at)});
  };measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);
 },[shown?.id,game.me]);
 useLayoutEffect(()=>{
  if(!shown||!scene||!projectile.current)return;
  const duration=itemSceneTiming(shown,game.me).duration,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frames=reduced?[{opacity:1,transform:`translate(${scene.points.to.x}px,${scene.points.to.y}px) translate(-50%,-50%) scale(.6)`},{opacity:0,transform:`translate(${scene.points.to.x}px,${scene.points.to.y}px) translate(-50%,-50%) scale(.6)`}]:itemProjectileFrames(scene.points,shown.kind==='blocked',!isAttackItem(shown.itemId));
  const animation=projectile.current.animate(frames,{duration,easing:'linear',fill:'both'});animation.currentTime=Math.max(0,Date.now()-shown.at);return()=>animation.cancel();
 },[shown?.id,scene,game.me]);
 if(!shown||!scene||!timing||!timing.duration)return null;
 const {points,source,target,elapsed}=scene,blocked=shown.kind==='blocked',offensive=shown.kind==='damage'||blocked,ownExchange=shown.kind==='exchange'&&(shown.actor===game.me||shown.target===game.me),message=rpgItemNoticeText(shown,game.players);
 const style={'--fx-ms':`${timing.duration}ms`,'--fx-delay':`-${elapsed}ms`,'--impact-ms':`${Math.max(0,timing.impact-elapsed)}ms`,'--shield-ms':`${Math.max(0,timing.shield-elapsed)}ms`,'--to-x':`${points.to.x}px`,'--to-y':`${points.to.y}px`,'--center-x':`${points.center.x}px`,'--center-y':`${points.center.y}px`,'--shield-w':`${target.width+24}px`,'--shield-h':`${target.height+30}px`} as CSSProperties;
 return createPortal(<div key={shown.id} className={`item-fx-scene smooth-item-scene fx-${shown.kind} ${shown.itemId==='ember-bomb'?'fx-ember':shown.itemId==='spark-dart'?'fx-dart':''}`} style={style} role="status" aria-live="polite" aria-label={`${message.title} · ${message.route} · ${message.detail}`}>
  <span className="item-seat-badge" style={{left:Math.min(innerWidth-34,source.right-12),top:Math.max(8,source.top-12)}} title={message.title}><img src={itemImage(shown.itemId)} alt=""/></span>
  {offensive&&<span className={`item-fx-projectile ${!isAttackItem(shown.itemId)?'is-tile-projectile':''}`} ref={projectile}>{blocked&&!isAttackItem(shown.itemId)?shown.tiles?.[0]?<TileFace tile={shown.tiles[0]}/>:<TileBack/>:<img src={itemImage(shown.itemId)} alt=""/>}</span>}
  {shown.kind==='damage'&&<><span className="item-fx-impact"/><svg className="item-impact-burst" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="19" fill="#fff7d9"/>{Array.from({length:8},(_,index)=><path key={index} d="M80 13L84 51L80 63L76 51Z" fill={index%2?'#ffbf62':'#fff3c1'} transform={`rotate(${index*45} 80 80)`}/>)}</svg></>}
  {blocked&&<span className="item-character-shield"><i/><img src={itemImage('ward-seal')} alt=""/></span>}
  {!offensive&&!ownExchange&&<><strong className="item-emblem-owner">{game.players[shown.actor]?.name}</strong><span className="item-fx-emblem"><img src={itemImage(shown.itemId)} alt=""/></span></>}
  {shown.kind==='failed'&&<span className="item-failed-caption">교환할 수 없습니다<small>1·2를 제외한 교환 가능한 패가 없어요.</small></span>}
  {shown.kind==='heal'&&<span className="item-heal-caption"><b>HP +{shown.amount}</b>{game.hpItemMode&&!isBattleItemMode(game)&&<small>이번 판 종료 시 회복</small>}</span>}
 </div>,document.body);
}
