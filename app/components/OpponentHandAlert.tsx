"use client";
import {useEffect,useRef,useState} from 'react';
import type {view} from '../../lib/game';
import {tr,trv} from '../../lib/i18n/index.ts';
export default function OpponentHandAlert({game}:{game:ReturnType<typeof view>}){
 const counts=game.players.map(player=>player.count),seen=useRef(counts),[alert,setAlert]=useState<{seat:number,count:number}|null>(null);
 useEffect(()=>{const seat=counts.findIndex((count,index)=>index!==game.me&&count>0&&count<=3&&count<seen.current[index]);seen.current=counts;if(seat>=0)setAlert({seat,count:counts[seat]});},[counts.join(','),game.round]);
 useEffect(()=>{if(!alert)return;const timer=setTimeout(()=>setAlert(null),1600);return()=>clearTimeout(timer);},[alert]);
 return alert?<div className="opponent-hand-alert" data-count={alert.count} role="status" aria-live="polite"><b>{trv(game.players[alert.seat].name)}</b> · {alert.count}{tr('장 남음')}</div>:null;
}
