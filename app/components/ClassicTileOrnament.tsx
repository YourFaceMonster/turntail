/** Fine guilloche and corner geometry frame a quiet central number field. */
export default function ClassicTileOrnament(){return <g className="classic-tile-ornament" fill="none" stroke="#8f7953" strokeWidth=".55" aria-hidden="true">
 <rect x="3" y="3" width="94" height="126" rx="7"/><rect x="5.5" y="5.5" width="89" height="121" rx="5" opacity=".6"/>
 {Array.from({length:10},(_,i)=><path key={i} opacity=".38" d={`M${9+i*8} 8l4 4-4 4-4-4ZM${9+i*8} 124l4-4-4-4-4 4Z`}/>)}
 {Array.from({length:7},(_,i)=><path key={i} opacity=".27" d={`M8 ${24+i*13}l4 6-4 6-4-6ZM92 ${24+i*13}l-4 6 4 6 4-6Z`}/>)}
 <path d="M17 24L22 19H38M62 19H78L83 24M17 111L22 116H38M62 116H78L83 111" strokeWidth=".8"/>
 <path d="M16 20L20 16L24 20L20 24ZM76 20L80 16L84 20L80 24ZM16 112L20 108L24 112L20 116ZM76 112L80 108L84 112L80 116Z" opacity=".6"/>
 <path d="M34 10Q50 21 66 10M34 122Q50 111 66 122"/><path d="M43 11L50 7L57 11L50 15ZM43 121L50 117L57 121L50 125Z" strokeWidth=".7"/>
 </g>;}
