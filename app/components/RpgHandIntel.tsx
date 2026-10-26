"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import {itemSceneTiming} from '../../lib/rpg-item-motion.ts';
import TileFace from './TileFace';
export default function RpgHandIntel({game}:{game:ReturnType<typeof view>}){
 const event=game.rpgRun?.lastItem,peek=game.rpgRun?.tactics?.[game.me]?.handPeek,seen=useRef(event?.id),[open,setOpen]=useState(false);
 useEffect(()=>{if(!event||seen.current===event.id)return;seen.current=event.id;if(event.kind!=='reveal'||event.actor!==game.me)return;const timer=setTimeout(()=>setOpen(true),Math.max(0,event.at+itemSceneTiming(event,game.me).duration-Date.now()));return()=>clearTimeout(timer);},[event?.id]);
 return <>{peek&&<button className="private-intel-button" onClick={()=>setOpen(true)}>엿본 패</button>}{open&&createPortal(<div className="modal-shade" onClick={()=>setOpen(false)}><section className="modal hand-intel-modal" role="dialog" aria-modal="true" aria-label="나만 아는 상대 손패" onClick={event=>event.stopPropagation()}><button className="close" onClick={()=>setOpen(false)} aria-label="엿본 패 닫기">×</button><h2>{peek?`${game.players[peek.target].name}의 손패`:'확인한 패가 이동했어요'}</h2>{peek?<><TileFace tile={peek.tile}/><p>나에게만 공개된 패예요.</p></>:<p>해당 패는 이미 제출되거나 교환됐어요.</p>}<button className="primary full" onClick={()=>setOpen(false)}>확인</button></section></div>,document.body)}</>;
}
