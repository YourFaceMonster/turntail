/** Quiet, seeded handling marks stay around the edge, clear of numbers and emblems. */
export default function TileWear({seed=0,dark=false}:{seed?:number,dark?:boolean}){
 const tone=dark?'#ecd2a0':'#79664b';
 return <g data-tile-wear="handled" fill="none" strokeLinecap="round">
  <path d="M7 23V11Q7 6 13 6H29M77 6H88Q94 6 94 13V29M94 107V120Q94 126 86 126H73M25 126H13Q7 126 7 119V110" stroke={tone} strokeWidth="2.4" opacity={dark?.16:.14}/>
  {Array.from({length:7},(_,i)=>{const n=(seed*17+i*31)%101,x=i%2?92-(n%3):6+n%3,y=14+n;return <path key={i} d={`M${x} ${y}l${i%2?-1.4:1.4} ${2+n%4}m${i%2?-1:1} -1l${i%2?-2:2} 2`} stroke={i%3===0?'#fff7de':tone} strokeWidth={i%3===0?.55:.4} opacity={i%3===0?.32:.2}/>;})}
  <path d={`M${14+seed%19} 124l8 -1M${66+seed%12} 9l5 1`} stroke="#fff6da" strokeWidth=".7" opacity=".3"/>
 </g>;
}
