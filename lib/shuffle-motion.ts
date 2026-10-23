export type ShufflePose={x:number,y:number,angle:number};
/** One continuous Bezier curve; no ease-to-stop at each intermediate waypoint. */
export function sampleShufflePose(poses:ShufflePose[],progress:number):ShufflePose{
 const t=Math.max(0,Math.min(1,progress)),u=t*t*(3-2*t),points=poses.map(p=>({...p}));
 for(let n=points.length-1;n>0;n--)for(let i=0;i<n;i++){
  for(const key of ['x','y','angle'] as const)points[i][key]+=(points[i+1][key]-points[i][key])*u;
 }
 return points[0];
}
export function shuffleDepth(tileHeight:number){return Math.min(26,Math.max(18,tileHeight*.38));}
/** Precompute once, then let the browser animate transforms without JS per frame. */
export function shuffleKeyframes(poses:ShufflePose[],width:number,height:number,depth:number){
 return Array.from({length:49},(_,i)=>{
  const t=i/48,p=sampleShufflePose(poses,t),v=Math.max(0,(t-.5)*2),z=depth*(1-v*v*(3-2*v));
  return {offset:t,transform:`translate3d(${p.x-width/2}px,${p.y-height/2}px,${z}px) rotate(${p.angle}deg)`};
 });
}
/** Visual randomness only. A launch seed keeps rerenders and resizes continuous. */
export function shuffleMotion(seed:number,index:number,width:number,height:number,tileWidth:number,tileHeight:number){
 let state=(seed^Math.imul(index+1,0x9e3779b9))>>>0;
 const random=()=>{state=(state+0x6d2b79f5)>>>0;let n=state;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;};
 // Reserve the rotated diagonal, including the visible body and its shadow.
 const margin=Math.hypot(tileWidth,tileHeight)/2+16;
 const rx=Math.max(0,Math.min(width*.35,width/2-margin));
 const ry=Math.max(0,Math.min(height*.25,height/2-margin));
 let heading=random()*Math.PI*2,angle=(random()-.5)*180;
 const direction=random()<.5?-1:1,delay=Math.floor(random()*150),poses:ShufflePose[]=[];
 for(let step=0;step<5;step++){
  if(step){heading+=direction*(.6+random()*.9);angle=Math.max(-165,Math.min(165,angle+(random()-.5)*100));}
  const radius=.28+random()*.68;
  poses.push({x:width/2+Math.cos(heading)*rx*radius,y:height/2+Math.sin(heading)*ry*radius,angle});
 }
 return {poses,delay};
}
