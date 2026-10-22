import {type Tile} from '../../lib/game';
const colors=['#142034','#008b43','#b46c00','#de1734'];
function Star({x=0,y=0,scale=1}:{x?:number,y?:number,scale?:number}){return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M0-20L5-6L20-4L8 5L12 20L0 12L-12 20L-8 5L-20-4L-5-6Z"/>;}
function Spark({x=0,y=0,scale=1}:{x?:number,y?:number,scale?:number}){return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M0-10L3-3L10 0L3 3L0 10L-3 3L-10 0L-3-3Z"/>;}
function Cloud(){return <path d="M-29 5C-41-1-34-18-22-15C-25-30-7-39 4-28C18-41 37-25 30-12C45-5 39 12 23 12H-22C-32 12-38 8-29 5Z"/>;}
function Motif({s}:{s:number}){
 if(s===0)return <Cloud/>;
 if(s===1)return <Star/>;
 if(s===2)return <path d="M10-29C-25-32-38 13-10 29C2 35 20 28 28 16C-3 24-17-11 10-29Z"/>;
 return <><circle r="17"/>{Array.from({length:12},(_,i)=><path key={i} transform={`rotate(${i*30})`} d="M-2-24L0-34L2-24Z"/>)}</>;
}
/** Eight emblems follow the approved concept: number is a cue, emblem is the main art. */
function SpecialMotif({s,n}:{s:number,n:number}){
 if(s===0)return <>
  <Cloud/>
  <path d="M-29 4C-20-12-6 7-18 9C-28 10-25-2-18-1M-7-14C6-30 27-10 12-3C-1 3-9-11 3-16C12-20 18-12 12-9" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round"/>
  {n===2?<><path d="M-3 3L-18 24H-5L-16 44L15 14H2L17-2Z" stroke="#fff" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke"/><path d="M-28 22H-37M19 25H31M-27 34H-36" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/></>:<path d="M-36 24C-15 13 2 30 21 18M-29 34H4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>}
 </>;
 if(s===2)return n===1?<>
  <path d="M11-34C-27-37-42 9-13 25C2 34 20 24 28 11C-6 22-23-13 11-34Z"/>
  <path d="M-34 36C-21 23-2 43 14 29M-29 44C-16 34 1 49 17 38" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/><circle cx="24" cy="30" r="3"/>
 </>:<>
  <circle cy="-6" r="23"/>
  <path d="M-29-23C-48 5-22 43 6 36C-20 33-33 9-29-23ZM30-26C52 7 26 43 0 44C29 32 37 8 30-26Z"/>
  <path d="M-27-26C-38 11-13 39 11 30" fill="none" stroke="currentColor" strokeWidth="1.5"/><Spark y={-41} scale={.7}/><Spark y={51} scale={.65}/><circle cy="-52" r="1.5"/>
 </>;
 if(s===1)return n===1?<>
  <path d="M-34 43C-44 8-11 2 7-21C-5 6-33 10-25 39C-34 24-28 11-9 2C-20 17-25 30-18 44ZM-20 44C-12 19 12 8 23-8C20 14-2 26-5 44Z"/>
  <Star x={16} y={-20} scale={.9}/><Spark x={-24} y={-19} scale={.55}/><Spark x={30} y={16} scale={.5}/>
 </>:<>
  <Star x={-17} y={0} scale={.78}/><Star x={16} y={14} scale={.85}/><Spark x={10} y={-31} scale={.6}/><Spark x={-26} y={34} scale={.5}/><Spark x={27} y={39} scale={.55}/>
  <path d="M-31 17C-51 42-19 51-6 32M-6-21C26-47 48-16 28 4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><path d="M-30 23C-38 37-23 42-14 35M0-24C23-37 36-24 31-13" fill="none" stroke="currentColor" strokeWidth="1.5"/>
 </>;
 return n===1?<>
  <path d="M-25 1A25 25 0 0 1 25 1Z"/>
  {Array.from({length:9},(_,i)=>{const a=(i*22.5+180)*Math.PI/180;return <path key={i} d={`M${Math.cos(a)*30} ${Math.sin(a)*30}L${Math.cos(a)*42} ${Math.sin(a)*42}`} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>;})}
  <path d="M-38 9H31M-27 18H17M-10 27H29M-18 36H9" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
 </>:<>
  {Array.from({length:16},(_,i)=><path key={i} transform={`rotate(${i*22.5})`} d="M-4-26C-10-34-3-39 0-47C0-35 9-35 5-25Z"/>)}
  <circle r="23" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle r="19"/><circle cy="50" r="2"/>
 </>;
}
/** The exact same art and body render in hand, flight and table. */
export default function TileFace({tile:t,small=false}:{tile:Tile,small?:boolean}){
 const special=t.n===1||t.n===2,ink=colors[t.s];
 return <span data-tile-id={t.id} data-number={t.n} data-suit={t.s} className={`tile face suit${t.s} ${small?'small':''} ${special?`special-${t.n===1?'one':'two'}`:''}`} style={{color:ink}}>
 <svg className="tile-art" viewBox="0 0 100 132" aria-hidden="true" focusable="false" fill={ink}>
 {special?<>
  <text className="special-number" x="10" y="31" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="28">{t.n}</text>
  <g className="special-motif" data-motif={`${t.s}:${t.n}`} transform={`translate(50 ${t.s===2&&t.n===2?76:78}) scale(${t.s===2&&t.n===2?.79:.87})`}><SpecialMotif s={t.s} n={t.n}/></g>
 </>:<>
  <text className="tile-number" x="49" y="79" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontSize={t.n>9?66:78} letterSpacing="-4">{t.n}</text>
  <g transform="translate(50 108) scale(.37)"><Motif s={t.s}/></g>
 </>}
 </svg></span>;
}
