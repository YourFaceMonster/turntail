"use client";
import {rpgSynergies} from '../../lib/rpg-phase-one.ts';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ALL_GAME_RELICS as RPG_RELICS,relicImage} from '../../lib/item-battle-relics.ts';
import type {RpgRun} from '../../lib/rpg.ts';
import {ALL_RELIC_HINTS as RPG_RELIC_HINTS,type RpgRelicActivation} from '../../lib/rpg-relic-feedback.ts';

export function RpgEquippedRelics({run}:{run:RpgRun}){
 const equipped=run.equipped,latest=run.relicActivations?.at(-1)?.seq||0;
 const [selected,setSelected]=useState<string|null>(null),trayRef=useRef<HTMLDivElement>(null);
 const [triggered,setTriggered]=useState<RpgRelicActivation[]>([]),seen=useRef({id:run.id,seq:latest});
 const [detailPosition,setDetailPosition]=useState({left:12,top:60});
 useLayoutEffect(()=>{if(!selected)return;const measure=()=>{const r=trayRef.current?.getBoundingClientRect();if(r)setDetailPosition({left:Math.max(12,Math.min(innerWidth-272,r.left-266)),top:Math.max(12,Math.min(innerHeight-190,r.top))});};measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);},[selected]);
 const active=equipped.includes(selected||'')?RPG_RELICS.find(relic=>relic.id===selected):undefined;
 useEffect(()=>{
  if(seen.current.id!==run.id){seen.current={id:run.id,seq:latest};setTriggered([]);setSelected(null);return;}
  const fresh=(run.relicActivations||[]).filter(event=>event.seq>seen.current.seq);
  seen.current.seq=latest;if(!fresh.length)return;
  const delay=Math.max(0,Math.min(...fresh.map(event=>event.at))-Date.now()),start=setTimeout(()=>setTriggered(fresh),delay),timer=setTimeout(()=>setTriggered([]),delay+3200);return()=>{clearTimeout(start);clearTimeout(timer);};
 },[run.id,latest]);
 useEffect(()=>{if(!selected)return;const outside=(event:PointerEvent)=>{if(!trayRef.current?.contains(event.target as Node)&&!(event.target as Element)?.closest?.('#rpg-equipped-relic-detail'))setSelected(null);};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setSelected(null);};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[selected]);
 return <div ref={trayRef} className="rpg-equipped-relics" role="group" aria-label="내 장착 유물">
  <header className="rpg-relic-tray-heading"><strong>장착 유물</strong><small>자동 적용</small></header>
  <div className="rpg-relic-slots">{Array.from({length:run.phaseOne?6:3},(_,index)=>{const id=equipped[index],relic=RPG_RELICS.find(item=>item.id===id),hint=RPG_RELIC_HINTS[id],flash=triggered.findLast(event=>event.relicId===id);return id?<button type="button" className={`rpg-relic-slot ${flash?'is-triggered':''}`} data-grade={relic?.grade||'common'} key={id} onClick={()=>setSelected(current=>current===id?null:id)} aria-label={`장착 유물 ${relic?.name||id} 효과 보기`} aria-expanded={active?.id===id} aria-controls={active?.id===id?'rpg-equipped-relic-detail':undefined} aria-haspopup="dialog"><span className="rpg-relic-slot-frame" key={`${id}:${flash?.seq||0}`}><img src={relicImage(id)} alt=""/></span><span className="rpg-relic-slot-condition">{hint?.label||'장착 효과'}</span><strong className="rpg-relic-slot-bonus">{hint?.bonus?.replace(/^피해 \+/,'추가 피해 +')||relic?.effect}</strong></button>:<span className="rpg-relic-slot is-empty" key={`empty-${index}`} aria-label="빈 유물 자리"><span className="rpg-relic-slot-frame" aria-hidden="true">◇</span><span className="rpg-relic-slot-condition">빈 자리</span></span>;})}</div>
  {!!rpgSynergies(run).length&&<small className="rpg-synergy">조합 · {rpgSynergies(run).map(effect=>effect.name).join(" · ")}</small>}
  {active&&typeof document!=='undefined'&&createPortal(<aside style={detailPosition} id="rpg-equipped-relic-detail" className="rpg-relic-tooltip" role="dialog" aria-label={`${active.name} 효과`}><img src={relicImage(active.id)} alt=""/><div><strong>{active.name}</strong><p>{active.effect}</p><small>{RPG_RELIC_HINTS[active.id]?.condition}</small></div><button type="button" aria-label="유물 설명 닫기" onClick={()=>setSelected(null)}>×</button></aside>,document.body)}
  {!!triggered.length&&typeof document!=='undefined'&&createPortal(<div className="rpg-relic-activation-notices" role="status" aria-live="polite" aria-atomic="true">{triggered.map(event=>{const relic=RPG_RELICS.find(item=>item.id===event.relicId);return <div className="rpg-relic-activation-notice" key={event.seq}><img src={relicImage(event.relicId)} alt=""/><span><small>{relic?.name||event.relicId} 발동</small><strong>{event.message}</strong></span></div>;})}</div>,document.body)}
 </div>;
}
