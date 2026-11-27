"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {BookOpen,ChevronLeft,ChevronRight,Shield} from 'lucide-react';
import OneMovePuzzle from './OneMovePuzzle';
import TileFace,{SuitEmblem} from './TileFace';
import TileBack from './TileBack';
import {suits,type Tile} from '../../lib/game';
import {TUTORIAL_LESSONS as lessons,tutorialAnswer} from '../../lib/tutorial';
import {rpgHandSettlement,rpgOverflowSettlement} from '../../lib/rpg-rework';
import {relicImage} from '../../lib/item-battle-relics';
import './tutorial-0647.css';
import './flat-tiles.css';
import './tutorial-fix-2026-11-19.css';
import './tutorial-fit-2026-11-24.css';
import {tr} from '../../lib/i18n/index.ts';

/** RPG journey rules (2026-11-10). Demo numbers come from the live settlement functions, never hand-typed. */
const RPG_NAMES=[tr('나'),'상대 1','상대 2'];
const handDemo=rpgHandSettlement([0,4,8],[0,1,2]);
const overflowDemo=(()=>{const counts=[0,6,4],seats=[0,1,2],{delta,transfers}=rpgHandSettlement(counts,seats);return {before:[95,50,50],delta,...rpgOverflowSettlement([95,50,50],[100,100,100],delta,counts,transfers,seats)};})();
const rpgLessons=[
 {title:tr('남은 패 수만큼 HP가 오가요'),text:tr('한 판이 끝나면 두 명씩 남은 패를 비교해요. 더 많이 남긴 쪽이 자기 패 수만큼 HP를 잃고, 적게 남긴 쪽이 그만큼 얻어요.')},
 {title:tr('넘친 회복은 반격이 돼요'),text:tr('HP가 가득 찬 상태에서 더 회복하면, 넘친 만큼은 나에게 HP를 준 상대들에게 피해로 돌아가요. 준 만큼의 비율로 나눠요. 상대도 같은 규칙이에요.')},
 {title:tr('이기면 바닥을 정찰해요'),text:tr('족보 싸움에서 이기면 바닥의 뒤집힌 위층 패를 몰래 볼 수 있어요. 나에게만 보여요.')},
 {title:tr('유물과 스테이지 진행'),text:tr('유물은 조건을 채우면 저절로 발동해요. 스테이지를 넘길 때마다 새 유물을 골라요.')},
];
type LessonFlight={tile:Tile,sx:number,sy:number,ex:number,ey:number,width:number,height:number,draw?:boolean};

export default function TutorialGuide({close,guided}:{close:()=>void,guided?:()=>void}){
 const [chapter,setChapter]=useState<'basic'|'rpg'|'puzzle'>('basic'),[step,setStep]=useState(0),[itemStep,setItemStep]=useState(0),[selected,setSelected]=useState<number[]>([]),[done,setDone]=useState(false),[message,setMessage]=useState(''),[picked,setPicked]=useState(false),[finish,setFinish]=useState(0),[revealed,setRevealed]=useState(false);
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
 function take(){if(!picked||busyRef.current)return;const tile={id:30,n:8,s:2};fly([tile],()=>{setDrawn(tile);setDone(true);setMessage(tr('비밀 패를 가져왔어요. 바로 내지 않고 차례를 넘깁니다.'));},true);}
 function tap(tile:Tile){if(done||busyRef.current||l.kind==='draw'||l.kind==='goal')return;setMessage('');if(l.kind==='color'||l.kind==='number'){setSelected([tile.id]);const ok=tutorialAnswer(l,[tile.id]);if(ok)play([tile],()=>{setDone(true);setMessage('');});else setMessage(tr('강한 순서를 다시 보고 선택해보세요.'));return;}
  const limit=l.kind==='pair'?2:l.kind==='triple'?3:l.kind==='five'?5:1;setSelected(old=>old.includes(tile.id)?old.filter(id=>id!==tile.id):[...old,tile.id].slice(-limit));
 }
 function submit(){if(busyRef.current)return;const ok=tutorialAnswer(l,selected,finish);if(!ok){setMessage(tr('안내에 맞는 패를 골라 다시 내보세요.'));return;}play(l.hand.filter(tile=>selected.includes(tile.id)),()=>{if(l.kind==='finish'&&!finish){setFinish(1);setSelected([]);setMessage(tr('상대 두 명이 한 장씩 가져왔어요. 다시 내가 선! 이제 마지막 3을 내세요.'));return;}setDone(true);setMessage('');});}
 // The goal page only explains: nothing to pick, the next button is ready at once.
 const goal=basic&&l.kind==='goal',lessonDone=done||goal;
 const actionDisabled=animating||basic&&!lessonDone&&(['color','number'].includes(l.kind)|| (l.kind==='draw'?!picked:!selected.length));
 return <div className="modal-shade tutorial-shade"><section className="modal tutorial-modal menu-surface flat-tiles" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
  <button className="close" onClick={close} aria-label={tr('튜토리얼 닫기')}>×</button>
  <header className="tutorial-heading"><span className="tutorial-book" aria-hidden="true"><BookOpen/></span><h2 id="tutorial-title">{tr('게임 규칙')}</h2></header>
  <div className="tutorial-chapters" role="group" aria-label={tr('배울 내용')}><button aria-pressed={basic} onClick={()=>{setChapter('basic');reset();}}>{tr('기본 규칙')}</button><button aria-pressed={chapter==='rpg'} onClick={()=>{setChapter('rpg');reset();}}>{tr('스토리모드')}</button><button aria-pressed={chapter==='puzzle'} onClick={()=>{setChapter('puzzle');reset();}}>{tr('한 수 퍼즐')}</button></div>
  {chapter==='puzzle'?<OneMovePuzzle/>:<>
  {/* 2026-11-24: the guide fits one screen. Info column (step, rule, order) and play column (table, hint, hand, buttons)
      stack on a phone held upright and sit side by side on a wide, short screen. */}
  <div className="tutorial-col-info">
  {basic&&index===0&&guided&&<button type="button" className="tutorial-guided-start" onClick={guided}>{tr('연습 판으로 따라 하기')}<small>{tr('약 2분')}</small></button>}
  <div className="tutorial-progress"><span>{basic?tr('기본 연습'):tr('스토리모드')} <b>{index+1} / {total}</b></span><progress value={index+1} max={total} aria-label={tr('현재 학습 단계')}/></div>
  <div className="tutorial-lesson-copy"><h3>{basic?l.title:rpgLessons[itemStep].title}</h3><p className="guide-copy">{basic?l.text:rpgLessons[itemStep].text}</p></div>
  {basic&&(l.kind==='color'?<div className="tutorial-order" aria-label={tr('왕관 열쇠 성화 철문 순서')}>{[3,1,2,0].map((s,i)=><span key={s}><i className={`suit${s}`}><SuitEmblem s={s}/>{suits[s]}</i>{i<3&&'›'}</span>)}</div>:l.kind==='number'?<p className="tutorial-rank">2 <b>›</b> 1 <b>›</b> 15 <b>›</b> … <b>›</b> 3</p>:l.kind==='five'?<p className="tutorial-five-order">{tr('스트레이트 ‹ 플러시 ‹ 풀하우스 ‹ 포카드 ‹ 스트레이트 플러시')}</p>:null)}
  </div>
  <div className="tutorial-col-play">
  {basic?<>
   <div className="tutorial-table" ref={tableRef} data-tutorial-landing={played.length>0}><small>{played.length?(l.target.length?tr('상대 패 위에 내가 낸 패'):tr('내가 낸 패')):l.target.length?tr('상대가 낸 패'):goal?tr('가운데 바닥 · 이곳에 패를 내요'):l.kind==='finish'&&finish?tr('다시 내가 선'):tr('내가 선 · 원하는 조합으로 시작')}</small>{played.length>0&&l.target.length>0&&<div className="tutorial-beaten" aria-label={tr('상대가 냈던 패')}>{l.target.map(t=><TileFace key={t.id} tile={t}/>)}</div>}<div className="tutorial-tiles">{(played.length?played:l.target).map(t=><TileFace key={t.id} tile={t}/>)}</div>{l.kind==='draw'&&<button className={`tutorial-back ${picked?'selected':''}`} disabled={done||animating} style={{visibility:animating||drawn?'hidden':'visible'}} onClick={()=>setPicked(true)} aria-pressed={picked} aria-label={tr('바닥 비밀 패 선택')}><TileBack/><small>{tr('위층 패')}</small></button>}</div>
   <div className={`helper-bubble ${done?'is-correct':''}`} role="status">{done&&<span aria-hidden="true">✓</span>}<p>{goal?l.tip:done?<>{message}<small className="tutorial-tip-line">{l.tip}</small></>:message||(l.kind==='draw'?tr('바닥 뒷면 패를 누른 뒤 가져오세요.'):l.kind==='pair'?tr('같은 숫자 7 두 장을 선택하세요.'):l.kind==='triple'?tr('같은 숫자 7 세 장을 선택하세요.'):l.kind==='five'?tr('7 세 장과 9 두 장을 선택하세요.'):tr('안내에 맞는 패를 직접 눌러보세요.'))}</p></div>
   <div className="tutorial-tiles tutorial-hand" ref={handRef} role="group" aria-label={tr('연습 손패')}>{[...l.hand,...(drawn?[drawn]:[])].filter(t=>!(l.kind==='finish'&&finish&&t.n===2)).map(t=><button key={t.id} data-tutorial-hand={t.id} disabled={done||animating||l.kind==='draw'||goal} style={played.some(tile=>tile.id===t.id)?{display:'none'}:{visibility:flights.some(f=>!f.draw&&f.tile.id===t.id)?'hidden':'visible'}} className={selected.includes(t.id)?'selected':''} onClick={()=>tap(t)} aria-pressed={selected.includes(t.id)} aria-label={`${suits[t.s]} ${t.n}`}><TileFace tile={t}/></button>)}</div>
  </>:<div className="tutorial-item-stage">
   {itemStep===0&&<><div className="tutorial-hp-demo"><Shield aria-hidden="true"/><span>{tr('예시 · 남은 패')} <b>{tr('0 · 4 · 8장')}</b></span><small>{tr('내가 먼저 다 냈어요')}</small></div><ul className="tutorial-rule-list tutorial-settle-demo">{RPG_NAMES.map((name,seat)=>{const d=handDemo.delta[seat];return <li key={name}><b>{name}</b> {tr('남은 패 {0}장 →',{0:[0,4,8][seat]})} <span className={d>0?'hp-recovered':d<0?'hp-lost':''}>HP {d>0?`+${d}`:d<0?`−${-d}`:'±0'}</span></li>;})}</ul><p className="tutorial-tip">{tr('상대 2는 나에게 8, 상대 1에게 8을 줘서 −16이에요. 패를 빨리 털수록 유리해요.')}</p></>}
   {itemStep===1&&<><div className="tutorial-hp-demo"><Shield aria-hidden="true"/><span>{tr('예시 · 내 HP')} <b>95/100</b></span><small>{tr('상대 1이 6장, 상대 2가 4장 남김')}</small></div><ul className="tutorial-rule-list tutorial-settle-demo">{RPG_NAMES.map((name,seat)=><li key={name}><b>{name}</b> HP {overflowDemo.before[seat]} → {overflowDemo.hp[seat]} <small className="tutorial-settle-why">{tr('패 정산')} {overflowDemo.delta[seat]>0?`+${overflowDemo.delta[seat]}`:`−${-overflowDemo.delta[seat]}`}{overflowDemo.dealt[seat]?<span className="hp-recovered"> {tr('· 넘친 {0} 반격',{0:overflowDemo.dealt[seat]})}</span>:null}{overflowDemo.taken[seat]?<span className="hp-lost"> {tr('· 반격 −{0}',{0:overflowDemo.taken[seat]})}</span>:null}</small></li>)}</ul><p className="tutorial-tip">{tr('내 HP는 +{0} 중 {1}만 채워져요. 넘친 {2}만큼은 나에게 HP를 준 비율(상대 1 6 : 상대 2 4)대로 {3}과 {4}로 나눠 돌아가요.',{0:overflowDemo.delta[0],1:overflowDemo.hp[0]-overflowDemo.before[0],2:overflowDemo.dealt[0],3:overflowDemo.taken[1],4:overflowDemo.taken[2]})}</p></>}
   {itemStep===2&&<><div className="tutorial-coin-stack"><span className="tutorial-coin-lower" aria-hidden="true"><TileBack/></span>{revealed?<span className="tutorial-coin-revealed"><TileFace tile={{id:26,n:7,s:2}}/></span>:<button aria-label={tr('위층 패 정찰하기')} onClick={()=>setRevealed(true)}><TileBack/></button>}</div>{!revealed&&<small className="tutorial-coin-hint">{tr('패를 눌러 몰래 보기')}</small>}<p className="tutorial-coin-result" role="status">{revealed?tr('성화 7이었어요! 이 정보는 나만 알아요.'):tr('페어로 이겼어요. 위층 패 1장을 볼 수 있어요.')}</p><ul className="tutorial-rule-list"><li>{tr('페어 1장 · 트리플 2장 · 5장 족보 3장 · 포카드 4장 · 스트레이트 플러시 5장.')}</li><li>{tr('뒤집힌 위층 패만 보이고, 누가 가져가면 정보는 사라져요.')}</li><li>{tr('손패를 모두 낸 마지막 승리는 다음 판 시작 때 1장 정찰로 바뀌어요.')}</li></ul></>}
   {itemStep===3&&<><div className="tutorial-kit-art" aria-hidden="true"><img src={relicImage('gamblers-gloves')} alt=""/><img src={relicImage('cracked-heart')} alt=""/><img src={relicImage('recovery-lantern')} alt=""/></div><ul className="tutorial-rule-list"><li>{tr('유물은 3개까지 장착해요. 대결 중에는 바꿀 수 없어요.')}</li><li>{tr('상대 한 명의 HP가 0이 되면 스테이지 클리어, 유물 보상을 골라요.')}</li><li>{tr('내 HP가 0이 되면 운명력 1개를 써서 그 스테이지에 다시 도전해요.')}</li><li>{tr('새 영역에 들어서면 HP가 100으로 회복되고, 유물은 1개만 이어져요.')}</li><li>{tr('성화·열쇠 영역의 주점에서는 가방의 유물을 바쳐 HP를 회복할 수 있어요.')}</li></ul></>}
  </div>}
  <footer className="tutorial-actions"><button className="secondary tutorial-back-step" disabled={index===0||animating} onClick={()=>move(index-1)}><ChevronLeft/>{tr('이전')}</button>
   {basic&&!lessonDone?<button className="primary" disabled={actionDisabled} onClick={()=>{if(l.kind==='draw')take();else submit();}}>{animating?tr('패 이동 중…'):['color','number'].includes(l.kind)?tr('패를 눌러 선택하세요'):l.kind==='draw'?tr('1장 가져오기'):tr('선택한 패 내기')}</button>:index<total-1?<button className="primary" onClick={()=>move(index+1)}>{tr('다음 단계')}<ChevronRight/></button>:basic?<button className="primary" onClick={()=>{nextFeel();setChapter('rpg');reset();}}>{tr('스토리모드 규칙도 알아보기')}<ChevronRight/></button>:<button className="primary" onClick={()=>{nextFeel();setChapter('puzzle');reset();}}>{tr('한 수 퍼즐 풀어보기')}<ChevronRight/></button>}
  </footer></div></>}<button className="text-btn tutorial-exit" onClick={close}>{tr('닫기')}</button>
 </section>{flights.length>0&&typeof document!=='undefined'&&createPortal(<div className="tutorial-flight-layer" aria-hidden="true">{flights.map((flight,i)=><span key={flight.tile.id} className="tutorial-flying-tile" style={{left:flight.sx,top:flight.sy,width:flight.width,height:flight.height,'--tutorial-flight-x':`${flight.ex-flight.sx}px`,'--tutorial-flight-y':`${flight.ey-flight.sy}px`,animationDelay:`${i*30}ms`} as CSSProperties}>{flight.draw?<TileBack/>:<TileFace tile={flight.tile}/>}</span>)}</div>,document.body)}</div>;
}
