"use client";
import {createPortal} from 'react-dom';
import {memo,useMemo,useEffect,useLayoutEffect,useRef,useState,useCallback,type CSSProperties} from 'react';
import {MATERIAL_COLORS} from './StageVisuals';
import TileBack from './TileBack';
import TileFace from './TileFace';
import TableSurface from './TableSurface';
import EntranceGpuTiles from './EntranceGpuTiles';
import {planShuffle,frameShuffle,overviewScale,shuffleDepth,shuffleFrameIndices,shuffleKeyframes,shuffleTransform,type ShuffleScene} from '../../lib/shuffle-motion';
import {matchShuffleTracks,planDealFlights,dealKeyframes,opponentExit} from '../../lib/deal-motion';
import {ENTRANCE_MS,entranceCurtain,type EntrancePhase} from '../../lib/atmosphere';
import {measureDealLayout,shuffleTileSize,type DealView,type DealItem,type DealTarget} from '../../lib/deal-animation';
type Props={stage?:number,phase:EntrancePhase,resume:boolean,reduced:boolean,visible:boolean,game:DealView|null,rotation:number,onPrepared:()=>void,onFallback:()=>void};
function GameEntrance({stage,phase,resume,reduced,visible:pageVisible,game,rotation,onPrepared,onFallback}:Props){
 const [screen,setScreen]=useState({width:0,height:0}),[landings,setLandings]=useState<{item:DealItem,target:DealTarget,finish:Record<string,string>}[]>([]);
 const [scene,setScene]=useState<ShuffleScene|null>(null),[assetsReady,setAssetsReady]=useState(false);
 const [gpuStatus,setGpuStatus]=useState<'pending'|'ready'|'fallback'>('pending');
 const shuffleSeed=useRef(0),measuredKey=useRef(''),cardElements=useRef<(HTMLDivElement|null)[]>([]),running=useRef<Animation[]>([]);
 const animationPhase=useRef('');
 const callbacks=useRef({onPrepared,onFallback});callbacks.current={onPrepared,onFallback};
 const activePhase=useRef(phase);activePhase.current=phase;
 const gpuPrepared=useCallback((status:'ready'|'fallback')=>{setGpuStatus(status);if(status==='fallback'&&['shuffle','deal'].includes(activePhase.current))callbacks.current.onFallback();},[]);
 const latest=useRef({game,rotation});latest.current={game,rotation};
 useEffect(()=>{const resize=()=>setScreen({width:window.innerWidth,height:window.innerHeight});resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 // Decode while the menu is still visible, rather than on the first moving frame.
 useEffect(()=>{
  if(!screen.width)return;
  let cancelled=false;setAssetsReady(false);
  const paths=[screen.height>=screen.width?'/turntale-empty-room-portrait.webp':'/turntale-empty-room.webp','/turntale-tile-back-gold.svg','/turntale-intro-walnut.webp',...(stage?['/turntale-stage-map.png','/turntale-stage-portraits.webp']:[])];
  void Promise.all(paths.map(src=>new Promise<void>(resolve=>{const img=new Image();img.onload=()=>{void img.decode().catch(()=>{}).then(resolve);};img.onerror=()=>resolve();img.src=src;}))).then(()=>{if(!cancelled)setAssetsReady(true);});
  return()=>{cancelled=true;};
 },[screen.width>screen.height,!!screen.width,stage]);
 useLayoutEffect(()=>{
  if(phase==='menu-out'){shuffleSeed.current=crypto.getRandomValues(new Uint32Array(1))[0];setLandings([]);setScene(null);setGpuStatus('pending');measuredKey.current='';}
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
     // Expensive computed styles are read once after geometry has settled.
     for(const row of rows)if(row.item.kind==='own'||row.item.kind==='upper'){
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
 const dealRoutes=useMemo(()=>scene?planDealFlights(cards.map(card=>{const p=card.poses!.at(-1)!;return {key:card.landing.item.key,kind:card.landing.item.kind,width:card.width,height:card.height,depth:card.depth,scale,source:{...p,x:screen.width/2+p.x*scale,y:screen.height/2+p.y*scale},target:card.landing.target};})):[],[cards,scene,scale,screen.width,screen.height]);
 const dealFrames=useMemo(()=>gpuStatus==='fallback'?dealRoutes.map(dealKeyframes):[],[dealRoutes,gpuStatus]);
 useLayoutEffect(()=>{
  if(gpuStatus!=='fallback'||!scene||!cards.length||reduced||resume||!['prepare','approach','shuffle'].includes(phase))return;
  const indices=shuffleFrameIndices(scene);
  running.current=cards.flatMap((card,i)=>{
   const el=cardElements.current[i];if(!el)return [];
   const animation=el.animate(shuffleKeyframes(card.poses!,card.width,card.height,card.depth,scale,screen.width/2,screen.height/2,indices),{duration:ENTRANCE_MS.shuffle,easing:'linear',fill:'both'});
   animation.pause();animation.currentTime=0;
   if(phase==='shuffle'&&pageVisible)animation.play();return [animation];
  });
  animationPhase.current='shuffle';
  return()=>{running.current.forEach(animation=>animation.cancel());running.current=[];};
 },[cards,reduced,resume,scene,gpuStatus,scale,screen.width,screen.height]);
 useEffect(()=>{
  if(phase!=='prepare'||!scene||!assetsReady||!pageVisible||gpuStatus==='pending')return;
  // Give the decoded artwork, paused transforms and compositing layers two paints.
  let second=0;const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>callbacks.current.onPrepared());});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);};
 },[phase,scene,assetsReady,pageVisible,gpuStatus]);
 useLayoutEffect(()=>{
  if(gpuStatus!=='fallback')return;
  if(phase==='deal'&&animationPhase.current!=='deal'&&dealFrames.length){
   running.current.forEach(animation=>animation.cancel());
   running.current=dealFrames.flatMap((frames,i)=>{const el=cardElements.current[i];if(!el)return [];const animation=el.animate(frames,{duration:ENTRANCE_MS.deal,easing:'linear',fill:'both'});animation.pause();animation.currentTime=0;return [animation];});
   animationPhase.current='deal';
  }
  if(phase==='shuffle'||phase==='deal')running.current.forEach(animation=>pageVisible?animation.play():animation.pause());
  else if(['settle','game-in','idle','menu-out'].includes(phase)){running.current.forEach(animation=>animation.cancel());running.current=[];animationPhase.current='';}
 },[phase,pageVisible,dealFrames,gpuStatus]);
 if(phase==='idle'||reduced||typeof document==='undefined')return null;
 const diameter=(scene?.width??Math.max(screen.width,screen.height)*1.35)+32;
 const overview=overviewScale({width:diameter-32,height:diameter-32},screen.width,screen.height);
 const curtain=phase==='menu-out'?ENTRANCE_MS['menu-out']:phase==='game-in'?ENTRANCE_MS['game-in']:360;
 return createPortal(<div className={`table-entrance entry-${phase} ${resume?'entry-resume':''} ${gpuStatus==='ready'?'entry-gpu-ready':''}`} aria-hidden="true" data-stage={stage} data-visible={pageVisible} data-curtain={entranceCurtain(phase)} style={{'--stage-side':stage?MATERIAL_COLORS[stage-1]:undefined,'--camera-ms':`${ENTRANCE_MS.approach+(resume?0:ENTRANCE_MS.shuffle)}ms`,'--camera-overview':overview,'--camera-near':1/Math.max(.001,overview),'--table-diameter':`${diameter}px`,'--deal-ms':`${ENTRANCE_MS.deal}ms`,'--curtain-ms':`${curtain}ms`} as CSSProperties}>
  <div className="entry-view-rig">
  <div className="entry-room"><div className="entry-room-warmth"/><div className="entry-room-moonlight"/></div>
  <div className="entry-camera">
  <div className="entry-table"><TableSurface withRim/></div>
  {!resume&&gpuStatus==='fallback'&&scene&&landings.length===60&&<div className="entry-deck">{cards.map(({landing,width:tileW,height:tileH,poses,depth},i)=>{
   const t=landing.target,kind=landing.item.kind;
   return <div key={i} ref={el=>{cardElements.current[i]=el;}} className={`deal-flying-card deal-${kind}`} style={{width:tileW,height:tileH,'--start-transform':shuffleTransform(poses![0],tileW,tileH,depth,scale,screen.width/2,screen.height/2),'--tile-depth':`${depth}px`,'--target-angle':`${t.angle}deg`,'--target-w':`${t.width}px`,'--target-h':`${t.height}px`,'--end-left':`${t.x-t.width/2}px`,'--end-top':`${t.y-t.height/2}px`,...landing.finish,'--flip-delay':`${ENTRANCE_MS.deal*.82}ms`,zIndex:i+1} as CSSProperties}>
    <span className="deal-side-top"/><span className="deal-side-left"/>
    <div className="deal-flipper"><div className="deal-back"><TileBack flat/></div>{landing?.item.tile&&<div className="deal-face"><TileFace tile={landing.item.tile}/></div>}</div>
    {kind==='lower'&&<span className="deal-covered tile covered-face"/>}
   </div>;
  })}</div>}
  </div>
  </div>
  {!resume&&scene&&cards.length===60&&<EntranceGpuTiles cards={cards} routes={dealRoutes} phase={phase} visible={pageVisible} width={screen.width} height={screen.height} overview={overview} onStatus={gpuPrepared}/>}
  <div className="entry-edge-shade"/>
  <div className="entry-curtain"/>
 </div>,document.body);
}

export default memo(GameEntrance);
