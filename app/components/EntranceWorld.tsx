import type {CSSProperties} from 'react';
export function tableWorldGeometry(diameter:number,cx:number,cy:number){
 const height=Math.max(200,Math.min(300,diameter*.3)),legWidth=Math.max(22,Math.min(38,diameter*.036));
 return {height,legWidth,span:Math.min(2200,diameter*2.25),legs:[-1,1].flatMap(x=>[-1,1].map(y=>({x:cx+x*diameter*.265,y:cy+y*diameter*.265})))};
}
/** A fixed raised tabletop, its four supports, and their shared floor plane. */
export default function EntranceWorld({diameter,cx,cy}:{diameter:number,cx:number,cy:number}){
 const {height,legWidth,span,legs}=tableWorldGeometry(diameter,cx,cy);
 return <div className="entry-world" style={{'--support-height':`${height}px`,'--support-width':`${legWidth}px`} as CSSProperties}>
  <div className="entry-ground" style={{left:cx-span/2,top:cy-span/2,width:span,height:span}}/>
  <div className="entry-wall" style={{left:cx-span/2,top:cy-diameter*.92-650,width:span,height:650}}/>
  <div className="entry-contact-shadow" style={{left:cx-diameter*.46,top:cy-diameter*.33,width:diameter*.92,height:diameter*.66}}/>
  {legs.map((p,i)=><div className="entry-table-leg" key={i} data-support={i+1} style={{left:p.x-legWidth/2,top:p.y}}><span className="leg-front"/><span className="leg-side"/><span className="leg-back"/><i className="leg-foot"/></div>)}
  <div className="entry-apron" style={{left:cx-diameter/2,top:cy-diameter/2,width:diameter,height:diameter}}/>
 </div>;
}
