import {paintFurnitureFace} from './furniture-paint';
import {stageSetting} from './stage-setting';
import {projectEntrancePoint,type GpuCamera} from './entrance-gpu';
import type {projectedFurniture} from './entrance-furniture';
/** The same clipped solid-furniture painter is used in the entrance and visual checks. */
export function paintFurnitureScene(ctx:CanvasRenderingContext2D,texture:HTMLCanvasElement|null,g:ReturnType<typeof projectedFurniture>,{stage,cx,cy,diameter,width,height,camera}:{stage:number,cx:number,cy:number,diameter:number,width:number,height:number,camera:GpuCamera}){
 const path=(points:{x:number,y:number}[])=>{ctx.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();};
   ctx.clearRect(0,0,width,height);ctx.save();ctx.beginPath();ctx.rect(-1,-1,width+2,height+2);path(g.cap);ctx.clip('evenodd');
   {
    const ground=projectEntrancePoint(cx,cy,-g.height,camera),edge=projectEntrancePoint(cx+diameter*.5,cy,-g.height,camera),radius=Math.max(2,Math.abs(edge.x-ground.x)*1.12),shadow=ctx.createRadialGradient(ground.x,ground.y,0,ground.x,ground.y,radius);
    shadow.addColorStop(0,'#07101966');shadow.addColorStop(.56,'#07101936');shadow.addColorStop(1,'#07101900');ctx.save();ctx.translate(ground.x,ground.y);ctx.scale(1,.2+Math.cos(camera.tilt)*.36);ctx.translate(-ground.x,-ground.y);ctx.fillStyle=shadow;ctx.fillRect(ground.x-radius,ground.y-radius,radius*2,radius*2);ctx.restore();
   }
   for(const face of g.faces){ctx.beginPath();path(face.points);ctx.fillStyle=face.color;ctx.fill();if(texture&&face.material!=='brass'){ctx.save();ctx.globalAlpha=stage===0?.72:1;paintFurnitureFace(ctx,texture,face.points,texture.width,stage===0&&(face.part.includes('turned-leg')||face.part.includes('pedestal')));ctx.restore();ctx.beginPath();path(face.points);ctx.fillStyle=face.part==='root'?'#100d1655':`rgba(10,16,25,${1-(face.light??.73)})`;ctx.fill();}
    ctx.strokeStyle=stage===0?(face.material==='brass'?'#d4b77b70':'#150b0844'):face.part==='slab'?'#b18a5628':'#21180e70';ctx.lineWidth=stage?1.2:.4;ctx.stroke();
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
   ctx.restore();
}
