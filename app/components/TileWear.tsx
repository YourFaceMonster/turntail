/** Seeded wear stays at the rim so even a battered face remains readable. */
export default function TileWear({seed=0,dark=false}:{seed?:number,dark?:boolean}){
 const age=(seed*13+7)%5,tone=dark?'#ecd2a0':'#63492e';
 return <g data-tile-wear="handled" data-wear-age={age} fill="none" strokeLinecap="round">
  <path d="M7 23V11Q7 6 13 6H29M77 6H88Q94 6 94 13V29M94 107V120Q94 126 86 126H73M25 126H13Q7 126 7 119V110" stroke={tone} strokeWidth={2.5+age*.4} opacity={.18+age*.055}/>
  {Array.from({length:5+age*3},(_,i)=>{const n=(seed*17+i*31)%101,x=i%2?92-(n%5):5+n%5,y=14+n;return <path key={i} d={`M${x} ${y}l${i%2?-2.6:2.6} ${3+n%6}m${i%2?-1:1} -1l${i%2?-3:3} 2`} stroke={i%3===0?'#fff0ce':tone} strokeWidth={i%3===0?1.05:.85} opacity={.2+age*.035}/>;})}
  {age>=2&&<><path d={`M12 ${91+seed%12}q8 -5 14 2m-9 7l9 -2M72 12l12 2`} stroke={tone} strokeWidth="2.2" opacity=".27"/><path d="M7 105L13 102L11 113L7 119M86 8L82 13L94 18" fill={dark?'#b7a286':'#89633e'} stroke="none" opacity=".32"/></>}
  {age>=3&&<path d="M15 125l6 -7l3 6l10 -1M91 28l-6 9l6 3" stroke={tone} strokeWidth="1.4" opacity=".45"/>}
  <path d={`M${14+seed%19} 124l8 -1M${66+seed%12} 9l5 1`} stroke="#fff6da" strokeWidth="1.1" opacity=".55"/>
 </g>;
}
