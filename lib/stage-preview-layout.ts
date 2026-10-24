import {entranceSeatLayout} from './entrance-company';
import {furnitureGeometry} from './entrance-furniture';
import {projectEntrancePoint} from './entrance-gpu';
import {SEATED_TILT} from './entrance-camera';
import {STAGE_THEMES} from './stage-theme';
type Point={x:number,y:number,z:number};
/** One camera fits the union of every regional slab and cast member, so changing regions never changes scale. */
export function stagePreviewLayout(width:number,height:number,above=false){
 const diameter=1200,cx=width/2,cy=height/2,overview=.32,padding=Math.min(18,Math.max(6,Math.min(width,height)*.04)),points:Point[]=[];
 for(let stage=1;stage<=10;stage++){
  const geometry=furnitureGeometry(diameter,cx,cy,stage);points.push(...geometry.cap,...geometry.faces.flatMap(f=>f.points));
  if(!above)for(const [index,p] of STAGE_THEMES[stage-1].opponents.slice(0,2).entries()){
   const seat=entranceSeatLayout(diameter,cx,cy,index,2,true,stage,{width,height,overview},p.portrait),y=seat.top+seat.height;
   for(const x of [seat.left-seat.width*.02,seat.left+seat.width*1.02])for(const z of [-seat.support-seat.height*.02,seat.height*1.02-seat.support])points.push({x,y,z});
  }
 }
 const tilt=above?0:SEATED_TILT;
 const bounds=(scale:number)=>{const screen=points.map(p=>projectEntrancePoint(p.x,p.y,p.z,{width,height,tilt,scale})),xs=screen.map(p=>p.x),ys=screen.map(p=>p.y);return {left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};};
 let lo=.001,hi=.9;
 for(let i=0;i<36;i++){const mid=(lo+hi)/2,b=bounds(mid);if(b.right-b.left<=Math.max(1,width-padding*2)&&b.bottom-b.top<=Math.max(1,height-padding*2))lo=mid;else hi=mid;}
 const box=bounds(lo),shift={x:width/2-(box.left+box.right)/2,y:height/2-(box.top+box.bottom)/2};
 return {diameter,cx,cy,overview,camera:{tilt,scale:lo},shift,bounds:{left:box.left+shift.x,right:box.right+shift.x,top:box.top+shift.y,bottom:box.bottom+shift.y},padding};
}
