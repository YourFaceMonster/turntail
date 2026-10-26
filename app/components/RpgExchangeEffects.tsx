"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {suits,type Tile,type view} from '../../lib/game.ts';
import {exchangeStageLayout,type ExchangeRect} from '../../lib/rpg-exchange-motion.ts';
import {itemImage,type RpgExchangeEvent,type RpgExchangeItem} from '../../lib/rpg-items.ts';
import TileFace from './TileFace';
import TileBack from './TileBack';
import useTileGestures from './useTileGestures';

type View=ReturnType<typeof view>;
export type ExchangeTarget={id:RpgExchangeItem,target:number};
type Measurements={layout:ReturnType<typeof exchangeStageLayout>,hand:ExchangeRect,opponent:ExchangeRect,sources:Record<number,ExchangeRect>,destinations:Record<number,ExchangeRect>,tiles:ExchangeRect[]};
const readRect=(element:Element|null):ExchangeRect|null=>{const rect=element?.getBoundingClientRect();return rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:null;};

export function RpgExchangeStage({game,target,selected,onReady,onConfirm,onCancel,onComplete,onBusy,onRemove,error}:{game:View,target:ExchangeTarget|null,selected:Tile[],onReady:(ready:boolean)=>void,onConfirm:(ids:number[])=>void,onCancel:()=>void,onComplete:()=>void,onBusy:(busy:boolean)=>void,onRemove:(id:number)=>void,error?:string}){
 const event=game.rpgRun?.lastExchange,runId=game.rpgRun?.id;
 const seen=useRef({runId,event:event?.id}),callbacks=useRef({onReady,onConfirm,onCancel,onComplete,onBusy,onRemove});callbacks.current={onReady,onConfirm,onCancel,onComplete,onBusy,onRemove};
 const [running,setRunning]=useState<RpgExchangeEvent|null>(null),[measurements,setMeasurements]=useState<Measurements|null>(null);
 const sources=useRef<Record<number,ExchangeRect>>({});
 const count=(running?.itemId||target?.id)==='fates-scales'?2:1,targetSeat=running?.target??target?.target,selectionKey=selected.map(tile=>tile.id).join(',');
 useLayoutEffect(()=>{
  if(seen.current.runId!==runId){seen.current={runId,event:event?.id};setRunning(null);sources.current={};callbacks.current.onBusy(false);return;}
  if(!event||seen.current.event===event.id)return;
  seen.current.event=event.id;setRunning(event);callbacks.current.onBusy(true);
 },[runId,event?.id]);
 useEffect(()=>{
  if(!running)return;
  const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?1100:2600;
  const timer=setTimeout(()=>{setRunning(null);sources.current={};callbacks.current.onComplete();callbacks.current.onBusy(false);},duration);
  return()=>clearTimeout(timer);
 },[running?.id]);
 useEffect(()=>{const item=game.rpgRun?.lastItem;if(target&&item?.kind==='blocked'&&item.actor===game.me&&item.target===target.target&&(item.itemId==='swapped-fate'||item.itemId==='fates-scales')){sources.current={};callbacks.current.onComplete();callbacks.current.onBusy(false);}},[game.rpgRun?.lastItem?.id]);
 useEffect(()=>()=>callbacks.current.onBusy(false),[]);
 useEffect(()=>{
  callbacks.current.onReady(!!target&&!running&&selected.length===count);
 },[target?.id,target?.target,selectionKey,count,running?.id]);
 useEffect(()=>{if(!target||running)return;const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')callbacks.current.onCancel();};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[!!target,running?.id]);
 useLayoutEffect(()=>{
  if(targetSeat===undefined||(!target&&!running)){setMeasurements(null);return;}
  const measure=()=>{
   const hand=readRect(document.querySelector('[data-hand-area]'))||{left:12,top:innerHeight*.75,width:innerWidth-24,height:innerHeight*.2};
   const opponent=readRect(document.querySelector(`.opponents [data-seat="${targetSeat}"] .portrait`))||{left:innerWidth/2-18,top:80,width:36,height:36};
   for(const tile of selected){const source=readRect(document.querySelector(`[data-hand="${tile.id}"] .tile`));if(source)sources.current[tile.id]=source;}
   const destinations:Record<number,ExchangeRect>={};
   for(const tile of running?.incoming||[]){const destination=readRect(document.querySelector(`[data-hand="${tile.id}"] .tile`));if(destination)destinations[tile.id]=destination;}
   const tiles=Array.from(document.querySelectorAll('[data-hand] .tile')).filter(tile=>getComputedStyle(tile.closest('[data-hand]')!).visibility!=='hidden').map(tile=>readRect(tile)!).filter(Boolean);
   setMeasurements({tiles,layout:exchangeStageLayout(innerWidth,innerHeight,hand,count),hand,opponent,sources:{...sources.current},destinations});
  };
  measure();window.addEventListener('resize',measure);window.addEventListener('scroll',measure,true);
  const hand=document.querySelector('[data-hand-area]'),observer=new ResizeObserver(measure);if(hand)observer.observe(hand);
  return()=>{observer.disconnect();window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true);};
 },[target?.id,targetSeat,selectionKey,count,running?.id]);
 const previewGestures=useTileGestures({kind:'hand',enabled:!!target&&!running,rotation:0,contextKey:`${runId}:${target?.id}:${targetSeat}:${selectionKey}`,tapContextKey:`${runId}:${target?.id}:${targetSeat}`,canStart:()=>false,canCommit:()=>false,canDoubleCommit:()=>selected.length===count,onTap:()=>{},onCommit:()=>{},onDoubleCommit:()=>callbacks.current.onConfirm(selected.map(tile=>tile.id))});
 if((!target&&!running)||!measurements||typeof document==='undefined')return null;
 const {layout,hand,opponent}=measurements,{cardWidth,cardHeight}=layout;
 const holes=measurements.tiles.map(rect=>{const left=Math.max(hand.left,rect.left),top=Math.max(hand.top,rect.top),right=Math.min(hand.left+hand.width,rect.left+rect.width),bottom=Math.min(hand.top+hand.height,rect.top+rect.height);return right>left&&bottom>top?`,${left}px ${top}px,${left}px ${bottom}px,${right}px ${bottom}px,${right}px ${top}px,${left}px ${top}px,0 0`:'';}).join('');
 const hole=`polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0${holes})`;
 const avatarDestination=(index:number)=>{const width=Math.min(cardWidth,opponent.width*.8);return {left:opponent.left+opponent.width/2-width/2+index*4,top:opponent.top+opponent.height/2-width/.76/2,width,height:width/.76};};
 const style=(index:number,source:ExchangeRect,destination:ExchangeRect):CSSProperties=>({width:cardWidth,height:cardHeight,'--sx':`${source.left}px`,'--sy':`${source.top}px`,'--ssx':source.width/cardWidth,'--ssy':source.height/cardHeight,'--ox':`${layout.own[index].x}px`,'--oy':`${layout.own[index].y}px`,'--px':`${layout.opponent[index].x}px`,'--py':`${layout.opponent[index].y}px`,'--dx':`${destination.left}px`,'--dy':`${destination.top}px`,'--dsx':destination.width/cardWidth,'--dsy':destination.height/cardHeight} as CSSProperties);
 const outgoing=running?.outgoing||selected,opponentArrives=!!running;
 const describe=(tiles:Tile[])=>tiles.map(tile=>`${suits[tile.s]} ${tile.n}`).join(' · ');
 return createPortal(<div className={`rpg-exchange-stage ${game.rpgTest?'rpg-test-mode':''}`} data-phase={running?'swapping':'selecting'}><div className="exchange-focus-shade" style={{clipPath:hole}} onClick={()=>!running&&callbacks.current.onCancel()}/><div className="exchange-stage-emblem" style={{left:layout.centerX,top:layout.emblemY}}><img src={itemImage(running?.itemId||target!.id)} alt=""/></div><div className="exchange-stage-label" style={{left:layout.centerX,top:layout.opponent[0].y-22}}>{game.players[targetSeat!].name}</div><div className="exchange-stage-label" style={{left:layout.centerX,top:layout.own[0].y-22}}>내 패</div>
  {!running&&Array.from({length:count},(_,index)=>selected[index]?null:<span key={`slot-${index}`} className="exchange-stage-placeholder" style={{left:layout.own[index].x,top:layout.own[index].y,width:cardWidth,height:cardHeight}}>선택</span>)}
  {outgoing.map((tile,index)=>{const source=measurements.sources[tile.id]||hand;return <button type="button" key={`${running?.id||'pick'}:${tile.id}`} className={`exchange-stage-tile ${running?'stage-post-outgoing':'stage-own-approach'}`} style={style(index,source,avatarDestination(index))} {...previewGestures.bind(tile.id)} onKeyDown={event=>{if(!running&&selected.length===count&&event.key==='Enter'){event.preventDefault();callbacks.current.onConfirm(selected.map(tile=>tile.id));}}} disabled={!!running} aria-label={`선택한 ${suits[tile.s]} ${tile.n}${running?' 보내는 중':' · 두 번 눌러 교환'}`}><TileFace tile={tile}/></button>;})}
  {opponentArrives&&Array.from({length:count},(_,index)=>{const tile=running?.incoming[index],destination=tile&&measurements.destinations[tile.id]||{left:hand.left+hand.width/2-cardWidth/2+index*(cardWidth+6),top:hand.top,width:cardWidth,height:cardHeight};return <span key={`${running?.id||'opponent'}:${index}`} className={`exchange-stage-tile ${running?'stage-post-incoming':'stage-opponent-approach'}`} style={style(index,avatarDestination(index),destination)}>{tile?<span className="exchange-stage-flipper"><span className="exchange-stage-back"><TileBack/></span><span className="exchange-stage-front"><TileFace tile={tile}/></span></span>:<TileBack/>}</span>;})}
  <div className="exchange-stage-controls" style={{left:layout.centerX,top:layout.controlsY}}>{running?<div className="exchange-stage-receipt" role="status" aria-live="polite"><strong>패 교환</strong><small>보낸 패: {describe(running.outgoing)}<br/>받은 패: {describe(running.incoming)}</small></div>:<><strong>{selected.length}/{count}장 · 한 번 눌러 미리보기, 두 번 눌러 교환</strong><small>바깥을 누르면 취소</small>{error&&<small className="exchange-stage-error">{error}</small>}</>}</div>
 </div>,document.body);
}
