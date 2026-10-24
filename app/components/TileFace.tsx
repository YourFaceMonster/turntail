"use client";
import {useId} from 'react';
import ClassicTileOrnament from './ClassicTileOrnament';
import TileWear from './TileWear';
import {stageTileDesign} from '../../lib/stage-tile-design';
import StageTileEngraving from './StageTileEngraving';
import TileCartoon,{CARTOON_TILE_PATH} from './TileCartoon';
import {TILE_INKS} from '../../lib/tile-palette';
import {useStageVisual,StageMaterial,StageMotif} from "./StageVisuals";
import {type Tile} from '../../lib/game';
const colors=TILE_INKS;
function Star({x=0,y=0,scale=1}:{x?:number,y?:number,scale?:number}){return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M0-20L5-6L20-4L8 5L12 20L0 12L-12 20L-8 5L-20-4L-5-6Z"/>;}
function Spark({x=0,y=0,scale=1}:{x?:number,y?:number,scale?:number}){return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M0-10L3-3L10 0L3 3L0 10L-3 3L-10 0L-3-3Z"/>;}
function Cloud(){return <path d="M-29 5C-41-1-34-18-22-15C-25-30-7-39 4-28C18-41 37-25 30-12C45-5 39 12 23 12H-22C-32 12-38 8-29 5Z"/>;}
function Motif({s}:{s:number}){
 if(s===0)return <Cloud/>;
 if(s===1)return <Star/>;
 if(s===2)return <path d="M10-29C-25-32-38 13-10 29C2 35 20 28 28 16C-3 24-17-11 10-29Z"/>;
 return <><circle r="17"/>{Array.from({length:12},(_,i)=><path key={i} transform={`rotate(${i*30})`} d="M-2-24L0-34L2-24Z"/>)}</>;
}
/** Shared vector emblems keep menu, decorative tiles and game suits consistent. */
export function SuitEmblem({s}:{s:number}){const scale=[.95,1.65,1.12,1.08][s];return <svg className={`suit-emblem emblem-${s}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false" fill="currentColor"><g transform={`translate(50 52) scale(${scale})`}><Motif s={s}/></g></svg>;}
/** The four number-two emblems keep their approved suit-specific artwork. */
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
 const special=t.n===2,ink=colors[t.s],stage=useStageVisual(),artId=useId().replace(/:/g,'');
 if(stage){
  const dark=[6,9,10].includes(stage),design=stageTileDesign(stage,special),numberProps={x:design.x,y:design.y,textAnchor:'middle' as const,fontFamily:design.font,fontWeight:900,fontSize:design.size-(t.n>9?9:0),letterSpacing:t.n>9?-3:-1};
  return <span data-tile-id={t.id} data-number={t.n} data-suit={t.s} className={`tile face stage-material-tile suit${t.s} ${small?'small':''}`} style={{color:ink}}><svg className="tile-art" style={{color:ink}} viewBox="0 0 100 132" aria-hidden="true" focusable="false"><defs><clipPath id={`${artId}-cartoon`}><path d={CARTOON_TILE_PATH}/></clipPath></defs><g clipPath={`url(#${artId}-cartoon)`}><g className="tile-main-art"><StageMaterial stage={stage} id={`material-${artId}`} seed={t.id}/><StageTileEngraving stage={stage} s={t.s} special={special}/>
  <g fill={ink} paintOrder="stroke" strokeLinejoin="round"><text {...numberProps} data-number-halo="true" stroke="#fff1d5" strokeWidth="5.6" aria-hidden="true">{t.n}</text><text {...numberProps} data-number-outline="dark" stroke="#111015" strokeWidth="2.6">{t.n}</text></g></g>
  <g className="tile-suit-identity" transform={`translate(${design.suit.x} ${design.suit.y}) scale(${design.suit.scale})`} fill={ink} paintOrder="stroke" strokeLinejoin="round" stroke="#fff1d5" strokeWidth="6"><StageMotif stage={stage} s={t.s} outline={{color:'#fff1d5',width:6}}/><g stroke="#141019" strokeWidth="2.5"><StageMotif stage={stage} s={t.s}/></g></g><TileCartoon seed={t.id} dark={dark}/></g></svg></span>;
 }
 return <span data-tile-id={t.id} data-number={t.n} data-suit={t.s} className={`tile face suit${t.s} ${small?'small':''} ${special?`special-${t.n===1?'one':'two'}`:''}`} style={{color:ink}}>
 <svg className="tile-art classic-tile-face" viewBox="0 0 100 132" aria-hidden="true" focusable="false" fill={ink} style={{color:ink}}>
 <defs><clipPath id={`${artId}-cartoon`}><path d={CARTOON_TILE_PATH}/></clipPath><linearGradient id={`${artId}-resin`} x1="0" y1="0" x2=".85" y2="1"><stop stopColor="#f5e9cd"/><stop offset=".55" stopColor="#f2e4c6"/><stop offset="1" stopColor="#e2cfaa"/></linearGradient><linearGradient id={`${artId}-edge`} x2="0" y2="1"><stop stopColor="#fff" stopOpacity=".14"/><stop offset=".18" stopColor="#fff" stopOpacity="0"/><stop offset=".83" stopColor="#9b8967" stopOpacity="0"/><stop offset="1" stopColor="#8d7c5e" stopOpacity=".08"/></linearGradient></defs>
 <g clipPath={`url(#${artId}-cartoon)`}><g className="tile-main-art"><rect width="100" height="132" rx="15" fill={`url(#${artId}-resin)`}/><image data-tile-grain="ivory" href="/turntale-ivory-material-055.webp" width="100" height="132" preserveAspectRatio="xMidYMid slice" opacity=".13"/>
 <rect x="1.4" y="1.4" width="97.2" height="129.2" rx="14" fill={`url(#${artId}-edge)`} stroke="#fff9e4" strokeWidth="1.8"/>
 <g opacity=".1" stroke="#86734b" strokeWidth=".5">{Array.from({length:12},(_,i)=><path key={i} d={`M${(i*31)%97} ${97+(i*13)%30}l${2+i%3} -1`}/>)}</g>
 <TileWear seed={t.id}/><ClassicTileOrnament s={t.s} special={special}/>
 <g stroke={t.s===2?'#8c3e08':undefined} strokeWidth={t.s===2?.65:undefined} paintOrder="stroke fill">
 <text className={special?'special-number':'tile-number'} x="45" y="65" textAnchor="middle" fontFamily="Trebuchet MS,Arial,sans-serif" fontWeight="900" fontSize={t.n>9?51:60} letterSpacing={t.n>9?-3:-1}>{t.n}</text></g></g>
 <g className="engraved-suit-mark tile-suit-identity" fill={ink} color={ink} stroke={t.s===2?'#8c3e08':undefined} strokeWidth={t.s===2?.65:undefined} paintOrder="stroke fill" data-motif={`${t.s}:${t.n}`} transform={`translate(${special?67:72} ${special?100:106}) scale(${(special?.52:.58)*(t.s===1?1.35:t.s===2?.73:1)})`}>{special?<SpecialMotif s={t.s} n={t.n}/>:<Motif s={t.s}/>}</g>
 <TileCartoon seed={t.id}/></g></svg></span>;
}
