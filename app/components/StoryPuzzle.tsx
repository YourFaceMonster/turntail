'use client';
import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import type {StoryEventId,StoryEventResult} from '../../lib/rpg-chapters';
import {SuitEmblem} from './TileFace';
import {cue} from '../../lib/sound-cues';
import './story-puzzle.css';

/**
 * Short hands-on story events (20~60 s). Every one can be retried or skipped; nothing here grants a reward
 * or blocks the main story. Results are reported once through done().
 */
type Props={id:StoryEventId,done:(result:StoryEventResult)=>void,inline?:boolean};
const TITLES:Record<StoryEventId,{title:string,hint:string}>={
 'quest-4':{title:'젖은 기록 맞추기',hint:'찢어진 조각을 문장 순서대로 눌러 이어 붙이세요.'},
 'quest-5':{title:'매듭 엮기',hint:'닳은 매듭을 하나씩 길게 눌러 단단히 조이세요.'},
 'st7-ledger':{title:'오래된 승부 기록',hint:'네 판의 기록 중 이상한 줄을 하나 고르세요.'},
 'quest-8':{title:'성소 살피기',hint:'흔적이 남은 곳 세 군데를 모두 살펴보세요.'},
 'quest-9':{title:'맞물린 문양',hint:'두 문양을 눌러 돌려, 바로 세우면 맞물립니다.'},
};

export default function StoryPuzzle({id,done,inline=false}:Props){
 const [solved,setSolved]=useState<string|null>(null),[skipped,setSkipped]=useState<string|null>(null),sent=useRef(false);
 const finish=(result:StoryEventResult)=>{if(sent.current)return;sent.current=true;done(result);};
 const win=(text:string)=>{cue('storyCard');setSolved(text);};
 // The ledger keeps its old narration for players who skip, so the clue is never lost.
 const skip=()=>{cue('back');if(id==='st7-ledger')setSkipped('기록의 2등 자리 옆에는 이름 없이 왕관 표식과 빛바랜 문장만 남아 있었다.');else finish('skipped');};
 const body=solved||skipped?<div className="story-puzzle-result" role="status"><p>{solved||skipped}</p><button className="primary" onClick={()=>{cue('confirm');finish(solved?'solved':'skipped');}}>계속</button></div>
  :id==='quest-4'?<Fragments win={win}/>:id==='quest-5'?<Knots win={win}/>:id==='st7-ledger'?<Ledger win={win}/>:id==='quest-8'?<Traces win={win}/>:<Emblems win={win}/>;
 const panel=<div className={`story-puzzle-shade ${inline?'is-inline':''}`} onClick={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>
  <section className="story-puzzle" data-puzzle={id} role="dialog" aria-modal="true" aria-label={TITLES[id].title}>
   <header><strong>{TITLES[id].title}</strong>{!solved&&!skipped&&<small>{TITLES[id].hint}</small>}</header>
   {body}
   {!solved&&!skipped&&<button className="text-btn story-puzzle-skip" onClick={skip}>건너뛰기</button>}
  </section>
 </div>;
 if(inline||typeof document==='undefined')return panel;
 return createPortal(panel,document.body);
}

type Win={win:(text:string)=>void};
function Shake({on,children}:{on:number,children:ReactNode}){return <div key={on} className={on?'story-puzzle-shake':''}>{children}</div>;}

/** ST4: three torn strips, tapped in reading order. A wrong tap scatters them back. */
const STRIPS=['한 문을…','…나누어 맡았다','둘이…'],ORDER=['둘이…','한 문을…','…나누어 맡았다'];
function Fragments({win}:Win){
 const [placed,setPlaced]=useState<string[]>([]),[miss,setMiss]=useState(0);
 const pick=(strip:string)=>{const next=[...placed,strip];if(ORDER[placed.length]!==strip){cue('back');setMiss(m=>m+1);setPlaced([]);return;}cue('click');setPlaced(next);if(next.length===ORDER.length)setTimeout(()=>win('“둘이… 한 문을… 나누어 맡았다.” 누가 무엇을 맡았는지는 아직 알 수 없다.'),350);};
 return <Shake on={miss}><div className="story-strips-board" aria-label="이어 붙인 기록">{ORDER.map((_,i)=><span key={i} className="story-strip-slot">{placed[i]||''}</span>)}</div>
  <div className="story-strips">{STRIPS.map(strip=><button key={strip} className="story-strip" data-piece={ORDER.indexOf(strip)+1} disabled={placed.includes(strip)} onClick={()=>pick(strip)}>{strip}</button>)}</div>
  {miss>0&&<small className="story-puzzle-note">조각이 흩어졌어요. 문장이 이어지는 순서를 떠올려 보세요.</small>}</Shake>;
}

/** ST5: three knots, each held for ~0.9 s. Letting go early lets the rope slip. */
const HOLD_MS=900;
function Knots({win}:Win){
 const [tied,setTied]=useState<boolean[]>([false,false,false]),[holding,setHolding]=useState<number|null>(null),[slip,setSlip]=useState(0),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const start=(i:number)=>{if(tied[i]||timer.current)return;setHolding(i);timer.current=setTimeout(()=>{timer.current=null;setHolding(null);cue('guard');setTied(list=>{const next=list.map((v,j)=>v||j===i);if(next.every(Boolean))setTimeout(()=>win('세 매듭이 단단히 조여졌다. 다리가 한결 덜 흔들린다.'),300);return next;});},HOLD_MS);};
 const stop=()=>{if(!timer.current)return;clearTimeout(timer.current);timer.current=null;setHolding(null);cue('back');setSlip(s=>s+1);};
 return <Shake on={slip}><div className="story-knots">{tied.map((done,i)=><button key={i} className={`story-knot ${done?'is-tied':''} ${holding===i?'is-holding':''}`} style={{'--hold':`${HOLD_MS}ms`} as CSSProperties} disabled={done} aria-label={done?`매듭 ${i+1} 완료`:`매듭 ${i+1} 길게 눌러 조이기`}
   onPointerDown={event=>{event.preventDefault();start(i);}} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onKeyDown={event=>{if((event.key===' '||event.key==='Enter')&&!event.repeat){event.preventDefault();start(i);}}} onKeyUp={event=>{if(event.key===' '||event.key==='Enter')stop();}}><i aria-hidden="true"/><small>{done?'단단함':'길게 누르기'}</small></button>)}</div>
  {slip>0&&<small className="story-puzzle-note">줄이 미끄러졌어요. 끝까지 눌러 조여 주세요.</small>}</Shake>;
}

/** ST7: four old match records; the odd one has an empty first place and only a crown mark in second. */
const LEDGER:readonly {first:string|null,second:string|null,third:string}[]=[
 {first:'브란',second:'모렌',third:'티사'},{first:'칼로',second:'세빈',third:'도르'},{first:null,second:null,third:'하스'},{first:'에반',second:'리온',third:'모렌'},
];
function Ledger({win}:Win){
 const [miss,setMiss]=useState(0);
 const pick=(i:number)=>{if(LEDGER[i].first){cue('back');setMiss(m=>m+1);return;}win('1등 칸은 비어 있고, 2등 칸에만 이름 없는 왕관 표식이 남아 있었다.');};
 return <Shake on={miss}><div className="story-ledger-page"><table className="story-ledger"><thead><tr><th>판</th><th>1등</th><th>2등</th><th>3등</th></tr></thead><tbody>{LEDGER.map((row,i)=><tr key={i}><td><button onClick={()=>pick(i)} aria-label={`${i+1}번째 기록 고르기`}>{i+1}</button></td><td>{row.first||<span className="story-ledger-blank" aria-label="빈칸"/>}</td><td>{row.second||<span className="story-ledger-crown" aria-label="왕관 표식"><SuitEmblem s={3}/></span>}</td><td>{row.third}</td></tr>)}</tbody></table></div>
  {miss>0&&<small className="story-puzzle-note">그 판은 이름이 모두 적혀 있어요. 빈 곳이 있는 줄을 찾아보세요.</small>}</Shake>;
}

/** ST8: three places to look at; each shows one trace of the earlier traveller. */
const TRACES=[
 {id:'letters',label:'편지함',text:'주인을 찾지 못한 편지 묶음. 맨 아래 봉투에 왕관 문양이 찍혀 있다.'},
 {id:'stars',label:'별자리판',text:'별을 이은 선 사이에 철문과 성화 문양이 그려져 있다.'},
 {id:'box',label:'봉인된 상자',text:'봉인에 비밀의 열쇠 문양. 누군가 여러 번 열었다 닫은 흔적이 있다.'},
] as const;
function Traces({win}:Win){
 const [seen,setSeen]=useState<string[]>([]);
 const look=(id:string)=>{if(seen.includes(id))return;cue('click');const next=[...seen,id];setSeen(next);if(next.length===TRACES.length)setTimeout(()=>win('세 곳 모두에 같은 문양이 남아 있었다. 먼저 지나간 여행자는 문양을 따라 여기까지 온 것이다.'),900);};
 return <div className="story-traces">{TRACES.map(trace=><button key={trace.id} className={seen.includes(trace.id)?'is-seen':''} onClick={()=>look(trace.id)} aria-pressed={seen.includes(trace.id)}><strong>{trace.label}</strong><small>{seen.includes(trace.id)?trace.text:'살펴보기'}</small></button>)}<small className="story-puzzle-note">{seen.length}/{TRACES.length} 곳 살핌</small></div>;
}

/** ST9: crown and iron gate start turned; tap to rotate each upright so they interlock like the altar relief. */
function Emblems({win}:Win){
 const [turns,setTurns]=useState([2,1]),[locked,setLocked]=useState(false);
 const turn=(i:number)=>{if(locked)return;cue('click');const next=turns.map((t,j)=>j===i?(t+1)%4:t);setTurns(next);if(next.every(t=>t===0)){setLocked(true);setTimeout(()=>win('왕관과 철문이 맞물리자, 제단 앞면의 새김과 똑같은 무늬가 되었다.'),700);}};
 return <div className={`story-emblems ${locked?'is-locked':''}`}>{[3,0].map((suit,i)=><button key={suit} className="story-emblem" data-suit={suit} style={{rotate:`${turns[i]*90}deg`}} onClick={()=>turn(i)} aria-label={`${suit===3?'왕관':'철문'} 문양 돌리기${turns[i]===0?' · 바로 섬':''}`}><SuitEmblem s={suit}/></button>)}</div>;
}
