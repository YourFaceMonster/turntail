"use client";
import {hasRoundCombat,hasImmediateSkills,roundProfessionDescription} from '../../lib/profession-round-rules';
import {RPG_PHASE_ONE} from '../../lib/rpg-phase-one.ts';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {PROFESSION_PORTRAITS,professionPortraitStyle} from '../../lib/profession-art';
import {createPortal} from 'react-dom';
import {Swords,Eye,Heart,Sparkles} from 'lucide-react';
import {RPG_PROFESSIONS,rpgProfession,type RpgProfessionId} from '../../lib/rpg-professions.ts';
import type {view} from '../../lib/game.ts';
import {professionEffectText} from '../../lib/rpg-profession-combat.ts';
import TileFace from './TileFace';
import {ProfessionGauge} from './ProfessionActives';
import {PROFESSION_ACTIVES,activeGauge} from '../../lib/profession-actives.ts';
function ProfessionIcon({id}:{id:RpgProfessionId}){return id==='swordsman'?<Swords/>:id==='rogue'?<Eye/>:id==='cleric'?<Heart/>:<Sparkles/>;}
const passiveText=(id:RpgProfessionId)=>id==='swordsman'?'페어 추가 피해 +1':id==='rogue'?'싱글 상대 패 1장 확인':id==='cleric'?'페어 HP +1':'트리플 추가 피해 +2';
const activeText=(id:RpgProfessionId)=>id==='swordsman'?'스트레이트 추가 피해 +3':id==='rogue'?'트리플 상대 패 2장 확인 · 1장 교환':id==='cleric'?'풀하우스 HP +5':'포카드 추가 피해 +6';
const professionRoles:Record<RpgProfessionId,{role:string,signature:string}>= {
 swordsman:{role:'무작위 단일 공격',signature:'상대 한 명에게 집중 공격'},
 rogue:{role:'정찰과 유도',signature:'바닥 투시 · 비밀 함정'},
 cleric:{role:'회복과 생존',signature:'페어를 모아 HP 회복'},
 mage:{role:'전체 공격',signature:'상대 모두에게 고른 피해'},
};
function rpgPhaseDescription(id:RpgProfessionId){return [...(id==='rogue'?['싱글 바닥 1장 투시','트리플 바닥 2장 투시 (1회)','직업 투시 패 회수 · 생존 상대 각각 피해 1']:[passiveText(id),`${activeText(id)}${id==='mage'?'':' (1회)'}`]),itemBattleDescription(id).at(-1)!,`게이지: 결투 ${RPG_PHASE_ONE.duelsPerGauge}회마다 +1 · 스테이지 간 이월`];}
function itemBattleDescription(id:RpgProfessionId){
 return id==='swordsman'?['싱글·페어 추가 피해 +1','스트레이트 추가 피해 +3 (1회)','강타 · 1/2/3/4칸 → 피해 1/2/4/6']:
  id==='rogue'?['싱글 바닥 1장 투시','트리플 바닥 2장 투시 (1회)','직업 투시 패 직접 회수 · 상대 각각 피해 1','함정 피해 4 · 2칸 소비 · 자기 턴 (1회)']:
  id==='cleric'?['페어 HP +1 · 두 번째 페어 추가 회복 +2','풀하우스 HP +5 (1회)','치유 · 1/2/3칸 → HP +1/+3/+5']:
  ['트리플 추가 피해 +2','5장 족보 추가 피해 +4','포카드 추가 피해 +6','화염 파동 · 1/2/3/4/5칸 → 모두 피해 1/2/3/4/6'];
}
/** Only the outcome phrase is bold; its condition and usage limit stay quiet. */
function EffectDescription({line}:{line:string}){const parts=line.split(/(추가 피해 \+\d+|추가 회복 \+\d+|HP \+\d+|바닥 \d+장 투시|상대 패 \d+장 확인|\d+장 교환|피해 \d+)/g);return <>{parts.map((part,index)=>index%2?<b className="profession-effect-value" key={index}>{part}</b>:part)}</>;}
export function RpgProfessionPicker({selected,choose,itemBattle=false,rpgPhase=false}:{selected:RpgProfessionId,choose:(id:RpgProfessionId)=>void,itemBattle?:boolean,rpgPhase?:boolean}){
 const description=roundProfessionDescription(selected);
 return <section className="profession-picker has-art" aria-label="전투 직업 선택"><h3>전투 직업 <small>나의 한 수를 고르세요</small></h3><div className="profession-choice-grid">{RPG_PROFESSIONS.map(profession=>{const role=professionRoles[profession.id];return <button type="button" key={profession.id} data-profession={profession.id} aria-label={`${profession.name} · ${role.role}`} aria-pressed={selected===profession.id} style={professionPortraitStyle(profession.id) as CSSProperties} className={`profession-choice profession-cartoon ${selected===profession.id?'chosen':''}`} onClick={()=>choose(profession.id)}><span className="profession-art" aria-hidden="true"><img src={PROFESSION_PORTRAITS[profession.id].src} alt="" width={PROFESSION_PORTRAITS[profession.id].width} height={PROFESSION_PORTRAITS[profession.id].height} decoding="async"/>{selected===profession.id&&<b className="profession-selected-mark">✓</b>}</span><strong><ProfessionIcon id={profession.id}/>{profession.name}</strong><span className="profession-role">{role.role}</span></button>;})}</div><aside className="profession-selected-detail" aria-live="polite" aria-atomic="true"><strong><ProfessionIcon id={selected}/>{rpgProfession(selected).name}<small>선택한 직업</small></strong>{description.map(line=><span key={line}><EffectDescription line={line}/></span>)}</aside></section>;
}
export function RpgProfessionStatus({game,seat,detail=false}:{game:ReturnType<typeof view>,seat:number,detail?:boolean}){
 const state=game.rpgRun?.combat;if(!state)return null;const id=state.professions[seat];
 const description=hasRoundCombat(game)?roundProfessionDescription(id,hasImmediateSkills(game)):game.rpgRun?.phaseOne?rpgPhaseDescription(id):state.itemBattle?.version===1?itemBattleDescription(id):[passiveText(id),`${activeText(id)}${id==="mage"?"":" (1회)"}`],ownGauge=!hasRoundCombat(game)&&detail&&!!state.itemBattle&&seat===game.me;
 return <span className={`profession-status ${detail?'is-detailed':''}`} title={description.join(' / ')}><ProfessionIcon id={id}/><b>{rpgProfession(id).name}</b><small>{hasImmediateSkills(game)?'스킬 즉시 · 패만 최종 정산':hasRoundCombat(game)?'족보 승리 · 판 종료 정산':id==='mage'?'자동 스킬 반복 발동':state.activeUsed[seat]?'자동 스킬 소진':'자동 스킬 대기'}</small>{detail&&<span className="profession-description">{description.map((line,index)=><span key={line}>{index>0&&<br/>}<EffectDescription line={line}/></span>)}</span>}{ownGauge&&<span className="profession-active-readout"><b>액티브 {activeGauge(game,seat)}/{PROFESSION_ACTIVES[id].maxGauge}</b><ProfessionGauge game={game} seat={seat}/><small>{game.rpgRun?.phaseOne?`결투 ${RPG_PHASE_ONE.duelsPerGauge}회마다`:"판 종료"} +1 · 이월</small></span>}</span>;
}
export function RpgProfessionIntel({game}:{game:ReturnType<typeof view>}){
 const state=game.rpgRun?.combat,reveal=state?.privateReveals[game.me]?.at(-1),button=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null),[open,setOpen]=useState(false),[position,setPosition]=useState({left:0,top:0});
 useEffect(()=>{setOpen(false);},[game.code,game.round]);
 useLayoutEffect(()=>{if(!open)return;const measure=()=>{const rect=button.current?.getBoundingClientRect();if(rect)setPosition({left:Math.max(8,Math.min(innerWidth-202,rect.left-80)),top:Math.max(8,Math.min(innerHeight-115,rect.top-115))});};measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);},[open,reveal?.eventId]);
 useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!button.current?.contains(event.target as Node)&&!panel.current?.contains(event.target as Node))setOpen(false);},escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[open]);
 if(state?.professions[game.me]!=='rogue'||state.itemBattle?.version===1)return null;
 return <><button type="button" ref={button} className="profession-intel-button" aria-label="도적의 정찰 패" aria-expanded={open} title="마지막 승리 때 확인한 패 · 발동마다 상대 무작위 선정" onClick={()=>setOpen(value=>!value)}><Eye aria-hidden="true"/>{!!reveal&&<b>{reveal.tiles.length}</b>}</button>{open&&typeof document!=='undefined'&&createPortal(<section ref={panel} className="profession-intel-panel" style={position} role="status" aria-label="나만 아는 직업 정찰 패">{reveal?<><strong>{game.players[reveal.target].name}</strong>{reveal.tiles.map(tile=><TileFace tile={tile} key={tile.id} small/>)}<small>마지막 정찰 기록 · 발동마다 상대 무작위</small></>:<small>싱글·트리플 싸움에서 이기면 확인한 패가 여기에 표시돼요.</small>}</section>,document.body)}</>;
}
export function RpgProfessionHistory({game}:{game:ReturnType<typeof view>}){
 const effects=game.rpgRun?.combat?.effects;if(!effects?.length)return null;
 return <details className="result-details profession-history"><summary>직업 스킬 내역 <small>{effects.length}회</small></summary>{effects.map(effect=><p key={effect.id}>{game.players[effect.actor].name} · {professionEffectText(effect)}</p>)}</details>;
}

export function RoundCombatPending({game}:{game:ReturnType<typeof view>}){
 const pending=game.rpgRun?.combat?.pendingRound;if(!hasRoundCombat(game)||game.phase!=='playing')return null;
 const effects=game.rpgRun?.combat?.effects||[],last=effects.at(-1);
 if(hasImmediateSkills(game))return <span className="round-combat-pending" role="status" title={last?`${game.players[last.actor].name} · ${professionEffectText(last)}`:'직업 스킬은 즉시 적용되고 기본 패 피해만 마지막에 정산해요'}><b>스킬 즉시 적용</b><span>패 피해 {pending?.damage[game.me]||0} 정산 예정</span>{last&&<small className="instant-skill-readout">{game.players[last.actor].name} · {last.floorScout?`바닥 ${last.revealed}장 확인`:last.heal?`HP +${last.heal}`:last.damage?`공격 ${last.damage}`:'회복 한도'}</small>}</span>;
 return <span className="round-combat-pending" role="status" title={last?`${game.players[last.actor].name} · ${professionEffectText(last)}`:"한 명이 손패를 비우면 공격·회복을 함께 반영해요"}><b>판 종료 정산</b><span>피해 {pending?.damage[game.me]||0} · 회복 {pending?.healing[game.me]||0}</span></span>;
}
