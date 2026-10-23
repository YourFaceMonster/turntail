export type ShufflePose={x:number,y:number,angle:number};
export type ShuffleSize={width:number,height:number};
export type ShuffleTrack={radius:number,poses:ShufflePose[]};
export type ShuffleScene={width:number,height:number,tracks:ShuffleTrack[]};
const FRAMES=96,GAP=4;
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
 const aspect=Math.max(.65,Math.min(1.75,viewportWidth/viewportHeight));
 let rx=largest*Math.sqrt(sizes.length*aspect/.42),ry=rx/aspect,points:ShufflePose[]=[];
 // Rejection sampling gives a loose pile from the very first frame, not a grid.
 for(let attempt=0;attempt<12;attempt++){
  points=[];
  for(let i=0;i<sizes.length;i++){
   let found=false;
   for(let tries=0;tries<900;tries++){
    if(tries%32===31)yield;
    const angle=random()*Math.PI*2,d=Math.sqrt(random())*(1-(largest+GAP)/Math.min(rx,ry));
    const p={x:Math.cos(angle)*rx*d,y:Math.sin(angle)*ry*d,angle:(random()-.5)*300};
    if(points.every((q,j)=>Math.hypot(p.x-q.x,p.y-q.y)>=radii[i]+radii[j]+GAP)){
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
 const velocity=points.map(()=>({x:0,y:0})),headings=points.map(()=>random()*Math.PI*2),spin=points.map(()=>40+random()*80);
 for(let frame=1;frame<=FRAMES;frame++){
  const prior=points.map(p=>({...p})),progress=frame/FRAMES,envelope=Math.sin(Math.PI*progress);
  // Rotate visitation order to avoid favouring a particular tile or hand.
  const order=points.map((_,i)=>(i+frame)%points.length),moved=new Set<number>();
  for(const i of order){
   const p=prior[i],normal=Math.hypot(p.x/rx,p.y/ry),turn=progress<.54?1:-1;
   let fx=-p.y/ry*turn*1.6+Math.cos(headings[i]+progress*5)*.7;
   let fy=p.x/rx*turn*1.6+Math.sin(headings[i]+progress*5)*.7;
   for(let j=0;j<points.length;j++)if(i!==j){
    const dx=p.x-prior[j].x,dy=p.y-prior[j].y,d=Math.hypot(dx,dy),reach=radii[i]+radii[j]+largest*.8;
    if(d<reach&&d>0){const push=(reach-d)/largest*2;fx+=dx/d*push;fy+=dy/d*push;}
   }
   if(normal>.78){fx-=p.x/rx*(normal-.78)*16;fy-=p.y/ry*(normal-.78)*16;}
   const v=velocity[i],speed=largest*.055*envelope,n=Math.max(1,Math.hypot(fx,fy));
   v.x=v.x*.72+fx/n*speed*.28;v.y=v.y*.72+fy/n*speed*.28;
   let accepted=false;
   for(const fraction of [1,.65,.3,0]){
    const q={x:p.x+v.x*fraction,y:p.y+v.y*fraction,angle:p.angle+spin[i]/FRAMES*envelope*(i%2?-1:1)};
    const inner=1-(largest+GAP)/Math.min(rx,ry);
    if(Math.hypot(q.x/rx,q.y/ry)>inner)continue;
    if(points.every((_,j)=>j===i||sweptDistance(p,q,prior[j],moved.has(j)?points[j]:prior[j])>=radii[i]+radii[j]+GAP-1e-7)){
     points[i]=q;accepted=true;break;
    }
   }
   if(!accepted)points[i]={...p};
   moved.add(i);
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
export function frameShuffle(scene:ShuffleScene,width:number,height:number){return Math.min(1,width*.91/scene.width,height*.83/scene.height);}
export function shuffleKeyframes(poses:ShufflePose[],width:number,height:number,depth:number,scale:number,cx:number,cy:number){
 return poses.map((p,i)=>({offset:i/(poses.length-1),transform:shuffleTransform(p,width,height,depth,scale,cx,cy)}));
}
export function shuffleTransform(p:ShufflePose,width:number,height:number,depth:number,scale:number,cx:number,cy:number){
 return `translate3d(${cx+p.x*scale-width/2}px,${cy+p.y*scale-height/2}px,${depth*scale}px) rotate(${p.angle}deg) scale3d(${scale},${scale},${scale})`;
}
