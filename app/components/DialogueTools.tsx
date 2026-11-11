'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import DialogueText from './DialogueText';
import {dialogueAutoChoice,setDialogueAuto,subscribeDialogueAuto} from '../../lib/dialogue-prefs';
import './dialogue-tools.css';

/** Auto-advance on/off, remembered across cutscenes. `fallback` is the screen's own default. */
export function useDialogueAuto(fallback:boolean):[boolean,(value:boolean)=>void]{
 const [auto,setAuto]=useState(fallback);
 useEffect(()=>{const update=()=>setAuto(dialogueAutoChoice()??fallback);update();return subscribeDialogueAuto(update);},[fallback]);
 return [auto,setDialogueAuto];
}

export type BacklogLine={speaker?:string,text:string};
/** Small buttons: auto-advance toggle and the "지난 대사" log. Clicks never reach the tap-to-advance surface. */
export function DialogueTools({auto,setAuto,lines,onOpenChange,className=''}:{auto:boolean,setAuto:(value:boolean)=>void,lines:readonly BacklogLine[],onOpenChange?:(open:boolean)=>void,className?:string}){
 const [open,setOpen]=useState(false);
 const toggle=(value:boolean)=>{setOpen(value);onOpenChange?.(value);};
 return <>
  <div className={`dialogue-tools ${className}`} onClick={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>
   <button type="button" aria-pressed={auto} onClick={()=>setAuto(!auto)} title={auto?'자동 넘김 끄기':'자동 넘김 켜기'}>{auto?'자동 ▶':'자동 ■'}</button>
   <button type="button" onClick={()=>toggle(true)} disabled={!lines.length}>지난 대사</button>
  </div>
  {open&&<DialogueBacklog lines={lines} close={()=>toggle(false)}/>}
 </>;
}

function DialogueBacklog({lines,close}:{lines:readonly BacklogLine[],close:()=>void}){
 const panel=useRef<HTMLElement>(null),list=useRef<HTMLOListElement>(null);
 useEffect(()=>{const previous=document.activeElement;panel.current?.focus();list.current?.lastElementChild?.scrollIntoView({block:'end'});return()=>{if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true});};},[]);
 // Portal to <body>: the dialogue boxes clip overflow and some cutscene layers are transformed, which would trap a fixed overlay.
 if(typeof document==='undefined')return null;
 return createPortal(<div className="dialogue-backlog-overlay" onClick={event=>{event.stopPropagation();close();}} onPointerDown={event=>event.stopPropagation()}>
  <section ref={panel} tabIndex={-1} className="dialogue-backlog" role="dialog" aria-modal="true" aria-label="지난 대사" onClick={event=>event.stopPropagation()} onKeyDown={event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();close();}}}>
   <header><strong>지난 대사</strong><button type="button" onClick={close} aria-label="지난 대사 닫기">×</button></header>
   <ol ref={list}>{lines.map((line,i)=><li key={i}>{line.speaker&&<small>{line.speaker}</small>}<p><DialogueText text={line.text}/></p></li>)}</ol>
  </section>
 </div>,document.body);
}
