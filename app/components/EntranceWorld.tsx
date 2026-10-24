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
  <svg className="world-ground-traces" viewBox="0 0 1000 1000" style={{left:cx-span/2,top:cy-span/2,width:span,height:span}}>
   <g fill="none" stroke={setting.wood?'#bca67d':'#b6c4be'} strokeWidth=".6" opacity=".12">{Array.from({length:8},(_,i)=><path key={i} d={setting.wood?`M${130+i*104} 40Q${90+i*106} 440 ${150+i*102} 960`:`M${60+i*137} 70l-14 150 23 112 -19 146 26 185 -16 260`}/>)}</g>
   <g fill="#040b10" opacity=".14">{Array.from({length:15},(_,i)=><ellipse key={i} cx={70+(i*191)%870} cy={80+(i*137)%840} rx={3+i%5} ry={1+i%2}/>)}</g>
  </svg>
  <div className="entry-floor-light warm" style={{left:cx-diameter*.65,top:cy-diameter*.4,width:diameter,height:diameter}}/><div className="entry-floor-light cool" style={{left:cx-diameter*.2,top:cy-diameter*.6,width:diameter,height:diameter}}/>
  <div className="entry-contact-shadow" style={{left:cx-diameter*.49,top:cy-diameter*.43,width:diameter*1.05,height:diameter*.96}}/>
  {legs.map((p,i)=><div className="world-leg-pair" key={i}><div className="world-leg-shadow" style={{left:p.x-legWidth,top:p.y-legWidth*.4,width:legWidth*2,height:legWidth*2.8,transform:`translateZ(${-height+1.2}px) rotate(-24deg)`}}/><div className="entry-table-leg" data-support={i+1} style={{left:p.x-legWidth/2,top:p.y}}><span className="leg-front"/><span className="leg-side"/><span className="leg-back"/><i className="leg-foot"/></div></div>)}
  {setting.kind==='stump'&&Array.from({length:7},(_,i)=><div className="world-root" key={i} style={{left:cx+Math.cos(i/7*Math.PI*2)*diameter*.22,top:cy+Math.sin(i/7*Math.PI*2)*diameter*.22,width:diameter*.38,height:diameter*.085,transform:`translateZ(${-height+10}px) rotate(${i/7*360}deg)`}}/>)}
  <div className="world-platform-sides">{sides.map((side,i)=><div className={`world-platform-side ${setting.wood?'wood':'stone'}`} key={i} style={{left:cx+side.x,top:cy+side.y,width:side.width+.35,height:setting.depth,transform:`rotate(${side.angle}deg) rotateX(-90deg)`}}><i style={{background:`linear-gradient(#ffffff0d,rgba(0,0,0,${1-side.light}))`}}/></div>)}</div>
  {setting.kind==='altar'&&<div className="world-altar-foot" style={{left:cx-diameter*.48,top:cy-diameter*.48,width:diameter*.96,height:diameter*.96,transform:`translateZ(${-height+3}px)`}}/>}
 </div>;
}
