"use client";
import {createContext,useContext,type ReactNode} from 'react';
export const StageVisualContext=createContext<number|undefined>(undefined);
export const useStageVisual=()=>useContext(StageVisualContext);
export function StageVisuals({stage,children}:{stage?:number,children:ReactNode}){return <StageVisualContext.Provider value={stage}>{children}</StageVisualContext.Provider>;}
export const MATERIAL_COLORS=['#dacead','#654124','#9cc0a1','#c0e4ed','#aa977d','#414449','#c2d5e1','#dfa347','#292d39','#392127'];
/** Grain, facets, pores and inclusions belong to the body, rather than a coloured frame. */
export function StageMaterial({stage,id,seed=0}:{stage:number,id:string,seed?:number}){
 const c=MATERIAL_COLORS[stage-1],dark=[2,6,9,10].includes(stage),shift=seed%13;
 return <><defs><linearGradient id={`${id}-body`} x2=".9" y2="1"><stop stopColor={c}/><stop offset=".5" stopColor={c}/><stop offset="1" stopColor={dark?'#171823':'#f0e9cc'}/></linearGradient><linearGradient id={`${id}-glint`}><stop stopColor="#fff" stopOpacity=".27"/><stop offset=".4" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#fff" stopOpacity=".12"/></linearGradient></defs><rect width="100" height="132" rx="10" fill={`url(#${id}-body)`}/>
 <g opacity={stage===9?.48:.24} transform={`translate(${shift-6} 0)`}>
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
 </g><rect x="1" y="1" width="98" height="130" rx="9" fill={`url(#${id}-glint)`} stroke={dark?'#c6ad7980':'#ffffff90'} strokeWidth="1.5"/></>;
}
const clouds=['M-30 8Q-43-6-24-14Q-23-32-4-24Q12-38 26-17Q43-14 34 8Z','M-32 7C-43-8-26-19-19-13C-20-33 10-34 18-18C39-25 46 7 25 10H-23Z','M-35 7L-28-11L-16-10L-8-27L9-29L21-15L33-10L35 8Z','M-33 8Q-41-2-25-13Q-21-34 0-23Q19-37 28-11Q45-4 30 10Z'];
const stars=['M0-25L7-8L24-4L11 8L14 26L0 15L-17 26L-12 7L-25-5L-7-9Z','M0-29L7-8L27 0L8 8L0 29L-8 8L-27 0L-8-8Z','M0-29L10-10L28 0L9 9L0 29L-9 9L-28 0L-10-10Z'];
export function StageMotif({stage,s}:{stage:number,s:number}){
 const angular=[3,4,6,9].includes(stage),delicate=[7,8].includes(stage);
 if(s===0)return <><path d={clouds[stage%4]}/>{[4,7,9,10].includes(stage)&&<path d="M-27 5Q-12-7-4 2T27 1" stroke="currentColor" strokeWidth="2" fill="none"/>}</>;
 if(s===1)return <><path d={stars[angular?stage%2+1:0]}/>{stage===10&&<path d="M0-31L-4-40M12 11L27 24M-12 10L-26 22" stroke="currentColor" strokeWidth="2"/>}</>;
 if(s===2)return <><path d={angular?'M12-30L-10-25L-29-6L-24 17L-5 30L16 25L29 12L6 16L-8 2L-6-17Z':'M12-30C-27-34-39 14-12 29C5 39 25 26 30 13C-3 26-22-10 12-30Z'}/>{delicate&&<path d="M-26-12Q-36 24-1 35" fill="none" stroke="currentColor" strokeWidth="1.2"/>}</>;
 return <><circle r={stage===5?16:18} fill={stage===5?'none':'currentColor'} stroke="currentColor" strokeWidth="3"/>{stage===5&&<circle r="11" fill="none" stroke="currentColor" strokeWidth="2"/>}{Array.from({length:stage===1?11:stage===9?13:12},(_,i)=><path key={i} transform={`rotate(${i*360/(stage===1?11:stage===9?13:12)})`} d={angular?'M-2-24L1-39L4-27':'M0-25L0-35'} stroke="currentColor" strokeWidth={delicate?1.5:3} fill="none" strokeLinecap={stage===1?'butt':'round'}/>)}</>;
}
export function StageBackArt({stage}:{stage:number}){return <svg viewBox="0 0 100 132" preserveAspectRatio="none" aria-hidden="true"><StageMaterial stage={stage} id={`back-${stage}`}/><g stroke="#f2d398" fill="none"><rect x="7" y="7" width="86" height="118" rx="7" strokeWidth="1.4"/><circle cx="50" cy="66" r="29" strokeWidth=".8"/>{Array.from({length:12},(_,i)=><path key={i} transform={`translate(50 66) rotate(${i*30})`} d={stage===10?'M0-4Q-9-19 0-37Q8-23 0-4':'M0-5L-2-23L0-36L2-23Z'} fill="#f2d398" strokeWidth=".5"/>)}</g></svg>;}
