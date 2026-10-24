import type {CSSProperties} from 'react';
import {KOREAN_OPPONENTS} from '../../lib/korean-opponents';
export default function KoreanPortrait({index}:{index:number}){
 const n=Math.max(0,Math.min(7,index));
 return <span className="korean-portrait portrait" role="img" aria-label={`${KOREAN_OPPONENTS[n].name} 아바타`} style={{backgroundPosition:`${n%4*100/3}% ${Math.floor(n/4)*100}%`} as CSSProperties}/>;
}
