const frames=[
 'M12 34V15Q12 8 21 8H78Q90 8 90 20V76M10 82V118Q10 124 18 124H83Q91 124 91 116',
 'M9 24L14 9H85L92 23V109L85 123H14L8 111ZM17 17H82M18 116H81',
 'M12 32Q2 9 26 11Q46 1 67 11Q95 7 89 34M9 88Q1 117 27 121M73 121Q99 119 90 87',
 'M8 28L22 8H76L92 29L87 108L75 124H24L9 109ZM15 26L27 16H73L85 28',
 'M9 23Q9 8 24 8H77Q92 8 92 23V108Q92 123 78 123H22Q8 123 9 108M16 28V17H31M69 17H85V28',
 'M8 29V10H91V31M8 101V123H91V102M13 36V91M87 36V91M18 18H31V28H22V37',
 'M9 33Q7 9 31 8Q50 14 68 8Q94 7 91 34M9 96Q6 123 33 123M69 123Q94 125 91 96',
 'M8 31V12L24 7H76L92 13V32M8 100V119L24 125H76L92 119V100M15 28V18H30M70 18H85V28',
 'M8 24L22 7L67 11L86 7L94 30L89 58L94 100L81 123L45 120L19 126L8 110L12 76Z',
 'M8 31Q4 8 25 11L39 6L50 11L65 7L82 12Q98 8 91 34M8 98Q1 121 24 120L40 125L58 120L76 125Q98 124 91 98'
];
const accents=[
 'M18 23Q9 39 22 36Q31 30 20 25M73 21Q92 24 83 38M18 93Q7 108 23 112',
 'M14 39L22 32L17 24M80 24L75 33L86 42M16 99L23 110M78 108L85 98',
 'M15 35Q2 20 19 18Q30 25 15 35ZM80 32Q72 9 89 19Q93 29 80 32M14 108Q4 94 19 93',
 'M17 18Q7 32 18 38Q29 31 17 18ZM82 19Q70 32 82 40Q95 31 82 19M15 91Q5 103 17 112',
 'M14 29L24 19L34 29L24 39ZM71 28L81 18L91 28L81 38ZM14 101L24 111L33 102',
 'M17 20V40L29 32L19 26M72 20L85 31L74 41M15 95L27 105L15 115M79 95V116',
 'M13 41Q13 14 35 16L25 25L26 38M69 18Q92 12 88 36L79 31M12 95Q13 118 33 116',
 'M16 37Q7 21 21 20Q35 22 23 33Q17 35 17 29M72 21Q91 14 89 31Q87 39 79 34M16 98Q8 117 30 112',
 'M12 43L20 18L33 28L24 44ZM75 17L91 33L79 42L69 31ZM14 96L31 112L17 117',
 'M12 45Q4 22 24 18L37 23L25 29L16 28M69 19L85 14L93 24L81 27L87 38M12 96L26 103L17 115M75 113L89 97'
];
/** Forty regional number medallions, keeping the four suits immediately recognizable. */
export default function StageTileEngraving({stage,s,special=false}:{stage:number,s:number,special?:boolean}){
 const count=8+stage%5,radius=s===2?31:32;
 return <g data-region-engraving={`${stage}:${s}`} fill="none" stroke="currentColor" strokeLinejoin="round" opacity={special?.48:.56}>
  <path d={frames[stage-1]} strokeWidth="1"/><path d={accents[stage-1]} strokeWidth="1.35" strokeLinecap="round"/>
  {!special&&<g transform="translate(45 47)">
   {s===0?<><path d={`M-30-9Q-41-${25+stage} -20-24Q-9-${35+stage} 5-27Q27-37 32-15Q43-4 31 16Q30 34 9 33Q-11 43-28 26Q-41 19-30-9Z`} strokeWidth="1.9"/><path d="M-25-20Q-37-9-24-7M24-20Q38-13 27-5M-22 24Q-34 14-22 12" strokeWidth=".8"/></>:
   s===1?<path d={Array.from({length:count*2},(_,i)=>{const a=(i*Math.PI/count)-Math.PI/2,r=i%2?27:37;return `${i?'L':'M'}${Math.cos(a)*r} ${Math.sin(a)*r}`;}).join('')+'Z'} strokeWidth="1.8"/>:
   s===2?<><path d={`M15-${radius+2}C-39-45-49 34 2 37Q30 37 39 11C5 36-30-5 15-${radius+2}Z`} fill="currentColor" fillOpacity=".13" strokeWidth="1.5"/><path d="M-27 29Q5 48 30 25" strokeWidth=".8"/></>:
   <>{Array.from({length:count+4},(_,i)=><path key={i} transform={`rotate(${i*360/(count+4)})`} d={stage%2?'M-2-31Q-8-37 0-44Q7-35 3-30':'M-2-32L0-43L3-31'} strokeWidth="1"/>)}<circle r="31" strokeWidth="1.5"/></>}
   <circle r={s===2?26:27} fill="#fff6df" fillOpacity=".08" stroke="none"/>
  </g>}
  <path d={stage%2?'M37 11L45 15L53 11M35 118L44 113L52 118':'M40 11L45 7L50 11L45 15ZM39 118H51'} strokeWidth="1"/>
 </g>;
}
