"use client";
import {useId,type ReactNode} from 'react';
const bodies=['#dacead','#654124','#9cc0a1','#c0e4ed','#aa977d','#414449','#c2d5e1','#dfa347','#292d39','#392127'];
/** One physical silhouette is shared by resting, moving and entrance tiles. */
export default function TilePrism({children,stage,ink='#d9be7f',back=false}:{children:ReactNode,stage?:number,ink?:string,back?:boolean}){
 const id=useId().replace(/:/g,''),body=stage?bodies[stage-1]:'#e4ded0',front=stage?body:back?'#12513d':'#fffdf5';
 return <svg className="tile-art tile-prism" viewBox="0 0 100 144" preserveAspectRatio="none" aria-hidden="true" focusable="false" style={{color:ink}} fill={ink} data-prism="solid">
  <defs><linearGradient id={`${id}-edge`} x2="0" y2="1"><stop stopColor={body}/><stop offset=".42" stopColor={body}/><stop offset=".48" stopColor="#13141b" stopOpacity=".5"/><stop offset="1" stopColor="#10131b"/></linearGradient><clipPath id={`${id}-front`}><path d="M8 2H92Q96 2 96 7L99 124Q100 131 93 132H7Q0 131 1 124L4 7Q4 2 8 2Z"/></clipPath></defs>
  <path d="M3 120H97L99 134Q99 142 92 143H8Q1 142 1 134Z" fill={`url(#${id}-edge)`} stroke="#080c12" strokeOpacity=".7" strokeWidth="1.4"/>
  <g clipPath={`url(#${id}-front)`}><rect width="100" height="132" fill={front}/><svg x="0" y="0" width="100" height="132" viewBox="0 0 100 132" preserveAspectRatio="none">{children}</svg></g>
  <path d="M8 2H92Q96 2 96 7L99 124Q100 131 93 132H7Q0 131 1 124L4 7Q4 2 8 2Z" fill="none" stroke={stage&&[2,6,9,10].includes(stage)?'#d9c8a76b':'#ffffffb3'} strokeWidth="1.4"/>
  <path d="M7 134Q50 138 93 134" fill="none" stroke={body} strokeWidth="1.8" opacity=".7"/>
 </svg>;
}
