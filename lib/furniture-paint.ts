type Point={x:number,y:number};
/** Paint a material in the face's local coordinates, rather than sliding screen-space grain. */
export function paintFurnitureFace(ctx:CanvasRenderingContext2D,texture:CanvasImageSource,points:Point[],size=512,vertical=false){
 if(points.length!==4)return;
 const across=Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y),down=Math.hypot(points[3].x-points[0].x,points[3].y-points[0].y),span=Math.max(24,Math.min(size,size*across/Math.max(1,down)));
 const src=vertical?[{x:0,y:0},{x:0,y:span},{x:size,y:span},{x:size,y:0}]:[{x:0,y:0},{x:span,y:0},{x:span,y:size},{x:0,y:size}];
 for(const ids of [[0,1,2],[0,2,3]]){const [s0,s1,s2]=ids.map(i=>src[i]),[p0,p1,p2]=ids.map(i=>points[i]),x1=s1.x-s0.x,y1=s1.y-s0.y,x2=s2.x-s0.x,y2=s2.y-s0.y,det=x1*y2-x2*y1;
  const a=((p1.x-p0.x)*y2-(p2.x-p0.x)*y1)/det,c=(x1*(p2.x-p0.x)-x2*(p1.x-p0.x))/det,b=((p1.y-p0.y)*y2-(p2.y-p0.y)*y1)/det,d=(x1*(p2.y-p0.y)-x2*(p1.y-p0.y))/det;
  ctx.save();ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,p0.x-a*s0.x-c*s0.y,p0.y-b*s0.x-d*s0.y);ctx.drawImage(texture,0,0);ctx.restore();
 }
}
