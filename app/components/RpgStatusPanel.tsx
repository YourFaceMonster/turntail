"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {RPG_RELICS} from '../../lib/rpg.ts';

type View=ReturnType<typeof view>;

export function RpgStatusPanel({game,seat,close,openProfile}:{game:View,seat:number,close:()=>void,openProfile?:()=>void}){
 const run=game.rpgRun;
 const panelRef=useRef<HTMLElement>(null);
 const [position,setPosition]=useState<CSSProperties>();
 useLayoutEffect(()=>{
  if(seat===game.me){setPosition(undefined);return;}
  const anchor=document.querySelector<HTMLElement>(`.rpg-mode .opponents [data-seat="${seat}"] .seat-card`);
  if(!anchor)return;
  const place=()=>{const bounds=anchor.getBoundingClientRect(),width=Math.min(360,bounds.width),rightSide=bounds.left+bounds.width/2>=innerWidth/2;setPosition({left:rightSide?bounds.right-width:bounds.left,top:bounds.bottom+4,right:'auto',width,visibility:bounds.bottom<0||bounds.top>innerHeight?'hidden':'visible'});};
  place();const observer=new ResizeObserver(place);observer.observe(anchor);window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
  return()=>{observer.disconnect();window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);};
 },[seat,game.me]);
 useEffect(()=>{const outside=(event:PointerEvent)=>{if(!panelRef.current?.contains(event.target as Node))close();};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[close]);
 if(!run||typeof document==='undefined')return null;
 const mine=seat===game.me,player=game.players[seat],equipped=mine?run.equipped:[];
 return createPortal(<div className="rpg-status-popover-layer"><section ref={panelRef} className={`modal rpg-status-panel ${mine?'is-own':'is-opponent'}`} style={mine?undefined:position||{visibility:'hidden'}} role="dialog" aria-label={`${player.name} RPG 상태`}>
  <header className="rpg-status-heading"><h2>{player.name}</h2><span className="rpg-status-hp">HP <b>{run.hp[seat]}</b><small>/100</small></span><button className="close" aria-label="상태창 닫기" onClick={close}>×</button></header>
  {mine&&<div className="rpg-status-resources"><span>운명 <b>{run.fate}</b></span><span>주화 <b>{run.coins}</b></span><span>포인트 <b>{run.points}</b></span></div>}
  <div className="rpg-status-relics"><span className="rpg-status-relic-label">장착 유물</span>{equipped.length?<div className="rpg-status-relic-items">{equipped.map(id=>{const relic=RPG_RELICS.find(item=>item.id===id);return <div key={id}><img src={`/rpg-items-v1/relics/${id}.webp`} alt=""/><strong>{relic?.name||id}</strong><small>{relic?.effect}</small></div>;})}</div>:<span className="rpg-status-empty">없음</span>}</div>
  {mine&&openProfile&&<button className="text-btn rpg-profile-edit" onClick={openProfile}>프로필 편집</button>}
 </section></div>,document.body);
}
