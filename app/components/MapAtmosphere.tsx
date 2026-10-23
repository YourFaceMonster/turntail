"use client";
import {memo,useEffect,useId,useState,type CSSProperties} from 'react';

/** Small, clipped effects keep the illustrated islands and hit targets stationary. */
function MapAtmosphere({paused=false}:{paused?:boolean}){
 const id=useId().replace(/:/g,''),[hidden,setHidden]=useState(false);
 useEffect(()=>{const update=()=>setHidden(document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 const falls=[
  'M238 511L275 514L280 594L257 625L240 600Z',
  'M920 535L945 532L941 688L925 721L921 660Z',
  'M298 791L327 794L324 914L312 952L294 938Z',
  'M192 821L214 827L208 977L191 1017L179 1000Z',
  'M776 990L795 983L791 1055L781 1084L768 1074Z',
  'M812 1261L832 1250L830 1323L815 1383L800 1388Z'
 ];
 return <div className="map-atmosphere" aria-hidden="true" data-paused={paused||hidden}>
  <svg viewBox="0 0 1024 1536" preserveAspectRatio="none" className="map-water">
   <defs>{falls.map((d,i)=><clipPath id={`${id}-fall-${i}`} key={i}><path d={d}/></clipPath>)}</defs>
   {falls.map((d,i)=><g clipPath={`url(#${id}-fall-${i})`} key={i} className="map-waterfall"><path d={d} fill="#7fe6ff" opacity=".07"/>
    <g className="map-water-stream" style={{animationDelay:`${-i*.21}s`}}>{Array.from({length:4},(_,n)=><path key={n} d={`M${[242,923,300,187,770,805][i]+n*7} 480Q${[264,943,329,212,796,831][i]+n*2} 850 ${[235,921,294,177,767,798][i]+n*7} 1410`} stroke={n%2?'#e6fcff':'#65dfff'} strokeWidth={n%2?2:3} strokeDasharray="12 28 4 20" fill="none" opacity=".4"/>)}</g>
   </g>)}
   {[[250,735],[298,780],[235,1072],[793,1150]].map(([x,y],i)=><g className="map-water-ripple" key={i} style={{transformOrigin:`${x}px ${y}px`,animationDelay:`${-i*1.1}s`}}><ellipse cx={x} cy={y} rx="22" ry="6" fill="none" stroke="#bcf7ff" strokeWidth="1.5" opacity=".35"/><ellipse cx={x} cy={y} rx="11" ry="3" fill="none" stroke="#e1ffff" opacity=".4"/></g>)}
  </svg>
  <div className="map-mist map-mist-near"/><div className="map-mist map-mist-far"/>
  {Array.from({length:12},(_,i)=><i className={`map-wind-speck ${i%3===0?'leaf':''}`} key={i} style={{left:`${8+i*7.1}%`,top:`${14+(i*19)%76}%`,'--drift-delay':`${-i*1.3}s`,'--drift-time':`${7+i%4}s`} as CSSProperties}/>)}
 </div>;
}
export default memo(MapAtmosphere);
