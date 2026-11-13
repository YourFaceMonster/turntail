"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {BookOpen,ChevronLeft,ChevronRight,Shield,Sparkles} from 'lucide-react';
import TileFace,{SuitEmblem} from './TileFace';
import TileBack from './TileBack';
import {suits,type Tile} from '../../lib/game';
import {TUTORIAL_LESSONS as lessons,tutorialAnswer} from '../../lib/tutorial';
import {rpgHandSettlement,rpgOverflowSettlement} from '../../lib/rpg-rework';
import {relicImage} from '../../lib/item-battle-relics';
import './tutorial-0647.css';

/** RPG journey rules (2026-11-10). Demo numbers come from the live settlement functions, never hand-typed. */
const RPG_NAMES=['나','AI 1','AI 2'];
const handDemo=rpgHandSettlement([0,4,8],[0,1,2]);
const overflowDemo=(()=>{const counts=[0,6,4],seats=[0,1,2],{delta,transfers}=rpgHandSettlement(counts,seats);return {before:[95,50,50],...rpgOverflowSettlement([95,50,50],[100,100,100],delta,counts,transfers,seats)};})();
const rpgLessons=[
 {title:'남은 패 수만큼 HP가 오가요',text:'한 판이 끝나면 두 명씩 남은 패를 비교해요. 더 많이 남긴 쪽이 자기 패 수만큼 HP를 잃고, 적게 남긴 쪽이 그만큼 얻어요.'},
 {title:'넘친 회복은 반격이 돼요',text:'HP가 가득 찬 상태에서 더 받으면, 넘친 만큼이 나에게 HP를 준 상대들에게 준 비율대로 피해로 돌아가요. 적에게도 같은 규칙이에요.'},
 {title:'이기면 바닥을 정찰해요',text:'족보로 싸움에서 이기면 바닥의 뒤집힌 위층 패를 몰래 볼 수 있어요. 내게만 보이고, 상대와 AI는 볼 수 없어요.'},
 {title:'유물과 스테이지 진행',text:'유물은 3개까지 장착하고 조건을 채우면 자동으로 발동해요. AI 한 명의 HP가 0이 되면 스테이지 클리어, 내 HP가 0이 되면 운명력 1개로 다시 도전해요.'},
];
type LessonFlight={tile:Tile,sx:number,sy:number,ex:number,ey:number,width:number,height:number,draw?:boolean};

export default function TutorialGuide({close}:{close:()=>void}){
 const [chapter,setChapter]=useState<'basic'|'rpg'>('basic'),[step,setStep]=useState(0),[itemStep,setItemStep]=useState(0),[selected,setSelected]=useState<number[]>([]),[done,setDone]=useState(false),[message,setMessage]=useState(''),[picked,setPicked]=useState(false),[finish,setFinish]=useState(0),[revealed,setRevealed]=useState(false);
 const [flights,setFlights]=useState<LessonFlight[]>([]),[played,setPlayed]=useState<Tile[]>([]),[drawn,setDrawn]=useState<Tile|null>(null),[animating,setAnimating]=useState(false),handRef=useRef<HTMLDivElement>(null),tableRef=useRef<HTMLDivElement>(null),busyRef=useRef(false),flightTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(flightTimer.current)clearTimeout(flightTimer.current);},[]);
 const l=lessons[step],basic=chapter==='basic',index=basic?step:itemStep,total=basic?lessons.length:rpgLessons.length;
 function reset(){if(flightTimer.current)clearTimeout(flightTimer.current);busyRef.current=false;setAnimating(false);setFlights([]);setPlayed([]);setDrawn(null);setSelected([]);setDone(false);setMessage('');setPicked(false);setFinish(0);}
 function nextFeel(){try{if(localStorage.getItem('jangseong-haptic')!=='off'&&navigator.vibrate)navigator.vibrate(12);}catch{}}
 function move(to:number){if(to>index)nextFeel();reset();if(basic)setStep(to);else{setItemStep(to);setRevealed(false);}}
 function fly(tiles:Tile[],land:()=>void,draw=false){
  if(busyRef.current)return;const target=(draw?handRef.current:tableRef.current?.querySelector('.tutorial-tiles'))?.getBoundingClientRect(),back=tableRef.current?.querySelector('.tutorial-back .tile')?.getBoundingClientRect();
  const moves=tiles.flatMap((tile,index)=>{const source=draw?back:handRef.current?.querySelector(`[data-tutorial-hand="${tile.id}"] .tile`)?.getBoundingClientRect();if(!source||!target)return [];return [{tile,sx:source.left,sy:source.top,ex:target.left+target.width/2-(tiles.length*(source.width+5)-5)/2+index*(source.width+5),ey:target.top+target.height/2-source.height/2,width:source.width,height:source.height,draw}];});
  if(!moves.length||matchMedia('(prefers-reduced-motion: reduce)').matches){land();return;}busyRef.current=true;setAnimating(true);setFlights(moves);
  flightTimer.current=setTimeout(()=>{busyRef.current=false;setAnimating(false);setFlights([]);land();},520+(tiles.length-1)*30);
 }
 function play(tiles:Tile[],land:()=>void){fly(tiles,()=>{setPlayed(tiles);land();});}
 function take(){if(!picked||busyRef.current)return;const tile={id:30,n:8,s:2};fly([tile],()=>{setDrawn(tile);setDone(true);setMessage('비밀 패를 가져왔어요. 바로 내지 않고 차례를 넘깁니다.');},true);}
 function tap(tile:Tile){if(done||busyRef.current||l.kind==='draw')return;setMessage('');if(l.kind==='color'||l.kind==='number'){setSelected([tile.id]);const ok=tutorialAnswer(l,[tile.id]);if(ok)play([tile],()=>{setDone(true);setMessage('맞아요! 다음 단계로 가볼까요?');});else setMessage('강한 순서를 다시 보고 선택해보세요.');return;}
  const limit=l.kind==='pair'?2:l.kind==='triple'?3:l.kind==='five'?5:1;setSelected(old=>old.includes(tile.id)?old.filter(id=>id!==tile.id):[...old,tile.id].slice(-limit));
 }
 function submit(){if(busyRef.current)return;const ok=tutorialAnswer(l,selected,finish);if(!ok){setMessage('안내에 맞는 패를 골라 다시 내보세요.');return;}play(l.hand.filter(tile=>selected.includes(tile.id)),()=>{if(l.kind==='finish'&&!finish){setFinish(1);setSelected([]);setMessage('상대 두 명이 한 장씩 가져왔어요. 다시 내가 선! 이제 마지막 3을 내세요.');return;}setDone(true);setMessage('좋아요! 직접 한 수를 익혔어요.');});}
 const actionDisabled=animating||basic&&!done&&(['color','number'].includes(l.kind)|| (l.kind==='draw'?!picked:!selected.length));
 return <div className="modal-shade tutorial-shade"><section className="modal tutorial-modal menu-surface" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
  <button className="close" onClick={close} aria-label="튜토리얼 닫기">×</button>
  <header className="tutorial-heading"><span className="tutorial-book" aria-hidden="true"><BookOpen/></span><div><span className="eyebrow">TURNTALE GUIDE</span><h2 id="tutorial-title">한 수씩 배워볼까요?</h2><p>직접 눌러 익히는 턴테일</p></div></header>
  <div className="tutorial-chapters" role="group" aria-label="배울 내용"><button aria-pressed={basic} onClick={()=>{setChapter('basic');reset();}}><BookOpen/>패와 기본 규칙</button><button aria-pressed={!basic} onClick={()=>{setChapter('rpg');reset();}}><Sparkles/>스토리모드 규칙</button></div>
  <div className="tutorial-progress"><span>{basic?'기본 연습':'스토리모드'} <b>{index+1} / {total}</b></span><progress value={index+1} max={total} aria-label="현재 학습 단계"/></div>
  <div className="tutorial-lesson-copy"><h3>{basic?l.title:rpgLessons[itemStep].title}</h3><p className="guide-copy">{basic?l.text:rpgLessons[itemStep].text}</p></div>
  {basic?<>
   {l.kind==='color'?<div className="tutorial-order" aria-label="왕관 비밀의 열쇠 성화 철문 순서">{[3,1,2,0].map((s,i)=><span key={s}><i className={`suit${s}`}><SuitEmblem s={s}/>{suits[s]}</i>{i<3&&'›'}</span>)}</div>:l.kind==='number'?<p className="tutorial-rank">2 <b>›</b> 1 <b>›</b> 15 <b>›</b> … <b>›</b> 3</p>:l.kind==='five'?<p className="tutorial-five-order">스트레이트 ‹ 플러시 ‹ 풀하우스 ‹ 포카드 ‹ 스트레이트 플러시</p>:null}
   <div className="tutorial-table" ref={tableRef} data-tutorial-landing={played.length>0}><small>{played.length?'내가 낸 패':l.target.length?'상대가 낸 패':l.kind==='finish'&&finish?'다시 내가 선':'내가 선 · 원하는 조합으로 시작'}</small><div className="tutorial-tiles">{(played.length?played:l.target).map(t=><TileFace key={t.id} tile={t}/>)}{!played.length&&!l.target.length&&<span className="tutorial-table-mark" aria-hidden="true">✦</span>}</div>{l.kind==='draw'&&<button className={`tutorial-back ${picked?'selected':''}`} disabled={done||animating} style={{visibility:animating||drawn?'hidden':'visible'}} onClick={()=>setPicked(true)} aria-pressed={picked} aria-label="바닥 비밀 패 선택"><TileBack/><small>위층 패</small></button>}</div>
   <div className={`helper-bubble ${done?'is-correct':''}`} role="status"><span aria-hidden="true">{done?'✓':'✦'}</span><p>{message||(l.kind==='draw'?'바닥 뒷면 패를 누른 뒤 가져오세요.':l.kind==='pair'?'같은 숫자 7 두 장을 선택하세요.':l.kind==='triple'?'같은 숫자 7 세 장을 선택하세요.':l.kind==='five'?'7 세 장과 9 두 장을 선택하세요.':'안내에 맞는 패를 직접 눌러보세요.')}</p></div>
   <div className="tutorial-tiles tutorial-hand" ref={handRef} role="group" aria-label="연습 손패">{[...l.hand,...(drawn?[drawn]:[])].filter(t=>!(l.kind==='finish'&&finish&&t.n===2)).map(t=><button key={t.id} data-tutorial-hand={t.id} disabled={done||animating||l.kind==='draw'} style={{visibility:played.some(tile=>tile.id===t.id)||flights.some(f=>!f.draw&&f.tile.id===t.id)?'hidden':'visible'}} className={selected.includes(t.id)?'selected':''} onClick={()=>tap(t)} aria-pressed={selected.includes(t.id)} aria-label={`${suits[t.s]} ${t.n}`}><TileFace tile={t}/></button>)}</div>
  </>:<div className="tutorial-item-stage">
   {itemStep===0&&<><div className="tutorial-hp-demo"><Shield aria-hidden="true"/><span>예시 · 남은 패 <b>0 · 4 · 8장</b></span><small>내가 먼저 다 냈어요</small></div><ul className="tutorial-rule-list tutorial-settle-demo">{RPG_NAMES.map((name,seat)=>{const d=handDemo.delta[seat];return <li key={name}><b>{name}</b> 남은 패 {[0,4,8][seat]}장 → <span className={d>0?'hp-recovered':d<0?'hp-lost':''}>HP {d>0?`+${d}`:d<0?`−${-d}`:'±0'}</span></li>;})}</ul><p className="tutorial-tip">AI 2는 나에게 8, AI 1에게 8을 줘서 −16이에요. 패를 빨리 털수록 유리해요.</p></>}
   {itemStep===1&&<><div className="tutorial-hp-demo"><Shield aria-hidden="true"/><span>예시 · 내 HP <b>95/100</b></span><small>AI 1이 6장, AI 2가 4장 남김</small></div><ul className="tutorial-rule-list tutorial-settle-demo">{RPG_NAMES.map((name,seat)=><li key={name}><b>{name}</b> HP {overflowDemo.before[seat]} → {overflowDemo.hp[seat]}{overflowDemo.dealt[seat]?<span className="hp-lost"> · 넘친 회복 → 상대 피해 {overflowDemo.dealt[seat]}</span>:null}{overflowDemo.taken[seat]?<span className="hp-lost"> · 넘친 회복 피해 −{overflowDemo.taken[seat]}</span>:null}</li>)}</ul><p className="tutorial-tip">+10 중 5만 채우고, 넘친 5는 준 비율(6:4)대로 3과 2로 돌아가요. AI 2는 AI 1에게 받은 +2가 반격 −2로 상쇄돼 그대로예요.</p></>}
   {itemStep===2&&<><div className="tutorial-coin-stack"><span className="tutorial-coin-lower">{revealed?<TileFace tile={{id:26,n:7,s:2}}/>:<TileBack/>}</span>{!revealed&&<button aria-label="위층 패 정찰하기" onClick={()=>setRevealed(true)}><TileBack/><small>눌러서 몰래 보기</small></button>}</div><p className="tutorial-coin-result" role="status">{revealed?'성화 7이었어요! 이 정보는 나만 알아요.':'페어로 이겼어요. 위층 패 1장을 볼 수 있어요.'}</p><ul className="tutorial-rule-list"><li>페어 1장 · 트리플 2장 · 5장 족보 3장 · 포카드 4장 · 스트레이트 플러시 5장.</li><li>뒤집힌 위층 패만 보이고, 누가 가져가면 정보는 사라져요.</li><li>손패를 모두 낸 마지막 승리는 다음 판 시작 때 1장 정찰로 바뀌어요.</li></ul></>}
   {itemStep===3&&<><div className="tutorial-kit-art" aria-hidden="true"><img src={relicImage('gamblers-gloves')} alt=""/><img src={relicImage('cracked-heart')} alt=""/><img src={relicImage('recovery-lantern')} alt=""/></div><ul className="tutorial-rule-list"><li>유물은 3개까지 장착해요. 대결 중에는 바꿀 수 없어요.</li><li>AI 한 명의 HP가 0이 되면 스테이지 클리어, 유물 보상을 골라요.</li><li>내 HP가 0이 되면 운명력 1개를 써서 그 스테이지에 다시 도전해요.</li><li>새 영역에 들어서면 HP가 100으로 회복되고, 유물은 1개만 이어져요.</li></ul></>}
  </div>}
  <footer className="tutorial-actions"><button className="secondary tutorial-back-step" disabled={index===0||animating} onClick={()=>move(index-1)}><ChevronLeft/>이전</button>
   {basic&&!done?<button className="primary" disabled={actionDisabled} onClick={()=>{if(l.kind==='draw')take();else submit();}}>{animating?'패 이동 중…':['color','number'].includes(l.kind)?'패를 눌러 선택하세요':l.kind==='draw'?'1장 가져오기':'선택한 패 내기'}</button>:index<total-1?<button className="primary" onClick={()=>move(index+1)}>다음 단계<ChevronRight/></button>:basic?<button className="primary" onClick={()=>{nextFeel();setChapter('rpg');reset();}}>스토리모드 규칙도 알아보기<ChevronRight/></button>:<button className="primary" onClick={()=>{nextFeel();close();}}>배우기 완료</button>}
  </footer><button className="text-btn tutorial-exit" onClick={close}>닫고 메뉴로 돌아가기</button>
 </section>{flights.length>0&&typeof document!=='undefined'&&createPortal(<div className="tutorial-flight-layer" aria-hidden="true">{flights.map((flight,i)=><span key={flight.tile.id} className="tutorial-flying-tile" style={{left:flight.sx,top:flight.sy,width:flight.width,height:flight.height,'--tutorial-flight-x':`${flight.ex-flight.sx}px`,'--tutorial-flight-y':`${flight.ey-flight.sy}px`,animationDelay:`${i*30}ms`} as CSSProperties}>{flight.draw?<TileBack/>:<TileFace tile={flight.tile}/>}</span>)}</div>,document.body)}</div>;
}
