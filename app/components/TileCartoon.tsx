/** Coarse painted chips use geometry, without a per-tile blur/filter or animation. */
export const CARTOON_TILE_PATH='M14 2L78 2L78 3L88 3Q97 4 97 15L98 42L97 43L98 110L97 118Q96 129 85 130L24 130L23 129L13 130Q3 129 3 118L2 91L3 90L2 24L3 13Q4 3 14 2Z';
export default function TileCartoon({seed=0,dark=false}:{seed?:number,dark?:boolean}){
 return <g data-tile-finish="cartoon" fill={dark?'#e8d5a6':'#a38c66'}>
  {Array.from({length:10},(_,i)=>{const n=(seed*13+i*29)%101;return <path key={i} d={`M${i%2?91-n%5:5+n%5} ${13+n}h${2+n%3}v3h-2v2h-2Z`} opacity={i%3===0?.2:.1}/>;})}
  <path d={CARTOON_TILE_PATH} fill="none" stroke={dark?'#182622':'#75654e'} strokeWidth="2.2" strokeLinejoin="round" opacity=".7"/>
  <path d="M13 7L35 7M7 20V39M67 125H85" fill="none" stroke={dark?'#d7d5ae':'#fff7de'} strokeWidth="3" strokeLinecap="round" opacity=".65"/>
 </g>;
}
