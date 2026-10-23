import {ENTRANCE_MS} from './atmosphere.ts';
const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export const ENTRANCE_FOCAL=1000;
/** Walk at eye level first; only lean over the table after arriving beside it. */
export function observerCamera(progress:number,overview:number){
 const p=Math.max(0,Math.min(1,progress)),walk=smooth(p/.7),lean=smooth((p-.7)/.3);
 const far=ENTRANCE_FOCAL/Math.max(.05,overview),beside=ENTRANCE_FOCAL*1.35;
 const distance=p<.7?far+(beside-far)*walk:beside+(ENTRANCE_FOCAL-beside)*lean;
 return {tilt:72*Math.PI/180*(1-lean),scale:ENTRANCE_FOCAL/distance};
}
/** The same sampled perspective transform drives the compositor and GPU clock. */
export function observerCameraFrames(overview:number,duration=ENTRANCE_MS.approach){const frames=Math.max(1,Math.ceil(duration/1000*120));return Array.from({length:frames+1},(_,i)=>{
 const camera=observerCamera(i/frames,overview);
 return {offset:i/frames,transform:`translateZ(${ENTRANCE_FOCAL-ENTRANCE_FOCAL/camera.scale}px) rotateX(${camera.tilt*180/Math.PI}deg)`};
});}
/** Distant scenery moves less than the physical floor, and finishes at the
 * exact live-scene transform. All layers share the observer animation clock. */
export function environmentCameraFrames(overview:number,duration=ENTRANCE_MS.approach,near=false){
 return observerCameraFrames(overview,duration).map((frame,i,frames)=>{
  const p=i/(frames.length-1),camera=observerCamera(p,overview),tilt=camera.tilt/(72*Math.PI/180);
  const travel=(1-camera.scale)/(1-Math.min(.999,overview));
  return {offset:frame.offset,transform:`translate3d(0,${-(near?30:12)*tilt}px,0) scale(${1+Math.max(0,travel)*(near?.12:.055)})`};
 });
}
