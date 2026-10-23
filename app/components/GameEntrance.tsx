"use client";
import {createPortal} from 'react-dom';
import {memo,useMemo,useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import TileBack from './TileBack';
import TileFace from './TileFace';
import TableSurface from './TableSurface';
import {planShuffle,frameShuffle,shuffleDepth,shuffleKeyframes,shuffleTransform,type ShuffleScene} from '../../lib/shuffle-motion';
import {matchShuffleTracks,planDealFlights,dealKeyframes} from '../../lib/deal-motion';
import {ENTRANCE_MS,type EntrancePhase} from '../../lib/atmosphere';
import {measureDealLayout,dealTarget,shuffleTileSize,type DealView,type DealItem,type DealTarget} from '../../lib/deal-animation';
type Props={phase:EntrancePhase,resume:boolean,reduced:boolean,visible:boolean,game:DealView|null,rotation:number,onPrepared:()=>void,onFallback:()=>void};
function GameEntrance({phase,resume,reduced,visible:pageVisible,game,rotation,onPrepared,onFallback}:Props){
 const [screen,setScreen]=useState({width:0,height:0}),[landings,setLandings]=useState<{item:DealItem,target:DealTarget,finish:Record<string,string>}[]>([]);
 const [tableTarget,setTableTarget]=useState<DealTarget|null>(null);
 const [scene,setScene]=useState<ShuffleScene|null>(null),[assetsReady,setAssetsReady]=useState(false);
 const shuffleSeed=useRef(0),measuredKey=useRef(''),cardElements=useRef<(HTMLDivElement|null)[]>([]),running=useRef<Animation[]>([]);
 const animationPhase=useRef('');
 const callbacks=useRef({onPrepared,onFallback});callbacks.current={onPrepared,onFallback};
 const latest=useRef({game,rotation});latest.current={game,rotation};
 useEffect(()=>{const resize=()=>setScreen({width:window.innerWidth,height:window.innerHeight});resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 // Decode while the menu is still visible, rather than on the first moving frame.
 useEffect(()=>{
  if(!screen.width)return;
  let cancelled=false;setAssetsReady(false);
  const paths=[screen.height>=screen.width?'/turntale-empty-room-portrait.webp':'/turntale-empty-room.webp','/turntale-tile-back.svg'];
  void Promise.all(paths.map(src=>new Promise<void>(resolve=>{const img=new Image();img.onload=()=>{void img.decode().catch(()=>{}).then(resolve);};img.onerror=()=>resolve();img.src=src;}))).then(()=>{if(!cancelled)setAssetsReady(true);});
  return()=>{cancelled=true;};
 },[screen.width>screen.height,!!screen.width]);
 useLayoutEffect(()=>{
  if(phase==='menu-out'){shuffleSeed.current=crypto.getRandomValues(new Uint32Array(1))[0];setLandings([]);setScene(null);setTableTarget(null);measuredKey.current='';}
  if(!['prepare','approach','shuffle','deal','settle','game-in'].includes(phase)||resume||reduced||!pageVisible)return;
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
    const table=dealTarget(tableRect,rotation);
    const signature=JSON.stringify([table,rows.map(r=>r.target)]);stable=signature===last?stable+1:0;last=signature;
    if(stable>=2){
     // Expensive computed styles are read once after geometry has settled.
     for(const row of rows){const style=getComputedStyle(document.querySelector(row.item.selector)!);row.finish={'--finish-bg':style.background,'--finish-border':style.border,'--finish-radius':style.borderRadius,'--finish-shadow':style.boxShadow};}
     measuredKey.current=layoutKey;setLandings(rows);setTableTarget(table);return;
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
  const assignments=scene?matchShuffleTracks(scene.tracks.map(track=>{const p=track.poses.at(-1)!;return {...p,x:screen.width/2+p.x*scale,y:screen.height/2+p.y*scale};}),landings.map(l=>l.target)):[];
  return landings.map((landing,i)=>{
  const {width,height}=shuffleTileSize(landing.item.kind,landing.target,own!),poses=scene?.tracks[assignments[i]].poses,depth=shuffleDepth(height);
  return {landing,width,height,poses,depth,keyframes:poses?shuffleKeyframes(poses,width,height,depth,scale,screen.width/2,screen.height/2):[]};
 });},[landings,screen.width,screen.height,own,scene,scale]);
 const dealFrames=useMemo(()=>scene?planDealFlights(cards.map(card=>{const p=card.poses!.at(-1)!;return {key:card.landing.item.key,kind:card.landing.item.kind,width:card.width,height:card.height,depth:card.depth,scale,source:{...p,x:screen.width/2+p.x*scale,y:screen.height/2+p.y*scale},target:card.landing.target};})).map(dealKeyframes):[],[cards,scene,scale,screen.width,screen.height]);
 useLayoutEffect(()=>{
  if(!scene||!cards.length||reduced||resume||!['prepare','approach','shuffle'].includes(phase))return;
  running.current=cards.flatMap((card,i)=>{
   const el=cardElements.current[i];if(!el)return [];
   const animation=el.animate(card.keyframes,{duration:ENTRANCE_MS.shuffle,easing:'linear',fill:'both'});
   animation.pause();animation.currentTime=0;
   if(phase==='shuffle'&&pageVisible)animation.play();return [animation];
  });
  animationPhase.current='shuffle';
  return()=>{running.current.forEach(animation=>animation.cancel());running.current=[];};
 },[cards,reduced,resume,scene]);
 useEffect(()=>{
  if(phase!=='prepare'||!scene||!assetsReady||!pageVisible)return;
  // Give the decoded artwork, paused transforms and compositing layers two paints.
  let second=0;const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>callbacks.current.onPrepared());});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);};
 },[phase,scene,assetsReady,pageVisible]);
 useLayoutEffect(()=>{
  if(phase==='deal'&&animationPhase.current!=='deal'&&dealFrames.length){
   running.current.forEach(animation=>animation.cancel());
   running.current=dealFrames.flatMap((frames,i)=>{const el=cardElements.current[i];if(!el)return [];const animation=el.animate(frames,{duration:ENTRANCE_MS.deal,easing:'linear',fill:'both'});animation.pause();animation.currentTime=0;return [animation];});
   animationPhase.current='deal';
  }
  if(phase==='shuffle'||phase==='deal')running.current.forEach(animation=>pageVisible?animation.play():animation.pause());
  else if(['settle','game-in','idle','menu-out'].includes(phase)){running.current.forEach(animation=>animation.cancel());running.current=[];animationPhase.current='';}
 },[phase,pageVisible,dealFrames]);
 if(phase==='idle'||reduced||typeof document==='undefined')return null;
 const visible=['approach','shuffle','prepare','deal','settle','game-in'].includes(phase),distributed=['deal','settle','game-in'].includes(phase)&&landings.length===60;
 return createPortal(<div className={`table-entrance entry-${phase} ${resume?'entry-resume':''} ${distributed?'entry-distributed':''}`} aria-hidden="true" data-visible={pageVisible} style={{'--approach-ms':`${ENTRANCE_MS.approach}ms`,'--shuffle-ms':`${ENTRANCE_MS.shuffle}ms`,'--deal-ms':`${ENTRANCE_MS.deal}ms`,'--reveal-ms':`${ENTRANCE_MS['game-in']}ms`,visibility:visible?'visible':'hidden'} as CSSProperties}>
  <div className="entry-room"><div className="entry-room-warmth"/><div className="entry-room-moonlight"/></div>
  <div className="entry-camera">
  <div className="entry-table" style={distributed&&tableTarget?{'--table-dx':`${tableTarget.x-screen.width/2}px`,'--table-dy':`${tableTarget.y-screen.height/2}px`,'--table-sx':tableTarget.width/(screen.width*.96),'--table-sy':tableTarget.height/(screen.height*.82),'--table-angle':`${tableTarget.angle}deg`} as CSSProperties:undefined}><TableSurface/></div>
  {!resume&&scene&&landings.length===60&&<div className="entry-deck">{cards.map(({landing,width:tileW,height:tileH,poses,depth},i)=>{
   const t=landing.target,kind=landing.item.kind;
   const last=poses!.at(-1)!;
   return <div key={i} ref={el=>{cardElements.current[i]=el;}} className={`deal-flying-card deal-${kind}`} style={{width:tileW,height:tileH,'--start-transform':shuffleTransform(poses![0],tileW,tileH,depth,scale,screen.width/2,screen.height/2),'--scatter-transform':shuffleTransform(last,tileW,tileH,depth,scale,screen.width/2,screen.height/2),'--tile-depth':`${depth}px`,'--sx':`${screen.width/2+last.x*scale-tileW/2}px`,'--sy':`${screen.height/2+last.y*scale-tileH/2}px`,'--scatter-scale':scale,'--scatter-z':`${depth*scale}px`,'--rest-angle':`${last.angle}deg`,'--tx':`${t.x-tileW/2}px`,'--ty':`${t.y-tileH/2}px`,'--target-angle':`${t.angle}deg`,'--target-w':`${t.width}px`,'--target-h':`${t.height}px`,'--end-left':`${t.x-t.width/2}px`,'--end-top':`${t.y-t.height/2}px`,...landing.finish,'--target-sx':t.width/tileW,'--target-sy':t.height/tileH,'--flip-delay':`${ENTRANCE_MS.deal*.82}ms`,zIndex:i+1} as CSSProperties}>
    <span className="deal-side-top"/><span className="deal-side-left"/>
    <div className="deal-flipper"><div className="deal-back"><TileBack flat/></div>{landing?.item.tile&&<div className="deal-face"><TileFace tile={landing.item.tile}/></div>}</div>
    {kind==='lower'&&<span className="deal-covered tile covered-face"/>}
   </div>;
  })}</div>}
  </div>
  <div className="entry-edge-shade"/>
 </div>,document.body);
}

export default memo(GameEntrance);
