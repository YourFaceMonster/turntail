import {sampleShufflePose,type ShufflePose} from './shuffle-motion.ts';
import {sampleDealRoute,type DealRoute} from './deal-motion.ts';
import {ENTRANCE_MS,type EntrancePhase} from './atmosphere.ts';
import {entranceCameraEase,GPU_TILE_STRIDE} from './entrance-gpu.ts';
export type EntranceRenderTile={width:number,height:number,depth:number,poses:ShufflePose[],faceSlot:number,kind:'own'|'opponent'|'lower'|'upper',target:{x:number,y:number,width:number,height:number,angle:number}};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function entranceFrameCamera(phase:EntrancePhase,elapsed:number,overview:number){
 const cameraTime=phase==='approach'?elapsed:phase==='shuffle'?ENTRANCE_MS.approach+elapsed:0;
 const progress=phase==='deal'||phase==='settle'||phase==='game-in'?1:entranceCameraEase(cameraTime/(ENTRANCE_MS.approach+ENTRANCE_MS.shuffle));
 return {tilt:62*Math.PI/180*(1-progress),scale:overview+(1-overview)*progress};
}
/** The original 60-body tracks and flight routes feed one instanced GPU draw. */
export function writeEntranceFrame(data:Float32Array,tiles:EntranceRenderTile[],routes:DealRoute[],phase:EntrancePhase,elapsed:number,cx:number,cy:number){
 const landed=phase==='settle'||phase==='game-in',t=clamp(elapsed/ENTRANCE_MS.deal);
 for(let i=0;i<tiles.length;i++){
  const tile=tiles[i];let x:number,y:number,z=tile.depth,sx=1,sy=1,angle:number,body=1,flip=0,visible=1;
  if(landed){x=tile.target.x;y=tile.target.y;angle=tile.target.angle;sx=tile.target.width/tile.width;sy=tile.target.height/tile.height;body=0;z=0;flip=tile.kind==='own'?Math.PI:0;visible=tile.kind==='own'||tile.kind==='upper'?1:0;}
  else if(phase==='deal'){
   const p=sampleDealRoute(routes[i],t);({x,y,z,sx,sy,angle}=p);body=1-clamp((t-.82)/.18);
   if(tile.kind==='own'){const u=clamp((elapsed-ENTRANCE_MS.deal*.82)/280);flip=Math.PI*u*u*(3-2*u);}
  }else{
   const p=phase==='shuffle'?sampleShufflePose(tile.poses,clamp(elapsed/ENTRANCE_MS.shuffle)):tile.poses[0];x=cx+p.x;y=cy+p.y;angle=p.angle;
  }
  const offset=i*GPU_TILE_STRIDE;
  data[offset]=x;data[offset+1]=y;data[offset+2]=z;data[offset+3]=angle*Math.PI/180;
  data[offset+4]=tile.width*sx;data[offset+5]=tile.height*sy;data[offset+6]=tile.depth*Math.min(sx,sy);data[offset+7]=flip;
  data[offset+8]=tile.faceSlot;data[offset+9]=body;data[offset+10]=visible;data[offset+11]=0;
 }
 return data;
}
