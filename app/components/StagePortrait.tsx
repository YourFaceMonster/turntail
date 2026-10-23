import type {CSSProperties} from 'react';
/** One atlas keeps all thirty stage portraits in a single cached request. */
export function StagePortrait({index}:{index:number}){
 const n=Math.max(0,Math.min(29,index));
 return <span className="stage-portrait portrait" aria-hidden="true" style={{backgroundPosition:`${n%5*25}% ${Math.floor(n/5)*20}%`} as CSSProperties}/>;
}
