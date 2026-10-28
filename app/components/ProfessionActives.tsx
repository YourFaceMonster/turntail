'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Swords,Heart,Sparkles} from 'lucide-react';
import type {view} from '../../lib/game.ts';
import {PROFESSION_ACTIVES,activeGauge,professionActiveAvailability,ACTIVE_IMPACT_MS,ACTIVE_PRESENTATION_MS,type ProfessionActiveEvent} from '../../lib/profession-actives.ts';
import {RogueTrapControl} from './RogueTrap';
type View=ReturnType<typeof view>;
export type ActiveHpPresentation={id:string,before:number[]};
export function ProfessionGauge({game,seat=game.me}:{game:View,seat?:number}){
 const profession=game.rpgRun?.combat?.professions[seat];if(!profession||seat!==game.me)return null;
 const max=PROFESSION_ACTIVES[profession].maxGauge,value=activeGauge(game,seat);
 return <span className="profession-gauge" role="meter" aria-label={`액티브 게이지 ${value}/${max}`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} title={`게이지 ${value}/${max} · 판 종료 시 +1 · 남은 칸 이월`}>{Array.from({length:max},(_,index)=><i key={index} className={index<value?'is-filled':''}/>)}</span>;
}
export function ProfessionActiveControl({game,enabled,targeting,choose}:{game:View,enabled:boolean,targeting:boolean,choose:()=>void}){
 const combat=game.rpgRun?.combat;if(!combat?.itemBattle)return null;const profession=combat.professions[game.me],config=PROFESSION_ACTIVES[profession],available=professionActiveAvailability(game,game.me,enabled),value=activeGauge(game,game.me),Icon=profession==='swordsman'?Swords:profession==='cleric'?Heart:Sparkles;
 return <span className={`profession-active-control profession-${profession}`} title={`${config.name} · ${value}/${config.maxGauge}칸 · ${available.reason}`}>
  {profession==='rogue'?<RogueTrapControl game={game} enabled={enabled} targeting={targeting} choose={choose}/>:<button type="button" className={`text-btn profession-active-button ${targeting?'is-targeting':''}`} disabled={!available.usable} aria-label={targeting?`${config.name} 대상 선택 취소`:`${config.name} · 게이지 ${value}/${config.maxGauge} · ${available.reason}`} aria-pressed={profession==='swordsman'?targeting:undefined} onClick={choose}><Icon aria-hidden="true"/></button>}
  <ProfessionGauge game={game}/>
 </span>;
}
export function ProfessionActiveEffects({game,onHit,onHpPresentation}:{game:View,onHit:()=>void,onHpPresentation:(value:ActiveHpPresentation|null)=>void}){
 const event=game.rpgRun?.combat?.actives?.lastEvent,seen=useRef(event?.id),callbacks=useRef({onHit,onHpPresentation});callbacks.current={onHit,onHpPresentation};
 const [scene,setScene]=useState<{event:ProfessionActiveEvent,impact:boolean,x:number,y:number,anchors:{seat:number,node:HTMLElement}[]}|null>(null);
 useLayoutEffect(()=>{
  if(!event){setScene(null);callbacks.current.onHpPresentation(null);return;}if(event.id===seen.current)return;seen.current=event.id;
  const end=event.at-ACTIVE_IMPACT_MS+ACTIVE_PRESENTATION_MS;if(Date.now()>end)return;
  const board=document.querySelector('.floor-stage')?.getBoundingClientRect(),anchors=game.players.flatMap((_,seat)=>{const affected=event.profession==='cleric'?seat===event.actor:event.profession==='swordsman'?seat===event.target:seat!==event.actor&&event.hpBefore[seat]>0;if(!affected)return [];const node=document.querySelector<HTMLElement>(seat===game.me?'.own-status-card':`.opponents [data-seat="${seat}"] .seat-card`);return node?[{seat,node}]:[];});
  setScene({event,impact:false,anchors,x:Math.max(120,Math.min(innerWidth-120,(board?.left||0)+(board?.width||innerWidth)/2)),y:Math.max(65,Math.min(innerHeight-65,(board?.top||0)+(board?.height||200)/2))});callbacks.current.onHpPresentation({id:event.id,before:event.hpBefore});
  const timer=setTimeout(()=>{setScene(value=>value?{...value,impact:true}:null);callbacks.current.onHpPresentation(null);callbacks.current.onHit();},Math.max(0,event.at-Date.now())),done=setTimeout(()=>setScene(null),Math.max(0,end-Date.now()));
  return()=>{clearTimeout(timer);clearTimeout(done);callbacks.current.onHpPresentation(null);};
 },[event?.id,game.me]);
 if(!scene)return null;const skill=PROFESSION_ACTIVES[scene.event.profession],healing=scene.event.profession==='cleric',Icon=scene.event.profession==='swordsman'?Swords:healing?Heart:Sparkles;
 return <>{createPortal(<div className={`profession-active-scene profession-${scene.event.profession} ${scene.impact?'is-impact':''}`} style={{left:scene.x,top:scene.y}} role="status"><Icon/><strong>{skill.name}{scene.impact?'!':' 준비'}</strong><span>{game.players[scene.event.actor].name} · {scene.event.spent}칸 소비</span><b>{healing?`HP +${scene.event.healing[scene.event.actor]}`:scene.event.profession==='mage'?`상대 각각 피해 ${skill.values[scene.event.spent]}`:`${game.players[scene.event.target!].name} 피해 ${scene.event.damage[scene.event.target!]}`}</b></div>,document.body)}
 {scene.impact&&scene.anchors.map(({seat,node})=>createPortal(<span className={`rpg-hit-overlay ${healing?'is-heal':'is-damage'} profession-active-impact`} role="status" aria-label={`${game.players[seat].name} ${healing?'회복':'피해'} ${healing?scene.event.healing[seat]:scene.event.damage[seat]}`}><span className="rpg-hit-flash"/>{healing&&<span className="rpg-healing-rings" aria-hidden="true"/>}<b className="rpg-hit-number">{healing?`+${scene.event.healing[seat]}`:scene.event.damage[seat]?`−${scene.event.damage[seat]}`:'방어'}</b></span>,node,`active:${seat}`))}</>;
}
