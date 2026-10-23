'use client';
import type {CSSProperties} from 'react';
/** Full-size location plates, with space reserved for the independently rendered world. */
export default function EntranceEnvironment({stage}:{stage?:number}){
 return <div className={`entrance-environment ${stage?'environment-landscape':'environment-library'}`} data-location={stage||0} aria-hidden="true">
  <div className="environment-distance" style={{backgroundImage:`url('${stage?`/environments/stage-${stage}-055.webp`:'/turntale-empty-room.webp'}')`} as CSSProperties}/>
  <div className="environment-distance-haze"/><div className="environment-near-light"/>{[4,5,7].includes(stage||0)&&<div className="environment-ground-mist"/>}{[2,9,10].includes(stage||0)&&<div className="environment-lamp-glow"/>}
 </div>;
}
