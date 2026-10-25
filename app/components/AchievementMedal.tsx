"use client";
import {useId} from 'react';
import {SuitEmblem} from './TileFace';

const palettes=[['#8465d9','#b79aff'],['#c75c94','#ffabd0'],['#3d90b8','#91e5f4'],['#b9793c','#ffcd78']];
const star='M0-12L3-4L12-3L6 3L7 12L0 7L-7 12L-6 3L-12-3L-3-4Z';
function Spark({x,y,size=1}:{x:number,y:number,size?:number}){return <path d={star} transform={`translate(${x} ${y}) scale(${size})`} fill="#ffe9a6" stroke="#402344" strokeWidth="2.2"/>;}
function Card({x,y,n,s=1,angle=0}:{x:number,y:number,n?:string,s?:number,angle?:number}){return <g transform={`translate(${x} ${y}) rotate(${angle})`}><path d="M-10-16Q-12-17-12-12L-11 16Q-10 19-6 19H10Q13 18 12 14L11-13Q10-17 6-16Z" fill="#a77d50" stroke="#342036" strokeWidth="2.4"/><path d="M-10-18L7-19Q11-19 11-14L10 13Q10 16 5 16H-8Q-12 15-12 11L-12-13Q-13-17-10-18Z" fill="#fff0c7" stroke="#342036" strokeWidth="2"/><path d="M-8-12L-6-15L-2-15M6 11L4 13" fill="none" stroke="#c59a68" strokeWidth="1.1"/>{n?<text y="6" x="-1" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="900" fontSize={n.length>1?16:22} fill={['#182638','#078958','#ee8b23','#d22c57'][s]} stroke="#402344" strokeWidth=".5" paintOrder="stroke">{n}</text>:<svg x="-11" y="-13" width="22" height="25" color={['#182638','#078958','#ee8b23','#d22c57'][s]}><SuitEmblem s={s}/></svg>}</g>;}
function Crown(){return <g stroke="#482039" strokeWidth="2.7" strokeLinejoin="round"><path d="M-25-6L-20 16Q0 24 20 16L25-6L12 2L0-16L-12 2Z" fill="#e8a64a"/><path d="M-20 10Q0 17 20 10L18 21Q0 27-18 21Z" fill="#ffe59b"/><path d="M-5 3L0-4L5 3L0 10Z" fill="#e55891"/><circle cx="-25" cy="-8" r="4" fill="#fff0af"/><circle cy="-18" r="4" fill="#fff0af"/><circle cx="25" cy="-8" r="4" fill="#fff0af"/></g>;}
function Trophy(){return <g stroke="#482039" strokeWidth="2.7" strokeLinejoin="round"><path d="M-14-17H-25V-8Q-25 7-10 7M14-17H25V-8Q25 7 10 7" fill="none" stroke="#f2bd66" strokeWidth="5"/><path d="M-18-22Q0-26 18-22L15-3Q12 11 0 12Q-12 11-15-3Z" fill="#ffce6f"/><path d="M-3 11H3V24H-3Z" fill="#e5a150"/><path d="M-16 23Q0 18 16 23L18 29H-18Z" fill="#ffe5a0"/><Spark x={0} y={-9} size={.7}/></g>;}
function Glyph({id}:{id:string}){
 if(id==='first-round')return <><path d="M-29-14Q-13-22 0-15Q13-24 29-16L25 22Q12 17 0 25Q-12 18-26 23Z" fill="#ffe4ab" stroke="#482039" strokeWidth="3"/><path d="M0-14V24M-21-7L-7-5M-22 2L-8 4M8-5L21-8M8 5L20 2" fill="none" stroke="#9d6e67" strokeWidth="2"/><Spark x={0} y={-22} size={.7}/></>;
 if(id==='first-win')return <Trophy/>;
 if(id==='ten-wins')return <><Crown/><text x="0" y="12" textAnchor="middle" fontSize="18" fontWeight="900" fill="#69364e" stroke="#fff0b0" strokeWidth=".6" paintOrder="stroke">10</text></>;
 if(id==='streak')return <><Card x={-13} y={5} n="3" angle={-12}/><path d="M11-30L-2-3H9L3 29L29-8H15L24-30Z" fill="#ffc858" stroke="#482039" strokeWidth="3" strokeLinejoin="round"/></>;
 if(id==='regular')return <><Card x={-12} y={0} angle={-18}/><Card x={9} y={1} n="25" s={2} angle={12}/></>;
 if(id==='all-seats')return <><Card x={-16} y={2} n="3" angle={-13}/><Card x={16} y={2} n="4" s={3} angle={13}/><Spark x={0} y={-22} size={.65}/></>;
 if(id==='pairs'||id==='triple'||id==='four-kind'){const count=id==='pairs'?2:id==='triple'?3:4;return <>{Array.from({length:count},(_,i)=><Card key={i} x={(i-(count-1)/2)*15} y={Math.abs(i-(count-1)/2)*4} n={String(count)} s={i%4} angle={(i-(count-1)/2)*12}/>)}</>;}
 if(id==='straight')return <>{[3,4,5,6,7].map((n,i)=><g transform={`translate(${(i-2)*12} ${10-i*4}) scale(.78)`} key={n}><Card x={0} y={0} n={String(n)} s={i%4} angle={-7+i*3}/></g>)}</>;
 if(id==='flush')return <><Card x={-16} y={5} angle={-22}/><Card x={15} y={4} angle={20}/><Card x={0} y={-7}/><Spark x={24} y={-23} size={.5}/></>;
 if(id==='full-house')return <><path d="M-28-5L0-28L28-5L23 0V25H-24V0Z" fill="#ec9eb3" stroke="#482039" strokeWidth="3"/><Card x={-10} y={10} n="3" s={3}/><Card x={12} y={10} n="2" s={2}/></>;
 if(id==='hundred-tiles')return <><Card x={-15} y={4} angle={-18}/><Card x={15} y={4} angle={16}/><Card x={0} y={-4} n="100" s={2}/></>;
 if(id==='stage-one')return <g stroke="#482039" strokeWidth="3" strokeLinejoin="round"><path d="M-27 25V-9Q-26-34 0-33Q26-34 27-9V25H13V-9Q0-24-13-9V25Z" fill="#b6b5e9"/><path d="M-31 25H31M-27 10H-13M13 10H27M-25-9H-13M13-9H25" fill="none"/><Spark x={0} y={-1} size={.8}/></g>;
 if(id==='stage-five')return <g stroke="#482039" strokeWidth="3" strokeLinejoin="round"><path d="M-21 29L-16-24L0-35L17-24L22 29Z" fill="#9db9ed"/><path d="M-23-8L0-20L25-7L19 0L-18 1ZM-25 15L0 3L26 16L22 22H-21Z" fill="#dbc3ff"/><path d="M0-34V-45L20-38L1-32" fill="#ffb875"/><path d="M-4 26V15H5V26" fill="#673c7e"/></g>;
 if(id==='stage-ten')return <g stroke="#482039" strokeWidth="2.7" strokeLinejoin="round"><path d="M-21-10L-27-29L-10-24L2-33L17-20L30-26L25-4L15 10L21 24L7 22L-1 33L-13 24L-25 27L-18 12L-31 2Z" fill="#ed9273"/><path d="M-21-10L-7-7L-13 3M17-20L11-5L23-9M-15 14L-4 8L9 14L7 23L-5 26Z" fill="#ffe0a1"/><path d="M-9-10L-4-8M8-10L13-11" stroke="#282032" strokeWidth="4"/><path d="M-4 14L0 18L5 14" fill="none"/><path d="M-13-25L-18-38M14-23L22-36" stroke="#ffe0a1" strokeWidth="6"/></g>;
 if(id==='secret-line')return <><path d="M-31 14Q-4-36 31-7M-29 23Q-4-22 30 2" fill="none" stroke="#ed98ce" strokeWidth="7"/><Spark x={9} y={0} size={1.65}/><Spark x={-25} y={-17} size={.6}/></>;
 if(id==='secret-clean')return <><path d="M12-31Q-32-36-31 5Q-26 33 7 29Q23 25 29 11Q-17 21 12-31Z" fill="#ffe2a4" stroke="#482039" strokeWidth="3"/><Card x={12} y={5} s={2} angle={13}/></>;
 if(id==='secret-sun')return <g stroke="#482039" strokeWidth="2.4" strokeLinejoin="round">{Array.from({length:10},(_,i)=><path key={i} d="M-4-24L0-36L5-24Z" transform={`rotate(${i*36})`} fill="#edaa59"/>)}<circle r="23" fill="#ffb86b"/><circle r="17" fill="#ef607e"/><text y="9" textAnchor="middle" fill="#fff1bd" fontSize="27" fontWeight="900" strokeWidth="1.4">2</text></g>;
 if(id==='secret-temper')return <g stroke="#482039" strokeWidth="2.7" strokeLinejoin="round"><path d="M-26 4L-32-10L-20-6L-18-27L-8-15L2-36L11-17L26-25L22-5L33-7L26 9L18 26L-18 29Z" fill="#ed9977"/><path d="M-23 1Q-13-14-2 1Q11-14 24 1L20 12L4 9L-1 4L-5 10L-20 13Z" fill="#fbe8a7"/><circle cx="-12" cy="2" r="4" fill="#50376b"/><circle cx="12" cy="2" r="4" fill="#50376b"/><path d="M-10 22Q0 11 12 21M-20-13L-10-8M14-9L23-16" fill="none"/></g>;
 return <><g transform="translate(0 -4)"><Crown/></g>{[0,1,2,3].map((s,i)=><g key={s} transform={`translate(${(i-1.5)*15} 29) scale(.55)`}><Card x={0} y={0} s={s} angle={(i-1.5)*12}/></g>)}<Spark x={-31} y={-22} size={.7}/><Spark x={31} y={-22} size={.7}/></>;
}

/** Illustrated, worn enamel medals borrow the heavy ink and warm paper of the tiles. */
export default function AchievementMedal({id,earned=false,secret=false}:{id:string,earned?:boolean,secret?:boolean}){
 const uid=useId().replace(/:/g,''),hash=[...id].reduce((v,c)=>v+c.charCodeAt(0),0),[base,light]=palettes[hash%palettes.length];
 return <svg className="achievement-medal" viewBox="0 0 120 136" aria-hidden="true" focusable="false" data-medal={secret?'sealed':id} data-earned={earned}>
  <defs><linearGradient id={`${uid}-metal`} x2=".8" y2="1"><stop stopColor="#fff0b3"/><stop offset=".48" stopColor="#e4ad58"/><stop offset="1" stopColor="#b8754b"/></linearGradient><linearGradient id={`${uid}-enamel`} x2=".8" y2="1"><stop stopColor={secret?'#57446e':light}/><stop offset="1" stopColor={secret?'#2b2141':base}/></linearGradient></defs>
  <path d="M28 86L19 129L41 118L54 131L60 95M65 94L71 131L85 119L107 128L95 84" fill={earned?'#b95793':'#665286'} stroke="#2b1b38" strokeWidth="3" strokeLinejoin="round"/>
  <path d="M32 93L27 118L41 110M86 93L96 117L84 109" fill="none" stroke="#f9a9c1" strokeWidth="2" opacity=".6"/>
  <path d="M59 4L71 12L86 10L94 24L108 31L106 47L115 61L107 75L108 91L93 98L85 113L70 111L57 121L44 111L28 113L22 99L7 91L10 76L2 61L11 47L10 31L24 24L32 10L47 12Z" fill={`url(#${uid}-metal)`} stroke="#35203c" strokeWidth="3.2" strokeLinejoin="round"/>
  <path d="M59 15L70 23L83 20L88 32L100 38L98 51L105 62L98 73L99 85L86 90L81 102L68 101L58 109L47 100L34 103L29 91L17 85L20 72L13 61L21 50L19 38L32 31L37 20L49 23Z" fill={`url(#${uid}-enamel)`} stroke="#694364" strokeWidth="2.4" strokeLinejoin="round"/>
  <path d="M29 33L38 24L47 26M84 93L79 100L70 99M15 58L19 53M98 43L100 48" fill="none" stroke="#fff4c2" strokeWidth="2.2" strokeLinecap="round" opacity=".85"/>
  <g transform="translate(59 62)">{secret?<g stroke="#30203b" strokeWidth="3" strokeLinejoin="round"><path d="M-15-6V-18Q-15-36 0-36Q16-36 16-18V-6" fill="none" stroke="#c2a6de" strokeWidth="7"/><path d="M-23-8L20-10L25 25L-22 28Z" fill="#d2aedb"/><path d="M-7 2Q-6-7 3-5Q16 0 4 9V13" fill="none" stroke="#6d4481" strokeWidth="5" strokeLinecap="round"/><circle cy="21" r="2.5" fill="#6d4481" stroke="none"/></g>:<Glyph id={id}/>}</g>
  <Spark x={15} y={17} size={earned?.65:.45}/><Spark x={103} y={105} size={earned?.7:.4}/>
  {earned&&<path d="M94 11L99 5L103 13L112 14L105 21L106 30L98 26L90 30L91 21L85 15Z" fill="#fff5bb" stroke="#482039" strokeWidth="2"/>}
 </svg>;
}
