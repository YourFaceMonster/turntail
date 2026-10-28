"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {gameRelic} from '../../lib/item-battle-relics.ts';
import type {view} from '../../lib/game.ts';
import {lastCombatBattle,professionEffectText} from '../../lib/rpg-profession-combat.ts';
import {hpSkillUseText} from '../../lib/hp-item-skills.ts';
import {HP_BATTLE_REVIEW_MS,type HpBattleEvent} from '../../lib/hp-item-battle.ts';
import {seatPanelTheme} from '../../lib/seat-presentation';
import SeatPortrait from './SeatPortrait';
import {RpgHpBar} from './RpgHpBar';
import {hpBattleSummary} from '../../lib/hp-battle-summary';
export function BattleEffectText({text}:{text:string}){
 const signed=text.replace(/(추가\s*피해)\s*\+(\d+)/g,'$1 −$2');
 return <>{signed.split(/([+−-]\d+)/g).map((part,index)=>index%2?<b key={index} className={part.startsWith('+')?'battle-healing':'battle-damage'}>{part}</b>:part)}</>;
}
export default function HpBattleReview({game,onHit,onReviewChange,onHpPresentation}:{game:ReturnType<typeof view>,onHit:()=>void,onReviewChange?:(pending:boolean)=>void,onHpPresentation?:(held:HpBattleEvent|null)=>void}){
 const event=lastCombatBattle(game),seen=useRef(event?.id),callback=useRef({onHit,onReviewChange,onHpPresentation});callback.current={onHit,onReviewChange,onHpPresentation};
 const [shown,setShown]=useState<HpBattleEvent|null>(null),[ready,setReady]=useState(false),notice=useRef<HTMLElement>(null),confirm=useRef<HTMLButtonElement>(null),[position,setPosition]=useState({left:0,top:0});
 const dismiss=()=>{if(!ready)return;setShown(null);callback.current.onReviewChange?.(false);};
 useLayoutEffect(()=>{
  if(!event||event.round!==game.round){setShown(null);return;}
  if(event.id===seen.current)return;seen.current=event.id;setShown(null);setReady(false);callback.current.onHpPresentation?.(event);callback.current.onReviewChange?.(true);
  const delay=Math.max(0,event.at+HP_BATTLE_REVIEW_MS-Date.now());
  const timer=setTimeout(()=>{setShown(event);callback.current.onHpPresentation?.(null);callback.current.onHit();},delay),unlock=setTimeout(()=>setReady(true),delay+1000);
  return()=>{clearTimeout(timer);clearTimeout(unlock);callback.current.onHpPresentation?.(null);callback.current.onReviewChange?.(false);};
 },[event?.id,game.round,game.me]);
 useLayoutEffect(()=>{if(shown)callback.current.onReviewChange?.(true);return()=>{if(shown)callback.current.onReviewChange?.(false);};},[shown?.id]);
 useLayoutEffect(()=>{
  if(!shown)return;const measure=()=>{const anchor=document.querySelector<HTMLElement>('.floor-stage')?.getBoundingClientRect(),rect=notice.current?.getBoundingClientRect(),halfW=(rect?.width||310)/2,halfH=(rect?.height||240)/2;setPosition({left:Math.max(halfW+8,Math.min(innerWidth-halfW-8,anchor?anchor.left+anchor.width/2:innerWidth/2)),top:Math.max(halfH+8,Math.min(innerHeight-halfH-8,anchor?anchor.top+anchor.height/2:innerHeight*.45))});};
  measure();const observer=new ResizeObserver(measure);if(notice.current)observer.observe(notice.current);window.addEventListener('resize',measure);return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
 },[shown?.id]);
 useEffect(()=>{
  if(!shown||!ready)return;const previous=document.activeElement;confirm.current?.focus({preventScroll:true});
  const keyboard=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();dismiss();}else if(event.key==='Tab'){event.preventDefault();confirm.current?.focus();}};
  document.addEventListener('keydown',keyboard);return()=>{document.removeEventListener('keydown',keyboard);if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true});};
 },[shown?.id,ready]);
 if(!shown)return null;
 const summary=hpBattleSummary(shown,game.players),effects=[...(shown.professions||[]).map(effect=>`${game.players[effect.actor].name} · ${professionEffectText(effect).replace(/바닥 패 (\d+)장 확인/,'투시 스킬 발동 · $1장')}`),...(shown.skills||[]).map(skill=>`${game.players[skill.actor].name} · ${hpSkillUseText(skill)}`),...(shown.relics||[]).map(effect=>`${gameRelic(effect.relicId)?.name||effect.relicId} · ${effect.message}`)];
 return createPortal(<div className="battle-review-shade" onClick={dismiss}><section ref={notice} className="battle-win-notice battle-damage-review compact-battle-review battle-review-0641" style={position} role="dialog" aria-modal="true" aria-labelledby="battle-review-title">
  <h2 className="compact-battle-heading" id="battle-review-title">{game.players[shown.actor].name} 승리!</h2><p className="battle-final-formula">{shown.playedCount||shown.damage}장 × 1점 = 피해 {shown.damage}</p>
  <div className="compact-battle-hp-rows">{summary.rows.map(row=>{const player=game.players[row.seat],theme=seatPanelTheme(row.seat);return <div className="battle-hp-row" key={player.id} style={{'--battle-light':theme.light,'--battle-dark':theme.dark,'--battle-border':theme.border} as CSSProperties}><RpgHpBar hp={row.hp} persistentChange owner={player.name} identity={<><SeatPortrait avatar={player.avatar} seat={row.seat}/><strong>{player.name}</strong></>} detail={<><span className="battle-hp-transition">HP {row.before} → {row.hp}</span>{row.note&&<span className="battle-row-effects"><BattleEffectText text={row.note}/></span>}</>} change={row.damage?<em className="negative">−{row.damage}</em>:row.healed?<em className="positive">+{row.healed}</em>:undefined}/></div>;})}</div>
  {!!effects.length&&<div className="battle-inline-effects">{effects.map((text,index)=><p key={index}><BattleEffectText text={text}/></p>)}</div>}
  <div className="compact-battle-footer"><button ref={confirm} className="battle-review-confirm" type="button" disabled={!ready} onClick={e=>{e.stopPropagation();dismiss();}}>클릭해서 계속</button></div>
 </section></div>,document.body);
}
