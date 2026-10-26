"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {suits,type Tile,type view} from '../../lib/game.ts';
import {exchangeTargetAvailable,itemImage,type RpgExchangeEvent,type RpgExchangeItem} from '../../lib/rpg-items.ts';
import {itemSceneTiming} from '../../lib/rpg-item-motion.ts';
import {exchangePickerPlacement,type ExchangeRect} from '../../lib/rpg-exchange-motion.ts';
import TileFace from './TileFace';
import TileBack from './TileBack';
type View=ReturnType<typeof view>;
export type ExchangeTarget={id:RpgExchangeItem,target:number};
type Placement={x:number,y:number,controlsY:number,hand:ExchangeRect,opponent:ExchangeRect,destinations:Record<number,ExchangeRect>,colors:Record<number,{light:string,dark:string,border:string}>,elapsed:number};
function ExchangeArrow(){return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M25 27C25 15 20 8 7 8M7 8l7-6M7 8l7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
export function RpgExchangeStage({game,target,selected,onReady,onConfirm,onCancel,onComplete,onBusy,onRemove,error,pending=false}:{game:View,target:ExchangeTarget|null,selected:Tile[],onReady:(ready:boolean)=>void,onConfirm:(ids:number[],target?:number)=>void,onCancel:()=>void,onComplete:()=>void,onBusy:(busy:boolean)=>void,onRemove:(id:number)=>void,error?:string,pending?:boolean}){
 const event=game.rpgRun?.lastExchange,runId=game.rpgRun?.id,seen=useRef({runId,event:event?.id}),callbacks=useRef({onReady,onConfirm,onCancel,onComplete,onBusy});callbacks.current={onReady,onConfirm,onCancel,onComplete,onBusy};
 const [running,setRunning]=useState<RpgExchangeEvent|null>(null),[placement,setPlacement]=useState<Placement|null>(null),sources=useRef<Record<number,ExchangeRect>>({});
 const count=(running?.itemId||target?.id)==='fates-scales'?2:1,targetSeat=running?.target??target?.target,selectionKey=selected.map(tile=>tile.id).join(',');
 useLayoutEffect(()=>{
  if(seen.current.runId!==runId){seen.current={runId,event:event?.id};setRunning(null);sources.current={};callbacks.current.onBusy(false);return;}
  if(!event||event.round!==game.round||event.id===seen.current.event)return;seen.current.event=event.id;setRunning(event);callbacks.current.onBusy(true);
 },[runId,event?.id,game.round]);
 useEffect(()=>{if(!running)return;const duration=itemSceneTiming({kind:'exchange',actor:game.me,target:running.target},game.me).duration;const timer=setTimeout(()=>{setRunning(null);sources.current={};callbacks.current.onComplete();callbacks.current.onBusy(false);},Math.max(0,running.at+duration-Date.now()));return()=>clearTimeout(timer);},[running?.id]);
 useEffect(()=>{const item=game.rpgRun?.lastItem;if(target&&item?.kind==='blocked'&&item.actor===game.me&&item.itemId===target.id){sources.current={};callbacks.current.onComplete();callbacks.current.onBusy(false);}},[game.rpgRun?.lastItem?.id]);
 useEffect(()=>()=>callbacks.current.onBusy(false),[]);
 useEffect(()=>{callbacks.current.onReady(!!target&&!running&&selected.length===count);},[target?.id,selectionKey,running?.id,count]);
 useEffect(()=>{if(!target||running)return;const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')callbacks.current.onCancel();};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[!!target,!!running]);
 useLayoutEffect(()=>{
  if(!target&&!running){setPlacement(null);return;}
  const measure=()=>{
   const hand=document.querySelector('[data-hand-area]')?.getBoundingClientRect()||{left:12,top:innerHeight*.75,width:innerWidth-24,height:innerHeight*.2};
   const opponent=document.querySelector(`.opponents [data-seat="${targetSeat}"] .seat-card`)?.getBoundingClientRect()||{left:innerWidth/2-25,top:70,width:50,height:40};
   selected.forEach(tile=>{const rect=document.querySelector(`[data-hand="${tile.id}"] .tile`)?.getBoundingClientRect();if(rect)sources.current[tile.id]=rect;});
   const destinations:Record<number,ExchangeRect>={},colors:Placement['colors']={};
   running?.incoming.forEach(tile=>{const rect=document.querySelector(`[data-hand="${tile.id}"] .tile`)?.getBoundingClientRect();if(rect)destinations[tile.id]=rect;});
   game.players.forEach((_,seat)=>{const el=document.querySelector(`.opponents [data-seat="${seat}"] .seat-card`);if(!el)return;const css=getComputedStyle(el);colors[seat]={light:css.getPropertyValue('--seat-hp-light').trim()||'#5795ca',dark:css.getPropertyValue('--seat-hp-dark').trim()||'#28577f',border:css.getPropertyValue('--persona').trim()||'#bfd9f4'};});
   setPlacement({...exchangePickerPlacement(innerWidth,innerHeight,hand),hand,opponent,destinations,colors,elapsed:running?Math.max(0,Date.now()-running.at):0});
  };measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);
 },[target?.id,targetSeat,selectionKey,running?.id]);
 if((!target&&!running)||!placement)return null;
 const {x,y,hand,opponent,destinations}=placement,duration=running?itemSceneTiming({kind:'exchange',actor:game.me,target:running.target},game.me).duration:2400;
 const outgoing=running?.outgoing||[],incoming=running?.incoming||[],describe=(tiles:Tile[])=>tiles.map(tile=>`${suits[tile.s]} ${tile.n}`).join(' · ');
 const style=(source:ExchangeRect,destination:ExchangeRect,index:number)=>({width:60,height:79,'--sx':`${source.left}px`,'--sy':`${source.top}px`,'--ssx':source.width/60,'--ssy':source.height/79,'--ox':`${x-30+index*66}px`,'--oy':`${y-40}px`,'--dx':`${destination.left}px`,'--dy':`${destination.top}px`,'--dsx':destination.width/60,'--dsy':destination.height/79,animationDuration:`${duration}ms`,animationDelay:`-${running?placement.elapsed:0}ms`} as CSSProperties);
 const seatDestination={left:opponent.left+opponent.width/2-22,top:opponent.top+opponent.height/2-29,width:44,height:58};
 return createPortal(<div className={`rpg-exchange-stage clean-exchange-stage ${running?'is-running':''}`} data-phase={running?'swapping':'selecting'}>
  <div className={`exchange-clean-emblem ${running?'is-casting':''}`} style={{left:x,top:y}}><img src={itemImage(running?.itemId||target!.id)} alt=""/></div>
  {!running&&<div className="exchange-clean-controls" style={{left:x,top:placement.controlsY}}><strong>{selected.length===count?'교환할 상대를 선택하세요':`내 손패 ${count}장을 먼저 선택하세요`}</strong>{selected.length===count&&<div className="exchange-pick-targets">{game.players.map((player,seat)=>{if(seat===game.me)return null;const color=placement.colors[seat],isLeft=seat===game.players.findIndex((_,i)=>i!==game.me);return <button type="button" key={player.id} style={{'--target-light':color?.light,'--target-dark':color?.dark,'--target-border':color?.border} as CSSProperties} disabled={pending||!exchangeTargetAvailable(game,target!.id,seat)} onClick={()=>callbacks.current.onConfirm(selected.map(tile=>tile.id),seat)}>{isLeft&&<ExchangeArrow/>}<strong>{player.name}</strong>{!isLeft&&<ExchangeArrow/>}</button>;})}</div>}<button className="exchange-cancel" disabled={pending} onClick={()=>callbacks.current.onCancel()}>취소</button>{error&&<p className="exchange-stage-error" role="alert">{error}</p>}</div>}
  {running&&outgoing.map((tile,index)=><span key={`out:${tile.id}`} className="exchange-stage-tile stage-post-outgoing" style={style(sources.current[tile.id]||{left:hand.left+hand.width/2-30,top:hand.top,width:60,height:79},seatDestination,index)}><TileFace tile={tile}/></span>)}
  {running&&incoming.map((tile,index)=><span key={`in:${tile.id}`} className="exchange-stage-tile stage-post-incoming" style={style(seatDestination,destinations[tile.id]||{left:hand.left+hand.width/2-30,top:hand.top,width:60,height:79},index)}><span className="exchange-stage-flipper" style={{animationDuration:`${duration}ms`}}><span className="exchange-stage-back"><TileBack/></span><span className="exchange-stage-front"><TileFace tile={tile}/></span></span></span>)}
  {running&&<div className="exchange-clean-receipt" style={{left:x,top:placement.controlsY}} role="status"><strong>{game.players[running.target]?.name}과 교환</strong><small>보낸 패 {describe(outgoing)} · 받은 패 {describe(incoming)}</small></div>}
 </div>,document.body);
}
