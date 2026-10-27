"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {gameRelic} from '../../lib/item-battle-relics.ts';
import type {view} from '../../lib/game.ts';
import {lastCombatBattle,professionEffectText} from '../../lib/rpg-profession-combat.ts';
import {hpSkillUseText} from '../../lib/hp-item-skills.ts';
import {HP_BATTLE_WIN_DELAY_MS,HP_BATTLE_REVIEW_MS,type HpBattleEvent} from '../../lib/hp-item-battle.ts';
import {seatPanelTheme} from '../../lib/seat-presentation';
import SeatPortrait from './SeatPortrait';
import {RpgHpBar} from './RpgHpBar';
import {hpBattleSummary} from '../../lib/hp-battle-summary';
export default function HpBattleEffects({game,onHit,onReviewChange,onHpPresentation}:{game:ReturnType<typeof view>,onHit:()=>void,onReviewChange?:(pending:boolean)=>void,onHpPresentation?:(held:HpBattleEvent|null)=>void}){
 const event=lastCombatBattle(game),seen=useRef(event?.id),callback=useRef({onHit,onReviewChange,onHpPresentation});callback.current={onHit,onReviewChange,onHpPresentation};
 const [announced,setAnnounced]=useState<HpBattleEvent|null>(null),[shown,setShown]=useState<HpBattleEvent|null>(null),[impact,setImpact]=useState<HpBattleEvent|null>(null),notice=useRef<HTMLElement>(null),confirm=useRef<HTMLButtonElement>(null),[position,setPosition]=useState({left:0,top:0});
 const dismiss=()=>{setShown(null);setAnnounced(null);setImpact(null);callback.current.onReviewChange?.(false);};
 useLayoutEffect(()=>{
  if(!event||event.round!==game.round){setShown(null);setAnnounced(null);setImpact(null);return;}
  if(event.id===seen.current)return;seen.current=event.id;
  if(event.roundFinal||game.phase==='ended'){setShown(null);setAnnounced(null);setImpact(null);callback.current.onReviewChange?.(false);return;}
  setShown(null);setAnnounced(null);setImpact(null);callback.current.onHpPresentation?.(event);callback.current.onReviewChange?.(true);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let animations:Animation[]=[];
  const winnerTimer=setTimeout(()=>{
   setAnnounced(event);callback.current.onHit();
  },Math.max(0,event.at+HP_BATTLE_WIN_DELAY_MS-Date.now()));
  const timer=setTimeout(()=>{
   setAnnounced(null);setShown(event);setImpact(event);callback.current.onHpPresentation?.(null);
   const anchors=game.players.flatMap((_,seat)=>event.hpAfter[seat]<event.hpBefore[seat]?[document.querySelector<HTMLElement>(seat===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${seat}"] .seat-card`)]:[]).filter((anchor):anchor is HTMLElement=>!!anchor);
   if(!reduced)animations=anchors.map(anchor=>anchor.animate([{translate:'0px',filter:'brightness(1)'},{translate:'-5px 2px',filter:'brightness(1.55)'},{translate:'4px -1px'},{translate:'-2px 0px'},{translate:'0px',filter:'brightness(1)'}],{duration:400,easing:'ease-out'}));
  },Math.max(0,event.at+HP_BATTLE_REVIEW_MS-Date.now()));
  return()=>{clearTimeout(timer);clearTimeout(winnerTimer);animations.forEach(animation=>animation.cancel());callback.current.onHpPresentation?.(null);callback.current.onReviewChange?.(false);};
 },[event?.id,game.round,game.me]);
 useLayoutEffect(()=>{
  if(!shown&&!announced)return;
  const measure=()=>{const anchor=document.querySelector<HTMLElement>('.floor-stage')?.getBoundingClientRect(),rect=notice.current?.getBoundingClientRect(),halfW=(rect?.width||300)/2,halfH=(rect?.height||220)/2;
   setPosition({left:Math.max(halfW+8,Math.min(innerWidth-halfW-8,anchor?anchor.left+anchor.width/2:innerWidth/2)),top:Math.max(halfH+8,Math.min(innerHeight-halfH-8,anchor?anchor.top+anchor.height/2:innerHeight*.45))});
  };measure();const observer=new ResizeObserver(measure);if(notice.current)observer.observe(notice.current);window.addEventListener('resize',measure);return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
 },[shown?.id,announced?.id]);
 useEffect(()=>{
  if(!shown)return;const previous=document.activeElement;confirm.current?.focus({preventScroll:true});
  const keyboard=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();dismiss();}else if(event.key==='Tab'){event.preventDefault();const targets=Array.from(notice.current?.querySelectorAll<HTMLElement>('button,summary')||[]),index=targets.indexOf(document.activeElement as HTMLElement);targets[(index+(event.shiftKey?-1:1)+targets.length)%targets.length]?.focus({preventScroll:true});}};
  document.addEventListener('keydown',keyboard);return()=>{document.removeEventListener('keydown',keyboard);if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true});};
 },[shown?.id]);
 const summary=shown?hpBattleSummary(shown,game.players):null;
 return <>{announced&&createPortal(<div className="battle-review-shade"><section ref={notice} className="battle-winner-notice" style={position} role="status"><SeatPortrait avatar={game.players[announced.actor].avatar} seat={announced.actor}/><span><small>{announced.label} 싸움</small><strong>{game.players[announced.actor].name} 승리!</strong><small>잠시 후 피해 결과를 확인하세요</small>{announced.professions?.map(effect=><small className="profession-trigger" key={effect.id}>{professionEffectText(effect)}</small>)}</span></section></div>,document.body)}{shown&&summary&&createPortal(<div className="battle-review-shade" onClick={dismiss}><section ref={notice} className="battle-win-notice battle-damage-review compact-battle-review" style={position} role="dialog" aria-modal="true" aria-labelledby="battle-review-title"><h2 className="compact-battle-heading" id="battle-review-title">이번 싸움 결과</h2><p className="compact-battle-summary">{summary.text}</p>{summary.calculation&&<p className="battle-damage-calculation"><span>이번 싸움에서 낸 패</span><strong>{summary.calculation.count}장 × 1 = 기본 피해 {summary.calculation.base}</strong><small>각 상대에게 적용 · 스킬에 따른 추가·방어는 아래에 표시</small></p>}<div className="compact-battle-hp-rows">{summary.rows.map(row=>{
  const {seat,hp,damage,healed,note,rank}=row,player=game.players[seat],theme=seatPanelTheme(seat);
  return <div className="battle-hp-row" key={player.id} data-standing={rank} style={{'--battle-light':theme.light,'--battle-dark':theme.dark,'--battle-border':theme.border} as CSSProperties}><RpgHpBar hp={hp} owner={player.name} identity={<><SeatPortrait avatar={player.avatar} seat={seat}/><strong><small className="hp-standing-rank">{rank}등</small>{player.name}</strong></>} detail={note} change={damage?<em className="negative">−{damage}</em>:healed?<em className="positive">+{healed}</em>:undefined}/></div>;
 })}</div>{!!shown.skills?.length&&<details className="compact-battle-skills" onClick={event=>event.stopPropagation()}><summary>적용 스킬 {shown.skills.length}</summary>{shown.skills.map(skill=><small key={skill.id}>{game.players[skill.actor].name} · {hpSkillUseText(skill)}</small>)}</details>}{!!shown.professions?.length&&<details className="compact-battle-skills" onClick={event=>event.stopPropagation()}><summary>직업 스킬 {shown.professions.length}</summary>{shown.professions.map(effect=><small key={effect.id}>{game.players[effect.actor].name} · {professionEffectText(effect)}</small>)}</details>}{!!shown.relics?.length&&<details className="compact-battle-skills" onClick={event=>event.stopPropagation()}><summary>유물 효과 {shown.relics.length}</summary>{shown.relics.map(effect=><small key={effect.relicId}>{gameRelic(effect.relicId)?.name} · {effect.message}</small>)}</details>}<div className="compact-battle-footer"><small title="HP 높은 순 · 동률이면 남은 패 적은 순">현재 HP 순위</small><button ref={confirm} className="battle-review-confirm" type="button" onClick={event=>{event.stopPropagation();dismiss();}}>클릭해서 계속</button></div></section></div>,document.body)}{impact&&game.players.map((player,seat)=>{const damage=impact.hpBefore[seat]-impact.hpAfter[seat];if(!damage)return null;const target=document.querySelector<HTMLElement>(seat===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${seat}"] .seat-card`);return target?createPortal(<span className={`rpg-hit-overlay ${damage<0?'is-heal':'is-damage'}`} role="status" aria-label={`${player.name} 싸움 ${damage<0?'회복':'피해'} ${Math.abs(damage)}`}><span className="rpg-hit-flash"/><b className="rpg-hit-number">{damage<0?'+':'−'}{Math.abs(damage)}</b></span>,target,`${impact.id}:${seat}`):null;})}</>;
}
