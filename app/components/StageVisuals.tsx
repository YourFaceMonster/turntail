"use client";
import {createContext,useContext,useId,type ReactNode} from 'react';
import TileWear from './TileWear';
export const StageVisualContext=createContext<number|undefined>(undefined);
export const useStageVisual=()=>useContext(StageVisualContext);
export function StageVisuals({stage,children}:{stage?:number,children:ReactNode}){return <StageVisualContext.Provider value={stage}>{children}</StageVisualContext.Provider>;}
export const MATERIAL_COLORS=['#dacead','#654124','#9cc0a1','#c0e4ed','#aa977d','#414449','#c2d5e1','#dfa347','#292d39','#392127'];
/** Grain, facets, pores and inclusions belong to the body, rather than a coloured frame. */
export function StageMaterial({stage,id,seed=0}:{stage:number,id:string,seed?:number}){
 const c=MATERIAL_COLORS[stage-1],dark=[2,6,9,10].includes(stage),shift=seed%13;
 return <><defs><clipPath id={`${id}-clip`}><rect width="100" height="132" rx="10"/></clipPath><linearGradient id={`${id}-body`} x2=".9" y2="1"><stop stopColor={c}/><stop offset=".5" stopColor={c}/><stop offset="1" stopColor={dark?'#171823':'#f0e9cc'}/></linearGradient><linearGradient id={`${id}-glint`}><stop stopColor="#fff" stopOpacity=".19"/><stop offset=".4" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#fff" stopOpacity=".12"/></linearGradient></defs><rect width="100" height="132" rx="10" fill={`url(#${id}-body)`}/>
 <image data-stage-texture={stage} href="/turntale-stage-materials-v2.webp" x={-((stage-1)%5)*100} y={-Math.floor((stage-1)/5)*132} width="500" height="264" preserveAspectRatio="none" clipPath={`url(#${id}-clip)`}/><g opacity={stage===9?.3:.2} transform={`translate(${shift-6} 0)`}>
 {stage===1&&Array.from({length:24},(_,i)=><ellipse key={i} cx={(i*37+seed*3)%112} cy={(i*19+seed)%132} rx={i%3===0?1.5:.7} ry={i%3===0?.7:1.6} fill="#806b47"/>)}
 {[2,5,10].includes(stage)&&Array.from({length:9},(_,i)=><path key={i} d={`M${i*14-15} -5C${i*12+38} 32 ${i*14-40} 82 ${i*13+13} 142M${i*14-12} -5C${i*12+41} 32 ${i*14-37} 82 ${i*13+16} 142`} stroke={stage===10?'#df4a3c':stage===5?'#514e45':'#1f130e'} strokeWidth={stage===5?2.5:1} fill="none"/>)}
 {stage===3&&<><path d="M-5 21Q49 5 103 65M-10 94Q40 42 108 117M10 0Q55 55 23 136" stroke="#315d49" strokeWidth="9" fill="none" opacity=".45"/><path d="M-10 91Q43 44 110 114" stroke="#e0f5b6" strokeWidth="4" fill="none"/></>}
 {stage===4&&<><path d="M0 0L67 0L13 132H0Z" fill="#fff"/><path d="M100 2L46 91L100 119Z" fill="#368299"/><path d="M4 131L72 27L33 132Z" fill="#77c6dc"/><circle cx="78" cy="44" r="2" fill="#fff"/></>}
 {stage===5&&<><ellipse cx="42" cy="65" rx="38" ry="21" fill="none" stroke="#e6ccb0" strokeWidth="4"/><ellipse cx="42" cy="65" rx="28" ry="14" fill="none" stroke="#4d5148" strokeWidth="3"/></>}
 {stage===6&&Array.from({length:33},(_,i)=><circle key={i} cx={(i*43+seed)%103} cy={(i*23+seed*3)%137} r={i%3===0?1.8:.7} fill={i%2?'#e4d9c1':'#090b14'}/>)}
 {stage===7&&Array.from({length:5},(_,i)=><path key={i} d={`M-20 ${i*33}Q35 ${i*33+28} 118 ${i*33-8}`} stroke={i%2?'#fff':'#6d8eac'} strokeWidth="9" fill="none"/>)}
 {stage===8&&<><ellipse cx="54" cy="66" rx="37" ry="58" fill="#ffe288"/><path d="M12 115Q48 61 69 10L57 65L88 101M57 65L27 51" stroke="#8b4e18" strokeWidth="2" fill="none"/><ellipse cx="82" cy="23" rx="3" ry="5" fill="#ffe5a0"/></>}
 {stage===9&&<><path d="M0 0L62 0L7 132H0ZM100 15L58 89L100 123Z" fill="#a5a9b9" opacity=".5"/><path d="M55 0L34 43L45 68L23 132M100 92L45 68L86 47" stroke="#c4cbd5" strokeWidth=".8" fill="none"/></>}
 {stage===10&&<><path d="M45 -5Q17 44 59 72L39 136M59 72L91 91M41 47L72 24M52 93L13 112" stroke="#d99c35" strokeWidth="1.8" fill="none"/><path d="M53 1L63 25L44 57L73 111L69 132" stroke="#ee3d36" strokeWidth="3" fill="none"/></>}
 </g><TileWear seed={seed+stage*7} dark={dark}/><rect x="1" y="1" width="98" height="130" rx="9" fill={`url(#${id}-glint)`} stroke={dark?'#c6ad7980':'#ffffff90'} strokeWidth="1.5"/></>;
}
const clouds=['M-30 8Q-43-6-24-14Q-23-32-4-24Q12-38 26-17Q43-14 34 8Z','M-32 7C-43-8-26-19-19-13C-20-33 10-34 18-18C39-25 46 7 25 10H-23Z','M-35 7L-28-11L-16-10L-8-27L9-29L21-15L33-10L35 8Z','M-33 8Q-41-2-25-13Q-21-34 0-23Q19-37 28-11Q45-4 30 10Z'];
const stars=['M0-25L7-8L24-4L11 8L14 26L0 15L-17 26L-12 7L-25-5L-7-9Z','M0-29L7-8L27 0L8 8L0 29L-8 8L-27 0L-8-8Z','M0-29L10-10L28 0L9 9L0 29L-9 9L-28 0L-10-10Z'];
export function StageMotif({stage,s,outline}:{stage:number,s:number,outline?:{color:string,width:number}}){
 const edge=outline?.color||'currentColor',weight=(n:number)=>outline?.width??n;
 const angular=[3,4,6,9].includes(stage),delicate=[7,8].includes(stage);
 if(s===0)return <><path d={clouds[stage%4]}/>{[4,7,9,10].includes(stage)&&<path d="M-27 5Q-12-7-4 2T27 1" stroke={edge} strokeWidth={weight(2)} fill="none"/>}</>;
 if(s===1)return <><path d={stars[angular?stage%2+1:0]}/>{stage===10&&<path d="M0-31L-4-40M12 11L27 24M-12 10L-26 22" stroke={edge} strokeWidth={weight(2)}/>}</>;
 if(s===2)return <><path d={angular?'M12-30L-10-25L-29-6L-24 17L-5 30L16 25L29 12L6 16L-8 2L-6-17Z':'M12-30C-27-34-39 14-12 29C5 39 25 26 30 13C-3 26-22-10 12-30Z'}/>{delicate&&<path d="M-26-12Q-36 24-1 35" fill="none" stroke={edge} strokeWidth={weight(1.2)}/>}</>;
 return <><circle r={stage===5?16:18} fill={stage===5?'none':'currentColor'} stroke={edge} strokeWidth={weight(3)}/>{stage===5&&<circle r="11" fill="none" stroke={edge} strokeWidth={weight(2)}/>}{Array.from({length:stage===1?11:stage===9?13:12},(_,i)=><path key={i} transform={`rotate(${i*360/(stage===1?11:stage===9?13:12)})`} d={angular?'M-2-24L1-39L4-27':'M0-25L0-35'} stroke={edge} strokeWidth={weight(delicate?1.5:3)} fill="none" strokeLinecap={stage===1?'butt':'round'}/>)}</>;
}
export const BACK_PALETTES=[['#172c49','#ffe5ae'],['#3d171f','#ffd38b'],['#15392c','#c6f4d2'],['#122d53','#bceeff'],['#3b2c1b','#f5dfb1'],['#18202d','#f0d19b'],['#192341','#e0f6ff'],['#42220d','#ffe5a1'],['#221929','#ffc7c4'],['#360f1b','#ffe09b']];
const BACK_MOTIFS=[
 'M29 100V51Q50 22 71 51V100M34 100V54Q50 31 66 54V100M24 101H76M50 36L53 26L56 36L66 39L56 42L53 52L50 42L40 39ZM38 74H62M50 62V85',
 'M50 32C70 55 39 56 65 77Q80 99 51 105Q21 100 31 77Q42 63 39 51Q51 59 50 32ZM39 99L62 105M30 109L72 97M28 97L70 109',
 'M50 108V34M50 44Q22 25 29 50Q32 64 50 65M50 58Q79 35 73 61Q69 77 50 80M50 78Q21 55 27 83Q30 97 50 99M50 99Q78 77 72 101Q66 115 50 108',
 'M50 30L72 62L50 98L28 62ZM50 40L64 62L50 85L36 62ZM24 102Q36 96 49 103T77 102M30 111Q47 104 69 111',
 'M29 50Q48 28 66 48L72 60L53 82L32 64Q18 78 36 97L48 103L70 81Q84 67 65 50M38 48L58 65L42 83L28 68M36 98L54 79L70 95M28 106L75 35',
 'M28 38L50 30L73 38V71Q70 93 50 106Q28 93 28 71ZM34 43L50 38L67 43V70Q65 85 50 97Q35 85 34 70ZM43 53L58 69L44 85M58 53L43 69L58 85',
 'M50 110V64M29 108H73M50 87Q25 83 29 64M50 77Q76 73 72 53M50 65Q35 60 38 48M50 67L59 46M49 49L43 38M68 31Q43 31 44 52Q26 44 35 28Q44 13 62 19Q54 30 68 31Z',
 'M50 28L56 46L75 49L61 61L64 80L50 70L35 80L39 61L24 49L44 46ZM27 93H73M33 101H67M39 109H61M24 35L18 30M77 35L83 30M50 87V94',
 'M26 80H74L67 97H34ZM36 72Q24 57 42 49Q39 64 50 59Q63 51 55 30Q82 57 62 73M25 105H75M35 99V106M65 99V106M45 82L52 89L47 96',
 'M50 113V49M50 92L31 106M50 92L71 109M50 101L43 116M50 101L58 118M50 68L29 51L20 53M50 74L74 53L81 56M50 55L36 37L26 36M50 60L65 37L75 35M50 50V28M28 53L27 39M73 54L75 42M35 37L35 25M65 37L67 24M45 31L50 19L55 31'
];
export function StageOrnament({stage}:{stage:number}){const color=[2,6,9,10].includes(stage)?'#ecd5a0':'#695138';return <g fill="none" stroke={color} strokeWidth=".9" opacity=".65"><rect x="4" y="4" width="92" height="124" rx="7"/><path d="M8 24V13Q8 9 13 9H34M66 9H87Q92 9 92 14V24M8 111V119Q8 123 14 123H29M71 123H87Q92 123 92 118V111M43 8L50 5L57 8L50 11ZM12 14L17 19M88 14L83 19"/></g>;}
/** Every hidden tile in one stage uses this same large, contrasting regional seal. */
export function StageBackArt({stage}:{stage:number}){
 const [base,ink]=BACK_PALETTES[stage-1],id=useId().replace(/:/g,'');return <svg className="tile-art" viewBox="0 0 100 132" preserveAspectRatio="none" aria-hidden="true" style={{color:ink}}><g data-back-design={stage}><StageMaterial stage={stage} id={`back-${id}`}/><rect x="4" y="4" width="92" height="124" rx="7" fill={base} opacity=".5"/><g fill="none"><rect x="7" y="7" width="86" height="118" rx="6" stroke="#070d16" strokeWidth="4"/><rect x="7" y="7" width="86" height="118" rx="6" stroke={ink} strokeWidth="1.8"/><path d="M50 17Q76 22 81 43V91Q76 113 50 119Q24 113 19 91V43Q24 22 50 17Z" fill={base} fillOpacity=".94" stroke={ink} strokeWidth="1.4"/><path d={BACK_MOTIFS[stage-1]} stroke="#050910" strokeWidth="5.5" strokeLinejoin="round" strokeLinecap="round"/><path d={BACK_MOTIFS[stage-1]} stroke={ink} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round"/>{[[13,15],[87,15],[13,117],[87,117]].map(([x,y],i)=><path key={i} d={`M${x-3} ${y}L${x} ${y-3}L${x+3} ${y}L${x} ${y+3}Z`} fill={ink} stroke={base} strokeWidth=".7"/>)}</g></g></svg>;
}
