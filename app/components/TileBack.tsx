"use client";
import {useStageVisual,StageBackArt} from './StageVisuals';
import {memo,useId} from 'react';
import TileWear from './TileWear';
/** The same sealed green reverse is used at rest, in flight and in the WebGL atlas. */
function TileBack({flat=false}:{flat?:boolean}){
 const stage=useStageVisual(),id=useId().replace(/:/g,'');if(stage)return <span className="tile back stage-material-tile"><StageBackArt stage={stage}/></span>;
 return <span className={`tile back tile-back-shared ${flat?'flat-back':''}`}><svg viewBox="0 0 100 132" preserveAspectRatio="none" aria-hidden="true" style={{color:"#dfc28a"}}><defs><linearGradient id={`${id}-back-glaze`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#aac5a8" stopOpacity=".22"/><stop offset=".35" stopColor="#eef4de" stopOpacity="0"/><stop offset="1" stopColor="#071b1b" stopOpacity=".4"/></linearGradient></defs>
  <rect width="100" height="132" rx="8" fill="#12513d"/><image data-tile-grain="reverse" href="/turntale-ivory-material-055.webp" width="100" height="132" preserveAspectRatio="xMidYMid slice" opacity=".09"/><rect width="100" height="132" rx="8" fill={`url(#${id}-back-glaze)`}/><rect x="2" y="2" width="96" height="128" rx="7" fill="none" stroke="#e6ead0" strokeOpacity=".22" strokeWidth="1.3"/>
  <rect x="6" y="6" width="88" height="120" rx="10" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="11" y="11" width="78" height="110" rx="7" fill="none" stroke="currentColor" strokeWidth=".8"/>{Array.from({length:16},(_,i)=><path key={i} transform={`translate(50 66) rotate(${i*22.5})`} d="M0-4L-2-20L0-38L2-20Z" fill="currentColor"/>)}<path d="M50 22L53 27L50 32L47 27ZM50 100L53 105L50 110L47 105Z" fill="currentColor"/>
 <TileWear seed={23} dark/></svg></span>;
}
export default memo(TileBack);
