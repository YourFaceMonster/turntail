'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
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
 swordsman:{role:'꾸준한 압박',signature:'싱글 · 페어 추가 피해'},
 rogue:{role:'정찰과 유도',signature:'바닥 투시 · 비밀 함정'},
 cleric:{role:'회복과 생존',signature:'페어를 모아 HP 회복'},
 mage:{role:'강력한 한 수',signature:'큰 족보로 추가 피해'},
};
function itemBattleDescription(id:RpgProfessionId){
 return id==='swordsman'?['싱글·페어 추가 피해 +1','스트레이트 추가 피해 +3 (1회)','강타 · 1/2/3/4칸 → 피해 1/2/4/6']:
  id==='rogue'?['싱글 바닥 1장 투시','트리플 바닥 2장 투시 (1회)','직업 투시 패 직접 회수 · 상대 각각 피해 1','함정 피해 4 · 2칸 소비 · 자기 턴 (1회)']:
  id==='cleric'?['페어 HP +1 · 두 번째 페어 추가 회복 +2','풀하우스 HP +5 (1회)','치유 · 1/2/3칸 → HP +1/+3/+5']:
  ['트리플 추가 피해 +2','5장 족보 추가 피해 +2','포카드 추가 피해 +6','화염 파동 · 1/2/3/4/5칸 → 상대 각각 피해 1/2/3/4/6'];
}
/** Only the outcome phrase is bold; its condition and usage limit stay quiet. */
function EffectDescription({line}:{line:string}){const parts=line.split(/(추가 피해 \+\d+|추가 회복 \+\d+|HP \+\d+|바닥 \d+장 투시|상대 패 \d+장 확인|\d+장 교환|피해 \d+)/g);return <>{parts.map((part,index)=>index%2?<b className="profession-effect-value" key={index}>{part}</b>:part)}</>;}
export function RpgProfessionPicker({selected,choose,itemBattle=false}:{selected:RpgProfessionId,choose:(id:RpgProfessionId)=>void,itemBattle?:boolean}){
 const description=itemBattle?itemBattleDescription(selected):[passiveText(selected),`${activeText(selected)}${selected==="mage"?"":" (1회)"}`];
 return <section className="profession-picker has-art" aria-label="전투 직업 선택"><h3>전투 직업 <small>나의 한 수를 고르세요</small></h3><div className="profession-choice-grid">{RPG_PROFESSIONS.map(profession=>{const role=professionRoles[profession.id];return <button type="button" key={profession.id} data-profession={profession.id} aria-label={`${profession.name} · ${role.role}`} aria-pressed={selected===profession.id} className={`profession-choice ${selected===profession.id?'chosen':''}`} onClick={()=>choose(profession.id)}><span className="profession-art" aria-hidden="true"><img src={`/item-battle-v1/professions/${profession.id}-front-v2.webp`} alt="" width={1024} height={1536} decoding="async"/>{selected===profession.id&&<b className="profession-selected-mark">✓</b>}</span><strong><ProfessionIcon id={profession.id}/>{profession.name}</strong><span className="profession-role">{role.role}</span><small className="profession-signature">{itemBattle?role.signature:passiveText(profession.id)}</small></button>;})}</div><aside className="profession-selected-detail" aria-live="polite" aria-atomic="true"><strong><ProfessionIcon id={selected}/>{rpgProfession(selected).name}<small>선택한 직업</small></strong>{description.map(line=><span key={line}><EffectDescription line={line}/></span>)}</aside><p>선택한 직업은 새 {itemBattle?'아이템전':'대전·여정'}부터 적용해요. 저장된 진행의 직업은 유지됩니다.</p></section>;
}
export function RpgProfessionStatus({game,seat,detail=false}:{game:ReturnType<typeof view>,seat:number,detail?:boolean}){
 const state=game.rpgRun?.combat;if(!state)return null;const id=state.professions[seat];
 const description=state.itemBattle?.version===1?itemBattleDescription(id):[passiveText(id),`${activeText(id)}${id==="mage"?"":" (1회)"}`],ownGauge=detail&&!!state.itemBattle&&seat===game.me;
 return <span className={`profession-status ${detail?'is-detailed':''}`} title={description.join(' / ')}><ProfessionIcon id={id}/><b>{rpgProfession(id).name}</b><small>{id==='mage'?'자동 스킬 반복 발동':state.activeUsed[seat]?'자동 스킬 소진':'자동 스킬 대기'}</small>{detail&&<span className="profession-description">{description.map((line,index)=><span key={line}>{index>0&&<br/>}<EffectDescription line={line}/></span>)}</span>}{ownGauge&&<span className="profession-active-readout"><b>액티브 {activeGauge(game,seat)}/{PROFESSION_ACTIVES[id].maxGauge}</b><ProfessionGauge game={game} seat={seat}/><small>판 종료 +1 · 이월</small></span>}</span>;
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
