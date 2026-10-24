import type {CSSProperties} from 'react';
export default function KoreanPortrait({index}:{index:number}){
 const n=Math.max(0,Math.min(7,index));
 return <span className="korean-portrait portrait" role="img" aria-label={`${['김복례','박만수','서도윤','윤하늬','강태오','정다솜','이문수','홍소리'][n]} 아바타`} style={{backgroundPosition:`${n%4*100/3}% ${Math.floor(n/4)*100}%`} as CSSProperties}/>;
}
