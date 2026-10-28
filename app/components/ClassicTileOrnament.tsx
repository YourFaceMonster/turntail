import {TILE_NUMBER_MEDALLION as plaque} from '../../lib/tile-face-geometry';
const starPath=Array.from({length:16},(_,index)=>{const angle=(index*22.5-90)*Math.PI/180,radius=index%2?40:47;return `${index?'L':'M'}${(plaque.x+Math.cos(angle)*radius).toFixed(2)} ${(plaque.y+Math.sin(angle)*radius).toFixed(2)}`;}).join('')+'Z';
/** Suit ornament and number share a centered, sufficiently wide medallion. */
export default function ClassicTileOrnament({s,special=false}:{s:number,special?:boolean}){
 return <g className={`classic-tile-ornament engraved-suit-${s}`} data-engraving={['cloud','star','moon','sun'][s]} stroke="currentColor" strokeLinejoin="round">
 {special&&<><path d="M10 7H90V122H10Z" fill="none" strokeWidth="2"/><path d="M15 12H85V117H15Z" fill="none" strokeWidth=".8"/><path d="M10 30Q31 30 30 7M70 7Q69 30 90 30M10 99Q31 99 30 122M70 122Q69 99 90 99" fill="none" strokeWidth="2"/></>}
 {s===3&&<g transform={`translate(${plaque.x} ${plaque.y})`} data-number-container="sun">
  {Array.from({length:16},(_,i)=><path key={i} transform={`rotate(${i*22.5})`} d="M-3-39C-9-43 0-44 0-49C4-45 7-42 3-39Z" fill="currentColor" strokeWidth=".5"/>)}
  <circle r={plaque.radius} fill="none" strokeWidth="1.6"/><circle r={plaque.innerRadius} fill="none" strokeWidth=".7"/>
 </g>}
 {s===2&&<><path d="M61 8C-4 0-9 77 40 85C64 89 82 71 85 57C62 78 27 64 27 38C27 24 42 12 61 8Z" fill="currentColor" strokeWidth=".6"/><path d="M78 6H92V24M72 10H87V30M68 14H82V34" fill="none" strokeWidth="1.2"/><path d="M13 79Q46 103 78 80M18 85Q47 106 73 87" fill="none" strokeWidth="1.1"/></>}
 {s===1&&<g data-number-container="star"><path d={starPath} fill="none" strokeWidth="2.4"/><path d={starPath} transform={`translate(${plaque.x*.055} ${plaque.y*.055}) scale(.945)`} fill="none" strokeWidth=".85"/></g>}
 {s===0&&<><path d="M24 11C5 9 5 34 17 34C29 35 28 19 19 22M68 12C87 0 99 19 90 27C83 34 73 26 79 20C84 16 90 22 85 25M83 40C102 35 101 59 89 62C78 65 75 52 83 49C90 46 94 55 87 56M71 75C90 66 97 83 87 90C78 96 66 87 74 82M18 72C2 78 9 95 21 91C30 88 25 79 20 83" fill="none" strokeWidth="2.4" strokeLinecap="round"/><path d="M25 7Q3 12 8 36M77 7Q99 11 97 31M89 66Q104 76 94 90M10 75Q1 95 25 98" fill="none" strokeWidth=".8"/></>}
 <circle data-number-medallion="true" cx={plaque.x} cy={plaque.y} r={plaque.radius} fill="#fffdf5" fillOpacity=".28" strokeWidth={s===2?1.2:1}/>
 <circle cx={plaque.x} cy={plaque.y} r={plaque.innerRadius} fill="none" strokeWidth=".45" opacity=".65"/>
 </g>;
}
