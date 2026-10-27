'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Swords,Eye,Heart,Sparkles} from 'lucide-react';
import {RPG_PROFESSIONS,rpgProfession,type RpgProfessionId} from '../../lib/rpg-professions.ts';
import type {view} from '../../lib/game.ts';
import {professionEffectText} from '../../lib/rpg-profession-combat.ts';
import TileFace from './TileFace';
function ProfessionIcon({id}:{id:RpgProfessionId}){return id==='swordsman'?<Swords/>:id==='rogue'?<Eye/>:id==='cleric'?<Heart/>:<Sparkles/>;}
const passiveText=(id:RpgProfessionId)=>id==='swordsman'?'페어 승리 · 피해 +1':id==='rogue'?'싱글 승리 · 상대 패 1장 확인':id==='cleric'?'페어 승리 · HP +1':'트리플 승리 · 피해 +2';
const activeText=(id:RpgProfessionId)=>id==='swordsman'?'스트레이트 승리 · 피해 +3':id==='rogue'?'트리플 승리 · 2장 확인·1장 교환':id==='cleric'?'풀하우스 승리 · HP +5':'포카드 승리 · 피해 +6';
export function RpgProfessionPicker({selected,choose}:{selected:RpgProfessionId,choose:(id:RpgProfessionId)=>void}){
 return <section className="profession-picker" aria-label="전투 직업 선택"><h3>전투 직업 <small>승리 조건을 만족하면 자동 발동</small></h3><div>{RPG_PROFESSIONS.map(profession=><button type="button" key={profession.id} aria-pressed={selected===profession.id} className={selected===profession.id?'chosen':''} onClick={()=>choose(profession.id)}><strong><ProfessionIcon id={profession.id}/>{profession.name}</strong><span>{passiveText(profession.id)}</span><small>판당 1회 · {activeText(profession.id)}</small></button>)}</div><p>패시브는 조건마다 · 자동 스킬은 카드 한 판에 1회 · 마나 없음<br/>선택한 직업은 새 대전·여정부터 적용해요.</p></section>;
}
export function RpgProfessionStatus({game,seat,detail=false}:{game:ReturnType<typeof view>,seat:number,detail?:boolean}){
 const state=game.rpgRun?.combat;if(!state)return null;const id=state.professions[seat];
 return <span className={`profession-status ${detail?'is-detailed':''}`} title={`${passiveText(id)} / ${activeText(id)}`}><ProfessionIcon id={id}/><b>{rpgProfession(id).name}</b><small>{state.activeUsed[seat]?'자동 스킬 소진':'자동 스킬 대기'}</small>{detail&&<span className="profession-description">{passiveText(id)}<br/>판당 1회 · {activeText(id)}</span>}</span>;
}
export function RpgProfessionIntel({game}:{game:ReturnType<typeof view>}){
 const state=game.rpgRun?.combat,reveal=state?.privateReveals[game.me]?.at(-1),button=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null),[open,setOpen]=useState(false),[position,setPosition]=useState({left:0,top:0});
 useEffect(()=>{setOpen(false);},[game.code,game.round]);
 useLayoutEffect(()=>{if(!open)return;const measure=()=>{const rect=button.current?.getBoundingClientRect();if(rect)setPosition({left:Math.max(8,Math.min(innerWidth-202,rect.left-80)),top:Math.max(8,Math.min(innerHeight-115,rect.top-115))});};measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);},[open,reveal?.eventId]);
 useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!button.current?.contains(event.target as Node)&&!panel.current?.contains(event.target as Node))setOpen(false);},escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[open]);
 if(state?.professions[game.me]!=='rogue')return null;
 return <><button type="button" ref={button} className="profession-intel-button" aria-label="도적의 정찰 패" aria-expanded={open} title="도적의 정찰 패" onClick={()=>setOpen(value=>!value)}><Eye aria-hidden="true"/>{!!reveal&&<b>{reveal.tiles.length}</b>}</button>{open&&typeof document!=='undefined'&&createPortal(<section ref={panel} className="profession-intel-panel" style={position} role="status" aria-label="나만 아는 직업 정찰 패">{reveal?<><strong>{game.players[reveal.target].name}</strong>{reveal.tiles.map(tile=><TileFace tile={tile} key={tile.id} small/>)}<small>발동 때 확인한 패 · 나에게만 공개</small></>:<small>싱글·트리플 싸움에서 이기면 확인한 패가 여기에 표시돼요.</small>}</section>,document.body)}</>;
}
export function RpgProfessionHistory({game}:{game:ReturnType<typeof view>}){
 const effects=game.rpgRun?.combat?.effects;if(!effects?.length)return null;
 return <details className="result-details profession-history"><summary>직업 스킬 내역 <small>{effects.length}회</small></summary>{effects.map(effect=><p key={effect.id}>{game.players[effect.actor].name} · {professionEffectText(effect)}</p>)}</details>;
}
