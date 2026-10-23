'use client';
import type {CSSProperties} from 'react';
/** Full-size location plates, with space reserved for the independently rendered world. */
export default function EntranceEnvironment({stage}:{stage?:number}){
 return <div className={`entrance-environment ${stage?'environment-landscape':'environment-library'}`} data-location={stage||0} style={stage?{backgroundImage:`url('/environments/stage-${stage}-055.webp')`} as CSSProperties:undefined} aria-hidden="true">
  <div className="environment-distance-haze"/>{[4,5,7].includes(stage||0)&&<div className="environment-ground-mist"/>}{[2,9,10].includes(stage||0)&&<div className="environment-lamp-glow"/>}
 </div>;
}
