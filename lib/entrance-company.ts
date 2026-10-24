import {furnitureDimensions} from './entrance-furniture';
import {opponentSeats} from './table-world';
import {projectEntrancePoint} from './entrance-gpu';
import {SEATED_TILT,seatedScale} from './entrance-camera';
export type CompanyViewport={width:number,height:number,overview:number};
export function entranceSeatLayout(diameter:number,cx:number,cy:number,index:number,count:number,monster:boolean,stage=0,viewport?:CompanyViewport){
 const seat=opponentSeats(count)[index],size=Math.max(150,Math.min(250,diameter*.18)),support=furnitureDimensions(diameter,cx,cy,stage).height,desired=support+Math.max(450,diameter*.5);
 let height=desired;
 if(viewport){const camera={width:viewport.width,height:viewport.height,scale:seatedScale(viewport.overview),tilt:SEATED_TILT};let lo=support+size,hi=desired;for(let j=0;j<20;j++){const mid=(lo+hi)/2,head=projectEntrancePoint(cx,cy-.53*diameter,mid-support,camera);if(head.y<viewport.height*.09)hi=mid;else lo=mid;}height=lo;}
 height=monster?height:support+size*1.6;
 const width=monster?height*(stage?1:2/3):size*1.45,x=cx+seat.x*diameter,y=cy-.53*diameter;
 return {left:x-width/2,top:y-height,width,height,support,head:{x,y,z:height*.82-support}};
}
export function greetingPlacement(head:{x:number,y:number,z:number},viewport:CompanyViewport,index:number,count:number){
 const p=projectEntrancePoint(head.x,head.y,head.z,{width:viewport.width,height:viewport.height,scale:seatedScale(viewport.overview),tilt:SEATED_TILT});
 const width=Math.min(300,Math.max(210,viewport.width*.24),viewport.width-24),leftSide=index<count/2;
 const desired=leftSide?p.x-width-28:p.x+28,left=Math.max(12,Math.min(viewport.width-width-12,desired)),top=Math.max(12,Math.min(viewport.height-120,p.y-105));
 return {left,top,width,tail:Math.max(24,Math.min(width-24,p.x-left)),headX:p.x,headY:p.y};
}
