"use client";
import {memo,useEffect,useId,useState,type CSSProperties} from 'react';

/** Small, clipped effects keep the illustrated islands and hit targets stationary. */
function MapAtmosphere({paused=false}:{paused?:boolean}){
 const id=useId().replace(/:/g,''),[hidden,setHidden]=useState(false);
 useEffect(()=>{const update=()=>setHidden(document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 const falls=[
  'M266 797L300 802L302 963L285 1052L264 1008Z',
  'M192 825L213 829L213 956L195 1016L180 987Z',
  'M921 538L942 537L942 674L928 723L917 689Z',
  'M776 991L798 984L795 1060L781 1116L765 1077Z',
  'M811 1257L833 1250L832 1378L814 1453L798 1420Z',
  'M451 1432L473 1439L468 1519H443Z',
  'M710 1383L734 1374L732 1470L717 1528L698 1488Z'
 ];
 const fallsX=[270,190,921,775,808,448,705],bridges=[[377,383,248,98],[306,620,140,88],[578,619,178,89],[375,739,228,119]];
 const fires=[[147,119],[214,159],[434,172],[297,444],[381,443],[628,353],[782,524],[751,618],[788,639],[484,589],[299,652],[565,640],[605,829],[533,1034],[489,1052],[424,1265],[591,1249],[664,1174]];

 return <div className="map-atmosphere" aria-hidden="true" data-paused={paused||hidden}>
  <svg viewBox="0 0 1024 1536" preserveAspectRatio="none" className="map-water">
   <defs>{falls.map((d,i)=><clipPath id={`${id}-fall-${i}`} key={i}><path d={d}/></clipPath>)}</defs>
   {falls.map((d,i)=><g clipPath={`url(#${id}-fall-${i})`} key={i} className="map-waterfall"><path d={d} fill="#7fe6ff" opacity=".07"/>
    <g className="map-water-stream" style={{animationDelay:`${-i*.21}s`}}>{Array.from({length:4},(_,n)=><path key={n} d={`M${fallsX[i]+n*6} 480Q${fallsX[i]+8+n*3} 850 ${fallsX[i]-4+n*6} 1410`} stroke={n%2?'#e6fcff':'#65dfff'} strokeWidth={n%2?2:3} strokeDasharray="18 14 5 11" fill="none" opacity=".58"/>)}</g>
   </g>)}
   {[[278,1042],[196,1001],[932,707],[814,1430],[717,1503]].map(([x,y],i)=><g className="map-water-ripple" key={i} style={{transformOrigin:`${x}px ${y}px`,animationDelay:`${-i*1.1}s`}}><ellipse cx={x} cy={y} rx="22" ry="6" fill="none" stroke="#bcf7ff" strokeWidth="1.5" opacity=".35"/><ellipse cx={x} cy={y} rx="11" ry="3" fill="none" stroke="#e1ffff" opacity=".4"/></g>)}
  </svg>
  <svg className="map-living-details" viewBox="0 0 1024 1536" preserveAspectRatio="none">
   <defs><filter id={`${id}-bridge-feather`}><feGaussianBlur stdDeviation="2"/></filter>{bridges.map(([x,y,w,h],i)=><mask id={`${id}-bridge-${i}`} key={i}><rect x={x+4} y={y+4} width={w-8} height={h-8} rx="16" fill="white" filter={`url(#${id}-bridge-feather)`}/></mask>)}<radialGradient id={`${id}-fire-glow`}><stop stopColor="#ffd16b" stopOpacity=".65"/><stop offset="1" stopColor="#ff9538" stopOpacity="0"/></radialGradient></defs>
   {bridges.map(([x,y,w,h],i)=><g mask={`url(#${id}-bridge-${i})`} key={i}><g className="map-bridge-sway" data-map-bridge={i+1} style={{transformOrigin:`${x+w/2}px ${y+h/2}px`,animationDelay:`${-i*.8}s`,animationDuration:`${3.2+i*.45}s`} as CSSProperties}><image href="/turntale-stage-map-0515.webp" width="1024" height="1536"/></g></g>)}
   {fires.map(([x,y],i)=><g transform={`translate(${x} ${y})`} key={i}><g className="map-lantern-breathe" style={{animationDelay:`${-i*.27}s`}}><ellipse rx="24" ry="33" fill={`url(#${id}-fire-glow)`}/><path className="map-lantern-flame" d="M0 4Q-8-2-2-12Q2-17 0-22Q13-8 5 2Z" fill={i<5?'#ff9a3c':'#ffc14d'}/><path className="map-lantern-heart" d="M0 3Q-4-2 1-12Q7-2 3 2Z" fill="#fff2ae"/></g></g>)}
   {[[100,268],[20,856],[130,1250]].map(([x,y],i)=><g transform={`translate(${x} ${y})`} key={i}><g className="map-bird-flight" data-flock={i} style={{animationDuration:`${21+i*7}s`,animationDelay:`${-7-i*11}s`} as CSSProperties}>{[0,1,2].map(n=><g key={n} transform={`translate(${-n*24} ${n%2*15}) scale(${1-n*.17})`}><path className="map-bird-wings" d="M-12 2Q-5-9 0 0Q6-10 13 0" fill="none" stroke={i===1?'#d6eef3':'#b1d7e7'} strokeWidth="2.8" strokeLinecap="round" style={{animationDelay:`${-n*.13}s`}}/></g>)}</g></g>)}
   {Array.from({length:24},(_,i)=><g transform={`translate(${90+i*37%860} ${220+i*83%1230})`} key={i}><circle className="map-firefly" r={i%3===0?2.1:1.3} fill={i%2?'#cceba8':'#ffcb76'} style={{animationDelay:`${-i*.47}s`,animationDuration:`${3+i%4}s`}}/></g>)}
  </svg>
  <div className="map-mist map-mist-near"/><div className="map-mist map-mist-far"/>
  {Array.from({length:12},(_,i)=><i className={`map-wind-speck ${i%3===0?'leaf':''}`} key={i} style={{left:`${8+i*7.1}%`,top:`${14+(i*19)%76}%`,'--drift-delay':`${-i*1.3}s`,'--drift-time':`${7+i%4}s`} as CSSProperties}/>)}
 </div>;
}
export default memo(MapAtmosphere);
