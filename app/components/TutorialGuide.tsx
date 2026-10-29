"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {BookOpen,ChevronLeft,ChevronRight,Shield,Sparkles} from 'lucide-react';
import TileFace,{SuitEmblem} from './TileFace';
import TileBack from './TileBack';
import {suits,type Tile} from '../../lib/game';
import {TUTORIAL_LESSONS as lessons,tutorialAnswer} from '../../lib/tutorial';
import {NEW_ITEM_MATCH_HP} from '../../lib/hp-limit';
import {PROFESSION_ACTIVES} from '../../lib/profession-actives';
import {CoinArtwork} from './FloorCoins';
import './tutorial-0647.css';

const roles=[
 {id:'swordsman',name:'검사',image:'swordsman-strike-v1.png',detail:'상대 한 명을 골라 공격해요. 모은 게이지를 모두 써서 강타합니다.'},
 {id:'mage',name:'마법사',image:'mage-fireball-v1.png',detail:'다른 상대 모두를 공격해요. 게이지를 많이 모으면 더 강한 화염을 사용해요.'},
 {id:'cleric',name:'성직자',image:'cleric-heal-v1.png',detail:'자신의 HP를 회복해요. 최대 HP를 넘어서 회복하지 않아요.'},
 {id:'rogue',name:'도적',image:null,detail:'2칸을 써서 보이는 바닥패 어디든 함정을 설치해요. 상대가 가져가면 피해 4. 위층·아래층 모두 가능해요.'},
] as const;
const itemLessons=[{title:'HP로 이어지는 아이템전',text:`나와 AI 2명이 HP ${NEW_ITEM_MATCH_HP}으로 시작해요. 손패를 먼저 비우면 한 판 승리, 누군가 HP가 0이 되면 대전이 끝나요.`},{title:'위층 아래 숨은 주화',text:'위층을 걷어내기 전에는 아래층 주화를 볼 수 없어요. 위층 패를 눌러 숨은 주화를 찾아보세요.'},{title:'직업 스킬은 내 차례에',text:'시작 게이지는 1칸, 한 판이 끝나면 +1칸 충전돼요. 남은 게이지는 다음 판에도 이어져요. 직업을 눌러 특징을 확인하세요.'},{title:'상점과 유물 활용하기',text:'첫 결투에는 소비 아이템을 사용할 수 없어요. 결투가 끝난 뒤 자기 차례에 아이템을 쓰고, 유물은 적힌 조건을 달성하면 자동으로 발동해요.'}];
type LessonFlight={tile:Tile,sx:number,sy:number,ex:number,ey:number,width:number,height:number,draw?:boolean};

export default function TutorialGuide({close}:{close:()=>void}){
 const [chapter,setChapter]=useState<'basic'|'items'>('basic'),[step,setStep]=useState(0),[itemStep,setItemStep]=useState(0),[selected,setSelected]=useState<number[]>([]),[done,setDone]=useState(false),[message,setMessage]=useState(''),[picked,setPicked]=useState(false),[finish,setFinish]=useState(0),[revealed,setRevealed]=useState(false),[role,setRole]=useState<typeof roles[number]['id']>('swordsman');
 const [flights,setFlights]=useState<LessonFlight[]>([]),[played,setPlayed]=useState<Tile[]>([]),[drawn,setDrawn]=useState<Tile|null>(null),[animating,setAnimating]=useState(false),handRef=useRef<HTMLDivElement>(null),tableRef=useRef<HTMLDivElement>(null),busyRef=useRef(false),flightTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(flightTimer.current)clearTimeout(flightTimer.current);},[]);
 const l=lessons[step],basic=chapter==='basic',index=basic?step:itemStep,total=basic?lessons.length:itemLessons.length,profession=roles.find(value=>value.id===role)!,active=PROFESSION_ACTIVES[role];
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
  <div className="tutorial-chapters" role="group" aria-label="배울 내용"><button aria-pressed={basic} onClick={()=>{setChapter('basic');reset();}}><BookOpen/>패와 기본 규칙</button><button aria-pressed={!basic} onClick={()=>{setChapter('items');reset();}}><Sparkles/>아이템전 안내</button></div>
  <div className="tutorial-progress"><span>{basic?'기본 연습':'아이템전'} <b>{index+1} / {total}</b></span><progress value={index+1} max={total} aria-label="현재 학습 단계"/></div>
  <div className="tutorial-lesson-copy"><h3>{basic?l.title:itemLessons[itemStep].title}</h3><p className="guide-copy">{basic?l.text:itemLessons[itemStep].text}</p></div>
  {basic?<>
   {l.kind==='color'?<div className="tutorial-order" aria-label="해 별 달 구름 순서">{[3,1,2,0].map((s,i)=><span key={s}><i className={`suit${s}`}><SuitEmblem s={s}/>{suits[s]}</i>{i<3&&'›'}</span>)}</div>:l.kind==='number'?<p className="tutorial-rank">2 <b>›</b> 1 <b>›</b> 15 <b>›</b> … <b>›</b> 3</p>:l.kind==='five'?<p className="tutorial-five-order">스트레이트 ‹ 플러시 ‹ 풀하우스 ‹ 포카드 ‹ 스트레이트 플러시</p>:null}
   <div className="tutorial-table" ref={tableRef} data-tutorial-landing={played.length>0}><small>{played.length?'내가 낸 패':l.target.length?'상대가 낸 패':l.kind==='finish'&&finish?'다시 내가 선':'내가 선 · 원하는 조합으로 시작'}</small><div className="tutorial-tiles">{(played.length?played:l.target).map(t=><TileFace key={t.id} tile={t}/>)}{!played.length&&!l.target.length&&<span className="tutorial-table-mark" aria-hidden="true">✦</span>}</div>{l.kind==='draw'&&<button className={`tutorial-back ${picked?'selected':''}`} disabled={done||animating} style={{visibility:animating||drawn?'hidden':'visible'}} onClick={()=>setPicked(true)} aria-pressed={picked} aria-label="바닥 비밀 패 선택"><TileBack/><small>위층 패</small></button>}</div>
   <div className={`helper-bubble ${done?'is-correct':''}`} role="status"><span aria-hidden="true">{done?'✓':'✦'}</span><p>{message||(l.kind==='draw'?'바닥 뒷면 패를 누른 뒤 가져오세요.':l.kind==='pair'?'같은 숫자 7 두 장을 선택하세요.':l.kind==='triple'?'같은 숫자 7 세 장을 선택하세요.':l.kind==='five'?'7 세 장과 9 두 장을 선택하세요.':'안내에 맞는 패를 직접 눌러보세요.')}</p></div>
   <div className="tutorial-tiles tutorial-hand" ref={handRef} role="group" aria-label="연습 손패">{[...l.hand,...(drawn?[drawn]:[])].filter(t=>!(l.kind==='finish'&&finish&&t.n===2)).map(t=><button key={t.id} data-tutorial-hand={t.id} disabled={done||animating||l.kind==='draw'} style={{visibility:played.some(tile=>tile.id===t.id)||flights.some(f=>!f.draw&&f.tile.id===t.id)?'hidden':'visible'}} className={selected.includes(t.id)?'selected':''} onClick={()=>tap(t)} aria-pressed={selected.includes(t.id)} aria-label={`${suits[t.s]} ${t.n}`}><TileFace tile={t}/></button>)}</div>
  </>:<div className="tutorial-item-stage">
   {itemStep===0&&<><div className="tutorial-hp-demo"><Shield aria-hidden="true"/><span>HP <b>{NEW_ITEM_MATCH_HP}</b></span><small>패 대전 · 직업 · 아이템 · 유물</small></div><ul className="tutorial-rule-list"><li>결투 승리: 승자가 그 결투에서 낸 패의 누적 장수가 기본 피해예요.</li><li>직업·유물의 추가 피해와 회복도 함께 적용돼요.</li><li>한 판이 끝나면 정산을 확인하고 다음 판으로 이어져요.</li></ul></>}
   {itemStep===1&&<><div className="tutorial-coin-stack"><span className="tutorial-coin-lower"><TileFace tile={{id:8,n:3,s:0}}/>{revealed&&<span className="tutorial-found-coin"><CoinArtwork/>3P</span>}</span>{!revealed&&<button aria-label="위층 걷어내기" onClick={()=>setRevealed(true)}><TileBack/><small>눌러서 위층 걷기</small></button>}</div><p className="tutorial-coin-result" role="status">{revealed?'주화 발견! 아래층 3을 가져가면 주화도 함께 받아요.':'아래층 주화는 아직 보이지 않아요.'}</p><ul className="tutorial-rule-list"><li>랜덤 주화는 라운드당 1개: 도적 1P · 다른 직업 3P.</li><li>바닥의 마지막 패는 누구나 5P.</li><li>두 보상이 겹치면 도적 6P · 다른 직업 8P.</li></ul></>}
   {itemStep===2&&<><div className="tutorial-professions" role="group" aria-label="직업 스킬 선택">{roles.map(value=><button key={value.id} aria-pressed={role===value.id} onClick={()=>setRole(value.id)}><img src={value.image?`/item-battle-v1/skills/${value.image}`:'/item-battle-v1/trap-v1.webp'} alt=""/>{value.name}</button>)}</div><div className="tutorial-skill-detail"><strong>{profession.name} · {active.name}</strong><p>{profession.detail}</p><small>{role==='rogue'?'2칸 소비 · 자기 턴 (1회)':`1~${active.maxGauge}칸 전량 소비 · ${role==='cleric'?'회복':'피해'} ${active.values.slice(1).join(' / ')}`}</small></div><p className="tutorial-tip">족보 승리로 자동 발동하는 직업 효과는 별도예요. 단순히 패를 내는 것만으로는 발동하지 않아요.</p></>}
   {itemStep===3&&<><div className="tutorial-kit-art" aria-hidden="true"><img src="/rpg-items-v1/consumables/emergency-herb-v2.webp" alt=""/><img src="/rpg-items-v1/consumables/ember-bomb-v2.webp" alt=""/><img src="/item-battle-v1/relics/sun-sigil.webp" alt=""/></div><ul className="tutorial-rule-list"><li>상점: 가진 주화 안에서 구매해요. 부족하면 회색으로 표시돼요.</li><li>장착 유물: 오른쪽 유물을 누르면 정확한 조건을 확인해요.</li><li>투시: 패 내용과 함정 유무를 확인해요. 함정 설치와는 다른 효과예요.</li><li>대전 도중 얻은 주화로 다음 상점에서 필요한 아이템을 준비하세요.</li></ul></>}
  </div>}
  <footer className="tutorial-actions"><button className="secondary tutorial-back-step" disabled={index===0||animating} onClick={()=>move(index-1)}><ChevronLeft/>이전</button>
   {basic&&!done?<button className="primary" disabled={actionDisabled} onClick={()=>{if(l.kind==='draw')take();else submit();}}>{animating?'패 이동 중…':['color','number'].includes(l.kind)?'패를 눌러 선택하세요':l.kind==='draw'?'1장 가져오기':'선택한 패 내기'}</button>:index<total-1?<button className="primary" onClick={()=>move(index+1)}>다음 단계<ChevronRight/></button>:basic?<button className="primary" onClick={()=>{nextFeel();setChapter('items');reset();}}>아이템전도 알아보기<ChevronRight/></button>:<button className="primary" onClick={()=>{nextFeel();close();}}>배우기 완료</button>}
  </footer><button className="text-btn tutorial-exit" onClick={close}>닫고 메뉴로 돌아가기</button>
 </section>{flights.length>0&&typeof document!=='undefined'&&createPortal(<div className="tutorial-flight-layer" aria-hidden="true">{flights.map((flight,i)=><span key={flight.tile.id} className="tutorial-flying-tile" style={{left:flight.sx,top:flight.sy,width:flight.width,height:flight.height,'--tutorial-flight-x':`${flight.ex-flight.sx}px`,'--tutorial-flight-y':`${flight.ey-flight.sy}px`,animationDelay:`${i*30}ms`} as CSSProperties}>{flight.draw?<TileBack/>:<TileFace tile={flight.tile}/>}</span>)}</div>,document.body)}</div>;
}
