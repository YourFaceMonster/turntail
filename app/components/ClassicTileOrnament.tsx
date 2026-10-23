/** Suit ornament grows around the number medallion, as on engraved physical tiles. */
export default function ClassicTileOrnament({s,special=false}:{s:number,special?:boolean}){
 return <g className={`classic-tile-ornament engraved-suit-${s}`} data-engraving={['cloud','star','moon','sun'][s]} stroke="currentColor" strokeLinejoin="round">
 {special&&<><path d="M10 7H90V122H10Z" fill="none" strokeWidth="2"/><path d="M15 12H85V117H15Z" fill="none" strokeWidth=".8"/><path d="M10 30Q31 30 30 7M70 7Q69 30 90 30M10 99Q31 99 30 122M70 122Q69 99 90 99" fill="none" strokeWidth="2"/></>}
 {s===3&&<g transform="translate(45 46)">
  {Array.from({length:16},(_,i)=><path key={i} transform={`rotate(${i*22.5})`} d="M-3-34C-11-40 1-41 0-47C4-42 8-39 4-34Z" fill="currentColor" strokeWidth=".5"/>)}
  <circle r="33" fill="none" strokeWidth="1.6"/><circle r="29.5" fill="none" strokeWidth=".7"/>
  <path d="M-27 32Q-12 44-24 45Q-33 44-27 39M-7 37Q7 47-4 49M15 32Q30 36 24 43Q19 47 15 41" fill="none" strokeWidth="1.7"/>
 </g>}
 {s===2&&<><path d="M61 8C-4 0-9 77 40 85C64 89 82 71 85 57C62 78 27 64 27 38C27 24 42 12 61 8Z" fill="currentColor" strokeWidth=".6"/><path d="M78 6H92V24M72 10H87V30M68 14H82V34" fill="none" strokeWidth="1.2"/><path d="M13 79Q46 103 78 80M18 85Q47 106 73 87" fill="none" strokeWidth="1.1"/></>}
 {s===1&&<><path d="M45 3L57 16L77 10L77 29L94 39L81 53L88 74L66 75L53 91L40 77L18 82L20 61L3 49L17 34L12 13L33 18Z" fill="none" strokeWidth="2.4"/><path d="M45 8L56 21L72 16L73 31L88 40L76 53L82 69L65 70L53 84L41 72L24 76L25 59L10 48L22 35L18 19L34 23Z" fill="none" strokeWidth=".85"/><path d="M84 3L87 10L94 13L87 16L84 23L81 16L74 13L81 10Z" fill="currentColor" stroke="none"/></>}
 {s===0&&<><path d="M24 11C5 9 5 34 17 34C29 35 28 19 19 22M68 12C87 0 99 19 90 27C83 34 73 26 79 20C84 16 90 22 85 25M83 40C102 35 101 59 89 62C78 65 75 52 83 49C90 46 94 55 87 56M71 75C90 66 97 83 87 90C78 96 66 87 74 82M18 72C2 78 9 95 21 91C30 88 25 79 20 83" fill="none" strokeWidth="2.4" strokeLinecap="round"/><path d="M25 7Q3 12 8 36M77 7Q99 11 97 31M89 66Q104 76 94 90M10 75Q1 95 25 98" fill="none" strokeWidth=".8"/></>}
 <circle cx="45" cy="46" r={s===2?30:28} fill="#fffdf5" strokeWidth={s===2?1.2:1}/>
 <circle cx="45" cy="46" r="26" fill="none" strokeWidth=".45" opacity=".65"/>
 </g>;
}
