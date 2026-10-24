import {ENTRANCE_MS,type EntrancePhase} from './atmosphere.ts';
const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export const ENTRANCE_FOCAL=1000;
export const SEATED_TILT=58*Math.PI/180;
export function seatedScale(overview:number){return Math.max(.46,Math.min(.72,overview*1.3));}
/** Zoom once while seated, then lift the view without another distance change. */
export function observerCamera(progress:number,_overview:number){return {tilt:SEATED_TILT*(1-smooth(progress)),scale:1};}
export function entranceCameraState(phase:EntrancePhase,progress:number,overview:number){
 const scale=seatedScale(overview);
 if(phase==='rise')return observerCamera(progress,overview);
 if(phase==='focus')return {tilt:SEATED_TILT,scale:scale+(1-scale)*smooth(progress)};
 if(phase==='deal')return {tilt:SEATED_TILT,scale};
 if(['settle','game-in','idle'].includes(phase))return {tilt:0,scale:1};
 return {tilt:SEATED_TILT,scale};
}
export function cameraTransform(camera:{tilt:number,scale:number}){return `translateZ(${ENTRANCE_FOCAL-ENTRANCE_FOCAL/camera.scale}px) rotateX(${camera.tilt*180/Math.PI}deg)`;}
/** GPU and compositor sample the same seated -> overhead -> final framing path. */
export function observerCameraFrames(overview:number,duration=ENTRANCE_MS.rise,phase:EntrancePhase='rise'){
 const frames=Math.max(1,Math.ceil(duration/1000*120));return Array.from({length:frames+1},(_,i)=>({offset:i/frames,transform:cameraTransform(entranceCameraState(phase,i/frames,overview))}));
}
export function environmentTransform(camera:{tilt:number,scale:number},overview:number,near=false){
 const tilt=camera.tilt/SEATED_TILT,travel=(1-camera.scale)/(1-seatedScale(overview));
 return `translate3d(0,${-(near?24:9)*tilt}px,0) scale(${1+Math.max(0,travel)*(near?.07:.035)})`;
}
export function environmentCameraFrames(overview:number,duration=ENTRANCE_MS.rise,near=false,phase:EntrancePhase='rise'){
 const frames=Math.max(1,Math.ceil(duration/1000*120));return Array.from({length:frames+1},(_,i)=>({offset:i/frames,transform:environmentTransform(entranceCameraState(phase,i/frames,overview),overview,near)}));
}
