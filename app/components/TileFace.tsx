import {suits,type Tile} from '../../lib/game';
const colors=['#182332','#087b42','#9a6400','#c62036'];
function Motif({s}:{s:number}){
 if(s===0)return <path d="M-13 4C-21 3-19-8-10-8C-10-22 10-22 13-10C27-9 27 8 15 9H-11C-18 9-20 4-13 4Z"/>;
 if(s===1)return <path d="M0-18L5-6L18-5L8 3L11 17L0 10L-11 17L-8 3L-18-5L-5-6Z"/>;
 if(s===2)return <path d="M9-18C-17-23-27 9-7 19C1 23 12 20 18 12C-2 17-11-5 9-18Z"/>;
 return <><circle r="10"/>{Array.from({length:12},(_,i)=><path key={i} transform={`rotate(${i*30})`} d="M-1.5-15L0-22L1.5-15Z"/>)}</>;
}
/** One fixed vector face is used in the hand, flight and table; the value cannot reflow. */
export default function TileFace({tile:t,small=false}:{tile:Tile,small?:boolean}){
 const special=t.n===1||t.n===2,ink=colors[t.s];
 return <span data-tile-id={t.id} data-number={t.n} data-suit={t.s} className={`tile face suit${t.s} ${small?'small':''} ${t.n===1?'special-one':t.n===2?'special-two':''}`}>
 <svg className="tile-art" viewBox="0 0 60 80" aria-hidden="true" focusable="false" fill={ink}>
 {special?<>
 <rect x="3.5" y="3.5" width="53" height="73" rx={t.s===1?2:t.s===2?12:7} fill="none" stroke={ink} strokeWidth={t.n===2?2:1} opacity=".55"/>
 {t.n===2&&<rect x="6.5" y="6.5" width="47" height="67" rx={t.s===2?10:4} fill="none" stroke={ink} strokeWidth=".7" opacity=".35"/>}
 <g transform={`translate(30 35) scale(${t.s===0?1.15:1.3})`} opacity=".1"><Motif s={t.s}/></g>
 {t.n===1?<path d="M28 11L15 22L22 30L28 25V53H18V62H45V53H37V11Z"/>:<path d="M13 28C12 4 49 4 49 25C49 38 31 44 24 52H49V63H12V53C18 42 39 31 39 25C39 15 24 15 24 28Z"/>}
 <g fill="#fffdf5" opacity=".65">{t.n===1?<path d="M30 17H32V52H30Z"/>:<path d="M19 25C20 12 41 12 43 23L41 23C38 15 23 16 22 25Z"/>}</g>
 {t.n===1?<g transform="translate(30 68) scale(.24)"><Motif s={t.s}/></g>:<><g transform="translate(22 68) scale(.22)"><Motif s={t.s}/></g><g transform="translate(38 68) scale(.22)"><Motif s={t.s}/></g></>}
 <text x="30" y="76" textAnchor="middle" fontSize="5.5" fontWeight="800" fontFamily="Arial,sans-serif">{suits[t.s]}</text>
 </>:<>
 <text className="tile-number" x="30" y="34" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontSize={t.n>9?32:35} letterSpacing="-1.5">{t.n}</text>
 <g transform="translate(30 51) scale(.48)"><Motif s={t.s}/></g>
 <path d="M14 65H46" stroke={ink} strokeWidth=".7" opacity=".25"/>
 <text x="30" y="75" textAnchor="middle" fontSize="7.5" fontWeight="800" fontFamily="Arial,sans-serif">{suits[t.s]}</text>
 </>}
 </svg></span>;
}
