'use client';
import {useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {PROFESSION_ACTIVES,activeGauge,professionActiveAvailability,ACTIVE_IMPACT_MS,ACTIVE_PRESENTATION_MS,type ProfessionActiveEvent} from '../../lib/profession-actives.ts';
import {RogueTrapControl} from './RogueTrap';
import {PROFESSION_SKILL_IMAGES,mageSpellPresentation} from '../../lib/item-battle-visuals';
type View=ReturnType<typeof view>;
export type ActiveHpPresentation={id:string,before:number[]};
export function SwordsmanSlash({impact=false}:{impact?:boolean}){return <span className={`swordsman-slash ${impact?'is-impact':''}`} aria-hidden="true"><svg viewBox="0 0 180 100"><path className="slash-wide" d="M12 83Q90 64 163 12"/><path className="slash-core" d="M12 83Q90 64 163 12"/><path className="slash-cross" d="M34 9L144 92"/></svg><i/></span>;}
export function ProfessionGauge({game,seat=game.me}:{game:View,seat?:number}){
 const profession=game.rpgRun?.combat?.professions[seat];if(!profession||seat!==game.me)return null;
 const max=PROFESSION_ACTIVES[profession].maxGauge,value=activeGauge(game,seat);
 return <span className="profession-gauge" role="meter" aria-label={`액티브 게이지 ${value}/${max}`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} title={`게이지 ${value}/${max} · 판 종료 시 +1 · 남은 칸 이월`}>{Array.from({length:max},(_,index)=><i key={index} className={index<value?'is-filled':''}/>)}</span>;
}
export function ProfessionActiveControl({game,enabled,targeting,choose}:{game:View,enabled:boolean,targeting:boolean,choose:()=>void}){
 const combat=game.rpgRun?.combat;if(!combat?.itemBattle)return null;const profession=combat.professions[game.me],config=PROFESSION_ACTIVES[profession],available=professionActiveAvailability(game,game.me,enabled),value=activeGauge(game,game.me),name=profession==='mage'?mageSpellPresentation(value).name:config.name;
 return <span className={`profession-active-control profession-${profession}`} title={`${name} · ${value}/${config.maxGauge}칸 · ${available.reason}`}>
  {profession==='rogue'?<RogueTrapControl game={game} enabled={enabled} targeting={targeting} choose={choose}/>:<button type="button" className={`text-btn profession-active-button ${targeting?'is-targeting':''}`} disabled={!available.usable} aria-label={targeting?`${name} 대상 선택 취소`:`${name} · 게이지 ${value}/${config.maxGauge} · ${available.reason}`} aria-pressed={profession==='swordsman'?targeting:undefined} onClick={choose}><img src={PROFESSION_SKILL_IMAGES[profession]} alt="" draggable={false}/></button>}
  <ProfessionGauge game={game}/>
 </span>;
}
export function ProfessionActiveEffects({game,onHit,onHpPresentation}:{game:View,onHit:()=>void,onHpPresentation:(value:ActiveHpPresentation|null)=>void}){
 const event=game.rpgRun?.combat?.actives?.lastEvent,seen=useRef(event?.id),callbacks=useRef({onHit,onHpPresentation});callbacks.current={onHit,onHpPresentation};
 const [scene,setScene]=useState<{event:ProfessionActiveEvent,impact:boolean,x:number,y:number,from:{x:number,y:number},elapsed:number,anchors:{seat:number,node:HTMLElement,x:number,y:number}[]}|null>(null);
 useLayoutEffect(()=>{
  if(!event){setScene(null);callbacks.current.onHpPresentation(null);return;}if(event.id===seen.current)return;seen.current=event.id;
  const end=event.at-ACTIVE_IMPACT_MS+ACTIVE_PRESENTATION_MS;if(Date.now()>end)return;
  const board=document.querySelector('.floor-stage')?.getBoundingClientRect(),source=document.querySelector(event.actor===game.me?'.own-status-card':`.opponents [data-seat="${event.actor}"] .seat-card`)?.getBoundingClientRect(),anchors=game.players.flatMap((_,seat)=>{const affected=event.profession==='cleric'?seat===event.actor:event.profession==='swordsman'?seat===event.target:seat!==event.actor&&event.hpBefore[seat]>0;if(!affected)return [];const node=document.querySelector<HTMLElement>(seat===game.me?'.own-status-card':`.opponents [data-seat="${seat}"] .seat-card`),rect=node?.getBoundingClientRect();return node&&rect?[{seat,node,x:rect.left+rect.width/2,y:rect.top+rect.height/2}]:[];});
  setScene({event,impact:false,anchors,from:source?{x:source.left+source.width/2,y:source.top+source.height/2}:{x:innerWidth/2,y:innerHeight*.8},elapsed:Math.max(0,Date.now()-(event.at-ACTIVE_IMPACT_MS)),x:Math.max(120,Math.min(innerWidth-120,(board?.left||0)+(board?.width||innerWidth)/2)),y:Math.max(65,Math.min(innerHeight-65,(board?.top||0)+(board?.height||200)/2))});callbacks.current.onHpPresentation({id:event.id,before:event.hpBefore});
  const animations:Animation[]=[];
  const timer=setTimeout(()=>{setScene(value=>value?{...value,impact:true}:null);callbacks.current.onHpPresentation(null);callbacks.current.onHit();if(event.profession==='swordsman'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)anchors.forEach(({node})=>animations.push(node.animate([{translate:'0 0'},{translate:'-7px 1px',filter:'brightness(1.6)'},{translate:'6px -1px'},{translate:'-3px 0'},{translate:'0 0',filter:'brightness(1)'}],{duration:480,easing:'ease-out'})));},Math.max(0,event.at-Date.now())),done=setTimeout(()=>setScene(null),Math.max(0,end-Date.now()));
  return()=>{clearTimeout(timer);clearTimeout(done);animations.forEach(animation=>animation.cancel());callbacks.current.onHpPresentation(null);};
 },[event?.id,game.me]);
 if(!scene)return null;const skill=PROFESSION_ACTIVES[scene.event.profession],healing=scene.event.profession==='cleric',spell=mageSpellPresentation(scene.event.spent),name=scene.event.profession==='mage'?spell.name:skill.name;
 return <>{createPortal(<div className={`profession-active-scene profession-${scene.event.profession} ${scene.impact?'is-impact':''}`} style={{left:scene.x,top:scene.y}} role="status"><img className="profession-effect-emblem" src={PROFESSION_SKILL_IMAGES[scene.event.profession]} alt=""/><strong>{name}{scene.event.profession==='swordsman'||scene.impact?'!':' 준비'}</strong><span>{game.players[scene.event.actor].name} · {scene.event.spent}칸 소비</span><b>{healing?`HP +${scene.event.healing[scene.event.actor]}`:scene.event.profession==='mage'?`모두 피해 ${skill.values[scene.event.spent]}`:`${game.players[scene.event.target!].name} 피해 ${scene.event.damage[scene.event.target!]}`}</b></div>,document.body)}
 {scene.event.profession==='mage'&&!scene.impact&&scene.anchors.map(anchor=>createPortal(<span className={`mage-spell-flight spell-${spell.kind}`} style={{'--spell-from-x':`${scene.from.x}px`,'--spell-from-y':`${scene.from.y}px`,'--spell-to-x':`${anchor.x}px`,'--spell-to-y':`${anchor.y}px`,'--spell-angle':`${Math.atan2(anchor.y-scene.from.y,anchor.x-scene.from.x)*180/Math.PI-135}deg`,'--spell-delay':`${-scene.elapsed}ms`,'--spell-flight-ms':`${ACTIVE_IMPACT_MS}ms`} as CSSProperties} aria-hidden="true"><img src={PROFESSION_SKILL_IMAGES.mage} alt=""/></span>,document.body,`spell-flight:${anchor.seat}`))}
 {scene.event.profession==='mage'&&scene.impact&&scene.anchors.map(({seat,node})=>createPortal(<MageSpellImpact spent={scene.event.spent}/>,node,`spell-hit:${seat}`))}
 {scene.event.profession==='swordsman'&&scene.anchors.map(({seat,node})=>createPortal(<SwordsmanSlash impact={scene.impact}/>,node,`slash:${seat}`))}
 {scene.impact&&scene.anchors.map(({seat,node})=>createPortal(<span className={`rpg-hit-overlay ${healing?'is-heal':'is-damage'} profession-active-impact`} role="status" aria-label={`${game.players[seat].name} ${healing?'회복':'피해'} ${healing?scene.event.healing[seat]:scene.event.damage[seat]}`}><span className="rpg-hit-flash"/>{healing&&<span className="rpg-healing-rings" aria-hidden="true"/>}<b className="rpg-hit-number">{healing?`+${scene.event.healing[seat]}`:scene.event.damage[seat]?`−${scene.event.damage[seat]}`:'방어'}</b></span>,node,`active:${seat}`))}</>;
}
export function MageSpellImpact({spent}:{spent:number}){const spell=mageSpellPresentation(spent);return <span className={`mage-spell-hit spell-${spell.kind}`} data-mage-spell={spell.kind} aria-hidden="true">{spell.kind==='wall'?<img src="/item-battle-v1/skills/mage-firewall-v1.png" alt=""/>:<><i/><i/><img src={PROFESSION_SKILL_IMAGES.mage} alt=""/></>}</span>;}
