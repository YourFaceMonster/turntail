"use client";
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {guidedSteps,type GuidedContext} from '../../lib/guided-match';
import {tr} from '../../lib/i18n/index.ts';
import './guided-overlay.css';

/** Guided practice duel (2026-11-24): one highlighted control at a time on the real table, everything else
 *  locked while a step is shown, a pointing finger on the target, and a box with what to do. Steps that wait
 *  for the opponent hide the box and unlock nothing (the opponent plays by itself). */
export default function GuidedOverlay({ctx,onExit,exitLabel}:{ctx:GuidedContext,onExit:(completed:boolean)=>void,exitLabel:string}){
 const steps=useMemo(()=>guidedSteps(),[]);
 const [index,setIndex]=useState(0);
 const step=steps[index];
 const waiting=!!step?.waitFor&&!step.waitFor(ctx);
 const ctxRef=useRef(ctx);ctxRef.current=ctx;
 // A step whose goal is already met moves on by itself (also covers a double-tap that picks and draws at once).
 useEffect(()=>{if(step&&!waiting&&step.until?.(ctx))setIndex(i=>i+1);});
 const shown=!!step&&!waiting;
 const spot=useRef<HTMLDivElement>(null),box=useRef<HTMLDivElement>(null),finger=useRef<HTMLDivElement>(null);
 useEffect(()=>{document.body.classList.toggle('guided-lock',shown&&!step?.final);return()=>document.body.classList.remove('guided-lock');},[shown,step]);
 // Follow the targets every frame: the table animates and the hand re-flows as tiles leave.
 useLayoutEffect(()=>{
  if(!shown||!step)return;let frame=0;
  const place=()=>{
   frame=requestAnimationFrame(place);
   const targets=(step.targets||[]).flatMap(sel=>[...document.querySelectorAll<HTMLElement>(sel)]);
   const allow=[...targets,...(step.allow||[]).flatMap(sel=>[...document.querySelectorAll<HTMLElement>(sel)])];
   for(const el of document.querySelectorAll('.guided-allow'))if(!allow.includes(el as HTMLElement))el.classList.remove('guided-allow');
   for(const el of allow)el.classList.add('guided-allow');
   const s=spot.current,b=box.current,f=finger.current;if(!s||!b||!f)return;
   const W=innerWidth,H=innerHeight,bw=Math.min(420,W-24);b.style.width=bw+'px';
   const rects=targets.map(t=>t.getBoundingClientRect()).filter(r=>r.width&&r.height);
   if(!rects.length){s.hidden=true;f.hidden=true;b.style.left=(W-bw)/2+'px';b.style.top=Math.max(16,H*.3)+'px';return;}
   const x0=Math.min(...rects.map(r=>r.left))-8,y0=Math.min(...rects.map(r=>r.top))-8,x1=Math.max(...rects.map(r=>r.right))+8,y1=Math.max(...rects.map(r=>r.bottom))+8;
   Object.assign(s.style,{left:x0+'px',top:y0+'px',width:x1-x0+'px',height:y1-y0+'px'});s.hidden=false;
   const bh=b.offsetHeight,below=y1+14,above=y0-14-bh;
   b.style.top=(below+bh<H-8?below:Math.max(8,above))+'px';
   b.style.left=Math.max(12,Math.min(W-bw-12,(x0+x1)/2-bw/2))+'px';
   // The finger points only where a tap is needed (not at plain "look here" steps).
   const tap=!step.button;f.hidden=!tap;
   // 2026-11-25: the painted hand (ui/kit/pointer-hand) points down, so its tip rests on the target's top edge.
   if(tap){const r=rects[0];f.style.left=r.left+r.width/2+'px';f.style.top=r.top+4+'px';}
  };
  place();
  return()=>{cancelAnimationFrame(frame);for(const el of document.querySelectorAll('.guided-allow'))el.classList.remove('guided-allow');};
 },[shown,step]);
 if(!shown)return null;
 return <div className="guided-layer" aria-live="polite">
  <div className="guided-spot" ref={spot} hidden/>
  {!(step.targets?.length)&&<div className="guided-dim"/>}
  <div className="guided-finger" ref={finger} hidden aria-hidden="true"><img src="/ui/kit/pointer-hand-v1.webp" alt=""/></div>
  <div className={`guided-box ${step.final?'is-final':''}`} ref={box} role="dialog" aria-label={tr('연습 판 안내')}>
   <small className="guided-progress">{tr('연습 판')} · {Math.min(index+1,steps.length)}/{steps.length}</small>
   <p dangerouslySetInnerHTML={{__html:step.text(ctx)}}/>
   <div className="guided-actions">
    {step.final?<button type="button" className="primary" onClick={()=>onExit(true)}>{exitLabel}</button>
     :<>{step.button&&<button type="button" className="primary" onClick={()=>setIndex(i=>i+1)}>{step.button}</button>}<button type="button" className="guided-skip" onClick={()=>onExit(false)}>{tr('연습 그만하기')}</button></>}
   </div>
  </div>
 </div>;
}
