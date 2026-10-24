"use client";
import {createPortal} from 'react-dom';
import {memo,useMemo,useEffect,useLayoutEffect,useRef,useState,useCallback,type CSSProperties} from 'react';
import {StagePortrait} from './StagePortrait';
import {stagePalette} from '../../lib/stage-presentation';
import {stageTheme} from '../../lib/stage-theme';
import {MATERIAL_COLORS,StageVisuals} from './StageVisuals';
import TileBack from './TileBack';
import TileFace from './TileFace';
import TableSurface from './TableSurface';
import EntranceGpuTiles from './EntranceGpuTiles';
import EntranceEnvironment from './EntranceEnvironment';
import EntranceFurniture from './EntranceFurniture';
import EntranceGreetings from './EntranceGreetings';
import EntranceSeats from './EntranceSeats';
import EntranceSavedTile from './EntranceSavedTile';
import ResumeGpuTiles from './ResumeGpuTiles';
import {entranceFrameCamera} from '../../lib/entrance-frame';
import {tileBodyDepth} from '../../lib/tile-body';
import {platformGeometry,stageSetting} from '../../lib/stage-setting';
import {tableCircle,opponentTableTarget} from '../../lib/table-world';
import {observerCameraFrames,environmentCameraFrames,environmentTransform,cameraTransform} from '../../lib/entrance-camera';
import {planShuffle,frameShuffle,overviewScale,shuffleDepth,shuffleFrameIndices,shuffleKeyframes,shuffleTransform,type ShuffleScene} from '../../lib/shuffle-motion';
import {matchShuffleTracks,planTableDealFlights,dealKeyframes} from '../../lib/deal-motion';
import {ENTRANCE_MS,entranceDuration,entranceCurtain,type EntrancePhase} from '../../lib/atmosphere';
import {measureDealLayout,shuffleTileSize,type DealView,type DealItem,type DealTarget} from '../../lib/deal-animation';
import {measureSavedTable,type SavedTableItem} from '../../lib/saved-table';
type Props={onWorldDiameter:(diameter:number)=>void,company:{name:string,avatar?:string,points:number,count:number}[],tableSet:number,stage?:number,phase:EntrancePhase,resume:boolean,migrated?:boolean,reduced:boolean,visible:boolean,game:DealView|null,rotation:number,onPrepared:()=>void,onFallback:()=>void};
function GameEntrance({onWorldDiameter,company,tableSet,stage,phase,resume,migrated=false,reduced,visible:pageVisible,game,rotation,onPrepared,onFallback}:Props){
 const [screen,setScreen]=useState({width:0,height:0}),[landings,setLandings]=useState<{item:DealItem,target:DealTarget,finish:Record<string,string>}[]>([]);
 const [scene,setScene]=useState<ShuffleScene|null>(null),[assetsReady,setAssetsReady]=useState(false);
 const [gpuStatus,setGpuStatus]=useState<'pending'|'ready'|'fallback'>('pending');
 const [savedLandings,setSavedLandings]=useState<{item:SavedTableItem,target:DealTarget,baseTarget?:DealTarget}[]>([]),[savedBounds,setSavedBounds]=useState<{left:number,top:number,width:number,height:number}|null>(null);
 const shuffleSeed=useRef(0),measuredKey=useRef(''),cardElements=useRef<(HTMLDivElement|null)[]>([]),running=useRef<Animation[]>([]);
 const animationPhase=useRef(''),cameraElement=useRef<HTMLDivElement>(null),cameraMotion=useRef<Animation|null>(null),environmentMotions=useRef<Animation[]>([]);
 const callbacks=useRef({onPrepared,onFallback});callbacks.current={onPrepared,onFallback};
 const circle=savedBounds?tableCircle(savedBounds,screen.width,screen.height,resume?0:(scene?.width||0)+32):null;
 const diameter=circle?.diameter??(scene?.width??Math.max(screen.width,screen.height)*1.35)+32;
 useEffect(()=>{if(phase==='menu-out')onWorldDiameter(0);else if(savedBounds&&(resume&&phase==='room-hold'||!resume&&phase==='prepare'&&scene))onWorldDiameter(diameter);},[phase,savedBounds,scene,resume,diameter,onWorldDiameter]);
 const overview=overviewScale({width:diameter-32,height:diameter-32},screen.width,screen.height);
 const worldX=circle?.cx??screen.width/2,worldY=circle?.cy??screen.height/2;
 useLayoutEffect(()=>{
  if(!['rise','focus'].includes(phase)||reduced||!cameraElement.current)return;
  const duration=entranceDuration(phase,resume),motion=cameraElement.current.animate(observerCameraFrames(overview,duration,phase),{duration,easing:'linear',fill:'both'});
  motion.id=`turntale-observer-${phase}`;cameraMotion.current=motion;
  const root=cameraElement.current.closest('.table-entrance');
  environmentMotions.current=['.environment-distance','.environment-near-light'].flatMap((selector,i)=>{
   const el=root?.querySelector(selector);if(!el)return [];
   const animation=el.animate(environmentCameraFrames(overview,duration,i===1,phase),{duration,easing:'linear',fill:'both'});animation.startTime=motion.startTime;return [animation];
  });
  if(!pageVisible)[motion,...environmentMotions.current].forEach(a=>a.pause());
  return()=>{motion.cancel();environmentMotions.current.forEach(a=>a.cancel());environmentMotions.current=[];cameraMotion.current=null;};
 },[phase,resume,reduced,overview]);
 useEffect(()=>{const motion=cameraMotion.current;if(motion)[motion,...environmentMotions.current].forEach(a=>pageVisible?a.play():a.pause());},[pageVisible,phase]);
 const activePhase=useRef(phase);activePhase.current=phase;
 const gpuPrepared=useCallback((status:'ready'|'fallback')=>{setGpuStatus(status);if(status==='fallback'&&!['idle','menu-out','room-hold'].includes(activePhase.current))callbacks.current.onFallback();},[]);
 const latest=useRef({game,rotation});latest.current={game,rotation};
 useEffect(()=>{const resize=()=>setScreen({width:window.innerWidth,height:window.innerHeight});resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 // Decode while the menu is still visible, rather than on the first moving frame.
 useEffect(()=>{
  if(!screen.width)return;
  let cancelled=false;setAssetsReady(false);
  const paths=[...(stage?[`/environments/stage-${stage}-055.webp`]:['/turntale-room-0513.webp']),'/monsters/blue-0513.webp','/monsters/red-0513.webp','/monsters/haetae-0513.webp','/turntale-ivory-material-055.webp','/turntale-stone-material-055.webp','/turntale-tile-back-gold.svg','/turntale-wood-0513.webp',...(stage||tableSet?['/turntale-stage-portraits.webp']:[]),...(tableSet?['/turntale-stage-materials-v2.webp']:[])];
  void Promise.all(paths.map(src=>new Promise<void>(resolve=>{const finish=()=>{clearTimeout(timer);resolve();},timer=setTimeout(finish,6000),img=new Image();img.onload=()=>{void img.decode().catch(()=>{}).then(finish);};img.onerror=finish;img.src=src;}))).then(()=>{if(!cancelled)setAssetsReady(true);});
  return()=>{cancelled=true;};
 },[screen.width>screen.height,!!screen.width,stage,tableSet]);
 useLayoutEffect(()=>{
  if(phase==='menu-out'){setSavedLandings([]);setSavedBounds(null);}
  if(!resume||phase!=='room-hold'||!game||!screen.width||!pageVisible)return;
  let frame=0,tries=0,last='',stable=0,cancelled=false;
  const measure=()=>{
   if(cancelled)return;
   try{
    const rows=measureSavedTable(game,rotation,selector=>document.querySelector(selector)?.getBoundingClientRect()||null);
    const rect=document.querySelector('.active-table .play-column')?.getBoundingClientRect();
    if(!rect||!rect.width||!rect.height)throw Error('Saved board pending');
    const signature=JSON.stringify([rows,rect.x,rect.y,rect.width,rect.height]);stable=signature===last?stable+1:0;last=signature;
    if(stable>=2){setSavedLandings(rows);setSavedBounds({left:rect.left,top:rect.top,width:rect.width,height:rect.height});return;}
   }catch{}
   if(++tries<90)frame=requestAnimationFrame(measure);else callbacks.current.onFallback();
  };
  frame=requestAnimationFrame(measure);return()=>{cancelled=true;cancelAnimationFrame(frame);};
 },[resume,phase,game,rotation,screen.width,screen.height,pageVisible]);
 useLayoutEffect(()=>{
  if(phase==='menu-out'){shuffleSeed.current=crypto.getRandomValues(new Uint32Array(1))[0];setLandings([]);setScene(null);setGpuStatus('pending');measuredKey.current='';}
  if(!['prepare','approach','shuffle','rise','deal','focus'].includes(phase)||resume||reduced||!pageVisible)return;
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
     measuredKey.current=layoutKey;setSavedBounds({left:tableRect.left,top:tableRect.top,width:tableRect.width,height:tableRect.height});setLandings(rows);return;
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
  let cancelled=false,timer=0,worker:Worker|undefined,startedFallback=false;
  const sizes=landings.map(l=>shuffleTileSize(l.item.kind,l.target,own)),planner=planShuffle(shuffleSeed.current,screen.width,screen.height,sizes);
  function advance(){
   if(cancelled)return;
   try{
    const until=performance.now()+3;
    do{const result=planner.next();if(result.done){setScene(result.value);return;}}while(performance.now()<until);
    timer=window.setTimeout(advance,0);
   }catch{callbacks.current.onFallback();}
  }
  const fallback=()=>{if(cancelled||startedFallback)return;startedFallback=true;clearTimeout(timer);worker?.terminate();timer=window.setTimeout(advance,0);};
  try{
   worker=new Worker(new URL('../../lib/shuffle-worker.ts',import.meta.url),{type:'module'});
   worker.onmessage=({data}:{data:{scene?:ShuffleScene,error?:string}})=>{if(cancelled)return;if(data.scene){clearTimeout(timer);setScene(data.scene);worker?.terminate();}else fallback();};
   worker.onerror=(event)=>{event.preventDefault();fallback();};
   worker.postMessage({seed:shuffleSeed.current,width:screen.width,height:screen.height,sizes});
   timer=window.setTimeout(fallback,8000);
  }catch{fallback();}
  return()=>{cancelled=true;clearTimeout(timer);worker?.terminate();planner.return(null!);};
 },[landings,own,screen.width,screen.height,preparing]);
 const scale=scene?frameShuffle(scene,screen.width,screen.height):1;
 const cards=useMemo(()=>{
  const targets=landings.map(l=>{
   if(l.item.kind!=='opponent'||!own||!game)return l.target;
   const [,seatText,ordinalText]=l.item.key.split('-'),seat=Number(seatText),index=game.players.map((_,i)=>i).filter(i=>i!==game.me).indexOf(seat);
   return opponentTableTarget(index,company.length,Number(ordinalText),game.players[seat].count,{cx:worldX,cy:worldY,diameter},own);
  });
  const assignments=scene?matchShuffleTracks(scene.tracks.map(track=>{const p=track.poses.at(-1)!;return {...p,x:screen.width/2+p.x*scale,y:screen.height/2+p.y*scale};}),targets):[];
  return landings.map((landing,i)=>{
  const {width,height}=shuffleTileSize(landing.item.kind,landing.target,own!),poses=scene?.tracks[assignments[i]].poses,depth=shuffleDepth(height);
  return {landing:{...landing,target:targets[i]},width,height,poses,depth};
 });},[landings,screen.width,screen.height,own,scene,scale,worldX,worldY,diameter,company.length,game?.me]);
 const dealRoutes=useMemo(()=>scene?planTableDealFlights(cards.map(card=>{const p=card.poses!.at(-1)!;return {key:card.landing.item.key,kind:card.landing.item.kind,width:card.width,height:card.height,depth:card.depth,scale,source:{...p,x:screen.width/2+p.x*scale,y:screen.height/2+p.y*scale},target:card.landing.target};})):[],[cards,scene,scale,screen.width,screen.height]);
 const dealFrames=useMemo(()=>gpuStatus==='fallback'?dealRoutes.map(dealKeyframes):[],[dealRoutes,gpuStatus]);
 useLayoutEffect(()=>{
  if(gpuStatus!=='fallback'||!scene||!cards.length||reduced||resume||!['prepare','approach','shuffle'].includes(phase))return;
  const indices=shuffleFrameIndices(scene,60);
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
  if(!resume||phase!=='room-hold'||!assetsReady||!savedBounds||!pageVisible||gpuStatus==='pending')return;
  let second=0;const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>callbacks.current.onPrepared());});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);};
 },[resume,phase,assetsReady,savedBounds,pageVisible,gpuStatus]);
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
  if(phase==='focus'){running.current.forEach(animation=>animation.cancel());running.current=[];animationPhase.current='focus';}
  if(phase==='shuffle'||phase==='deal')running.current.forEach(animation=>pageVisible?animation.play():animation.pause());
  else if(['settle','game-in','idle','menu-out'].includes(phase)){running.current.forEach(animation=>animation.cancel());running.current=[];animationPhase.current='';}
 },[phase,pageVisible,dealFrames,gpuStatus]);
 if(phase==='idle'||reduced||typeof document==='undefined')return null;

 const curtain=phase==='menu-out'?ENTRANCE_MS['menu-out']:phase==='game-in'?entranceDuration('game-in',resume):ENTRANCE_MS.approach,cameraStart=entranceFrameCamera(phase,0,overview,resume);
 return createPortal(<StageVisuals stage={tableSet||undefined}><div className={`table-entrance entry-${phase} ${resume?'entry-resume':''} ${gpuStatus==='ready'?'entry-gpu-ready':''}`} aria-hidden="true" data-stage={stage} data-world-kind={stageSetting(stage||0).kind} data-visible={pageVisible} data-curtain={entranceCurtain(phase)} style={{'--stage-accent':stage?stagePalette(stage).accent:undefined,'--stage-side':tableSet?MATERIAL_COLORS[tableSet-1]:undefined,'--camera-ms':`${entranceDuration('approach',resume)}ms`,'--camera-far':`${(1-1/Math.max(.001,overview))*1000}px`,'--camera-overview':overview,'--camera-near':1/Math.max(.001,overview),'--table-diameter':`${diameter}px`,'--deal-ms':`${ENTRANCE_MS.deal}ms`,'--focus-ms':`${ENTRANCE_MS.focus}ms`,'--rise-ms':`${ENTRANCE_MS.rise}ms`,'--opponent-out-ms':`${ENTRANCE_MS['opponent-out']}ms`,'--environment-far-transform':environmentTransform(cameraStart,overview),'--environment-near-transform':environmentTransform(cameraStart,overview,true),'--curtain-ms':`${curtain}ms`} as CSSProperties}>
  <div className="entry-room"><EntranceEnvironment stage={stage}/></div>
  <div className="entry-view-rig">
  <div className="entry-camera" ref={cameraElement} style={{transform:cameraTransform(cameraStart)}}>
  <EntranceSeats viewport={{width:screen.width,height:screen.height,overview}} company={company} diameter={diameter} cx={worldX} cy={worldY} stage={stage||0}/>
  <div className="entry-table" style={{left:worldX-diameter/2,top:worldY-diameter/2,width:diameter,height:diameter,borderRadius:"50%",clipPath:platformGeometry(diameter,stage||0).clip}}><TableSurface stage={stage||tableSet||undefined} withRim/></div>
  {resume&&gpuStatus!=='ready'&&<div className="entry-saved-table">{savedLandings.map(({item,target,baseTarget})=><EntranceSavedTile key={item.key} item={item} target={target} baseTarget={baseTarget}/>)}</div>}
  {!resume&&gpuStatus==='fallback'&&scene&&landings.length===60&&<div className="entry-deck">{cards.map(({landing,width:tileW,height:tileH,poses,depth},i)=>{
   const t=landing.target,kind=landing.item.kind;
   return <div key={i} ref={el=>{cardElements.current[i]=el;}} className={`deal-flying-card deal-${kind}`} style={{width:tileW,height:tileH,'--start-transform':shuffleTransform(poses![0],tileW,tileH,depth,scale,screen.width/2,screen.height/2),'--tile-depth':`${depth}px`,'--target-depth':`${tileBodyDepth(t.height)}px`,'--landed-depth':`${tileBodyDepth(t.height)*(kind==='upper'?2:1)}px`,'--target-angle':`${t.angle}deg`,'--target-w':`${t.width}px`,'--target-h':`${t.height}px`,'--end-left':`${t.x-t.width/2}px`,'--end-top':`${t.y-t.height/2}px`,...landing.finish,'--flip-delay':`${ENTRANCE_MS.deal*.82}ms`,zIndex:i+1} as CSSProperties}>
    <span className="deal-side-top deal-body-side"/><span className="deal-side-left deal-body-side"/><span className="deal-side-bottom deal-body-side"/><span className="deal-side-right deal-body-side"/>
    <div className="deal-flipper"><div className="deal-back"><TileBack flat/></div>{landing?.item.tile&&<div className="deal-face"><TileFace tile={landing.item.tile}/></div>}</div>
    {kind==='lower'&&<span className="deal-covered tile covered-face"/>}
   </div>;
  })}</div>}
  </div>
  </div>
  <EntranceFurniture diameter={diameter} cx={worldX} cy={worldY} stage={stage||0} width={screen.width} height={screen.height} overview={overview} phase={phase} visible={pageVisible}/>
  {phase==='shuffle'&&<EntranceGreetings company={company}/>}
  {resume&&phase!=='menu-out'&&savedLandings.length>0&&<ResumeGpuTiles rows={savedLandings} phase={phase} visible={pageVisible} width={screen.width} height={screen.height} overview={overview} onStatus={gpuPrepared}/>}
  {!resume&&!['menu-out','room-hold'].includes(phase)&&scene&&cards.length===60&&<EntranceGpuTiles cards={cards} routes={dealRoutes} phase={phase} visible={pageVisible} width={screen.width} height={screen.height} overview={overview} onStatus={gpuPrepared}/>}
  <div className="entry-reunion"><div className="entry-return-note"><span>{resume?'WELCOME BACK':`${company.length+1} PLAYERS · TAKE YOUR SEAT`}</span><strong>{stage?`${stageTheme(stage).name}의 테이블`:resume?'익숙한 테이블로 돌아왔어요':'달빛 서재의 작은 승부'}</strong><small>{resume?migrated?'3인전으로 전환했어요. 스테이지와 점수는 이어지고, 진행 중이던 패는 다시 나눴어요.':'자리에 놓인 패 그대로, 승부를 이어갑니다.':'테이블에 둘러앉아 새로운 승부를 시작합니다.'}</small></div></div>
  <div className="entry-edge-shade"/>
  <div className="entry-curtain"/>
  {['prepare','room-hold'].includes(phase)&&<div className="entry-preparing-note"><i/><strong>{resume?'저장된 테이블을 불러오고 있어요':'새로운 승부를 준비하고 있어요'}</strong><small>잠시만 기다려 주세요</small></div>}
 </div></StageVisuals>,document.body);
}

export default memo(GameEntrance);
