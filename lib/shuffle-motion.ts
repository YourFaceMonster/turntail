import {tileBodyDepth} from './tile-body.ts';
import {ENTRANCE_MS} from './atmosphere.ts';
import {collideTiles,type RigidTile} from './shuffle-contacts.ts';
export type ShufflePose={x:number,y:number,angle:number};
export type ShuffleSize={width:number,height:number};
export type ShuffleTrack={radius:number,width?:number,height?:number,poses:ShufflePose[],contacts?:number[]};
export type ShuffleScene={width:number,height:number,tracks:ShuffleTrack[],contacts?:number};
export const SHUFFLE_HZ=120;
export const SHUFFLE_FRAMES=Math.round(ENTRANCE_MS.shuffle/1000*SHUFFLE_HZ);
const FRAMES=SHUFFLE_FRAMES,GAP=4,DT=144/FRAMES;
function rng(seed:number){let state=seed>>>0;return()=>{state=(state+0x6d2b79f5)>>>0;let n=state;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;};}
/** Minimum centre distance for the WHOLE linear interval, not just its endpoints. */
export function sweptDistance(a:ShufflePose,b:ShufflePose,c:ShufflePose,d:ShufflePose){
 const x=a.x-c.x,y=a.y-c.y,dx=b.x-a.x-d.x+c.x,dy=b.y-a.y-d.y+c.y;
 const speed=dx*dx+dy*dy,t=speed?Math.max(0,Math.min(1,-(x*dx+y*dy)/speed)):0;
 return Math.hypot(x+dx*t,y+dy*t);
}
/** Conservative circles enclose every tile corner at every angle, including its body. */
export function shuffleDepth(tileHeight:number){return tileBodyDepth(tileHeight);}
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
 const physicalWidth=Math.max(...sizes.map(s=>s.width)),physicalHeight=Math.max(...sizes.map(s=>s.height));
 const tracks:ShuffleTrack[]=points.map((p,i)=>({radius:radii[i],width:physicalWidth,height:physicalHeight,poses:[{...p}],contacts:[]}));
 const bodies:RigidTile[]=points.map((p,i)=>({...p,width:physicalWidth,height:physicalHeight,vx:0,vy:0,spin:0})),phases=bodies.map(()=>random()*Math.PI*2);
 let contacts=0;
 for(let frame=1;frame<=FRAMES;frame++){
  const t=frame/FRAMES,envelope=Math.sin(Math.PI*t),drive=largest*.038*envelope;
  for(let i=0;i<bodies.length;i++){
   const p=bodies[i],side=p.x<0?-1:1,cx=side*rx*.2,cy=Math.sin(t*Math.PI*2)*ry*.16;
   const dx=p.x-cx,dy=p.y-cy,d=Math.max(largest,Math.hypot(dx,dy)),turn=Math.cos(t*Math.PI*2+side*.55);
   const normal=Math.hypot(p.x,p.y)/rx,inward=Math.max(0,normal-.48)*4;
   const fx=-dy/d*turn+Math.cos(phases[i]+t*5)*.55-p.x/rx*inward;
   const fy=dx/d*turn+Math.sin(phases[i]+t*5)*.55-p.y/ry*inward;
   p.vx=p.vx*Math.pow(.95,DT)+fx*drive*DT;p.vy=p.vy*Math.pow(.95,DT)+fy*drive*DT;p.spin=p.spin*Math.pow(.95,DT)+Math.sin(phases[i]+t*7)*.001*envelope*DT;
   const cap=largest*.24,spd=Math.hypot(p.vx,p.vy);if(spd>cap){p.vx*=cap/spd;p.vy*=cap/spd;}
   if(t>.84){p.vx*=Math.pow(.84,DT);p.vy*=Math.pow(.84,DT);p.spin*=Math.pow(.78,DT);}
  }
  // Four substeps and eight short constraint passes preserve contact while
  // avoiding tunnelling. This entire simulation is prepared before playback.
  for(let sub=0;sub<4;sub++){
   for(const p of bodies){p.x+=p.vx*DT/4;p.y+=p.vy*DT/4;p.angle+=p.spin*DT/4*180/Math.PI;}
   for(let pass=0;pass<(frame===FRAMES?48:8);pass++){
    for(let i=0;i<bodies.length;i++)for(let j=0;j<i;j++){
     const a=bodies[i],b=bodies[j],reach=tracks[i].radius+tracks[j].radius;
     if(Math.abs(a.x-b.x)>reach||Math.abs(a.y-b.y)>reach)continue;
     if(collideTiles(a,b)){contacts++;if(pass===0){tracks[i].contacts!.push(frame);tracks[j].contacts!.push(frame);}}
    }
    for(let i=0;i<bodies.length;i++){
     const p=bodies[i],d=Math.hypot(p.x,p.y),limit=rx-tracks[i].radius-2;
     if(d>limit){const nx=p.x/d,ny=p.y/d;p.x=nx*limit;p.y=ny*limit;const v=p.vx*nx+p.vy*ny;if(v>0){p.vx-=nx*v*1.2;p.vy-=ny*v*1.2;p.spin*=.8;}}
    }
   }
   yield;
  }
  bodies.forEach((p,i)=>tracks[i].poses.push({x:p.x,y:p.y,angle:p.angle}));
 }
 return {width:rx*2,height:ry*2,tracks,contacts};
}
/** Piecewise linear interpolation matches WAAPI; swept checks cover the in-betweens. */
export function sampleShufflePose(poses:ShufflePose[],progress:number):ShufflePose{
 const n=Math.max(0,Math.min(1,progress))*(poses.length-1),i=Math.min(poses.length-2,Math.floor(n)),t=n-i,a=poses[i],b=poses[i+1];
 return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,angle:a.angle+(b.angle-a.angle)*t};
}
/** Close view uses actual measured tile dimensions; only the observer zooms. */
export function frameShuffle(_scene:ShuffleScene,_width:number,_height:number){return 1;}
export function overviewScale(scene:Pick<ShuffleScene,'width'|'height'>,width:number,height:number){return Math.min(1,width*.9/(scene.width+32),height*.78/(scene.height+32));}
/** Preserve each contact timestamp for both GPU and compositor playback. */
export function shuffleFrameIndices(scene:ShuffleScene,maxHz=SHUFFLE_HZ){
 const last=Math.max(0,(scene.tracks[0]?.poses.length||1)-1),count=Math.min(last,Math.max(1,Math.ceil(ENTRANCE_MS.shuffle/1000*maxHz)));
 if(!last)return [0];
 return Array.from({length:count+1},(_,i)=>Math.round(i*last/count));
}

export function shuffleKeyframes(poses:ShufflePose[],width:number,height:number,depth:number,scale:number,cx:number,cy:number,indices?:readonly number[]){
 return (indices??poses.map((_,i)=>i)).map(i=>({offset:i/(poses.length-1),transform:shuffleTransform(poses[i],width,height,depth,scale,cx,cy)}));
}
export function shuffleTransform(p:ShufflePose,width:number,height:number,depth:number,scale:number,cx:number,cy:number){
 return `translate3d(${cx+p.x*scale-width/2}px,${cy+p.y*scale-height/2}px,${depth*scale}px) rotate(${p.angle}deg) scale3d(${scale},${scale},${scale})`;
}
