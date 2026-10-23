"use client";
import {createPortal} from 'react-dom';
import {memo,useMemo,useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import TileFace from './TileFace';
import TableSurface from './TableSurface';
import ShuffleCanvas from './ShuffleCanvas';
import {planShuffle,frameShuffle,overviewScale,shuffleDepth,type ShuffleScene} from '../../lib/shuffle-motion';
import {matchShuffleTracks,planDealFlights,opponentExit} from '../../lib/deal-motion';
import {ENTRANCE_MS,entranceCurtain,type EntrancePhase} from '../../lib/atmosphere';
import {measureDealLayout,shuffleTileSize,type DealView,type DealItem,type DealTarget} from '../../lib/deal-animation';
type Props={phase:EntrancePhase,resume:boolean,reduced:boolean,visible:boolean,game:DealView|null,rotation:number,onPrepared:()=>void,onFallback:()=>void};
function GameEntrance({phase,resume,reduced,visible:pageVisible,game,rotation,onPrepared,onFallback}:Props){
 const [screen,setScreen]=useState({width:0,height:0}),[landings,setLandings]=useState<{item:DealItem,target:DealTarget,finish:Record<string,string>}[]>([]);
 const [scene,setScene]=useState<ShuffleScene|null>(null),[assetsReady,setAssetsReady]=useState(false);
 const shuffleSeed=useRef(0),measuredKey=useRef('');
 const callbacks=useRef({onPrepared,onFallback});callbacks.current={onPrepared,onFallback};
 const latest=useRef({game,rotation});latest.current={game,rotation};
 useEffect(()=>{const resize=()=>setScreen({width:window.innerWidth,height:window.innerHeight});resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 // Decode while the menu is still visible, rather than on the first moving frame.
 useEffect(()=>{
  if(!screen.width)return;
  let cancelled=false;setAssetsReady(false);
  const paths=[screen.height>=screen.width?'/turntale-empty-room-portrait.webp':'/turntale-empty-room.webp','/turntale-tile-back-gold.svg'];
  void Promise.all(paths.map(src=>new Promise<void>(resolve=>{const img=new Image();img.onload=()=>{void img.decode().catch(()=>{}).then(resolve);};img.onerror=()=>resolve();img.src=src;}))).then(()=>{if(!cancelled)setAssetsReady(true);});
  return()=>{cancelled=true;};
 },[screen.width>screen.height,!!screen.width]);
 useLayoutEffect(()=>{
  if(phase==='menu-out'){shuffleSeed.current=crypto.getRandomValues(new Uint32Array(1))[0];setLandings([]);setScene(null);measuredKey.current='';}
  if(!['prepare','approach','shuffle','deal'].includes(phase)||resume||reduced||!pageVisible)return;
  const layoutKey=`${screen.width}:${screen.height}:${rotation}`;
  if(phase!=='prepare'&&measuredKey.current===layoutKey)return;
  // A viewport change mid-flight must reveal the correctly laid-out live board,
  // rather than restarting 60 motions against stale coordinates.
  if(phase!=='prepare'&&measuredKey.current){callbacks.current.onFallback();return;}
  let frame=0,attempt=0,last='',stable=0,ended=false;
  function measure(){
   if(ended)return;
   try{
    const {game,rotation}=latest.current;if(!game)throw Error('Not mounted');
    const rows=measureDealLayout(game,rotation,selector=>{const el=document.querySelector(selector);return el?{rect:el.getBoundingClientRect(),finish:{}}:null;});
    const tableRect=document.querySelector('.active-table .play-column')?.getBoundingClientRect();
    if(!tableRect||tableRect.width<=0||tableRect.height<=0)throw Error('Table layout pending');
    const signature=JSON.stringify([tableRect.width,tableRect.height,rows.map(r=>r.target)]);stable=signature===last?stable+1:0;last=signature;
    if(stable>=2){
     // Only the own-face handoff uses a DOM copy; the other 50+ backs stay on canvas.
     for(const row of rows)if(row.item.kind==='own'){
      const style=getComputedStyle(document.querySelector(row.item.selector)!);
      row.finish={'--finish-bg':style.background,'--finish-border':style.border,'--finish-radius':style.borderRadius,'--finish-shadow':style.boxShadow};
     }
     measuredKey.current=layoutKey;setLandings(rows);return;
    }
   }catch{}
   if(++attempt<90)frame=requestAnimationFrame(measure);
   else if(phase==='prepare')callbacks.current.onFallback();
  }
  frame=requestAnimationFrame(measure);
  return()=>{ended=true;cancelAnimationFrame(frame);};
 },[phase,resume,reduced,pageVisible,screen.width,screen.height,rotation]);
 const own=landings.find(row=>row.item.kind==='own')?.target;
 const preparing=phase==='prepare'&&!resume&&!reduced;
 useEffect(()=>{
  if(!preparing||!own||landings.length!==60||!screen.width)return;
  let cancelled=false,timer=0;
  const planner=planShuffle(shuffleSeed.current,screen.width,screen.height,landings.map(l=>shuffleTileSize(l.item.kind,l.target,own)));
  function advance(){
   if(cancelled)return;
   try{
    const until=performance.now()+3;
    do{const result=planner.next();if(result.done){setScene(result.value);return;}}while(performance.now()<until);
    timer=window.setTimeout(advance,0);
   }catch{callbacks.current.onFallback();}
  }
  timer=window.setTimeout(advance,0);
  return()=>{cancelled=true;clearTimeout(timer);planner.return(null!);};
 },[landings,own,screen.width,screen.height,preparing]);
 const scale=scene?frameShuffle(scene,screen.width,screen.height):1;
 const cards=useMemo(()=>{
  const targets=landings.map(l=>l.item.kind==='opponent'&&own?{...opponentExit(l.target,screen.width,screen.height,90,Number(l.item.key.match(/\d+$/)?.[0]??0),Math.hypot(own.width,own.height)),width:own.width,height:own.height}:l.target);
  const assignments=scene?matchShuffleTracks(scene.tracks.map(track=>{const p=track.poses.at(-1)!;return {...p,x:screen.width/2+p.x*scale,y:screen.height/2+p.y*scale};}),targets):[];
  return landings.map((landing,i)=>{
  const {width,height}=shuffleTileSize(landing.item.kind,landing.target,own!),poses=scene?.tracks[assignments[i]].poses,depth=shuffleDepth(height);
  return {landing:{...landing,target:targets[i]},width,height,poses,depth};
 });},[landings,screen.width,screen.height,own,scene,scale]);
 const routes=useMemo(()=>scene?planDealFlights(cards.map(card=>{const p=card.poses!.at(-1)!;return {key:card.landing.item.key,kind:card.landing.item.kind,width:card.width,height:card.height,depth:card.depth,scale,source:{...p,x:screen.width/2+p.x*scale,y:screen.height/2+p.y*scale},target:card.landing.target};})):[],[cards,scene,scale,screen.width,screen.height]);
 const canvasCards=useMemo(()=>cards.map((card,i)=>({poses:card.poses!,width:card.width,height:card.height,depth:card.depth,route:routes[i]})),[cards,routes]);
 useEffect(()=>{
  if(phase!=='prepare'||!scene||routes.length!==60||!assetsReady||!pageVisible)return;
  // Give the decoded artwork and precomputed paths two paints.
  let second=0;const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>callbacks.current.onPrepared());});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);};
 },[phase,scene,routes,assetsReady,pageVisible]);
 if(phase==='idle'||reduced||typeof document==='undefined')return null;
 const diameter=(scene?.width??Math.max(screen.width,screen.height)*1.35)+32;
 const overview=overviewScale({width:diameter-32,height:diameter-32},screen.width,screen.height);
 const curtain=phase==='menu-out'?ENTRANCE_MS['menu-out']:360;
 return createPortal(<div className={`table-entrance entry-${phase} ${resume?'entry-resume':''}`} aria-hidden="true" data-visible={pageVisible} data-curtain={entranceCurtain(phase)} style={{'--camera-ms':`${ENTRANCE_MS.approach+(resume?0:ENTRANCE_MS.shuffle)}ms`,'--camera-overview':overview,'--camera-near':1/Math.max(.001,overview),'--table-diameter':`${diameter}px`,'--deal-ms':`${ENTRANCE_MS.deal}ms`,'--curtain-ms':`${curtain}ms`} as CSSProperties}>
  <div className="entry-view-rig">
  <div className="entry-room"><div className="entry-room-warmth"/><div className="entry-room-moonlight"/></div>
  <div className="entry-camera">
  <div className="entry-table"><TableSurface/></div>
  {!resume&&scene&&canvasCards.length===60&&<ShuffleCanvas cards={canvasCards} phase={phase} visible={pageVisible} width={screen.width} height={screen.height} scale={scale}/>}
  {!resume&&scene&&landings.length===60&&<div className="entry-deck">{cards.filter(card=>card.landing.item.kind==='own').map(({landing,width:tileW,height:tileH,depth})=>{
   const t=landing.target;
   return <div key={landing.item.key} className="deal-flying-card deal-own" style={{width:tileW,height:tileH,'--tile-depth':`${depth}px`,'--target-angle':`${t.angle}deg`,'--target-w':`${t.width}px`,'--target-h':`${t.height}px`,'--end-left':`${t.x-t.width/2}px`,'--end-top':`${t.y-t.height/2}px`,...landing.finish} as CSSProperties}>
    <div className="deal-flipper"><div className="deal-face"><TileFace tile={landing.item.tile!}/></div></div>
   </div>;
  })}</div>}
  </div>
  </div>
  <div className="entry-edge-shade"/>
  <div className="entry-curtain"/>
 </div>,document.body);
}

export default memo(GameEntrance);
