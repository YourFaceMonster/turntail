'use client';
import {useEffect,useLayoutEffect,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game';
import {seatPanelTheme} from '../../lib/seat-presentation';
import SeatPortrait from './SeatPortrait';
export default function ProfessionTargetPicker({game,pending,onChoose,onCancel}:{game:ReturnType<typeof view>,pending:boolean,onChoose:(seat:number)=>void,onCancel:()=>void}){
 const [position,setPosition]=useState<{left:number,top:number}|null>(null);
 useLayoutEffect(()=>{const measure=()=>{const hand=document.querySelector('.hand-panel')?.getBoundingClientRect(),board=document.querySelector('.floor-stage')?.getBoundingClientRect();const beside=!!hand&&!!board&&hand.left>=board.right-4,center=beside?hand!.left+hand!.width/2:board?board.left+board.width/2:innerWidth/2;setPosition({left:Math.max(145,Math.min(innerWidth-145,center)),top:Math.max(180,Math.min(innerHeight-24,hand?hand.top+(beside?190:12):innerHeight*.65))});};measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);},[]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape')onCancel();};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[onCancel]);
 if(!position)return null;
 return createPortal(<section className="profession-target-picker" style={position} role="group" aria-label="강타 대상 선택"><strong>강타를 사용할 상대를 선택하세요</strong><div className="exchange-pick-targets profession-pick-targets">{game.players.map((player,seat)=>{if(seat===game.me||game.rpgRun!.hp[seat]<=0)return null;const theme=seatPanelTheme(seat);return <button type="button" key={player.id} className={seat===2?'is-right-target':''} disabled={pending} onClick={()=>onChoose(seat)} style={{'--target-light':theme.light,'--target-dark':theme.dark,'--target-border':theme.border} as CSSProperties} aria-label={`${player.name}에게 강타 사용`}><SeatPortrait avatar={player.avatar} seat={seat}/><strong>{player.name}</strong><small>HP {game.rpgRun!.hp[seat]}</small></button>;})}</div><button type="button" className="text-btn profession-target-cancel" disabled={pending} onClick={onCancel}>취소</button></section>,document.body);
}
