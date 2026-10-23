"use client";
import {useId,type CSSProperties} from 'react';

function phase(delay:number){return {'--candle-delay':`${delay}s`} as CSSProperties;}
function Flame({x,y,size=12,delay=0}:{x:number,y:number,size?:number,delay?:number}){
 return <g transform={`translate(${x} ${y}) scale(${size/20})`}><g className="candle-flame" style={phase(delay)}><path d="M0 5C-19-8 2-19 0-38C20-17 18-4 0 5Z" fill="#ffc458"/><path d="M0 4C-9-5 2-11 2-21C11-10 9-1 0 4Z" fill="#fff7c3"/></g></g>;
}
function LightDefs({id}:{id:string}){
 return <defs><radialGradient id={id+'light'}><stop stopColor="#ffbd68" stopOpacity=".64"/><stop offset=".38" stopColor="#ff9a35" stopOpacity=".28"/><stop offset="1" stopColor="#ff922b" stopOpacity="0"/></radialGradient><linearGradient id={id+'shade'} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#140b09" stopOpacity="0"/><stop offset=".3" stopColor="#140b09" stopOpacity=".62"/><stop offset=".72" stopColor="#140b09" stopOpacity=".38"/><stop offset="1" stopColor="#140b09" stopOpacity="0"/></linearGradient><filter id={id+'soft'} x="-35%" y="-50%" width="170%" height="200%"><feGaussianBlur stdDeviation="8"/></filter></defs>;
}
function CandleLight({id,x,y,r,delay=0,scale=1}:{id:string,x:number,y:number,r:number,delay?:number,scale?:number}){
 return <g transform={`translate(${x} ${y})`} style={phase(delay)}>
  <g className="candle-light-wash"><ellipse fill={`url(#${id}light)`} rx={r} ry={r*.85}/></g>
  <g transform={`scale(${scale})`}><g className="candle-cast-shadow" fill={`url(#${id}shade)`} filter={`url(#${id}soft)`}>
   <path d="M-5 10Q90-10 285-90L350-36Q150 10-5 18Z"/>
   <path d="M0 16Q110 24 320 76L352 120Q160 70 0 22Z"/>
   <path d="M-5 22Q80 96 260 198L320 246Q128 192-5 30Z"/>
  </g></g>
 </g>;
}
function CastleLights({id,portrait=false}:{id:string,portrait?:boolean}){
 const windows=portrait?[[858,278,3],[873,278,3],[868,310,4],[804,334,3],[837,379,4],[847,378,3],[756,364,2],[655,430,5],[842,441,3],[872,527,5]]:[[1499,198,3],[1515,198,3],[1513,230,4],[1440,249,3],[1468,294,3],[1483,294,3],[1359,278,2],[1206,340,5],[1494,354,4],[1526,445,6]];
 return <g className="castle-lights">{windows.map(([x,y,r],i)=><g key={i} transform={`translate(${x} ${y})`}>
  <g className="castle-window-light" style={{'--light-delay':`${i*-.83}s`,'--light-duration':`${3.7+(i%4)*.9}s`} as CSSProperties}>
   <ellipse rx={r*5} ry={r*6} fill={`url(#${id}light)`}/><rect x={-r*.55} y={-r} width={r*1.1} height={r*2.2} rx={r*.3} fill="#fff1a8"/>
  </g>
 </g>)}</g>;
}
export default function RoomAmbience(){
 const id=useId().replace(/:/g,'');const wide=id+'wide',tall=id+'tall';
 return <div className="room-ambience" aria-hidden="true">
  <svg className="ambience-wide" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMax slice">
   <LightDefs id={wide}/>
   <CastleLights id={wide}/>
   <CandleLight id={wide} x={76} y={426} r={270} scale={1.15} delay={-.5}/>
   <CandleLight id={wide} x={550} y={133} r={130} scale={.65} delay={-1.1}/>
   <CandleLight id={wide} x={365} y={400} r={150}/>
   <g transform="translate(210 802) rotate(18)"><ellipse className="table-candle-reflection" fill={`url(#${wide}light)`} rx="330" ry="65" style={phase(-.5)}/></g>
   <Flame x={365} y={403} size={14}/><Flame x={401} y={417} size={9} delay={-.7}/>
  </svg>
  <svg className="ambience-portrait" viewBox="0 0 940 1672" preserveAspectRatio="xMidYMax slice">
   <LightDefs id={tall}/>
   <CastleLights id={tall} portrait/>
   <CandleLight id={tall} x={45} y={1090} r={300} scale={1.1} delay={-.5}/>
   <CandleLight id={tall} x={258} y={236} r={160} scale={.7} delay={-1.1}/>
   <CandleLight id={tall} x={106} y={500} r={140} scale={.75}/>
   <CandleLight id={tall} x={106} y={660} r={125} scale={.65} delay={-.8}/>
   <CandleLight id={tall} x={40} y={780} r={130} scale={.65} delay={-1.4}/>
   <CandleLight id={tall} x={127} y={938} r={135} scale={.7} delay={-.4}/>
   <g transform="translate(195 1440) rotate(28)"><ellipse className="table-candle-reflection" fill={`url(#${tall}light)`} rx="310" ry="95" style={phase(-.5)}/></g>
   <Flame x={106} y={500} size={15}/><Flame x={106} y={660} size={12} delay={-.8}/><Flame x={40} y={780} size={15} delay={-1.4}/><Flame x={127} y={938} size={13} delay={-.4}/>
  </svg>
 </div>;
}
