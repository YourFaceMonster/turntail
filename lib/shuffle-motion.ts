export type ShufflePose={x:number,y:number,angle:number};
export type ShuffleSize={width:number,height:number};
export type ShuffleTrack={radius:number,poses:ShufflePose[]};
export type ShuffleScene={width:number,height:number,tracks:ShuffleTrack[]};
const FRAMES=144,GAP=4;
function rng(seed:number){let state=seed>>>0;return()=>{state=(state+0x6d2b79f5)>>>0;let n=state;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;};}
/** Minimum centre distance for the WHOLE linear interval, not just its endpoints. */
export function sweptDistance(a:ShufflePose,b:ShufflePose,c:ShufflePose,d:ShufflePose){
 const x=a.x-c.x,y=a.y-c.y,dx=b.x-a.x-d.x+c.x,dy=b.y-a.y-d.y+c.y;
 const speed=dx*dx+dy*dy,t=speed?Math.max(0,Math.min(1,-(x*dx+y*dy)/speed)):0;
 return Math.hypot(x+dx*t,y+dy*t);
}
/** Conservative circles enclose every tile corner at every angle, including its body. */
export function shuffleDepth(tileHeight:number){return Math.min(26,Math.max(18,tileHeight*.38));}
/**
 * One shared simulation for all 60 solid tiles. Yield after each frame so preparing
 * a fresh round never monopolises the main thread. No simulation runs during play.
 * Coordinates are on a physical table; the camera frames that table independently
 * of the native tile dimensions used at the final live-game endpoints.
 */
export function* planShuffle(seed:number,viewportWidth:number,viewportHeight:number,sizes:ShuffleSize[]):Generator<void,ShuffleScene>{
 const random=rng(seed),largest=Math.max(...sizes.map(s=>Math.hypot(s.width,s.height)/2+2)),radii=sizes.map(()=>largest);
 // A circular physical tabletop allows a broad sweeping wash. The close camera
 // may crop peripheral tiles rather than shrinking all 60 physical objects.
 let rx=largest*Math.sqrt(sizes.length/.42),ry=rx,points:ShufflePose[]=[];
 // Rejection sampling gives a loose pile from the very first frame, not a grid.
 for(let attempt=0;attempt<12;attempt++){
  points=[];
  for(let i=0;i<sizes.length;i++){
   let found=false;
   for(let tries=0;tries<900;tries++){
    if(tries%32===31)yield;
    const angle=random()*Math.PI*2,d=Math.sqrt(random())*(1-(largest+GAP)/Math.min(rx,ry));
    const p={x:Math.cos(angle)*rx*d,y:Math.sin(angle)*ry*d,angle:(random()-.5)*300};
    if(points.every((q,j)=>{const dx=p.x-q.x,dy=p.y-q.y,reach=radii[i]+radii[j]+GAP;return Math.abs(dx)>=reach||Math.abs(dy)>=reach||dx*dx+dy*dy>=reach*reach;})){
     points.push(p);found=true;break;
    }
   }
   if(!found)break;
   yield;
  }
  if(points.length===sizes.length)break;
  rx*=1.12;ry*=1.12;
 }
 if(points.length!==sizes.length)throw Error('Unable to place solid shuffle tiles');
 const tracks=points.map((p,i)=>({radius:radii[i],poses:[{...p}]}));
 const velocity=points.map(()=>({x:0,y:0})),headings=points.map(()=>random()*Math.PI*2),spin=points.map(()=>70+random()*90);
 const sweep=(t:number)=>{return .42*Math.sin(2*Math.PI*t)+.12*Math.sin(4*Math.PI*t);};
 for(let frame=1;frame<=FRAMES;frame++){
  const prior=points.map(p=>({...p})),progress=frame/FRAMES,envelope=Math.sin(Math.PI*progress);
  const delta=sweep(progress)-sweep((frame-1)/FRAMES),c=Math.cos(delta),s=Math.sin(delta);
  // Two gentle alternating hand sweeps reverse instead of rotating the pile
  // like a carousel. Independent vortices mix neighbours between each sweep.
  const base=prior.map(p=>({x:p.x*c-p.y*s,y:p.x*s+p.y*c,angle:p.angle+delta*180/Math.PI}));
  points=base.map(p=>({...p}));
  const order=points.map((_,i)=>(i+frame)%points.length);
  for(const i of order){
   const p=base[i],normal=Math.hypot(p.x/rx,p.y/ry),turn=Math.cos(progress*Math.PI*2);
   const vortexX=(p.x<0?-1:1)*rx*.3,vortexY=Math.sin(progress*Math.PI*2)*ry*.18;
   let fx=-(p.y-vortexY)/ry*turn*2+Math.cos(headings[i]+progress*5)*1.7;
   let fy=(p.x-vortexX)/rx*turn*2+Math.sin(headings[i]+progress*5)*1.7;
   for(let j=0;j<points.length;j++)if(i!==j){
    const dx=p.x-base[j].x,dy=p.y-base[j].y,reach=radii[i]+radii[j]+largest*.55;
    if(Math.abs(dx)>=reach||Math.abs(dy)>=reach)continue;
    const d=Math.hypot(dx,dy);
    if(d<reach&&d>0){const push=(reach-d)/largest*2.5;fx+=dx/d*push;fy+=dy/d*push;}
   }
   if(normal>.72){fx-=p.x/rx*(normal-.72)*14;fy-=p.y/ry*(normal-.72)*14;}
   const v=velocity[i],vx=v.x*c-v.y*s,vy=v.x*s+v.y*c;
   const speed=largest*.27*envelope,n=Math.max(1,Math.hypot(fx,fy));
   v.x=vx*.62+fx/n*speed*.38;v.y=vy*.62+fy/n*speed*.38;
   // Deflect along contact normals instead of repeatedly stopping and jittering.
   for(let pass=0;pass<2;pass++)for(let j=0;j<points.length;j++)if(i!==j){
    const dx=p.x-points[j].x,dy=p.y-points[j].y,reach=radii[i]+radii[j]+GAP+speed*2;
    if(Math.abs(dx)>=reach||Math.abs(dy)>=reach)continue;
    const d=Math.hypot(dx,dy);
    if(d>0&&d<reach){
     const toward=(v.x*dx+v.y*dy)/d;
     if(toward<0){v.x-=dx/d*toward;v.y-=dy/d*toward;}
    }
   }
   for(const fraction of [1,.65,.3,0]){
    const q={x:p.x+v.x*fraction,y:p.y+v.y*fraction,angle:p.angle+spin[i]/FRAMES*envelope*(i%2?-1:1)};
    const inner=1-(largest+GAP)/Math.min(rx,ry);
    if(Math.hypot(q.x/rx,q.y/ry)>inner+1e-9)continue;
    if(points.every((_,j)=>{
     if(j===i)return true;
     const reach=radii[i]+radii[j]+GAP-1e-7,dx=q.x-points[j].x,dy=q.y-points[j].y;
     if(Math.abs(dx)<reach&&Math.abs(dy)<reach&&dx*dx+dy*dy<reach*reach)return false;
     const sweptReach=radii[i]+radii[j]+.5;
     if(Math.min(prior[i].x,q.x)-Math.max(prior[j].x,points[j].x)>=sweptReach||
        Math.min(prior[j].x,points[j].x)-Math.max(prior[i].x,q.x)>=sweptReach||
        Math.min(prior[i].y,q.y)-Math.max(prior[j].y,points[j].y)>=sweptReach||
        Math.min(prior[j].y,points[j].y)-Math.max(prior[i].y,q.y)>=sweptReach)return true;
     return sweptDistance(prior[i],q,prior[j],points[j])>=sweptReach;
    })){points[i]=q;break;}
   }
  }
  points.forEach((p,i)=>tracks[i].poses.push({...p}));
  yield;
 }
 return {width:rx*2,height:ry*2,tracks};
}
/** Piecewise linear interpolation matches WAAPI; swept checks cover the in-betweens. */
export function sampleShufflePose(poses:ShufflePose[],progress:number):ShufflePose{
 const n=Math.max(0,Math.min(1,progress))*(poses.length-1),i=Math.min(poses.length-2,Math.floor(n)),t=n-i,a=poses[i],b=poses[i+1];
 return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,angle:a.angle+(b.angle-a.angle)*t};
}
/** Close view uses actual measured tile dimensions; only the observer zooms. */
export function frameShuffle(_scene:ShuffleScene,_width:number,_height:number){return 1;}
export function overviewScale(scene:Pick<ShuffleScene,'width'|'height'>,width:number,height:number){return Math.min(1,width*.9/(scene.width+32),height*.78/(scene.height+32));}
/** All 60 backs share these timestamps. Skip redundant frames only when the
 * interpolated motion remains close to the original and solid bodies clear. */
export function shuffleFrameIndices(scene:ShuffleScene){
 const tracks=scene.tracks,last=(tracks[0]?.poses.length??1)-1,indices=[0];
 if(!tracks.length)return indices;
 const allowedError=Math.min(6,Math.min(...tracks.map(t=>t.radius))*.12);
 const safe=(a:number,b:number)=>{
  for(let i=0;i<tracks.length;i++){
   const track=tracks[i],p=track.poses;
   for(let frame=a+1;frame<b;frame++){
    const t=(frame-a)/(b-a),point=p[frame];
    if(Math.hypot(point.x-p[a].x-(p[b].x-p[a].x)*t,point.y-p[a].y-(p[b].y-p[a].y)*t)>allowedError)return false;
   }
   for(let j=0;j<i;j++){
    const other=tracks[j];
    if(sweptDistance(p[a],p[b],other.poses[a],other.poses[b])<track.radius+other.radius+.5)return false;
   }
  }
  return true;
 };
 for(let start=0;start<last;){
  let end=Math.min(last,start+3);
  while(end>start+1&&!safe(start,end))end--;
  indices.push(end);start=end;
 }
 return indices;
}
export function shuffleKeyframes(poses:ShufflePose[],width:number,height:number,depth:number,scale:number,cx:number,cy:number,indices?:readonly number[]){
 return (indices??poses.map((_,i)=>i)).map(i=>({offset:i/(poses.length-1),transform:shuffleTransform(poses[i],width,height,depth,scale,cx,cy)}));
}
export function shuffleTransform(p:ShufflePose,width:number,height:number,depth:number,scale:number,cx:number,cy:number){
 return `translate3d(${cx+p.x*scale-width/2}px,${cy+p.y*scale-height/2}px,${depth*scale}px) rotate(${p.angle}deg) scale3d(${scale},${scale},${scale})`;
}
