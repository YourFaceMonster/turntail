/** Coarse painted chips use geometry, without a per-tile blur/filter or animation. */
export const CARTOON_TILE_PATH='M15 2H85Q97 2 98 15L97 116Q97 129 84 130H16Q3 129 3 117L2 16Q2 3 15 2Z';
export default function TileCartoon({seed=0,dark=false}:{seed?:number,dark?:boolean}){
 return <g data-tile-finish="cartoon" fill={dark?'#e8d5a6':'#a38c66'}>
  <path d={CARTOON_TILE_PATH} fill="none" stroke={dark?'#182622':'#75654e'} strokeWidth="2.3" strokeLinejoin="round" opacity=".76"/>
  <path d={`M5 ${42+seed%19}l3 6l-2 9M${17+seed%23} 128l8 -3l6 2M92 ${81+seed%17}l-3 5l3 7`} fill="none" stroke={dark?'#131620':'#72533c'} strokeWidth="1.5" opacity=".6"/>
  <path d="M13 7L35 7M7 20V39M67 125H85" fill="none" stroke={dark?'#d7d5ae':'#fff7de'} strokeWidth="2" strokeLinecap="round" opacity=".65"/>
 </g>;
}
