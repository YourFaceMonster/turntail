"use client";
import {useEffect,useLayoutEffect,useRef} from 'react';
import {sampleShufflePose,type ShufflePose} from '../../lib/shuffle-motion';
import {sampleDealRoute,type DealRoute} from '../../lib/deal-motion';
import {ENTRANCE_MS,type EntrancePhase} from '../../lib/atmosphere';

export type CanvasBack={poses:ShufflePose[],width:number,height:number,depth:number,route:DealRoute};
type Props={cards:CanvasBack[],phase:EntrancePhase,visible:boolean,width:number,height:number,scale:number};

/** Shuffle and deal paint 60 physical backs in one surface instead of 60 3D layers. */
export default function ShuffleCanvas({cards,phase,visible,width,height,scale}:Props){
 const canvas=useRef<HTMLCanvasElement>(null),image=useRef<HTMLImageElement|null>(null),texture=useRef<HTMLCanvasElement|null>(null);
 const elapsed=useRef(0),last=useRef(0);
 const repaint=useRef<()=>void>(()=>{});
 useEffect(()=>{
  const img=new Image();img.onload=()=>repaint.current();img.src='/turntale-tile-back-gold.svg';image.current=img;
  return()=>{img.onload=null;image.current=null;texture.current=null;};
 },[]);
 useLayoutEffect(()=>{
  if(!cards.length||!width||!height||!['prepare','approach','shuffle','deal','settle','game-in'].includes(phase))return;
  const surface=canvas.current;if(!surface)return;
  const ratio=Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(2300000/(width*height)));
  const pixelWidth=Math.max(1,Math.round(width*ratio)),pixelHeight=Math.max(1,Math.round(height*ratio));
  if(surface.width!==pixelWidth||surface.height!==pixelHeight){surface.width=pixelWidth;surface.height=pixelHeight;}
  const ctx=surface.getContext('2d',{alpha:true});if(!ctx)return;
  let frame=0,disposed=false,currentProgress=0;
  elapsed.current=0;last.current=0;
  const draw=(progress:number)=>{
   ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
   const art=image.current;
   if(!texture.current&&art?.complete&&art.naturalWidth){
    const stamp=document.createElement('canvas');stamp.width=150;stamp.height=198;
    stamp.getContext('2d')?.drawImage(art,0,0,stamp.width,stamp.height);texture.current=stamp;
   }
   const dealing=['deal','settle','game-in'].includes(phase);
   const tiles=cards.map(card=>{
    if(dealing){const pose=sampleDealRoute(card.route,progress);
     return {card,pose,x:pose.x,y:pose.y,w:card.width*pose.sx,h:card.height*pose.sy,z:pose.z};
    }
    const pose=sampleShufflePose(card.poses,progress),y=height/2+pose.y*scale;
    return {card,pose,x:width/2+pose.x*scale,y,w:card.width*scale,h:card.height*scale,z:y};
   });
   // Lower bodies go down first. The ivory edge is a painted body, not a tile.
   tiles.sort((a,b)=>a.z-b.z);
   for(const {card,pose,x,y,w,h} of tiles){
    if(x+w < -40||x-w>width+40||y+h < -40||y-h>height+40)continue;
    if(dealing&&card.route.kind==='own'&&progress>.82)ctx.globalAlpha=Math.max(0,1-(progress-.82)/.08);
    else ctx.globalAlpha=1;
    if(ctx.globalAlpha<=0)continue;
    ctx.save();ctx.translate(x,y);ctx.rotate(pose.angle*Math.PI/180);
    const depth=card.depth*(dealing?Math.min(w/card.width,h/card.height):scale);
    ctx.fillStyle='#e7e3d6';ctx.beginPath();ctx.roundRect(-w/2,-h/2+depth,w,h,Math.min(7,w*.1));ctx.fill();
    ctx.fillStyle='#c8c3b5';ctx.fillRect(-w/2+2,h/2-1,w-4,Math.max(2,depth-3));
    ctx.fillStyle='#fffdf3';ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,Math.min(7,w*.1));ctx.fill();
    ctx.fillStyle='#12513d';ctx.beginPath();ctx.roundRect(-w/2+2,-h/2+2,w-4,h-4,Math.min(6,w*.09));ctx.fill();
    if(texture.current)ctx.drawImage(texture.current,-w/2,-h/2,w,h);
    ctx.restore();
   }
   ctx.globalAlpha=1;
  };
  const tick=(now:number)=>{
   if(disposed)return;
   if(visible&&(phase==='shuffle'||phase==='deal')){
    if(last.current)elapsed.current+=now-last.current;
    last.current=now;currentProgress=Math.min(1,elapsed.current/ENTRANCE_MS[phase]);draw(currentProgress);
   }else if(visible){last.current=0;currentProgress=dealingEnd?1:0;draw(currentProgress);}
   else last.current=0;
   if(visible&&(phase==='shuffle'||phase==='deal')&&elapsed.current<ENTRANCE_MS[phase])frame=requestAnimationFrame(tick);
  };
  const dealingEnd=phase==='settle'||phase==='game-in';
  repaint.current=()=>{if(!disposed&&visible)draw(currentProgress);};
  if(visible){if(dealingEnd){currentProgress=1;draw(1);}else frame=requestAnimationFrame(tick);}
  return()=>{disposed=true;repaint.current=()=>{};cancelAnimationFrame(frame);last.current=0;};
 },[cards,phase,visible,width,height,scale]);
 return <canvas ref={canvas} className="entry-shuffle-canvas" aria-hidden="true"/>;
}
