"use client";
import Motif from './SuitMotif';
import {useId} from 'react';
import ClassicTileOrnament from './ClassicTileOrnament';
import TileWear from './TileWear';
import StageTileEngraving from './StageTileEngraving';
import TileCartoon,{CARTOON_TILE_PATH} from './TileCartoon';
import TileMaterialFinish,{TILE_MATERIAL_NAMES} from './TileMaterialFinish';
import {TILE_INKS} from '../../lib/tile-palette';
import {tileNumberGeometry} from '../../lib/tile-face-geometry';
import {useStageVisual,StageMaterial} from "./StageVisuals";
import {type Tile} from '../../lib/game';
const colors=TILE_INKS;
/** Shared emblems for every gameplay surface; IDs stay unchanged. */
export function SuitEmblem({s}:{s:number}){return <svg className={`suit-emblem emblem-${s}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false" fill="currentColor"><g transform="translate(50 50)"><Motif s={s}/></g></svg>;}
function SpecialMotif({s}:{s:number,n:number}){return <><Motif s={s}/><path d="M-36 31L-32 37H-21M21 37H32L36 31" fill="none" stroke="currentColor" strokeWidth="2"/></>;}
/** The exact same art and body render in hand, flight and table. */
export default function TileFace({tile:t,small=false,muted=false}:{tile:Tile,small?:boolean,muted?:boolean}){
 const special=t.n===2,ink=muted?'#737770':colors[t.s],suitInk=colors[t.s],stage=useStageVisual(),artId=useId().replace(/[^a-zA-Z0-9_-]/g,'');
 if(stage){
  const dark=[2,5,6,9,10].includes(stage),numberProps=tileNumberGeometry(t.n);
  return <span data-tile-id={t.id} data-number={t.n} data-suit={t.s} data-tile-material={TILE_MATERIAL_NAMES[stage-1]} title={`${TILE_MATERIAL_NAMES[stage-1]} 패`} className={`tile face stage-material-tile suit${t.s} ${small?'small':''}`} style={{color:ink}}><svg className="tile-art" data-number-layout="classic" style={{color:ink}} viewBox="0 0 100 132" aria-hidden="true" focusable="false"><defs><clipPath id={`${artId}-cartoon`}><path d={CARTOON_TILE_PATH}/></clipPath></defs><g clipPath={`url(#${artId}-cartoon)`}><g className="tile-main-art"><StageMaterial stage={stage} id={`material-${artId}`} seed={t.id}/>{[2,5,10].includes(stage)&&<path d={CARTOON_TILE_PATH} fill="#fff1d0" opacity={stage===10?.24:.10} data-wood-lightening="true"/>}<TileMaterialFinish stage={stage} id={artId}/><g opacity={dark?.17:.12}><StageTileEngraving stage={stage} s={t.s} special={special}/></g><ClassicTileOrnament s={t.s} special={special}/>
  <g fill={ink} paintOrder="stroke" strokeLinejoin="round"><text {...numberProps} data-number-halo="true" stroke="#fff1d5" strokeWidth="5.6" aria-hidden="true">{t.n}</text><text {...numberProps} data-number-outline="dark" stroke="#111015" strokeWidth="2.6">{t.n}</text></g></g>
  <g className="tile-suit-identity" color={dark&&t.s===0?'#eadfc7':suitInk} transform={`translate(${special?70:74} 111) scale(${(special?.44:.5)})`} fill={suitInk} paintOrder="stroke" strokeLinejoin="round" stroke={dark?'#fff1d5':t.s===2?'#8c3e08':'none'} strokeWidth={dark?1.8:.65}>{special?<SpecialMotif s={t.s} n={t.n}/>:<Motif s={t.s}/>}</g><TileCartoon seed={t.id} dark={dark}/></g></svg></span>;
 }
 return <span data-tile-id={t.id} data-number={t.n} data-suit={t.s} className={`tile face suit${t.s} ${small?'small':''} ${special?`special-${t.n===1?'one':'two'}`:''}`} style={{color:ink}}>
 <svg className="tile-art classic-tile-face" data-number-layout="classic" viewBox="0 0 100 132" aria-hidden="true" focusable="false" fill={ink} style={{color:ink}}>
 <defs><clipPath id={`${artId}-cartoon`}><path d={CARTOON_TILE_PATH}/></clipPath><linearGradient id={`${artId}-resin`} x1="0" y1="0" x2=".85" y2="1"><stop stopColor="#f5e9cd"/><stop offset=".55" stopColor="#f2e4c6"/><stop offset="1" stopColor="#e2cfaa"/></linearGradient><linearGradient id={`${artId}-edge`} x2="0" y2="1"><stop stopColor="#fff" stopOpacity=".14"/><stop offset=".18" stopColor="#fff" stopOpacity="0"/><stop offset=".83" stopColor="#9b8967" stopOpacity="0"/><stop offset="1" stopColor="#8d7c5e" stopOpacity=".08"/></linearGradient></defs>
 <g clipPath={`url(#${artId}-cartoon)`}><g className="tile-main-art"><rect width="100" height="132" rx="15" fill={`url(#${artId}-resin)`}/><image data-tile-grain="ivory" href="/turntale-ivory-material-055.webp" width="100" height="132" preserveAspectRatio="xMidYMid slice" opacity=".13"/>
 <rect x="1.4" y="1.4" width="97.2" height="129.2" rx="14" fill={`url(#${artId}-edge)`} stroke="#fff9e4" strokeWidth="1.8"/>
 <g opacity=".1" stroke="#86734b" strokeWidth=".5">{Array.from({length:12},(_,i)=><path key={i} d={`M${(i*31)%97} ${97+(i*13)%30}l${2+i%3} -1`}/>)}</g>
 <TileWear seed={t.id}/><ClassicTileOrnament s={t.s} special={special}/>
 <g stroke={t.s===2?'#8c3e08':undefined} strokeWidth={t.s===2?.65:undefined} paintOrder="stroke fill">
 <text className={special?'special-number':'tile-number'} {...tileNumberGeometry(t.n)} stroke={t.n>9?(t.s===2?'#8c3e08':ink):undefined} strokeWidth={t.n>9?.65:undefined}>{t.n}</text></g></g>
 <g className="engraved-suit-mark tile-suit-identity" fill={suitInk} color={suitInk} stroke={t.s===2?'#8c3e08':undefined} strokeWidth={t.s===2?.65:undefined} paintOrder="stroke fill" data-motif={`${t.s}:${t.n}`} transform={`translate(${special?70:74} 111) scale(${(special?.44:.5)})`}>{special?<SpecialMotif s={t.s} n={t.n}/>:<Motif s={t.s}/>}</g>
 <TileCartoon seed={t.id}/></g></svg></span>;
}
