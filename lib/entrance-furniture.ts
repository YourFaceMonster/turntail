import {platformGeometry,stageSetting} from './stage-setting';
import {projectEntrancePoint,type GpuCamera} from './entrance-gpu';
export type WorldPoint={x:number,y:number,z:number};
export type FurnitureFace={points:WorldPoint[],color:string,part:string};
export function furnitureDimensions(diameter:number,cx:number,cy:number,stage=0){
 const setting=stageSetting(stage),height=setting.kind==='table'?Math.max(300,Math.min(640,diameter*.32)):Math.max(setting.height,Math.min(680,diameter*.3));
 const depth=setting.kind==='table'?Math.max(setting.depth,Math.min(100,diameter*.05)):height;
 const legWidth=Math.max(38,Math.min(90,diameter*.045));
 return {height,depth,legWidth,span:Math.min(2200,diameter*2.1),legs:setting.kind==='table'?[-1,1].flatMap(x=>[-1,1].map(y=>({x:cx+x*diameter*.265,y:cy+y*diameter*.265}))):[]};
}
/** Closed cuboids below the tabletop. Projected into one layer, with an explicit tabletop mask. */
export function furnitureGeometry(diameter:number,cx:number,cy:number,stage=0){
 const dims=furnitureDimensions(diameter,cx,cy,stage),platform=platformGeometry(diameter,stage),faces:FurnitureFace[]=[];
 const addBox=(x:number,y:number,w:number,h:number,top:number,bottom:number,part:string)=>{
  const corners=[{x:x-w/2,y:y-h/2},{x:x+w/2,y:y-h/2},{x:x+w/2,y:y+h/2},{x:x-w/2,y:y+h/2}];
  const colors=['#66442c','#392a20','#8b613b','#4d3526'];
  for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];faces.push({part,color:colors[i],points:[{...a,z:top},{...b,z:top},{...b,z:bottom},{...a,z:bottom}]});}
  faces.push({part,color:'#9b7448',points:corners.map(p=>({...p,z:top}))});
 };
 const cap=platform.vertices.map(p=>({x:cx+p.x,y:cy+p.y,z:0}));
 cap.forEach((a,i)=>{const b=cap[(i+1)%cap.length],organic=stage>0&&platform.setting.kind!=='table',lower=(p:WorldPoint,j:number)=>({...p,x:cx+(p.x-cx)*(organic?.92+.035*Math.sin(j*1.7):1),y:cy+(p.y-cy)*(organic?.92+.035*Math.sin(j*1.7):1),z:-dims.depth*(organic?.93+.07*Math.sin(j*2.1):1)}),front=(a.y+b.y)/2>cy;faces.push({part:'slab',color:stage===0?(front?'#795033':'#483225'):platform.setting.color,points:[{...a,z:-.5},{...b,z:-.5},lower(b,i+1),lower(a,i)]});});
 if(stage>0&&platform.setting.kind==='stump')for(let i=0;i<9;i++){const a=i/9*Math.PI*2,b=a+.21,top=-dims.height*.38,bottom=-dims.height;faces.push({part:'root',color:platform.setting.color,points:[{x:cx+Math.cos(a)*diameter*.42,y:cy+Math.sin(a)*diameter*.42,z:top},{x:cx+Math.cos(b)*diameter*.44,y:cy+Math.sin(b)*diameter*.44,z:top},{x:cx+Math.cos(b)*diameter*.57,y:cy+Math.sin(b)*diameter*.57,z:bottom},{x:cx+Math.cos(a)*diameter*.58,y:cy+Math.sin(a)*diameter*.58,z:bottom}]});}
 if(stage>0&&platform.setting.kind==='altar')for(let tier=0;tier<2;tier++)cap.forEach((a,i)=>{const b=cap[(i+1)%cap.length],k=1.01+tier*.025,top=-dims.height*(.55+tier*.26),bottom=top-dims.height*.09;faces.push({part:'plinth',color:platform.setting.color,points:[{x:cx+(a.x-cx)*k,y:cy+(a.y-cy)*k,z:top},{x:cx+(b.x-cx)*k,y:cy+(b.y-cy)*k,z:top},{x:cx+(b.x-cx)*k,y:cy+(b.y-cy)*k,z:bottom},{x:cx+(a.x-cx)*k,y:cy+(a.y-cy)*k,z:bottom}]});});
 for(let i=0;i<dims.legs.length;i++){
  const p=dims.legs[i];addBox(p.x,p.y,dims.legWidth,dims.legWidth,-dims.depth,-dims.height,`leg-${i}`);
  addBox(p.x,p.y,dims.legWidth*1.2,dims.legWidth*1.2,-dims.height+24,-dims.height,`foot-${i}`);
 }
 if(dims.legs.length){for(const side of [-1,1])addBox(cx,cy+side*diameter*.265,diameter*.53,dims.legWidth*.42,-dims.height*.68,-dims.height*.68-25,'stretcher');}
 return {cap,faces,...dims};
}
export function projectedFurniture(diameter:number,cx:number,cy:number,stage:number,camera:GpuCamera){
 const geometry=furnitureGeometry(diameter,cx,cy,stage),project=(p:WorldPoint)=>projectEntrancePoint(p.x,p.y,p.z,camera);
 const depth=(p:WorldPoint)=>(p.y-camera.height/2)*Math.sin(camera.tilt)+p.z*Math.cos(camera.tilt);
 return {...geometry,cap:geometry.cap.map(project),faces:geometry.faces.map(f=>({...f,depth:f.points.reduce((n,p)=>n+depth(p),0)/f.points.length,points:f.points.map(project)})).sort((a,b)=>a.depth-b.depth)};
}
