'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {sceneImage} from '../../lib/scene-assets';
import {STAGE_TABLE_ATLAS,stageTableCell} from '../../lib/stage-table-material';
import {paintFurnitureFace} from '../../lib/furniture-paint';
import {stageSetting} from '../../lib/stage-setting';
import {projectEntrancePoint} from '../../lib/entrance-gpu';
import {projectedFurniture} from '../../lib/entrance-furniture';
import {entranceFrameCamera} from '../../lib/entrance-frame';
import {ENTRANCE_MS,type EntrancePhase} from '../../lib/atmosphere';
const materialTiles=new Map<number,HTMLCanvasElement>();
/** One projected drawing keeps the legs and slab visible without CSS 3D flattening artifacts. */
export default function EntranceFurniture({diameter,cx,cy,stage=0,width,height,phase,visible,overview,cameraOverride}:{diameter:number,cx:number,cy:number,stage?:number,width:number,height:number,phase:EntrancePhase,visible:boolean,overview:number,cameraOverride?:{tilt:number,scale:number}}){
 const [texture,setTexture]=useState<HTMLCanvasElement|null>(null);
 useEffect(()=>{let stopped=false;if(!stage){setTexture(null);return;}const cached=materialTiles.get(stage);if(cached){setTexture(cached);return;}void sceneImage(STAGE_TABLE_ATLAS).then(image=>{if(stopped)return;const cell=stageTableCell(stage,image.naturalWidth,image.naturalHeight),tile=document.createElement('canvas');tile.width=tile.height=512;tile.getContext('2d')?.drawImage(image,cell.x,cell.y,cell.width,cell.height,0,0,512,512);materialTiles.set(stage,tile);setTexture(tile);}).catch(()=>{});return()=>{stopped=true;};},[stage]);
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
   const camera={width,height,...(cameraOverride||entranceFrameCamera(phase,elapsed,overview,false,stage>0))},g=projectedFurniture(diameter,cx,cy,stage,camera);
   ctx.clearRect(0,0,width,height);ctx.save();ctx.beginPath();ctx.rect(-1,-1,width+2,height+2);path(g.cap);ctx.clip('evenodd');
   if(stage){
    const ground=projectEntrancePoint(cx,cy,-g.height,camera),edge=projectEntrancePoint(cx+diameter*.5,cy,-g.height,camera),radius=Math.max(2,Math.abs(edge.x-ground.x)*1.12),shadow=ctx.createRadialGradient(ground.x,ground.y,0,ground.x,ground.y,radius);
    shadow.addColorStop(0,'#07101966');shadow.addColorStop(.56,'#07101936');shadow.addColorStop(1,'#07101900');ctx.save();ctx.translate(ground.x,ground.y);ctx.scale(1,.2+Math.cos(camera.tilt)*.36);ctx.translate(-ground.x,-ground.y);ctx.fillStyle=shadow;ctx.fillRect(ground.x-radius,ground.y-radius,radius*2,radius*2);ctx.restore();
   }
   for(const face of g.faces){ctx.beginPath();path(face.points);ctx.fillStyle=face.color;ctx.fill();if(texture){paintFurnitureFace(ctx,texture,face.points);ctx.beginPath();path(face.points);ctx.fillStyle=face.part==='root'?'#100d1655':`rgba(10,16,25,${1-(face.light??.73)})`;ctx.fill();}
    ctx.strokeStyle=face.part==='slab'?'#b18a5628':'#21180e70';ctx.lineWidth=stage?1.2:.7;ctx.stroke();
    if(stage&&face.points.length===4){
     const [a,b,c,d]=face.points,wood=stageSetting(stage).wood;
     ctx.beginPath();ctx.moveTo(a.x,a.y+.7);ctx.lineTo(b.x,b.y+.7);ctx.strokeStyle='#ffe4ad55';ctx.lineWidth=1.8;ctx.stroke();
     for(let mark=0;mark<(wood?9:6);mark++){
      const u=(mark+.4)/10,v=((mark*37+stage*13)%81+9)/100,point=(x:number,y:number)=>({x:a.x*(1-x)*(1-y)+b.x*x*(1-y)+c.x*x*y+d.x*(1-x)*y,y:a.y*(1-x)*(1-y)+b.y*x*(1-y)+c.y*x*y+d.y*(1-x)*y}),start=point(u,v),end=point(Math.min(.98,u+(wood?.08:.15)),Math.min(.98,v+(wood?.4:.08)));
      ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.strokeStyle=mark%3===0?'#e5cba033':'#111a2433';ctx.lineWidth=mark%3===0?1.3:.65;ctx.stroke();
     }
    }
    if(face.part.startsWith('leg-')){const [a,b,c,d]=face.points;ctx.beginPath();ctx.moveTo(a.x*.82+b.x*.18,a.y*.82+b.y*.18);ctx.lineTo(d.x*.82+c.x*.18,d.y*.82+c.y*.18);ctx.strokeStyle='#d2a46538';ctx.lineWidth=1.8;ctx.stroke();}
   }
   ctx.restore();if(!cameraOverride&&['shuffle','deal','focus','rise','opponent-out'].includes(phase)&&clock.current.elapsed<ENTRANCE_MS[phase])frame=requestAnimationFrame(draw);
  };
  draw(last);return()=>cancelAnimationFrame(frame);
 },[diameter,cx,cy,stage,width,height,phase,visible,overview,texture,cameraOverride]);
 return <canvas ref={canvas} className="entry-furniture" data-furniture="solid-legs-and-slab" aria-hidden="true"/>;
}
