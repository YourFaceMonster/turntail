import type {CSSProperties} from 'react';
import {platformGeometry,stageSetting} from '../../lib/stage-setting';
export function tableWorldGeometry(diameter:number,cx:number,cy:number,stage=0){
 const setting=stageSetting(stage),height=stage?setting.height:Math.max(200,Math.min(300,diameter*.3)),legWidth=Math.max(22,Math.min(38,diameter*.036));
 return {height,legWidth,span:Math.min(2200,diameter*2.1),legs:setting.kind==='table'?[-1,1].flatMap(x=>[-1,1].map(y=>({x:cx+x*diameter*.265,y:cy+y*diameter*.265}))):[]};
}
/** Rock, altar and living roots use solid bodies; only actual tables have legs. */
export default function EntranceWorld({diameter,cx,cy,stage=0}:{diameter:number,cx:number,cy:number,stage?:number}){
 const {height,legWidth,span,legs}=tableWorldGeometry(diameter,cx,cy,stage),{setting,sides}=platformGeometry(diameter,stage);
 return <div className={`entry-world world-${setting.kind}`} data-world-kind={setting.kind} data-world-stage={stage} style={{'--support-height':`${height}px`,'--support-width':`${legWidth}px`,'--world-side':setting.color} as CSSProperties}>
  <div className="entry-ground" style={{left:cx-span/2,top:cy-span/2,width:span,height:span}}/>
  <div className="entry-floor-light warm" style={{left:cx-diameter*.65,top:cy-diameter*.4,width:diameter,height:diameter}}/><div className="entry-floor-light cool" style={{left:cx-diameter*.2,top:cy-diameter*.6,width:diameter,height:diameter}}/>
  <div className="entry-contact-shadow" style={{left:cx-diameter*.49,top:cy-diameter*.43,width:diameter*1.05,height:diameter*.96}}/>
  {legs.map((p,i)=><div className="world-leg-pair" key={i}><div className="world-leg-shadow" style={{left:p.x,top:p.y,width:legWidth*3,height:height*.7,transform:`translateZ(${-height+.2}px) rotate(-28deg)`}}/><div className="entry-table-leg" data-support={i+1} style={{left:p.x-legWidth/2,top:p.y}}><span className="leg-front"/><span className="leg-side"/><span className="leg-back"/><i className="leg-foot"/></div></div>)}
  {setting.kind==='stump'&&Array.from({length:7},(_,i)=><div className="world-root" key={i} style={{left:cx+Math.cos(i/7*Math.PI*2)*diameter*.22,top:cy+Math.sin(i/7*Math.PI*2)*diameter*.22,width:diameter*.38,height:diameter*.085,transform:`translateZ(${-height+10}px) rotate(${i/7*360}deg)`}}/>)}
  <div className="world-platform-sides">{sides.map((side,i)=><div className={`world-platform-side ${setting.wood?'wood':'stone'}`} key={i} style={{left:cx+side.x,top:cy+side.y,width:side.width+.6,height:setting.depth,transform:`rotate(${side.angle}deg) rotateX(-90deg)`,filter:`brightness(${side.light})`}}/>)}</div>
  {setting.kind==='altar'&&<div className="world-altar-foot" style={{left:cx-diameter*.48,top:cy-diameter*.48,width:diameter*.96,height:diameter*.96,transform:`translateZ(${-height+3}px)`}}/>}
 </div>;
}
