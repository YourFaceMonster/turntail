'use client';
import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import type {StoryEventId,StoryEventResult} from '../../lib/rpg-chapters';
import {cue} from '../../lib/sound-cues';
import './story-puzzle.css';

/**
 * Short hands-on story events (20~60 s). Every one can be retried or skipped; nothing here grants a reward
 * or blocks the main story. Results are reported once through done().
 *
 * 2026-11-16 user request ("이벤트 이미지 만들어서 현실적으로, UI도 새롭게, 컨셉은 유지"): ST4·5·8·9 are played on
 * full-screen Codex paintings (portrait 1024×1536 / wide 1672×941). The player touches the things in the picture;
 * hit areas come from docs/st{4,5,8,9}-*-v1-hit-areas.json, in % of the whole image, and the stage keeps the image
 * ratio so those % stay true. ST7 keeps its painted ledger page.
 */
type Props={id:StoryEventId,done:(result:StoryEventResult)=>void,inline?:boolean};
const TITLES:Record<StoryEventId,{title:string,hint:string}>={
 'quest-4':{title:'젖은 기록 맞추기',hint:'아래 조각을 문장 순서대로 눌러 가죽 판에 붙이세요.'},
 'quest-5':{title:'매듭 엮기',hint:'기둥의 풀린 매듭을 하나씩 길게 눌러 단단히 조이세요.'},
 'st7-ledger':{title:'오래된 승부 기록',hint:'네 판의 기록 중 이상한 줄을 하나 고르세요.'},
 'quest-8':{title:'성소 살피기',hint:'흔적이 남은 물건 세 곳을 눌러 가까이 살펴보세요.'},
 'quest-9':{title:'맞물린 문양',hint:'제단의 두 원판을 눌러 돌려, 바로 세우면 맞물립니다.'},
};
const SCENE_EVENTS:readonly StoryEventId[]=['quest-4','quest-5','quest-8','quest-9'];

type Layout='portrait'|'wide';
const SIZE:Record<Layout,{w:number,h:number}>={portrait:{w:1024,h:1536},wide:{w:1672,h:941}};
/** Portrait art on tall screens, wide art on wide ones (server render and tests: portrait). */
function useLayout():Layout{
 const [layout,setLayout]=useState<Layout>('portrait');
 useEffect(()=>{if(typeof matchMedia==='undefined')return;const query=matchMedia('(min-aspect-ratio:1/1)'),apply=()=>setLayout(query.matches?'wide':'portrait');apply();query.addEventListener?.('change',apply);return()=>query.removeEventListener?.('change',apply);},[]);
 return layout;
}

export default function StoryPuzzle({id,done,inline=false}:Props){
 const [solved,setSolved]=useState<string|null>(null),[skipped,setSkipped]=useState<string|null>(null),sent=useRef(false),layout=useLayout();
 const finish=(result:StoryEventResult)=>{if(sent.current)return;sent.current=true;done(result);};
 const win=(text:string)=>{cue('storyCard');setSolved(text);};
 // The ledger keeps its old narration for players who skip, so the clue is never lost.
 const skip=()=>{cue('back');if(id==='st7-ledger')setSkipped('기록의 2등 자리 옆에는 이름 없이 왕관 표식과 빛바랜 문장만 남아 있었다.');else finish('skipped');};
 const ended=!!(solved||skipped),scene=SCENE_EVENTS.includes(id);
 const result=ended&&<div className="story-puzzle-result" role="status"><p>{solved||skipped}</p><button className="primary" onClick={()=>{cue('confirm');finish(solved?'solved':'skipped');}}>계속</button></div>;
 const skipButton=!ended&&<button className="text-btn story-puzzle-skip" onClick={skip}>건너뛰기</button>;
 const play=id==='quest-4'?<Fragments win={win} layout={layout} done={ended}/>:id==='quest-5'?<Knots win={win} layout={layout}/>:id==='quest-8'?<Traces win={win} layout={layout}/>:id==='quest-9'?<Emblems win={win} layout={layout}/>:null;
 const panel=<div className={`story-puzzle-shade ${inline?'is-inline':''} ${scene?'is-scene':''}`} onClick={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>
  {scene?<section className="story-puzzle is-scene" data-puzzle={id} data-layout={layout} data-ended={ended||undefined} role="dialog" aria-modal="true" aria-label={TITLES[id].title}>
   <header><strong>{TITLES[id].title}</strong>{!ended&&<small>{TITLES[id].hint}</small>}</header>
   {play}
   <footer className="story-scene-foot">{result}{skipButton}</footer>
  </section>
  :<section className="story-puzzle" data-puzzle={id} role="dialog" aria-modal="true" aria-label={TITLES[id].title}>
   <header><strong>{TITLES[id].title}</strong>{!ended&&<small>{TITLES[id].hint}</small>}</header>
   {result||<Ledger win={win}/>}
   {skipButton}
  </section>}
 </div>;
 if(inline||typeof document==='undefined')return panel;
 return createPortal(panel,document.body);
}

type Win={win:(text:string)=>void};
type SceneProps=Win&{layout:Layout};
function Shake({on,children,className=''}:{on:number,children:ReactNode,className?:string}){return <div key={on} className={`${className} ${on?'story-puzzle-shake':''}`.trim()||undefined}>{children}</div>;}
/** The painting at its own ratio, as large as the frame allows; children are placed in % of the whole image. */
function Scene({src,layout,children,blur=src,className=''}:{src:string,layout:Layout,children?:ReactNode,blur?:string,className?:string}){
 const {w,h}=SIZE[layout];
 return <div className="story-scene-frame" style={{'--scene-blur':`url('${blur}')`} as CSSProperties}><div className={`story-scene ${className}`} style={{aspectRatio:`${w}/${h}`,'--scene-w':w,'--scene-h':h} as CSSProperties}><img className="story-scene-art" src={src} alt="" aria-hidden="true" width={w} height={h} draggable={false}/>{children}</div></div>;
}
const box=(a:{x:number,y:number,width:number,height:number}):CSSProperties=>({left:`${a.x}%`,top:`${a.y}%`,width:`${a.width}%`,height:`${a.height}%`});
const centred=(a:{center_x:number,center_y:number,width:number,height:number}):CSSProperties=>({left:`${a.center_x-a.width/2}%`,top:`${a.center_y-a.height/2}%`,width:`${a.width}%`,height:`${a.height}%`});

/** ST4: three torn strips, tapped in reading order onto the blank slots of the leather board. A wrong tap scatters them back. */
const STRIPS=['한 문을…','…나누어 맡았다','둘이…'],ORDER=['둘이…','한 문을…','…나누어 맡았다'];
const RECORD_SLOTS:Record<Layout,readonly {x:number,y:number,width:number,height:number}[]>={
 portrait:[{x:17.5,y:34.7,width:65.5,height:11.4},{x:17.5,y:49,width:65.5,height:11.5},{x:17.5,y:63.6,width:65.5,height:11.3}],
 wide:[{x:51.5,y:28,width:36.3,height:14.5},{x:51.5,y:46.5,width:36.3,height:14.1},{x:51.5,y:64,width:36.3,height:13.8}],
};
function Fragments({win,layout,done}:SceneProps&{done:boolean}){
 const [placed,setPlaced]=useState<string[]>([]),[miss,setMiss]=useState(0);
 const pick=(strip:string)=>{const next=[...placed,strip];if(ORDER[placed.length]!==strip){cue('back');setMiss(m=>m+1);setPlaced([]);return;}cue('item');setPlaced(next);if(next.length===ORDER.length)setTimeout(()=>win('“둘이… 한 문을… 나누어 맡았다.” 누가 무엇을 맡았는지는 아직 알 수 없다.'),550);};
 return <><Shake on={miss} className="story-scene-shake"><Scene src={`/story-events/st4-record-scene-${layout}-v1.webp`} layout={layout}>
  <div className="story-record-board" role="group" aria-label="이어 붙인 기록">{RECORD_SLOTS[layout].map((slot,i)=>{const strip=placed[i];return <span key={i} className={`story-record-slot ${strip?'is-filled':''}`} style={box(slot)}>{strip&&<span className="story-strip is-placed" data-piece={ORDER.indexOf(strip)+1}>{strip}</span>}</span>;})}</div>
 </Scene></Shake>
  {!done&&<div className="story-strips story-scene-tray">{STRIPS.map(strip=><button key={strip} className="story-strip" data-piece={ORDER.indexOf(strip)+1} disabled={placed.includes(strip)} onClick={()=>pick(strip)}>{strip}</button>)}</div>}
  {!done&&miss>0&&<small className="story-puzzle-note">조각이 흩어졌어요. 문장이 이어지는 순서를 떠올려 보세요.</small>}</>;
}

/** ST5: three knots on the bridge posts, each held for ~0.9 s. Letting go early lets the rope slip. */
const HOLD_MS=900;
const KNOT_ANCHORS:Record<Layout,readonly {center_x:number,center_y:number,width:number,height:number}[]>={
 portrait:[{center_x:18.5,center_y:54.8,width:27,height:18},{center_x:50,center_y:54.8,width:27,height:18},{center_x:81.2,center_y:54.8,width:27,height:18}],
 wide:[{center_x:25,center_y:60.8,width:20,height:35.54},{center_x:50,center_y:60.8,width:20,height:35.54},{center_x:75,center_y:60.8,width:20,height:35.54}],
};
function Knots({win,layout}:SceneProps){
 const [tied,setTied]=useState<boolean[]>([false,false,false]),[holding,setHolding]=useState<number|null>(null),[slip,setSlip]=useState(0),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const start=(i:number)=>{if(tied[i]||timer.current)return;setHolding(i);timer.current=setTimeout(()=>{timer.current=null;setHolding(null);cue('guard');setTied(list=>{const next=list.map((v,j)=>v||j===i);if(next.every(Boolean))setTimeout(()=>win('세 매듭이 단단히 조여졌다. 다리가 한결 덜 흔들린다.'),500);return next;});},HOLD_MS);};
 const stop=()=>{if(!timer.current)return;clearTimeout(timer.current);timer.current=null;setHolding(null);cue('back');setSlip(s=>s+1);};
 return <><Shake on={slip} className="story-scene-shake"><Scene src={`/story-events/st5-knots-scene-${layout}-v1.webp`} layout={layout} className={tied.every(Boolean)?'is-steady':''}>
  {KNOT_ANCHORS[layout].map((anchor,i)=>{const done=tied[i];return <button key={i} className={`story-knot ${done?'is-tied':''} ${holding===i?'is-holding':''}`} style={{...centred(anchor),'--hold':`${HOLD_MS}ms`} as CSSProperties} disabled={done} aria-label={done?`매듭 ${i+1} 완료`:`매듭 ${i+1} 길게 눌러 조이기`}
   onPointerDown={event=>{event.preventDefault();start(i);}} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onContextMenu={event=>event.preventDefault()} onKeyDown={event=>{if((event.key===' '||event.key==='Enter')&&!event.repeat){event.preventDefault();start(i);}}} onKeyUp={event=>{if(event.key===' '||event.key==='Enter')stop();}}>
   <img src={`/story-events/st5-knot-${done?'tight':'loose'}-v1.webp`} alt="" aria-hidden="true" draggable={false}/><span className="story-knot-hold" aria-hidden="true"/><small>{done?'단단함':'길게 누르기'}</small></button>;})}
 </Scene></Shake>
  <small className="story-puzzle-note">{slip>0&&!tied.every(Boolean)?'줄이 미끄러졌어요. 끝까지 눌러 조여 주세요.':`${tied.filter(Boolean).length}/3 매듭`}</small></>;
}

/** ST7: four old match records; the odd one has an empty first place and only a crown mark in second. */
const LEDGER:readonly {first:string|null,second:string|null,third:string}[]=[
 {first:'브란',second:'모렌',third:'티사'},{first:'칼로',second:'세빈',third:'도르'},{first:null,second:null,third:'하스'},{first:'에반',second:'리온',third:'모렌'},
];
/** Row tap zones on the painted ledger (Codex 2026-11-15, docs/st7-ledger-v2-hit-areas.json), % of the 900×1100 page. */
const LEDGER_ROWS=[{y:32,h:8},{y:40.8,h:8.2},{y:49.8,h:8},{y:58.6,h:8}] as const;
function Ledger({win}:Win){
 const [miss,setMiss]=useState(0);
 const pick=(i:number)=>{if(LEDGER[i].first){cue('back');setMiss(m=>m+1);return;}win('1등 칸은 비어 있고, 2등 칸에만 이름 없는 왕관 표식이 남아 있었다.');};
 return <Shake on={miss}><div className="story-ledger-page is-painted" role="group" aria-label="오래된 승부 기록 · 이상한 줄을 고르세요">{LEDGER.map((row,i)=><button key={i} type="button" className="story-ledger-row" style={{top:`${LEDGER_ROWS[i].y}%`,height:`${LEDGER_ROWS[i].h}%`}} onClick={()=>pick(i)} aria-label={`${i+1}번째 기록 · 1등 ${row.first||'빈칸'} · 2등 ${row.second||'왕관 표식'} · 3등 ${row.third}`}/>)}</div>
  {miss>0&&<small className="story-puzzle-note">그 판은 이름이 모두 적혀 있어요. 빈 곳이 있는 줄을 찾아보세요.</small>}</Shake>;
}

/** ST8: three things in the sanctuary; each opens a close-up showing one trace of the earlier traveller. */
const TRACES=[
 {id:'letters',label:'편지함',text:'주인을 찾지 못한 편지 묶음. 맨 아래 봉투에 왕관 문양이 찍혀 있다.'},
 {id:'stars',label:'별자리판',text:'별을 이은 선 사이에 철문과 성화 문양이 그려져 있다.'},
 {id:'box',label:'봉인된 상자',text:'봉인에 비밀의 열쇠 문양. 누군가 여러 번 열었다 닫은 흔적이 있다.'},
] as const;
type TraceId=typeof TRACES[number]['id'];
const TRACE_AREAS:Record<Layout,Record<TraceId,{x:number,y:number,width:number,height:number}>>={
 portrait:{letters:{x:8,y:49,width:34,height:22},stars:{x:57.5,y:28,width:30.7,height:21.5},box:{x:50,y:62,width:42,height:21.5}},
 wide:{letters:{x:13,y:43,width:19,height:25},stars:{x:39.5,y:28,width:20.5,height:36},box:{x:67,y:51.5,width:23.5,height:32}},
};
function Traces({win,layout}:SceneProps){
 const [seen,setSeen]=useState<TraceId[]>([]),[open,setOpen]=useState<TraceId|null>(null),trace=TRACES.find(t=>t.id===open),openedAt=useRef(0);
 const look=(id:TraceId)=>{cue('click');openedAt.current=Date.now();setOpen(id);if(!seen.includes(id))setSeen([...seen,id]);};
 // A tap that opened the close-up must not also close it (touch screens can follow a tap with a second click).
 const close=()=>{if(Date.now()-openedAt.current<400)return;cue('back');setOpen(null);if(seen.length===TRACES.length)setTimeout(()=>win('세 곳 모두에 같은 문양이 남아 있었다. 먼저 지나간 여행자는 문양을 따라 여기까지 온 것이다.'),350);};
 return <><Scene src={`/story-events/st8-sanctuary-scene-${layout}-v1.webp`} layout={layout}>
  {TRACES.map(t=><button key={t.id} className={`story-trace-spot ${seen.includes(t.id)?'is-seen':''}`} style={box(TRACE_AREAS[layout][t.id])} onClick={()=>look(t.id)} aria-pressed={seen.includes(t.id)} aria-label={`${t.label} 살펴보기${seen.includes(t.id)?' · 살펴봄':''}`}><span>{t.label}{seen.includes(t.id)&&' ✓'}</span></button>)}
  {trace&&<div className="story-closeup" role="dialog" aria-label={`${trace.label} 가까이 보기`} onClick={close}><figure><img src={`/story-events/st8-trace-${trace.id}-v1.webp`} alt={`${trace.label} 확대 그림`} width={768} height={768}/><figcaption><strong>{trace.label}</strong>{trace.text}</figcaption></figure><button className="secondary" onClick={event=>{event.stopPropagation();close();}}>{seen.length===TRACES.length?'다 살펴봤다':'다른 곳 살피기'}</button></div>}
 </Scene>
  <small className="story-puzzle-note">{seen.length}/{TRACES.length} 곳 살핌</small></>;
}

/** ST9: crown and iron-gate discs start turned in the altar sockets; tap to rotate each upright so the altar lights. */
const SOCKETS:Record<Layout,readonly {center_x:number,center_y:number,diameter_x:number,diameter_y:number}[]>={
 portrait:[{center_x:27.4,center_y:55,diameter_x:33,diameter_y:22},{center_x:72.1,center_y:55,diameter_x:33,diameter_y:22}],
 wide:[{center_x:35.8,center_y:58.8,diameter_x:18.5,diameter_y:32.87},{center_x:63.6,center_y:58.8,diameter_x:18.5,diameter_y:32.87}],
};
/** The disc sprites carry transparent padding: the stone fills about 89.5% of the 512px canvas (alpha bbox 26~484). */
const DISC_FILL=458/512;
function Emblems({win,layout}:SceneProps){
 const [turns,setTurns]=useState([2,1]),[locked,setLocked]=useState(false);
 const turn=(i:number)=>{if(locked)return;cue('click');const next=turns.map((t,j)=>j===i?(t+1)%4:t);setTurns(next);if(next.every(t=>t===0)){setLocked(true);cue('guard',.2);setTimeout(()=>win('왕관과 철문이 맞물리자, 제단 앞면의 새김과 똑같은 무늬가 되었다.'),1300);}};
 return <><Scene src={`/story-events/st9-altar-scene-${layout}-v1.webp`} layout={layout} className={`story-altar ${locked?'is-locked':''}`}>
  <img className="story-altar-lit" src={`/story-events/st9-altar-lit-${layout}-v1.webp`} alt="" aria-hidden="true" draggable={false}/>
  {(['crown','gate'] as const).map((disc,i)=>{const s=SOCKETS[layout][i],w=s.diameter_x/DISC_FILL,h=s.diameter_y/DISC_FILL;return <button key={disc} className="story-disc" data-disc={disc} style={{left:`${s.center_x-w/2}%`,top:`${s.center_y-h/2}%`,width:`${w}%`,height:`${h}%`}} disabled={locked} onClick={()=>turn(i)} aria-label={`${disc==='crown'?'왕관':'철문'} 원판 돌리기${turns[i]===0?' · 바로 섬':''}`}><img src={`/story-events/st9-disc-${disc}-v1.webp`} alt="" aria-hidden="true" draggable={false} style={{rotate:`${turns[i]*90}deg`}}/></button>;})}
 </Scene>
  <small className="story-puzzle-note">{locked?'제단에 불이 들어왔다.':`바로 선 원판 ${turns.filter(t=>t===0).length}/2`}</small></>;
}
