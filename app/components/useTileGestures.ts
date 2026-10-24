'use client';
import {useEffect,useRef,type PointerEvent,type MouseEvent,type DragEvent} from 'react';
import {tableGestureDelta,tileSwipeReady,isTileDoubleTap,type TileGestureKind,type TileTap} from '../../lib/tile-gestures';
type Config={kind:TileGestureKind,enabled:boolean,rotation:number,contextKey:string,canStart:(id:number)=>boolean,canCommit:(id:number)=>boolean,onTap:(id:number)=>void,onCommit:(id:number)=>void};
type Drag={id:number,pointer:number,x:number,y:number,at:number,height:number,moved:boolean,context:string,button:HTMLButtonElement,tiles:HTMLElement[]};
/** One pointer owns a gesture; click and swipe share the existing guarded actions. */
export default function useTileGestures(config:Config){
 const latest=useRef(config);latest.current=config;
 const drag=useRef<Drag|null>(null),tap=useRef<TileTap|null>(null),blocked=useRef<{id:number,until:number}|null>(null);
 function clear(){const d=drag.current;drag.current=null;if(!d)return;for(const tile of d.tiles){delete tile.dataset.tileDragging;delete tile.dataset.swipeReady;tile.style.removeProperty('--gesture-x');tile.style.removeProperty('--gesture-y');}try{if(d.button.hasPointerCapture(d.pointer))d.button.releasePointerCapture(d.pointer);}catch{}}
 function cancel(){const d=drag.current;if(d)blocked.current={id:d.id,until:Date.now()+500};tap.current=null;clear();}
 useEffect(()=>{cancel();},[config.contextKey,config.enabled]);
 useEffect(()=>{const hidden=()=>{if(document.hidden)cancel();},extra=(e:globalThis.PointerEvent)=>{if(drag.current&&e.pointerId!==drag.current.pointer)cancel();};window.addEventListener('blur',cancel);window.addEventListener('pagehide',cancel);window.addEventListener('pointerdown',extra,true);document.addEventListener('visibilitychange',hidden);return()=>{window.removeEventListener('blur',cancel);window.removeEventListener('pagehide',cancel);window.removeEventListener('pointerdown',extra,true);document.removeEventListener('visibilitychange',hidden);clear();};},[]);
 return {bind:(id:number)=>({
  onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>{
   if(!e.isPrimary){cancel();return;}if(e.button!==0)return;
   const c=latest.current;blocked.current=null;
   if(!c.enabled||!c.canStart(id)||e.currentTarget.disabled)return;
   const button=e.currentTarget,rect=button.getBoundingClientRect();
   clear();const tiles=c.kind==='hand'?Array.from(button.parentElement?.querySelectorAll<HTMLElement>('.hand-tile.selected')||[]):[button];
   drag.current={id,pointer:e.pointerId,x:e.clientX,y:e.clientY,at:e.timeStamp,height:c.rotation?rect.width:rect.height,moved:false,context:c.contextKey,button,tiles};
   try{button.setPointerCapture(e.pointerId);}catch{}
  },
  onPointerMove:(e:PointerEvent<HTMLButtonElement>)=>{
   const d=drag.current;if(!d||d.pointer!==e.pointerId)return;
   const c=latest.current;if(!c.enabled||c.contextKey!==d.context){cancel();return;}const delta=tableGestureDelta(d,{x:e.clientX,y:e.clientY},c.rotation);
   if(Math.hypot(delta.x,delta.y)<9&&!d.moved)return;
   d.moved=true;tap.current=null;e.preventDefault();
   const ready=c.canCommit(id)&&tileSwipeReady(c.kind,delta,d.height,e.timeStamp-d.at);
   for(const tile of d.tiles){tile.dataset.tileDragging='true';tile.dataset.swipeReady=String(ready);tile.style.setProperty('--gesture-x',`${Math.max(-40,Math.min(40,delta.x*.25))}px`);tile.style.setProperty('--gesture-y',`${Math.max(-120,Math.min(120,delta.y))}px`);}
  },
  onPointerUp:(e:PointerEvent<HTMLButtonElement>)=>{
   const d=drag.current;if(!d||d.pointer!==e.pointerId)return;
   const c=latest.current,delta=tableGestureDelta(d,{x:e.clientX,y:e.clientY},c.rotation),moved=d.moved||Math.hypot(delta.x,delta.y)>=9;
   if(moved){blocked.current={id,until:Date.now()+500};tap.current=null;e.preventDefault();}
   const commit=moved&&c.enabled&&c.contextKey===d.context&&c.canCommit(id)&&tileSwipeReady(c.kind,delta,d.height,e.timeStamp-d.at);
   clear();if(commit)c.onCommit(id);
  },
  onPointerCancel:cancel,
  onLostPointerCapture:()=>{if(drag.current)cancel();},
  onClick:(e:MouseEvent<HTMLButtonElement>)=>{
   if(blocked.current?.id===id&&Date.now()<blocked.current.until){e.preventDefault();e.stopPropagation();blocked.current=null;return;}
   const c=latest.current;if(!c.enabled)return;
   const next={id,at:e.timeStamp,x:e.clientX,y:e.clientY};
   if(c.kind==='floor'&&e.detail>0&&isTileDoubleTap(tap.current,next)&&c.canCommit(id)){tap.current=null;c.onCommit(id);return;}
   tap.current=e.detail>0?next:null;c.onTap(id);
  },
  onContextMenu:(e:MouseEvent<HTMLButtonElement>)=>{if(drag.current)e.preventDefault();},
  onDragStart:(e:DragEvent<HTMLButtonElement>)=>e.preventDefault()
 })};
}
