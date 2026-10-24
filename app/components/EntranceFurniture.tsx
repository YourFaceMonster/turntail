'use client';
import {useLayoutEffect,useRef} from 'react';
import {projectedFurniture} from '../../lib/entrance-furniture';
import {entranceFrameCamera} from '../../lib/entrance-frame';
import {ENTRANCE_MS,type EntrancePhase} from '../../lib/atmosphere';
/** One projected drawing keeps the legs and slab visible without CSS 3D flattening artifacts. */
export default function EntranceFurniture({diameter,cx,cy,stage=0,width,height,phase,visible,overview}:{diameter:number,cx:number,cy:number,stage?:number,width:number,height:number,phase:EntrancePhase,visible:boolean,overview:number}){
 const canvas=useRef<HTMLCanvasElement>(null),clock=useRef({phase,elapsed:0});
 useLayoutEffect(()=>{
  if(clock.current.phase!==phase)clock.current={phase,elapsed:0};
  const node=canvas.current,ctx=node?.getContext('2d');if(!node||!ctx||!width||!height||!visible)return;
  const ratio=Math.min(devicePixelRatio||1,2);node.width=Math.round(width*ratio);node.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
  let frame=0,last=performance.now();
  const path=(points:{x:number,y:number}[])=>{ctx.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();};
  const draw=(now:number)=>{
   clock.current.elapsed+=Math.max(0,now-last);last=now;
   const animation=document.querySelector('.entry-camera')?.getAnimations().find(a=>a.id===`turntale-observer-${phase}`);
   const elapsed=Math.min(ENTRANCE_MS[phase],['focus','rise'].includes(phase)&&typeof animation?.currentTime==='number'?animation.currentTime:clock.current.elapsed);
   const camera={width,height,...entranceFrameCamera(phase,elapsed,overview)},g=projectedFurniture(diameter,cx,cy,stage,camera);
   ctx.clearRect(0,0,width,height);ctx.save();ctx.beginPath();ctx.rect(-1,-1,width+2,height+2);path(g.cap);ctx.clip('evenodd');
   for(const face of g.faces){ctx.beginPath();path(face.points);ctx.fillStyle=face.color;ctx.fill();ctx.strokeStyle=face.part==='slab'?'#b18a5628':'#21180e70';ctx.lineWidth=.7;ctx.stroke();
    if(face.part.startsWith('leg-')){const [a,b,c,d]=face.points;ctx.beginPath();ctx.moveTo(a.x*.82+b.x*.18,a.y*.82+b.y*.18);ctx.lineTo(d.x*.82+c.x*.18,d.y*.82+c.y*.18);ctx.strokeStyle='#d2a46538';ctx.lineWidth=1.8;ctx.stroke();}
   }
   ctx.restore();if(['shuffle','deal','focus','rise','opponent-out'].includes(phase)&&clock.current.elapsed<ENTRANCE_MS[phase])frame=requestAnimationFrame(draw);
  };
  draw(last);return()=>cancelAnimationFrame(frame);
 },[diameter,cx,cy,stage,width,height,phase,visible,overview]);
 return <canvas ref={canvas} className="entry-furniture" data-furniture="solid-legs-and-slab" aria-hidden="true"/>;
}
