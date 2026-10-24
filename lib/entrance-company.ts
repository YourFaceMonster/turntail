import {stageModel} from './stage-models';
import {furnitureDimensions} from './entrance-furniture';
import {opponentSeats} from './table-world';
import {projectEntrancePoint} from './entrance-gpu';
import {SEATED_TILT,seatedScale} from './entrance-camera';
export type SeatLayout={left:number,top:number,width:number,height:number,support:number,head:{x:number,y:number,z:number}};
export type CompanyViewport={width:number,height:number,overview:number};
export function entranceSeatLayout(diameter:number,cx:number,cy:number,index:number,count:number,monster:boolean,stage=0,viewport?:CompanyViewport,portrait?:number):SeatLayout{
 if(stage>0){
  // Regional furniture must never decide the size of a person or creature.
  const reference=entranceSeatLayout(diameter,cx,cy,index,count,true,0,viewport),height=reference.width;
  const model=stageModel(portrait??0),aspect=model.rect[2]/model.rect[3],width=height*aspect,support=height*.46;
  const seat=opponentSeats(count)[index],x=cx+seat.x*diameter*.78,y=cy-diameter*(count===1?.50:.44),facing=index>=Math.ceil(count/2)?-1:1;
  const faceX=(model.face[0]-model.rect[0]+model.face[2]/2)/model.rect[2],faceY=(model.face[1]-model.rect[1]+model.face[2]/2)/model.rect[3];
  return {left:x-width/2,top:y-height,width,height,support,head:{x:x+(faceX-.5)*width*facing,y,z:height*(1-faceY)-support}};
 }
 const seat=opponentSeats(count)[index],size=Math.max(150,Math.min(250,diameter*.18)),support=furnitureDimensions(diameter,cx,cy,stage).height,desired=support+Math.max(450,diameter*.5);
 let height=desired;
 if(viewport){const camera={width:viewport.width,height:viewport.height,scale:seatedScale(viewport.overview),tilt:SEATED_TILT};let lo=support+size,hi=desired;for(let j=0;j<20;j++){const mid=(lo+hi)/2,head=projectEntrancePoint(cx,cy-(stage?.4:.53)*diameter,mid-support,camera);if(head.y<viewport.height*.09)hi=mid;else lo=mid;}height=lo;}
 height=monster?stage?Math.min(height,support/.43):height:support+size*1.6;
 const width=monster?height*(stage?1:2/3):size*1.45,x=cx+seat.x*diameter,y=cy+(stage?seat.y-.12:-.53)*diameter,renderSupport=stage?height*.52:support;
 return {left:x-width/2,top:y-height,width,height,support:renderSupport,head:{x,y,z:height*.82-renderSupport}};
}
export function greetingPlacement(head:{x:number,y:number,z:number},viewport:CompanyViewport,index:number,count:number){
 const p=projectEntrancePoint(head.x,head.y,head.z,{width:viewport.width,height:viewport.height,scale:seatedScale(viewport.overview),tilt:SEATED_TILT});
 const width=Math.min(300,Math.max(210,viewport.width*.24),viewport.width-24),leftSide=index<count/2;
 const desired=leftSide?p.x-width-28:p.x+28,left=Math.max(12,Math.min(viewport.width-width-12,desired)),top=Math.max(12,Math.min(viewport.height-120,p.y-105));
 return {left,top,width,tail:Math.max(24,Math.min(width-24,p.x-left)),headX:p.x,headY:p.y};
}
