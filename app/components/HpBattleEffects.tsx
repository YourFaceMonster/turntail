"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {hpSkillUseText} from '../../lib/hp-item-skills.ts';
import {isBattleItemMode,type HpBattleEvent} from '../../lib/hp-item-battle.ts';
export default function HpBattleEffects({game,onHit}:{game:ReturnType<typeof view>,onHit:()=>void}){
 const event=game.hpItemMatch?.lastBattle,seen=useRef(event?.id),callback=useRef(onHit);callback.current=onHit;
 const [shown,setShown]=useState<HpBattleEvent|null>(null);
 useEffect(()=>{
  if(!isBattleItemMode(game)||!event||event.round!==game.round){setShown(null);return;}if(event.id===seen.current)return;seen.current=event.id;setShown(event);callback.current();
  const anchors=game.players.flatMap((_,seat)=>event.hpAfter[seat]<event.hpBefore[seat]?[document.querySelector<HTMLElement>(seat===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${seat}"] .seat-card`)]:[]).filter((anchor):anchor is HTMLElement=>!!anchor);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animations=reduced?[]:anchors.map(anchor=>anchor.animate([{translate:'0px',filter:'brightness(1)'},{translate:'-4px',filter:'brightness(1.5)'},{translate:'3px'},{translate:'0px',filter:'brightness(1)'}],{duration:350,easing:'ease-out'}));
  const timer=setTimeout(()=>setShown(null),1150);return()=>{clearTimeout(timer);animations.forEach(animation=>animation.cancel());};
 },[event?.id,game.round,game.me]);
 if(!shown)return null;
 const anchor=document.querySelector<HTMLElement>('.trick-area')?.getBoundingClientRect();
 return <>{createPortal(<div className="battle-win-notice" style={{left:anchor?anchor.left+anchor.width/2:innerWidth/2,top:anchor?anchor.top+8:innerHeight*.5}} role="status"><strong>{game.players[shown.actor].name} · {shown.label} 승리</strong><small>{game.players.map((player,seat)=>seat===shown.actor?null:`${player.name} −${shown.hpBefore[seat]-shown.hpAfter[seat]}`).filter(Boolean).join(" · ")}</small>{shown.skills?.map(skill=><small key={skill.id}>{game.players[skill.actor].name} · {hpSkillUseText(skill)}</small>)}</div>,document.body)}{game.players.map((player,seat)=>{const damage=shown.hpBefore[seat]-shown.hpAfter[seat];if(!damage)return null;const target=document.querySelector<HTMLElement>(seat===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${seat}"] .seat-card`);return target?createPortal(<span className="rpg-hit-overlay is-damage" role="status" aria-label={`${player.name} 싸움 피해 ${damage}`}><span className="rpg-hit-flash"/><b className="rpg-hit-number">−{damage}</b></span>,target,`${shown.id}:${seat}`):null;})}</>;
}
