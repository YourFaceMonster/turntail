import {ENTRANCE_MS,type EntrancePhase} from './atmosphere.ts';
const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const silk=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
export const ENTRANCE_FOCAL=1000;
export const SEATED_TILT=64*Math.PI/180;
export function seatedScale(overview:number){return Math.max(.25,Math.min(.56,overview*1.1));}
/** Classic tables retain their original camera. Painted regions lift while moving closer. */
export function observerCamera(progress:number,_overview:number){return {tilt:SEATED_TILT*(1-smooth(progress)),scale:1};}
export function entranceCameraState(phase:EntrancePhase,progress:number,overview:number,painterly=false){
 const scale=seatedScale(overview);
 if(painterly){
  const t=silk(progress),mid=scale+(1-scale)*.48,tilt=42*Math.PI/180;
  if(phase==='focus')return {tilt:SEATED_TILT+(tilt-SEATED_TILT)*t,scale:scale+(mid-scale)*t};
  if(phase==='rise')return {tilt:tilt*(1-t),scale:mid+(1-mid)*t};
 }
 if(phase==='rise')return observerCamera(progress,overview);
 if(phase==='focus')return {tilt:SEATED_TILT,scale:scale+(1-scale)*smooth(progress)};
 if(phase==='deal')return {tilt:SEATED_TILT,scale};
 if(['opponent-out','settle','game-in','idle'].includes(phase))return {tilt:0,scale:1};
 return {tilt:SEATED_TILT,scale};
}
export function cameraTransform(camera:{tilt:number,scale:number}){return `translateZ(${ENTRANCE_FOCAL-ENTRANCE_FOCAL/camera.scale}px) rotateX(${camera.tilt*180/Math.PI}deg)`;}
/** DOM, tile GPU and furniture sample exactly the same camera and clock. */
export function observerCameraFrames(overview:number,duration=ENTRANCE_MS.rise,phase:EntrancePhase='rise',painterly=false){
 const frames=Math.max(1,Math.ceil(duration/1000*120));return Array.from({length:frames+1},(_,i)=>({offset:i/frames,transform:cameraTransform(entranceCameraState(phase,i/frames,overview,painterly))}));
}
export function environmentTransform(camera:{tilt:number,scale:number},overview:number,near=false,painterly=false){
 const lift=1-camera.tilt/SEATED_TILT,zoom=camera.scale/seatedScale(overview);
 if(painterly){const progress=Math.max(0,Math.min(1,(camera.scale-seatedScale(overview))/(1-seatedScale(overview))));return `translate3d(0,${-(near?26:18)*lift}px,0) scale(${1+progress*(near?.065:.045)+lift*.015})`;}
 return `translate3d(0,${-(near?46:34)*lift}px,0) scale(${1+(zoom-1)*(near?1.025:1)})`;
}
export function environmentCameraFrames(overview:number,duration=ENTRANCE_MS.rise,near=false,phase:EntrancePhase='rise',painterly=false){
 const frames=Math.max(1,Math.ceil(duration/1000*120));return Array.from({length:frames+1},(_,i)=>({offset:i/frames,transform:environmentTransform(entranceCameraState(phase,i/frames,overview,painterly),overview,near,painterly)}));
}
