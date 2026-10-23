export type RigidTile={x:number,y:number,angle:number,width:number,height:number,vx:number,vy:number,spin:number};
/** Separating axes for the four real rectangular edges, rather than a wide circle. */
export function tileContact(a:Pick<RigidTile,'x'|'y'|'angle'|'width'|'height'>,b:Pick<RigidTile,'x'|'y'|'angle'|'width'|'height'>){
 const aa=a.angle*Math.PI/180,ba=b.angle*Math.PI/180,ac=Math.cos(aa),as=Math.sin(aa),bc=Math.cos(ba),bs=Math.sin(ba);
 const axes=[[ac,as],[-as,ac],[bc,bs],[-bs,bc]],dx=b.x-a.x,dy=b.y-a.y;let depth=Infinity,nx=0,ny=0;
 for(const [x,y] of axes){
  const ra=(Math.abs(x*ac+y*as)*a.width+Math.abs(-x*as+y*ac)*a.height)/2;
  const rb=(Math.abs(x*bc+y*bs)*b.width+Math.abs(-x*bs+y*bc)*b.height)/2,dot=dx*x+dy*y,overlap=ra+rb-Math.abs(dot);
  if(overlap<0)return null;
  if(overlap<depth){depth=overlap;nx=dot<0?-x:x;ny=dot<0?-y:y;}
 }
 return {depth,nx,ny};
}
/** An off-centre impact transfers linear momentum and angular momentum. */
export function collideTiles(a:RigidTile,b:RigidTile){
 const hit=tileContact(a,b);if(!hit)return false;
 const {depth,nx,ny}=hit,move=(depth+.12)*.505;
 a.x-=nx*move;a.y-=ny*move;b.x+=nx*move;b.y+=ny*move;
 const support=(t:RigidTile,sign:number)=>{const angle=t.angle*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),u=nx*c+ny*s,v=-nx*s+ny*c;return {x:(Math.abs(u)<.05?0:Math.sign(u)*sign)*t.width/2*c-(Math.abs(v)<.05?0:Math.sign(v)*sign)*t.height/2*s,y:(Math.abs(u)<.05?0:Math.sign(u)*sign)*t.width/2*s+(Math.abs(v)<.05?0:Math.sign(v)*sign)*t.height/2*c};};
 const pa=support(a,1),pb=support(b,-1),cx=(a.x+pa.x+b.x+pb.x)/2,cy=(a.y+pa.y+b.y+pb.y)/2;
 const ax=cx-a.x,ay=cy-a.y,bx=cx-b.x,by=cy-b.y,ia=12/(a.width*a.width+a.height*a.height),ib=12/(b.width*b.width+b.height*b.height);
 const rx=b.vx-b.spin*by-a.vx+a.spin*ay,ry=b.vy+b.spin*bx-a.vy-a.spin*ax,vn=rx*nx+ry*ny;
 if(vn>=0)return false;
 const ca=ax*ny-ay*nx,cb=bx*ny-by*nx,j=-1.28*vn/(2+ca*ca*ia+cb*cb*ib),tx=-ny,ty=nx;
 const friction=Math.max(-j*.24,Math.min(j*.24,-(rx*tx+ry*ty)/2)),jx=j*nx+friction*tx,jy=j*ny+friction*ty;
 a.vx-=jx;a.vy-=jy;b.vx+=jx;b.vy+=jy;
 a.spin=Math.max(-.12,Math.min(.12,a.spin-(ax*jy-ay*jx)*ia));b.spin=Math.max(-.12,Math.min(.12,b.spin+(bx*jy-by*jx)*ib));
 return j>.04;
}
