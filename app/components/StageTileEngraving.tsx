import ClassicTileOrnament from './ClassicTileOrnament';
/** The same four sculpted number surrounds as the original set, engraved into regional materials. */
export default function StageTileEngraving({stage,s,special=false}:{stage:number,s:number,special?:boolean}){
 return <g data-region-engraving={`${stage}:${s}`} data-number-geometry="classic" strokeLinejoin="round">
  <ClassicTileOrnament s={s} special={special}/>
  <g fill="none" stroke="currentColor" strokeWidth=".85" opacity=".38" aria-hidden="true">
   <path d={stage%2?'M13 108V118H28M17 112V114H23':'M13 110L21 118H30M16 108L25 117'}/>
  </g>
 </g>;
}
