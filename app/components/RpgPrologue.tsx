'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import SceneMotion from './SceneMotion';
import {createPortal} from 'react-dom';
import {FIRST_PROLOGUE,PrologueClock,type PrologueCut} from '../../lib/rpg-prologue';
import {prologueAmbience} from '../../lib/rpg-prologue-audio';
import {prologueArt,prologueSceneSources,prologueSceneGroup} from '../../lib/rpg-prologue-art';

export function TwoCrowns(){return <svg viewBox="0 0 100 70" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"><path d="M12 21l13 10 10-19 11 19 14-10-5 29H17zM17 56h38"/><path d="M40 31l13 10 10-19 11 19 14-10-5 29H45zM45 66h38"/></g></svg>;}
export function StoryTile({back=false}:{back?:boolean}){return <div className={`prologue-tile ${back?'is-back':''}`} aria-label={back?'겹친 두 왕관이 새겨진 낡은 패 뒷면':'낡은 빨간 숫자 2 패'}><div className="prologue-tile-front"><span>2</span><i>☾</i></div><div className="prologue-tile-back"><TwoCrowns/></div><b className="prologue-tile-scratch"/></div>;}
export function ProloguePicture({cut,duration=cut.duration,speaker=''}:{cut:PrologueCut,duration?:number,speaker?:string}){
 const indoor=['room','table','card'].includes(cut.scene),art=prologueArt(cut);
 return <div className={`prologue-picture scene-${cut.scene}`} data-location={cut.location||undefined} data-speaking={!!speaker} style={{'--scene-duration':`${duration}ms`} as CSSProperties} aria-hidden="true">
  {speaker&&<SceneMotion kind="story" speaker={speaker} scene={cut.id}/>}
  {art&&<div className="prologue-canvas"><div className="prologue-camera" style={cut.location?{transformOrigin:cut.focus}:undefined}>
   <picture><source media="(max-aspect-ratio:1/1)" srcSet={art.portrait}/><img style={cut.focus?{objectPosition:cut.focus}:undefined} className="prologue-scene-art" src={art.landscape} alt="" decoding="async"/></picture>
  </div></div>}
  {indoor&&<div className="prologue-firelight"/>}
  {['snow','inn'].includes(cut.scene)&&Array.from({length:24},(_,i)=><i key={i} className="prologue-snow" style={{'--x':`${(i*37)%100}%`,'--delay':`${-i*.73}s`,'--drift':`${12+i%5*7}px`} as CSSProperties}/>)}
  <div className="prologue-shade"/>
 </div>;
}
type Props={enter:()=>void,context?:AudioContext|null,music?:boolean,sound?:boolean,musicVolume?:number,cuts?:readonly PrologueCut[],label?:string,skipLabel?:string};
export default function RpgPrologue({enter,context,music=true,sound=true,musicVolume=40,cuts=FIRST_PROLOGUE,label='턴테일 프롤로그',skipLabel='건너뛰기'}:Props){
 const finish=useRef(enter);
 useEffect(()=>{finish.current=enter;},[enter]);
 const clock=useRef<PrologueClock|null>(null);
 const [index,setIndex]=useState(0),[visible,setVisible]=useState(true),[artReady,setArtReady]=useState(false);
 const root=useRef<HTMLElement>(null),lastTap=useRef(-Infinity),cut=cuts[index],sceneGroup=prologueSceneGroup(cuts,index);
 useEffect(()=>{
  const player=clock.current??new PrologueClock(cuts,()=>finish.current());clock.current=player;
  const previous=document.activeElement,previousOverflow=document.body.style.overflow,previousPriority=document.body.style.getPropertyPriority('overflow');document.body.style.setProperty('overflow','hidden','important');root.current?.focus();
  let disposed=false,loading=true,loadId=0;
  const orientation=window.matchMedia('(max-aspect-ratio:1/1)');
  const visibility=()=>{const active=!document.hidden;player.pause(!active||loading);setVisible(active);};
  const hide=()=>{player.pause(true);setVisible(false);};visibility();
  let frame=0;const animate=(now:number)=>{player.tick(now);setIndex(player.index);if(!player.completed)frame=requestAnimationFrame(animate);};
  const loadArt=()=>{const current=++loadId;loading=true;setArtReady(false);visibility();void Promise.all(prologueSceneSources(cuts,orientation.matches).map(src=>new Promise<void>(resolve=>{const image=new Image();setTimeout(resolve,8000);image.onload=()=>{void image.decode().catch(()=>{}).then(()=>resolve());};image.onerror=()=>resolve();image.src=src;}))).then(()=>{if(disposed||current!==loadId)return;loading=false;setArtReady(true);visibility();cancelAnimationFrame(frame);frame=requestAnimationFrame(animate);});};
  loadArt();orientation.addEventListener('change',loadArt);
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',hide);window.addEventListener('pageshow',visibility);
  return()=>{disposed=true;cancelAnimationFrame(frame);document.body.style.setProperty('overflow',previousOverflow,previousPriority);orientation.removeEventListener('change',loadArt);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',visibility);if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true});};
 },[cuts]);
 useEffect(()=>{if(!artReady||!visible||!context||context.state!=='running')return;return prologueAmbience(context,cut,music,musicVolume,sound);},[context,cut,visible,artReady,music,musicVolume,sound]);
 function advance(){if(!artReady)return;const now=performance.now();if(now-lastTap.current<350)return;lastTap.current=now;clock.current!.next();setIndex(clock.current!.index);}
 if(typeof document==='undefined')return null;
 return createPortal(<section ref={root} tabIndex={-1} className="rpg-prologue" role="dialog" aria-modal="true" aria-label={label} data-cut={cut.id} data-paused={!visible} onKeyDown={event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();clock.current!.complete();}if(event.target===event.currentTarget&&(event.key===' '||event.key==='Enter')){event.preventDefault();advance();}if(event.key==='Tab'){event.preventDefault();root.current?.querySelector<HTMLButtonElement>('.prologue-skip')?.focus();}}}>
  {artReady?<div className="prologue-tap-surface" onClick={advance}><div className="prologue-cut" data-scene={cut.scene} style={{'--cut-duration':`${cut.duration}ms`} as CSSProperties}><ProloguePicture key={sceneGroup.key} cut={cuts[sceneGroup.start]} duration={sceneGroup.duration} speaker={cut.speaker}/><div key={cut.id} className="prologue-caption" aria-live="polite">{cut.speaker&&<small>{cut.speaker}</small>}<p>{cut.line}</p>{cuts===FIRST_PROLOGUE&&cut.scene==='gate'&&<small>시작 유물 · 금이 간 심장</small>}</div></div></div>:<p className="prologue-loading" role="status">이야기를 펼치는 중…</p>}
  <button className="prologue-skip" onClick={()=>clock.current!.complete()}>{skipLabel} <span aria-hidden="true">↗</span></button><span className="prologue-touch-hint">화면을 누르면 다음 장면</span>
  {artReady&&cut.location&&<div className="prologue-location"><small>현재 위치</small><strong>{cut.location}</strong></div>}
 </section>,document.body);
}
