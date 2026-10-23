"use client";
import {createPortal} from 'react-dom';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import RoomAmbience from './RoomAmbience';
import TileBack from './TileBack';
import TileFace from './TileFace';
import TableSurface from './TableSurface';
import {ENTRANCE_MS,type EntrancePhase} from '../../lib/atmosphere';
import {measureDealLayout,dealTarget,shufflePoint,DEAL_TILE_W,DEAL_TILE_H,type DealView,type DealItem,type DealTarget} from '../../lib/deal-animation';
type Props={phase:EntrancePhase,resume:boolean,reduced:boolean,visible:boolean,game:DealView|null,rotation:number,onPrepared:()=>void,onFallback:()=>void};
export default function GameEntrance({phase,resume,reduced,visible:pageVisible,game,rotation,onPrepared,onFallback}:Props){
 const [screen,setScreen]=useState({width:0,height:0}),[landings,setLandings]=useState<{item:DealItem,target:DealTarget,finish:Record<string,string>}[]>([]);
 const [tableTarget,setTableTarget]=useState<DealTarget|null>(null);
 const callbacks=useRef({onPrepared,onFallback});callbacks.current={onPrepared,onFallback};
 const latest=useRef({game,rotation});latest.current={game,rotation};
 useEffect(()=>{const resize=()=>setScreen({width:window.innerWidth,height:window.innerHeight});resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 useLayoutEffect(()=>{
  if(phase==='menu-out'){setLandings([]);setTableTarget(null);}
  if(!['prepare','deal','settle','game-in'].includes(phase)||resume||reduced||!pageVisible)return;
  let frame=0,attempt=0,last='',stable=0,ended=false;
  function measure(){
   if(ended)return;
   try{
    const {game,rotation}=latest.current;if(!game)throw Error('Not mounted');
    const rows=measureDealLayout(game,rotation,selector=>{const el=document.querySelector(selector);if(!el)return null;const style=getComputedStyle(el);return {rect:el.getBoundingClientRect(),finish:{'--finish-bg':style.background,'--finish-border':style.border,'--finish-radius':style.borderRadius,'--finish-shadow':style.boxShadow}};});
    const tableRect=document.querySelector('.active-table .play-column')?.getBoundingClientRect();
    if(!tableRect||tableRect.width<=0||tableRect.height<=0)throw Error('Table layout pending');
    const table=dealTarget(tableRect,rotation);
    const signature=JSON.stringify([table,rows.map(r=>r.target)]);stable=signature===last?stable+1:0;last=signature;
    if(stable>=2){setLandings(rows);setTableTarget(table);if(phase==='prepare')callbacks.current.onPrepared();return;}
   }catch{}
   if(++attempt<90)frame=requestAnimationFrame(measure);
   else if(phase==='prepare')callbacks.current.onFallback();
  }
  frame=requestAnimationFrame(measure);
  return()=>{ended=true;cancelAnimationFrame(frame);};
 },[phase,resume,reduced,pageVisible,screen.width,screen.height,rotation]);
 if(phase==='idle'||reduced||typeof document==='undefined')return null;
 const visible=['approach','shuffle','prepare','deal','settle','game-in'].includes(phase),distributed=['deal','settle','game-in'].includes(phase)&&landings.length===60;
 return createPortal(<div className={`table-entrance entry-${phase} ${resume?'entry-resume':''} ${distributed?'entry-distributed':''}`} aria-hidden="true" data-visible={pageVisible} style={{'--approach-ms':`${ENTRANCE_MS.approach}ms`,'--shuffle-ms':`${ENTRANCE_MS.shuffle}ms`,'--reveal-ms':`${ENTRANCE_MS['game-in']}ms`,visibility:visible?'visible':'hidden'} as CSSProperties}>
  <div className="entry-room"><RoomAmbience/></div>
  <div className="entry-table" style={distributed&&tableTarget?{left:tableTarget.x-tableTarget.width/2,top:tableTarget.y-tableTarget.height/2,width:tableTarget.width,height:tableTarget.height,'--table-angle':`${tableTarget.angle}deg`} as CSSProperties:undefined}><TableSurface/></div>
  {!resume&&<div className="entry-deck">{Array.from({length:60},(_,i)=>{
   const {x,y}=shufflePoint(i,screen.width,screen.height),landing=landings[i],t=landing?.target||{x,y,width:DEAL_TILE_W,height:DEAL_TILE_H,angle:0},kind=landing?.item.kind||'upper',side=i%2?1:-1;
   return <div key={i} className={`deal-flying-card deal-${kind}`} style={{'--sx':`${x-DEAL_TILE_W/2}px`,'--sy':`${y-DEAL_TILE_H/2}px`,'--scatter-x':`${screen.width/2+side*(40+(i*23)%110)-DEAL_TILE_W/2}px`,'--scatter-y':`${screen.height/2+(i*43)%210-105-DEAL_TILE_H/2}px`,'--sweep-x':`${screen.width/2-side*(30+(i*31)%110)-DEAL_TILE_W/2}px`,'--sweep-y':`${screen.height/2+(i*37)%180-90-DEAL_TILE_H/2}px`,'--tile-angle':`${(i*41)%100-50}deg`,'--tx':`${t.x-DEAL_TILE_W/2}px`,'--ty':`${t.y-DEAL_TILE_H/2}px`,'--target-angle':`${t.angle}deg`,'--target-w':`${t.width}px`,'--target-h':`${t.height}px`,'--end-left':`${t.x-t.width/2}px`,'--end-top':`${t.y-t.height/2}px`,...landing?.finish,'--target-sx':t.width/DEAL_TILE_W,'--target-sy':t.height/DEAL_TILE_H,'--deal-delay':`${i*15}ms`,'--flip-delay':`${i*15+670}ms`,zIndex:i+1} as CSSProperties}>
    <div className="deal-flipper"><div className="deal-back"><TileBack/></div>{landing?.item.tile&&<div className="deal-face"><TileFace tile={landing.item.tile}/></div>}</div>
    {kind==='lower'&&<span className="deal-covered tile covered-face"/>}
   </div>;
  })}</div>}
  <div className="entry-edge-shade"/>
 </div>,document.body);
}
