'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Eye,Swords} from 'lucide-react';
import type {view} from '../../lib/game.ts';
import type {AmbushBurst} from '../../lib/item-battle-rules.ts';
import {AMBUSH_IMPACT_MS,AMBUSH_PRESENTATION_MS} from '../../lib/pickup-presentation.ts';
type View=ReturnType<typeof view>;
export type AmbushHpPresentation={id:string,before:number[],owner:number};
export function RogueAmbushEffects({game,onHit,onHpPresentation}:{game:View,onHit:()=>void,onHpPresentation:(value:AmbushHpPresentation|null)=>void}){
 const event=game.rpgRun?.combat?.itemBattle?.lastAmbush,seen=useRef(event?.id),callbacks=useRef({onHit,onHpPresentation});callbacks.current={onHit,onHpPresentation};
 const [scene,setScene]=useState<{event:AmbushBurst,impact:boolean,targets:{node:HTMLElement,seat:number}[],x:number,y:number}|null>(null);
 useLayoutEffect(()=>{
  if(!event){setScene(null);callbacks.current.onHpPresentation(null);return;}if(seen.current===event.id)return;seen.current=event.id;const end=event.at-AMBUSH_IMPACT_MS+AMBUSH_PRESENTATION_MS;if(Date.now()>end)return;
  const board=document.querySelector('.floor-stage')?.getBoundingClientRect(),targets=game.players.flatMap((_,seat)=>{if(seat===event.owner)return [];const node=document.querySelector<HTMLElement>(seat===game.me?'.own-status-card':`.opponents [data-seat="${seat}"] .seat-card`);return node?[{node,seat}]:[];});
  setScene({event,impact:false,targets,x:(board?.left||0)+(board?.width||innerWidth)/2,y:(board?.top||0)+(board?.height||200)/2});callbacks.current.onHpPresentation({id:event.id,before:event.hpBefore,owner:event.owner});
  const impact=setTimeout(()=>{callbacks.current.onHpPresentation(null);setScene(value=>value?{...value,impact:true}:null);callbacks.current.onHit();},Math.max(0,event.at-Date.now())),done=setTimeout(()=>setScene(null),Math.max(0,end-Date.now()));
  return()=>{clearTimeout(impact);clearTimeout(done);callbacks.current.onHpPresentation(null);};
 },[event?.id,game.me]);
 if(!scene)return null;const coin=game.floorCoins?.events.at(-1),discovery=game.floorCoins?.lastDiscovery,yieldsToCoin=[coin,discovery].some(value=>value&&value.at>=scene.event.at&&value.at<scene.event.at+1000),trap=game.rpgRun?.combat?.itemBattle?.lastTrap,sharesTrap=trap&&Math.abs(trap.at-scene.event.at)<200;
 return <>{createPortal(<div className={`ambush-presentation ${scene.impact?'is-impact':''} ${yieldsToCoin?'yields-to-coin':''}`} style={{left:scene.x,top:scene.y-(sharesTrap?75:0)}} role="status"><Eye/><strong>{scene.impact?'투시 회수 기습!':'투시한 패 회수'}</strong><span>{game.players[scene.event.owner].name} · 상대 각각 피해 1</span></div>,document.body)}{scene.impact&&scene.targets.map(({node,seat})=>createPortal(<span className="ambush-target-hit" role="status"><Swords/><b>{scene.event.damage[seat]?`−${scene.event.damage[seat]}`:'방어'}</b></span>,node,`ambush:${seat}`))}</>;
}
