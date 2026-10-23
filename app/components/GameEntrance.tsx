"use client";
import {createPortal} from 'react-dom';
import {memo,useMemo,useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import RoomAmbience from './RoomAmbience';
import TileBack from './TileBack';
import TileFace from './TileFace';
import TableSurface from './TableSurface';
import {shuffleMotion,shuffleDepth,shuffleKeyframes} from '../../lib/shuffle-motion';
import {ENTRANCE_MS,type EntrancePhase} from '../../lib/atmosphere';
import {measureDealLayout,dealTarget,shuffleTileSize,type DealView,type DealItem,type DealTarget} from '../../lib/deal-animation';
type Props={phase:EntrancePhase,resume:boolean,reduced:boolean,visible:boolean,game:DealView|null,rotation:number,onPrepared:()=>void,onFallback:()=>void};
function GameEntrance({phase,resume,reduced,visible:pageVisible,game,rotation,onPrepared,onFallback}:Props){
 const [screen,setScreen]=useState({width:0,height:0}),[landings,setLandings]=useState<{item:DealItem,target:DealTarget,finish:Record<string,string>}[]>([]);
 const [tableTarget,setTableTarget]=useState<DealTarget|null>(null);
 const shuffleSeed=useRef(0),measuredKey=useRef(''),cardElements=useRef<(HTMLDivElement|null)[]>([]),running=useRef<Animation[]>([]);
 const callbacks=useRef({onPrepared,onFallback});callbacks.current={onPrepared,onFallback};
 const latest=useRef({game,rotation});latest.current={game,rotation};
 useEffect(()=>{const resize=()=>setScreen({width:window.innerWidth,height:window.innerHeight});resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 useLayoutEffect(()=>{
  if(phase==='menu-out'){shuffleSeed.current=crypto.getRandomValues(new Uint32Array(1))[0];setLandings([]);setTableTarget(null);measuredKey.current='';}
  if(!['prepare','approach','shuffle','deal','settle','game-in'].includes(phase)||resume||reduced||!pageVisible)return;
  const layoutKey=`${screen.width}:${screen.height}:${rotation}`;
  if(phase!=='prepare'&&measuredKey.current===layoutKey)return;
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
    if(stable>=2){measuredKey.current=layoutKey;setLandings(rows);setTableTarget(table);if(phase==='prepare')callbacks.current.onPrepared();return;}
   }catch{}
   if(++attempt<90)frame=requestAnimationFrame(measure);
   else if(phase==='prepare')callbacks.current.onFallback();
  }
  frame=requestAnimationFrame(measure);
  return()=>{ended=true;cancelAnimationFrame(frame);};
 },[phase,resume,reduced,pageVisible,screen.width,screen.height,rotation]);
 const own=landings.find(row=>row.item.kind==='own')?.target;
 const cards=useMemo(()=>landings.map((landing,i)=>{
  const {width,height}=shuffleTileSize(landing.item.kind,landing.target,own!),motion=shuffleMotion(shuffleSeed.current,i,screen.width,screen.height,width,height),depth=shuffleDepth(height);
  return {landing,width,height,motion,depth,keyframes:shuffleKeyframes(motion.poses,width,height,depth)};
 }),[landings,screen.width,screen.height,own]);
 useLayoutEffect(()=>{
  if(!cards.length||reduced||resume||!['prepare','approach','shuffle'].includes(phase))return;
  running.current=cards.flatMap((card,i)=>{
   const el=cardElements.current[i];if(!el)return [];
   const animation=el.animate(card.keyframes,{duration:ENTRANCE_MS.shuffle-card.motion.delay,delay:card.motion.delay,easing:'linear',fill:'both'});
   animation.pause();animation.currentTime=0;
   if(phase==='shuffle'&&pageVisible)animation.play();return [animation];
  });
  return()=>{running.current.forEach(animation=>animation.cancel());running.current=[];};
 },[cards,reduced,resume]);
 useLayoutEffect(()=>{
  if(phase==='shuffle')running.current.forEach(animation=>pageVisible?animation.play():animation.pause());
  else if(['deal','settle','game-in','idle','menu-out'].includes(phase)){running.current.forEach(animation=>animation.cancel());running.current=[];}
 },[phase,pageVisible]);
 if(phase==='idle'||reduced||typeof document==='undefined')return null;
 const visible=['approach','shuffle','prepare','deal','settle','game-in'].includes(phase),distributed=['deal','settle','game-in'].includes(phase)&&landings.length===60;
 return createPortal(<div className={`table-entrance entry-${phase} ${resume?'entry-resume':''} ${distributed?'entry-distributed':''}`} aria-hidden="true" data-visible={pageVisible} style={{'--approach-ms':`${ENTRANCE_MS.approach}ms`,'--shuffle-ms':`${ENTRANCE_MS.shuffle}ms`,'--reveal-ms':`${ENTRANCE_MS['game-in']}ms`,visibility:visible?'visible':'hidden'} as CSSProperties}>
  <div className="entry-room"><RoomAmbience/></div>
  <div className="entry-camera">
  <div className="entry-table" style={distributed&&tableTarget?{'--table-dx':`${tableTarget.x-screen.width/2}px`,'--table-dy':`${tableTarget.y-screen.height/2}px`,'--table-sx':tableTarget.width/(screen.width*1.24),'--table-sy':tableTarget.height/(screen.height*1.24),'--table-angle':`${tableTarget.angle}deg`} as CSSProperties:undefined}><TableSurface/></div>
  {!resume&&landings.length===60&&<div className="entry-deck">{cards.map(({landing,width:tileW,height:tileH,motion,depth},i)=>{
   const t=landing.target,kind=landing.item.kind;
   const last=motion.poses[4];
   const poses=Object.fromEntries(motion.poses.flatMap((p,n)=>[[`--mix-x${n}`,`${p.x-tileW/2}px`],[`--mix-y${n}`,`${p.y-tileH/2}px`],[`--mix-a${n}`,`${p.angle}deg`]]));
   return <div key={i} ref={el=>{cardElements.current[i]=el;}} className={`deal-flying-card deal-${kind}`} style={{width:tileW,height:tileH,...poses,'--tile-depth':`${depth}px`,'--mix-delay':`${motion.delay}ms`,'--mix-ms':`${ENTRANCE_MS.shuffle-motion.delay}ms`,'--sx':`${last.x-tileW/2}px`,'--sy':`${last.y-tileH/2}px`,'--rest-angle':`${last.angle}deg`,'--tx':`${t.x-tileW/2}px`,'--ty':`${t.y-tileH/2}px`,'--target-angle':`${t.angle}deg`,'--target-w':`${t.width}px`,'--target-h':`${t.height}px`,'--end-left':`${t.x-t.width/2}px`,'--end-top':`${t.y-t.height/2}px`,...landing.finish,'--target-sx':t.width/tileW,'--target-sy':t.height/tileH,'--deal-delay':`${i*15}ms`,'--flip-delay':`${i*15+670}ms`,zIndex:i+1} as CSSProperties}>
    <span className="deal-side-top"/><span className="deal-side-left"/>
    <div className="deal-flipper"><div className="deal-back"><TileBack/></div>{landing?.item.tile&&<div className="deal-face"><TileFace tile={landing.item.tile}/></div>}</div>
    {kind==='lower'&&<span className="deal-covered tile covered-face"/>}
   </div>;
  })}</div>}
  </div>
  <div className="entry-edge-shade"/>
 </div>,document.body);
}

export default memo(GameEntrance);
