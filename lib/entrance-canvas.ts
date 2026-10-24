import {GPU_TILE_STRIDE,TILE_ATLAS_CELL,projectEntrancePoint,type GpuCamera} from './entrance-gpu';
type Point={x:number,y:number};
/** Stable projected solids for browsers without WebGL2; uses the exact same frame data/atlas. */
export class EntranceCanvas{
 private ctx:CanvasRenderingContext2D;private ratio:number;
 constructor(private canvas:HTMLCanvasElement,private atlas:HTMLCanvasElement,width:number,height:number,private body:[number,number,number]=[1,.983,.937]){
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw Error('Tile canvas unavailable');this.ctx=ctx;
  this.ratio=Math.min(window.devicePixelRatio||1,2,Math.sqrt(1800000/(width*height)));canvas.width=Math.round(width*this.ratio);canvas.height=Math.round(height*this.ratio);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 }
 draw(data:Float32Array,camera:GpuCamera){
  const ctx=this.ctx,ratio=this.ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,camera.width,camera.height);
  const parts:{points:Point[],depth:number,alpha:number,color?:string,slot?:number,blend?:number}[]=[];
  for(let at=0;at<data.length;at+=GPU_TILE_STRIDE){
   const [x,y,z,angle,w,h,thickness,reveal,slot,body,alpha]=data.subarray(at,at+11);if(alpha<.001)continue;
   const c=Math.cos(angle),s=Math.sin(angle),corners=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
   const world=corners.map(([dx,dy])=>({x:x+dx*c-dy*s,y:y+dx*s+dy*c}));
   const depth=(p:{y:number},height:number)=>(p.y-camera.height/2)*Math.sin(camera.tilt)+height*Math.cos(camera.tilt);
   const top=world.map(p=>projectEntrancePoint(p.x,p.y,z,camera)),bottom=world.map(p=>projectEntrancePoint(p.x,p.y,z-thickness,camera));
   // Contact shadows stay below every body and never write depth over a face.
   ctx.beginPath();const ground=world.map(p=>projectEntrancePoint(p.x+2,p.y+4,.3,camera));ctx.moveTo(ground[0].x,ground[0].y);for(const p of ground.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();ctx.fillStyle=`rgba(22,16,10,${alpha*.13})`;ctx.fill();
   if(body>.001&&thickness>.1)for(let i=0;i<4;i++){
    const j=(i+1)%4;parts.push({points:[top[i],top[j],bottom[j],bottom[i]],depth:(depth(world[i],z-thickness/2)+depth(world[j],z-thickness/2))/2,alpha:alpha*body,color:`rgb(${this.body.map(v=>Math.round(v*[.76,.94,.82,.98][i]*255)).join(' ')})`});
   }
   parts.push({points:top,depth:depth({y},z)+.01,alpha,slot,blend:Math.max(0,Math.min(1,reveal/Math.PI))});
  }
  parts.sort((a,b)=>a.depth-b.depth);
  for(const part of parts){ctx.globalAlpha=part.alpha;
   if(part.color){ctx.beginPath();ctx.moveTo(part.points[0].x,part.points[0].y);for(const p of part.points.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();ctx.fillStyle=part.color;ctx.fill();}
   else{const t=part.blend!,blend=t*t*(3-2*t);if(blend<1)this.face(part.points,0,part.alpha*(1-blend));if(blend>0)this.face(part.points,part.slot!,part.alpha*blend);}
  }
  ctx.globalAlpha=1;
 }
 private face(points:Point[],slot:number,alpha:number){
  const {width:w,height:h,columns}=TILE_ATLAS_CELL,x=slot%columns*w,y=Math.floor(slot/columns)*h,source=[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}];
  // Four triangles around the centre reduce perspective shear while retaining a bounded fallback cost.
  const centre=(p:Point[])=>({x:p.reduce((n,v)=>n+v.x,0)/4,y:p.reduce((n,v)=>n+v.y,0)/4}),sc=centre(source),dc=centre(points);
  for(let i=0;i<4;i++)this.triangle([source[i],source[(i+1)%4],sc],[points[i],points[(i+1)%4],dc],alpha);
 }
 private triangle(src:Point[],dst:Point[],alpha:number){
  const [s0,s1,s2]=src,[p0,p1,p2]=dst,x1=s1.x-s0.x,y1=s1.y-s0.y,x2=s2.x-s0.x,y2=s2.y-s0.y,det=x1*y2-x2*y1;
  if(Math.abs(det)<1e-8)return;
  const a=((p1.x-p0.x)*y2-(p2.x-p0.x)*y1)/det,c=(x1*(p2.x-p0.x)-x2*(p1.x-p0.x))/det,b=((p1.y-p0.y)*y2-(p2.y-p0.y)*y1)/det,d=(x1*(p2.y-p0.y)-x2*(p1.y-p0.y))/det;
  const ctx=this.ctx;ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,p0.x-a*s0.x-c*s0.y,p0.y-b*s0.x-d*s0.y);ctx.drawImage(this.atlas,0,0);ctx.restore();
 }
 destroy(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);}
}
