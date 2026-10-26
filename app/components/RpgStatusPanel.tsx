"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {RPG_RELICS,RPG_CONSUMABLES} from '../../lib/rpg.ts';
import {RPG_RELIC_HINTS} from '../../lib/rpg-relic-feedback.ts';

type View=ReturnType<typeof view>;

export function RpgStatusPanel({game,seat,close}:{game:View,seat:number,close:()=>void}){
 const run=game.rpgRun;
 const panelRef=useRef<HTMLElement>(null);
 const [position,setPosition]=useState<CSSProperties>();
 useLayoutEffect(()=>{
  const mine=seat===game.me;
  const anchor=document.querySelector<HTMLElement>(mine?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${seat}"] .seat-card`);
  if(!anchor)return;
  const place=()=>{const bounds=anchor.getBoundingClientRect(),width=Math.min(mine?260:360,bounds.width),rightSide=!mine&&bounds.left+bounds.width/2>=innerWidth/2;setPosition({left:rightSide?bounds.right-width:bounds.left,top:mine?Math.max(8,bounds.top-(panelRef.current?.offsetHeight||120)-6):bounds.bottom+4,right:'auto',width,visibility:bounds.bottom<0||bounds.top>innerHeight?'hidden':'visible'});};
  place();const observer=new ResizeObserver(place);observer.observe(anchor);if(panelRef.current)observer.observe(panelRef.current);window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
  return()=>{observer.disconnect();window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);};
 },[seat,game.me]);
 useEffect(()=>{const outside=(event:PointerEvent)=>{if(!panelRef.current?.contains(event.target as Node))close();};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[close]);
 if(!run||typeof document==='undefined')return null;
 const inventory=seat===game.me?run.consumables:run.enemyConsumables?.[seat]||[];
 const mine=seat===game.me,player=game.players[seat],equipped=mine?run.equipped:[];
 return createPortal(<div className="rpg-status-popover-layer"><section ref={panelRef} className={`modal rpg-status-panel ${mine?'is-own':'is-opponent'}`} style={position||{visibility:'hidden'}} role="dialog" aria-label={`${player.name} RPG 상태`}>
  <header className="rpg-status-heading"><h2>{player.name}</h2><span className="rpg-status-hp">HP <b>{run.hp[seat]}</b><small>/100</small></span><button className="close" aria-label="상태창 닫기" onClick={close}>×</button></header>
  <p className="rpg-status-item-summary">{mine?`아이템 ${inventory.length}개${run.itemGuards?.[seat]?' · 비밀 방패 대기':''}`:'아이템과 방어 준비는 비공개'}</p>{mine&&<p className="rpg-status-item-names">{[...new Set(inventory)].map(id=>`${RPG_CONSUMABLES.find(item=>item.id===id)?.name||id} ×${inventory.filter(entry=>entry===id).length}`).join(' · ')}</p>}
  <div className="rpg-status-relics"><span className="rpg-status-relic-label">장착 유물</span>{equipped.length?<div className="rpg-status-relic-items">{equipped.map(id=>{const relic=RPG_RELICS.find(item=>item.id===id),hint=RPG_RELIC_HINTS[id];return <div key={id}><img src={`/rpg-items-v1/relics/${id}.webp`} alt=""/><strong>{relic?.name||id}</strong><small>{hint?`${hint.label} ${hint.bonus}`:relic?.effect}</small></div>;})}</div>:<span className="rpg-status-empty">없음</span>}</div>
 </section></div>,document.body);
}
