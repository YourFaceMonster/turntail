'use client';
import {RPG_PHASE_ONE} from '../../lib/rpg-phase-one.ts';
import {useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {PROFESSION_ACTIVES,activeGauge,professionActiveAvailability,ACTIVE_IMPACT_MS,ACTIVE_PRESENTATION_MS,type ProfessionActiveEvent} from '../../lib/profession-actives.ts';
import {RogueTrapControl} from './RogueTrap';
import {PROFESSION_SKILL_IMAGES,mageSpellPresentation,mageSpellFlightOrientation} from '../../lib/item-battle-visuals';
type View=ReturnType<typeof view>;
export type ActiveHpPresentation={id:string,before:number[]};
export function SwordsmanSlash({impact=false}:{impact?:boolean}){return <span className={`swordsman-slash steel-strike ${impact?'is-impact':''}`} aria-hidden="true">
 <svg className="steel-sweep" viewBox="0 0 180 100"><path className="steel-wake" d="M9 86Q55 12 167 9Q106 31 42 81Z"/><path className="steel-edge" d="M10 86Q73 34 167 9"/></svg>
 <img className="steel-blade sword-cutout" src="/item-battle-v1/skills/swordsman-sword-cutout-v1.png" alt="" draggable={false}/>
 {impact&&<><svg className="steel-impact-flare" viewBox="0 0 180 100"><path className="steel-impact-trail" d="M-6 104Q60 51 184-5L166 18Q70 70-6 104Z"/><path className="steel-impact-line" d="M-6 104L184-5"/></svg><span className="steel-contact"><i/><i/><i/><i/><i/><i/></span></>}
 </span>;}
export function ProfessionGauge({game,seat=game.me}:{game:View,seat?:number}){
 const profession=game.rpgRun?.combat?.professions[seat];if(!profession||seat!==game.me)return null;
 const max=PROFESSION_ACTIVES[profession].maxGauge,value=activeGauge(game,seat);
 return <span className={`profession-gauge ${value===max?'is-full':''}`} role="meter" aria-label={`액티브 게이지 ${value}/${max}${value===max?' · 완충':''}`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} title={`게이지 ${value}/${max} · ${game.rpgRun?.phaseOne?`결투 ${RPG_PHASE_ONE.duelsPerGauge}회마다 +1`:'판 종료 시 +1'} · 남은 칸 이월`}>{Array.from({length:max},(_,index)=><i key={index} className={index<value?'is-filled':''}/>)}</span>;
}
export function ProfessionActiveControl({game,enabled,targeting,choose}:{game:View,enabled:boolean,targeting:boolean,choose:()=>void}){
 const combat=game.rpgRun?.combat;if(!combat?.itemBattle)return null;const profession=combat.professions[game.me],config=PROFESSION_ACTIVES[profession],available=professionActiveAvailability(game,game.me,enabled),value=activeGauge(game,game.me),name=profession==='mage'?mageSpellPresentation(value).name:config.name;
 return <span className={`profession-active-control profession-${profession} ${value===config.maxGauge?'is-full':''}`} title={`${name} · ${value}/${config.maxGauge}칸 · ${available.reason}`}>
  {profession==='rogue'?<RogueTrapControl game={game} enabled={enabled} targeting={targeting} choose={choose}/>:<button type="button" className={`text-btn profession-active-button ${targeting?'is-targeting':''}`} disabled={!available.usable} aria-label={targeting?`${name} 대상 선택 취소`:`${name} · 게이지 ${value}/${config.maxGauge} · ${available.reason}`} aria-pressed={profession==='swordsman'?targeting:undefined} onClick={choose}><img src={PROFESSION_SKILL_IMAGES[profession]} alt="" draggable={false}/></button>}
  <ProfessionGauge game={game}/>
 </span>;
}
export function ProfessionSkillNotice({event,players,impact=false,style}:{event:ProfessionActiveEvent,players:readonly {name:string}[],impact?:boolean,style?:CSSProperties}){
 const healing=event.profession==='cleric',spell=mageSpellPresentation(event.spent),skill=PROFESSION_ACTIVES[event.profession],name=event.profession==='mage'?spell.name:skill.name;
 const amount=healing?event.healing[event.actor]:event.profession==='mage'?skill.values[event.spent]:event.damage[event.target!],target=healing?'자신 회복':event.profession==='mage'?'상대 모두':players[event.target!]?.name||'상대';
 return <div className={`profession-active-scene skill-notice profession-${event.profession} ${impact?'is-impact':''}`} style={style} role="status"><span className="skill-notice-corner" aria-hidden="true"/><span className="profession-notice-icon"><img src={PROFESSION_SKILL_IMAGES[event.profession]} alt=""/></span><div className="profession-notice-copy"><small>직업 스킬 <em>{impact?'적중':'시전'}</em></small><strong>{name}</strong><span>{players[event.actor].name} · {event.spent}칸 소비</span></div><p className="profession-notice-outcome"><span>{target}</span><b>{healing?`+${amount} HP`:amount?`−${amount} HP`:'방어'}</b></p></div>;
}
export function MageSpellFlight({from,to,spent,elapsed=0}:{from:{x:number,y:number},to:{x:number,y:number},spent:number,elapsed?:number}){
 const spell=mageSpellPresentation(spent),orientation=mageSpellFlightOrientation(from,to);
 return <span className={`mage-spell-flight spell-${spell.kind}`} data-flight-direction={orientation.direction} style={{'--spell-from-x':`${from.x}px`,'--spell-from-y':`${from.y}px`,'--spell-to-x':`${to.x}px`,'--spell-to-y':`${to.y}px`,'--spell-angle':`${orientation.angle}deg`,'--spell-mirror':orientation.mirror,'--spell-delay':`${-elapsed}ms`,'--spell-flight-ms':`${ACTIVE_IMPACT_MS}ms`} as CSSProperties} aria-hidden="true"><img src={PROFESSION_SKILL_IMAGES.mage} alt=""/></span>;
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
 if(!scene)return null;const healing=scene.event.profession==='cleric';
 return <>{createPortal(<ProfessionSkillNotice event={scene.event} players={game.players} impact={scene.impact} style={{left:scene.x,top:scene.y}}/>,document.body)}
 {scene.event.profession==='mage'&&!scene.impact&&scene.anchors.map(anchor=>createPortal(<MageSpellFlight from={scene.from} to={anchor} spent={scene.event.spent} elapsed={scene.elapsed}/>,document.body,`spell-flight:${anchor.seat}`))}
 {scene.event.profession==='mage'&&scene.impact&&scene.anchors.map(({seat,x,y})=>createPortal(<span className="mage-impact-anchor" data-target-seat={seat} style={{left:Math.max(70,Math.min(innerWidth-70,x)),top:Math.max(65,Math.min(innerHeight-65,y))}}><MageSpellImpact spent={scene.event.spent}/></span>,document.body,`spell-hit:${seat}`))}
 {scene.event.profession==='swordsman'&&scene.anchors.map(({seat,x,y})=>createPortal(<span className="swordsman-impact-anchor" data-target-seat={seat} style={{left:Math.max(100,Math.min(innerWidth-100,x)),top:Math.max(75,Math.min(innerHeight-75,y))}}><SwordsmanSlash impact={scene.impact}/></span>,document.body,`slash:${seat}`))}
 {scene.impact&&scene.anchors.map(({seat,node})=>createPortal(<span className={`rpg-hit-overlay ${healing?'is-heal':'is-damage'} profession-active-impact`} role="status" aria-label={`${game.players[seat].name} ${healing?'회복':'피해'} ${healing?scene.event.healing[seat]:scene.event.damage[seat]}`}><span className="rpg-hit-flash"/>{healing&&<span className="rpg-healing-rings" aria-hidden="true"/>}<b className="rpg-hit-number">{healing?`+${scene.event.healing[seat]}`:scene.event.damage[seat]?`−${scene.event.damage[seat]}`:'방어'}</b></span>,node,`active:${seat}`))}</>;
}
export function MageSpellImpact({spent}:{spent:number}){const spell=mageSpellPresentation(spent);return <span className={`mage-spell-hit spell-${spell.kind}`} data-mage-spell={spell.kind} aria-hidden="true">{spell.kind==='wall'?<><span className="firewall-core"/><img src="/item-battle-v1/skills/mage-firewall-v1.png" alt=""/><span className="firewall-shockwave"/><span className="firewall-embers">{Array.from({length:9},(_,i)=><i key={i} style={{'--ember-index':i} as CSSProperties}/>)}</span></>:<><span className="mage-explosion-sprite"/><span className="mage-burn-haze"/><i className="mage-impact-ring"/></>}</span>;}
