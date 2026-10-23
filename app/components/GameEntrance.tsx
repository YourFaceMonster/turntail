"use client";
import {createPortal} from 'react-dom';
import type {CSSProperties} from 'react';
import RoomAmbience from './RoomAmbience';
import {SuitEmblem} from './TileFace';
import {ENTRANCE_MS,type EntrancePhase} from '../../lib/atmosphere';
export default function GameEntrance({phase,resume,reduced,visible:pageVisible}:{phase:EntrancePhase,resume:boolean,reduced:boolean,visible:boolean}){
 if(phase==='idle'||reduced||typeof document==='undefined')return null;
 const visible=['approach','shuffle','settle','game-in'].includes(phase);
 return createPortal(<div className={`table-entrance entry-${phase} ${resume?'entry-resume':''}`} aria-hidden="true" data-visible={pageVisible} style={{'--approach-ms':`${ENTRANCE_MS.approach}ms`,'--shuffle-ms':`${ENTRANCE_MS.shuffle}ms`,'--reveal-ms':`${ENTRANCE_MS['game-in']}ms`,visibility:visible?'visible':'hidden'} as CSSProperties}>
  <div className="entry-room"><RoomAmbience/></div>
  <div className="entry-table"><div className="entry-table-rim"/><div className="entry-lamplight"/>
   {!resume&&<div className="entry-tiles">{Array.from({length:18},(_,i)=>{
    const col=i%6,row=Math.floor(i/6),side=i%2?1:-1;
    return <div key={i} className="entry-tile-slot" style={{'--slot-x':`${(col-2.5)*47}px`,'--slot-y':`${(row-1)*65}px`,'--scatter-x':`${side*(75+(i*37)%130)}px`,'--scatter-y':`${(i*53)%190-95}px`,'--sweep-x':`${-side*(105+(i*17)%65)}px`,'--sweep-y':`${(i*29)%130-65}px`,'--tile-angle':`${(i*41)%110-55}deg`,'--tile-delay':`${i%6*18}ms`} as CSSProperties}>
     <span className="entry-ivory-tile"><span className="entry-tile-back"><SuitEmblem s={i%4}/></span></span>
    </div>;
   })}</div>}
  </div>
  <div className="entry-edge-shade"/>
 </div>,document.body);
}
