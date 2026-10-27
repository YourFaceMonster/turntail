import {CARTOON_TILE_PATH} from './TileCartoon';
export const TILE_MATERIAL_NAMES=['뼈','호두나무','옥','수정','규화목','현무암','월장석','호박석','흑요석','세계수 목재'] as const;
/** Restrained edge details add material character without covering the shared number/suit layout. */
export default function TileMaterialFinish({stage,id}:{stage:number,id:string}){
 const dark=[6,9,10].includes(stage),wood=[2,5,10].includes(stage),glass=[4,8,9].includes(stage),accent=stage===10?'#efbe68':stage===3?'#d6f0c0':stage===7?'#deedff':glass?'#fff3d9':'#eedcb5';
 return <g data-material-finish={TILE_MATERIAL_NAMES[stage-1]} pointerEvents="none">
  <defs><linearGradient id={`${id}-finish`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor={accent} stopOpacity={glass?.26:.12}/><stop offset=".28" stopColor={accent} stopOpacity="0"/><stop offset=".8" stopColor="#151919" stopOpacity="0"/><stop offset="1" stopColor="#151919" stopOpacity={dark?.28:.12}/></linearGradient></defs>
  <path d={CARTOON_TILE_PATH} fill={`url(#${id}-finish)`}/>
  <path d="M12 25Q10 12 24 10L75 9Q87 9 89 21" fill="none" stroke={accent} strokeOpacity={glass?.66:.27} strokeWidth={glass?1.7:1.1} strokeLinecap="round"/>
  <path d="M13 111Q13 122 25 122H76Q87 122 88 111" fill="none" stroke={dark?'#04090e':'#785936'} strokeOpacity=".24" strokeWidth="1.5" strokeLinecap="round"/>
  {wood&&<g fill="none" stroke={stage===10?'#e5a64b':'#d6b58b'} strokeOpacity={stage===10?.3:.2} strokeWidth=".7"><path d="M9 32Q19 49 9 70T11 111M89 29Q80 51 90 74T87 113"/><path d="M17 116Q38 110 57 117T83 115"/></g>}
  {stage===3&&<path d="M90 24Q81 34 90 47M8 101Q24 87 28 99" fill="none" stroke="#deefc1" strokeOpacity=".45" strokeWidth="1.1"/>}
  {stage===4&&<g fill="none" stroke="#e8fbff" strokeOpacity=".7" strokeWidth="1"><path d="M14 19L22 26L11 49M79 11L85 22L88 63M12 113L23 120L51 121"/></g>}
  {stage===6&&<g fill="#060a12" opacity=".4"><path d="M8 37L14 33L11 44ZM91 93L85 99L90 104Z"/><circle cx="18" cy="112" r="1.3"/><circle cx="83" cy="22" r="1"/></g>}
  {stage===7&&<path d="M11 26Q40 9 86 21M13 115Q47 123 84 112" fill="none" stroke="#edf7ff" strokeOpacity=".4" strokeWidth="2"/>}
  {stage===8&&<g fill="none" stroke="#6f4618" strokeOpacity=".32" strokeWidth=".8"><path d="M17 27L21 34L17 41M85 87L79 95L82 103"/><ellipse cx="18" cy="109" rx="1.4" ry="2.4"/></g>}
  {stage===9&&<g fill="none" stroke="#d7d8e7" strokeOpacity=".35" strokeWidth=".8"><path d="M13 23L19 49L10 73M89 28L82 44L90 63M16 117L34 121"/></g>}
 </g>;
}
