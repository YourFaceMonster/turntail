'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {trapAvailability,type TrapBurst} from '../../lib/item-battle-rules.ts';
import {TRAP_IMPACT_MS,TRAP_PRESENTATION_MS} from '../../lib/pickup-presentation.ts';
type View=ReturnType<typeof view>;
export type TrapHpPresentation={id:string,target:number,before:number};
export function RogueTrapControl({game,enabled,targeting,choose}:{game:View,enabled:boolean,targeting:boolean,choose:()=>void}){
 const state=game.rpgRun?.combat;if(!state?.itemBattle||state.professions[game.me]!=='rogue')return null;
 const availability=trapAvailability(game,game.me,enabled),hasFloor=game.stacks.some(stack=>stack.trapAvailable);
 return <button type="button" className={`text-btn rogue-trap-control ${targeting?'is-targeting':''}`} disabled={!availability.usable||!hasFloor} title={hasFloor?availability.reason:'남은 바닥패 없음'} aria-label={targeting?'함정 설치 취소':availability.reason==='이번 턴 스킬 사용 완료'?'함정 사용함':'함정 설치'} aria-pressed={targeting} onClick={choose}><img src="/item-battle-v1/trap-v1.webp" alt=""/></button>;
}
export function FloorTrapMarker({game,index}:{game:View,index:number}){
 const state=game.rpgRun?.combat?.itemBattle,own=state?.traps.some(trap=>trap.index===index),intel=state?.trapIntel[game.me]?.find(value=>value.index===index);
 if(!own&&!intel)return null;
 const label=own?'내 함정':intel?.trapped?'함정 발견':'확인 시 함정 없음';
 return <span className={`floor-trap-inset ${own?'is-own':intel?.trapped?'is-detected':'is-clear'}`} aria-label={label} title={label}>{own||intel?.trapped?<img src="/item-battle-v1/trap-v1.webp" alt=""/>:'✓'}</span>;
}
export function RogueTrapEffects({game,onHit,onHpPresentation}:{game:View,onHit:()=>void,onHpPresentation:(value:TrapHpPresentation|null)=>void}){
 const event=game.rpgRun?.combat?.itemBattle?.lastTrap,seen=useRef(event?.id),callbacks=useRef({onHit,onHpPresentation});callbacks.current={onHit,onHpPresentation};
 const [scene,setScene]=useState<{event:TrapBurst,impact:boolean,floor:HTMLElement|null,target:HTMLElement|null,owners:{node:HTMLElement,x:number,y:number}[],targetPoint:{x:number,y:number},center:{x:number,y:number}}|null>(null),[safe,setSafe]=useState(false);
 useLayoutEffect(()=>{
  if(!event){setScene(null);setSafe(false);callbacks.current.onHpPresentation(null);return;}if(event.id===seen.current)return;seen.current=event.id;if(event.safe){setScene(null);setSafe(true);const timer=setTimeout(()=>setSafe(false),2300);return()=>clearTimeout(timer);}setSafe(false);
  const start=event.at-TRAP_IMPACT_MS,end=start+TRAP_PRESENTATION_MS;if(Date.now()>end)return;
  const seat=(who:number)=>document.querySelector<HTMLElement>(who===game.me?'.rpg-mode .own-status-card':`.rpg-mode .opponents [data-seat="${who}"] .seat-card`),target=seat(event.target),floor=document.querySelector<HTMLElement>(`[data-stack="${event.index}"]`),board=document.querySelector('.floor-stage')?.getBoundingClientRect();
  const owners=(event.owners||[event.owner]).map(seat).filter((node):node is HTMLElement=>!!node).map(node=>{const rect=node.getBoundingClientRect();return {node,x:Math.max(65,Math.min(innerWidth-65,rect.left+rect.width/2)),y:Math.min(innerHeight-35,rect.bottom+5)};}),rect=target?.getBoundingClientRect(),targetPoint={x:(rect?.left||0)+(rect?.width||0)/2,y:(rect?.bottom||0)-5},center={x:Math.max(110,Math.min(innerWidth-110,(board?.left||0)+(board?.width||innerWidth)/2)),y:Math.max(80,Math.min(innerHeight-80,(board?.top||0)+(board?.height||200)/2))};
  setScene({event,impact:false,floor,target,owners,targetPoint,center});callbacks.current.onHpPresentation({id:event.id,target:event.target,before:event.hpBefore});
  const animations:Animation[]=[];
  const impact=setTimeout(()=>{callbacks.current.onHpPresentation(null);setScene(value=>value?{...value,impact:true}:null);callbacks.current.onHit();
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const portrait=target?.querySelector('.avatar,img,svg');if(portrait)animations.push(portrait.animate([{translate:'0 0'},{translate:'-7px 1px'},{translate:'7px -2px'},{translate:'-4px 1px'},{translate:'0 0'}],{duration:520,easing:'ease-out'}));
    owners.forEach(({node})=>{const face=node.querySelector('.avatar,img,svg');if(face)animations.push(face.animate([{scale:'1',rotate:'0deg'},{scale:'1.16',rotate:'-7deg'},{scale:'1.1',rotate:'7deg'},{scale:'1.16',rotate:'-5deg'},{scale:'1',rotate:'0deg'}],{duration:1100,easing:'ease-in-out'}));});
   }
  },Math.max(0,event.at-Date.now())),done=setTimeout(()=>setScene(null),Math.max(0,end-Date.now()));
  return()=>{clearTimeout(impact);clearTimeout(done);animations.forEach(animation=>animation.cancel());callbacks.current.onHpPresentation(null);};
 },[event?.id,game.me]);
 if(safe)return createPortal(<div className="trap-recovery-notice" role="status">내 함정을 안전하게 회수했어요 · 피해 없음</div>,document.body);
 if(!scene)return null;const {event:hit,impact}=scene,coin=game.floorCoins?.events.at(-1),discovery=game.floorCoins?.lastDiscovery,yieldsToCoin=[coin,discovery].some(value=>value&&value.index===hit.index&&value.at>=hit.at&&value.at<hit.at+1000),ownerNames=(hit.owners||[hit.owner]).map(owner=>game.players[owner].name).join(' · ');
 return <>{createPortal(<div className={`trap-presentation ${impact?'is-impact':'is-revealing'} ${yieldsToCoin?'yields-to-coin':''}`} data-trap-phase={impact?'impact':'revealing'}>
  <div className="trap-impact-title" style={{left:scene.center.x,top:scene.center.y}} role="status" aria-live="polite"><strong>{impact?'쾅! 함정 발동':'함정을 밟았다!'}</strong><span>{impact?`${game.players[hit.target].name} ${hit.damage?`HP −${hit.damage}`:'피해 방어'}`:`${ownerNames}의 숨겨둔 함정`}</span></div>
 </div>,document.body)}
 {scene.floor&&createPortal(<span className={`trap-floor-scene ${impact?'is-impact':''}`} aria-hidden="true"><i/><i/><img src="/item-battle-v1/trap-v1.webp" alt=""/><b>쾅!</b></span>,scene.floor)}
 {impact&&scene.target&&createPortal(<span className="trap-target-impact" aria-hidden="true"/>,scene.target)}
 {impact&&createPortal(<b className="trap-damage-float" style={{left:scene.targetPoint.x,top:scene.targetPoint.y}}>{hit.damage?`−${hit.damage}`:'방어'}</b>,document.body)}
 {impact&&scene.owners.map((owner,index)=>createPortal(<span className="trap-owner-laugh" style={{left:owner.x,top:owner.y}} role="status">히히, 걸렸네!</span>,document.body,`laugh:${index}`))}</>;
}
