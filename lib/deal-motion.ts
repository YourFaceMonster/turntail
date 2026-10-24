import {tileBodyDepth} from './tile-body.ts';
import {sweptDistance,type ShufflePose} from './shuffle-motion.ts';
export type DealFlight={key:string,kind:'own'|'opponent'|'lower'|'upper',width:number,height:number,depth:number,scale:number,source:ShufflePose,target:ShufflePose&{width:number,height:number}};
const lerp=(a:number,b:number,t:number)=>t===0?a:t===1?b:a+(b-a)*t;
const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
function pointSegment(p:ShufflePose,a:ShufflePose,b:ShufflePose){return sweptDistance(p,p,a,b);}
/** Minimum distance between paths, even if two tiles travel at different speeds. */
export function routeDistance(a:ShufflePose,b:ShufflePose,c:ShufflePose,d:ShufflePose){
 const cross=(p:ShufflePose,q:ShufflePose,r:ShufflePose)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
 const x=cross(a,b,c),y=cross(a,b,d),u=cross(c,d,a),v=cross(c,d,b);
 if(x*y<0&&u*v<0)return 0;
 return Math.min(pointSegment(a,c,d),pointSegment(b,c,d),pointSegment(c,a,b),pointSegment(d,a,b));
}
/** Minimum-cost matching: a concealed back has no identity until it is dealt. */
export function matchShuffleTracks(sources:ShufflePose[],targets:ShufflePose[]):number[]{
 const n=sources.length,u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);
 for(let i=1;i<=n;i++){
  p[0]=i;let j0=0;const min=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
  do{
   used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;
   for(let j=1;j<=n;j++)if(!used[j]){
    const a=sources[i0-1],b=targets[j-1],cur=Math.hypot(a.x-b.x,a.y-b.y)-u[i0]-v[j];
    if(cur<min[j]){min[j]=cur;way[j]=j0;}
    if(min[j]<delta){delta=min[j];j1=j;}
   }
   for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;
   j0=j1;
  }while(p[j0]!==0);
  do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
 }
 return targets.map((_,j)=>p[j+1]-1);
}
export type DealRoute=DealFlight&{tier:number,ceiling:number,ground:number,body:number};
/** A count badge marks the seat, but must never become a landing tile. */
export function opponentExit(seat:{x:number,y:number,angle:number},width:number,height:number,margin=90,ordinal=0,tileDiagonal=70){
 const cx=width/2,cy=height/2,dx=seat.x-cx,dy=seat.y-cy;
 const length=Math.max(1,Math.hypot(dx,dy));
 const factor=Math.max((Math.abs(dx)>1e-6?(width/2+margin+tileDiagonal*5)/Math.abs(dx):0),(Math.abs(dy)>1e-6?(height/2+margin+tileDiagonal*5)/Math.abs(dy):0),1);
 const side=ordinal===0?0:(ordinal%2?1:-1)*Math.ceil(ordinal/2)*(tileDiagonal+6);
 return {...seat,x:cx+dx*factor-dy/length*side,y:cy+dy*factor+dx/length*side};
}
/**
 * Lift all tiles before transit, reserve separate height bands for crossing swept
 * footprints, then lower all tiles after transit. Crossed paths never share a
 * physical height. Upper floor tiles keep a whole body above their lower tiles.
 */
export function planDealFlights(flights:DealFlight[]):DealRoute[]{
 const body=Math.max(...flights.map(f=>f.depth*Math.max(f.scale,Math.min(f.target.width/f.width,f.target.height/f.height)))),step=body+4,routes:DealRoute[]=[];
 for(const flight of flights){
  const radius=Math.max(Math.hypot(flight.width,flight.height),Math.hypot(flight.target.width,flight.target.height))/2+2;
  const conflicts=routes.filter(other=>{
   const r=Math.max(Math.hypot(other.width,other.height),Math.hypot(other.target.width,other.target.height))/2+2;
   return routeDistance(flight.source,flight.target,other.source,other.target)<radius+r;
  });
  const lower=flight.kind==='upper'?routes.find(other=>other.key===flight.key.replace(/^upper-/,'lower-')):undefined;
  let tier=lower?lower.tier+1:0;while(conflicts.some(other=>other.tier===tier))tier++;
  routes.push({...flight,tier,body,ceiling:(tier+4)*step,ground:tileBodyDepth(flight.target.height)*(flight.kind==='upper'?2:1)});
 }
 return routes;
}
export function sampleDealRoute(route:DealRoute,progress:number){
 // Every tile clears the table before transit and lands only after all transit.
 // Within that safe interval, groups peel off at different times and speeds.
 const lift=smooth(progress/.18);
 const seed=Number(route.key.match(/\d+$/)?.[0]??0);
 const start=.18+((seed*7+route.tier*3)%7)*.012;
 const end=.73+((seed*11+route.tier)%7)*.012;
 const travel=smooth((progress-start)/(end-start)),land=smooth((progress-.82)/.18);
 const a=route.source,b=route.target,angle=(((b.angle-a.angle+180)%360)+360)%360-180;
 return {x:lerp(a.x,b.x,travel),y:lerp(a.y,b.y,travel),angle:a.angle+angle*travel,
  sx:lerp(route.scale,b.width/route.width,travel),sy:lerp(route.scale,b.height/route.height,travel),
  z:progress<.18?lerp(route.depth*route.scale,route.ceiling,lift):lerp(route.ceiling,route.ground,land),
  opacity:1};
}
/** The visible opening slides low across the table instead of flying overhead. */
export function planTableDealFlights(flights:DealFlight[]):DealRoute[]{
 return planDealFlights(flights).map(route=>({...route,ceiling:Math.max(route.depth*route.scale,route.ground)+Math.min(24,route.body*1.2)}));
}
export function dealKeyframes(route:DealRoute){
 // Include the exact stage boundaries. No keyframe interval straddles stages.
 const stops=[0,.18,.82,1,...Array.from({length:37},(_,i)=>i/36)].sort((a,b)=>a-b).filter((t,i,a)=>!i||t!==a[i-1]);
 return stops.map(offset=>{
  const p=sampleDealRoute(route,offset);
  return {offset,opacity:p.opacity,transform:`translate3d(${p.x-route.width/2}px,${p.y-route.height/2}px,${p.z}px) rotate(${p.angle}deg) scale3d(${p.sx},${p.sy},${Math.min(p.sx,p.sy)})`};
 });
}
