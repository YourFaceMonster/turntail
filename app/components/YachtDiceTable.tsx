'use client';
import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {Settings2} from 'lucide-react';
import './yacht-dice.css';
import {YACHT_CATEGORIES,YACHT_LABELS,YACHT_HINTS,YACHT_UPPER,YACHT_BONUS,YACHT_JOKER_BONUS,upperSubtotal,yachtBonus,seatTotal,boxScore,allowedCategories,yachtJoker,yachtJokerBonus,isYachtRoll,yachtAiPlan,openCategories,yachtShape,type YachtMatch,type YachtCategory} from '../../lib/yacht-dice';
import {DICE_DEN_DIALOGUE,DICE_DEN_STAKE,DICE_NPC,DICE_RELIC} from '../../lib/rpg-dice-den';
import AnimalFace from './AnimalFace';
import {josa} from '../../lib/josa';
import {relicImage} from '../../lib/item-battle-relics';
import {cue} from '../../lib/sound-cues';
import {haptic,DICE_HAPTICS} from '../../lib/haptics';
import {APP_VERSION} from '../../lib/version';
import type {DiceAction,DiceDenState} from '../../lib/rpg-journey';
import TableSurface from './TableSurface';
import TurntaleWordmark from './TurntaleWordmark';
import {tr,trv} from '../../lib/i18n/index.ts';

/*
 * Same chrome as the in-game card table (topbar, seat card, felt, hand panel, action bar, result modal),
 * so the dice table reads as another TURNTALE match. Inside the felt: keep row + tray + dice cup.
 * Press and hold the cup to shake, release to pour (a click or the main button shakes briefly).
 * Vibration goes through lib/haptics, so it follows the player's haptic setting.
 */
/** Dedicated Haro portrait, matching his dice-den story scene. */
export const HARO_PORTRAIT='/avatars/haro-v1.webp';
const PIPS:Record<number,number[]>={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const KEEP_X=[16,33,50,67,84],KEEP_Y=14.5,CUP={x:89,y:90};
/** Landing cells, ≥ 26 apart; with the small jitter below every pair stays ≥ DIE_GAP. Bottom-right stays clear for the cup. */
const CELLS=[[20,38],[50,38],[80,38],[20,63],[50,63],[80,63],[24,88],[53,88]];
const JITTER={x:1.8,y:1.2};
/** Die width is 14.5% of the stage; its circumscribed circle is ~10.3% → centres ≥ 21.5 apart never overlap at any tilt.
 *  y is a % of the stage height (1.05 × width), so it is scaled before measuring. */
export const DIE_GAP=21.5;
export const STAGE_RATIO=1.05;
const MIN_SHAKE=420;
/** Narrow screens: long names shorten; the full name stays in the tooltip and aria label. */
const SHORT:Partial<Record<YachtCategory,string>>={'small-straight':tr('스몰'),'large-straight':tr('라지'),'four-kind':tr('포카'),'full-house':'풀하우스'};
/** One-line rule under each lower box; straights and yacht show their fixed score. [wide, narrow] */
const TILE_HINT:Partial<Record<YachtCategory,readonly [string,string]>>={choice:[tr('5개 합'),tr('5개 합')],'four-kind':[tr('같은 눈 4개'),tr('4개 같음')],'full-house':[tr('3개+2개'),'3+2'],'small-straight':[tr('4연속 · 15점'),tr('15점')],'large-straight':[tr('5연속 · 30점'),tr('30점')],yacht:[tr('모두 같음 · 50점'),tr('50점')]};
const COMBOS:readonly YachtCategory[]=['four-kind','full-house','small-straight','large-straight','yacht'];
function seeded(seed:string){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return ()=>{h=Math.imul(h^h>>>15,2246822507)>>>0;h=Math.imul(h^h>>>13,3266489909)>>>0;h^=h>>>16;return (h>>>0)/4294967296;};}
/** Stable scatter for one roll: a shuffled grid with a little jitter and tilt per die, never overlapping. */
export function scatter(stamp:string){const r=seeded(stamp),cells=[...CELLS];for(let i=cells.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
 return cells.slice(0,5).map(([x,y])=>({x:x+(r()*2-1)*JITTER.x,y:y+(r()*2-1)*JITTER.y,rot:Math.round((r()-.5)*44),spin:Math.round(360+r()*540)*(r()<.5?-1:1)}));}
function haroLine(last:YachtMatch['last']){if(!last||last.seat!==1)return '';const {category,score}=last;
 if(last.bonus)return tr('요트 보너스다! 오늘 운이 좋은데.');
 if(category==='yacht'&&score)return tr('요트다! 안개도 이건 못 가리지.');if(!score)return tr('{0} 버리지. 아깝지만.',{0:josa(YACHT_LABELS[category],'은/는')});
 if(score>=25)return tr('{0} {1}점. 나쁘지 않군.',{0:YACHT_LABELS[category],1:score});return tr('{0}에 {1}점.',{0:YACHT_LABELS[category],1:score});}
type Flash={key:string,tier:'combo'|'yacht'|'bonus',title:string,score:string,seat:0|1};
/** What deserves a banner after a box is written: yachts, joker bonuses, combos, the 63 bonus. */
export function flashFor(prev:YachtMatch|null,match:YachtMatch):Flash|null{
 const last=match.last;if(!last||!prev||prev===match||prev.last===last)return null;
 const key=`${match.round}-${last.seat}-${last.category}`,who=last.seat;
 if(last.bonus)return {key,tier:'yacht',title:tr('요트 보너스'),score:`+${last.bonus}`,seat:who};
 if(last.category==='yacht'&&last.score)return {key,tier:'yacht',title:tr('요트!'),score:tr('{0}점',{0:last.score}),seat:who};
 const before=upperSubtotal(prev.sheets[who]),after=upperSubtotal(match.sheets[who]);
 if(before<YACHT_BONUS.threshold&&after>=YACHT_BONUS.threshold)return {key,tier:'bonus',title:tr('숫자 보너스'),score:`+${YACHT_BONUS.points}`,seat:who};
 if(COMBOS.includes(last.category)&&last.score)return {key,tier:'combo',title:YACHT_LABELS[last.category],score:tr('{0}점',{0:last.score}),seat:who};
 return null;
}

function DieFace({value}:{value:number}){return <span className="yacht-die-face" aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i} className={PIPS[value]?.includes(i)?(value===1?'pip is-ace':'pip'):''}/>)}</span>;}
function DiceCup({state}:{state:'idle'|'shaking'|'pouring'}){
 return <svg className={`yacht-cup-art is-${state}`} viewBox="0 0 120 130" aria-hidden="true">
  <ellipse cx="60" cy="122" rx="40" ry="7" fill="#000" opacity=".35"/>
  <path d="M22 18 L98 18 L88 116 Q60 124 32 116 Z" fill="#3a2418" stroke="#140b06" strokeWidth="5" strokeLinejoin="round"/>
  <path d="M30 26 L90 26 L84 104 Q60 110 36 104 Z" fill="#5a3522" opacity=".55"/>
  <path d="M27 44 Q60 52 93 44 M31 92 Q60 100 89 92" stroke="#c99a3b" strokeWidth="5" fill="none"/>
  <g fill="#f1d27a">{[34,48,60,72,86].map(x=><circle key={x} cx={x} cy={x===60?50:48} r="2.6"/>)}</g>
  <ellipse cx="60" cy="18" rx="38" ry="9" fill="#8f1d1d" stroke="#140b06" strokeWidth="5"/>
  <ellipse cx="60" cy="19" rx="29" ry="5" fill="#5e1010"/>
  <path d="M36 34 Q40 70 40 100" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".18" fill="none"/>
 </svg>;
}

type Props={den:DiceDenState,match:YachtMatch,hp:number,equipped:readonly string[],busy:boolean,error?:string,play:(action:DiceAction)=>void,retry:()=>void,leave:()=>void,
 playerName?:string,playerAvatar?:ReactNode,settings?:()=>void,exit?:()=>void,
 /** Single-play menu table: no HP stake, no relic; retry starts a fresh game and leave returns to the menu. */
 practice?:boolean};
const PRACTICE_LINES:Record<string,string>={win:tr('하로가 웃으며 주사위를 건넨다. "한 판 더 하겠나?"'),lose:tr('하로가 컵을 툭 내려놓는다. "운은 돌고 도는 거야."'),draw:tr('점수가 똑같다. 하로가 어깨를 으쓱한다.'),forfeit:tr('판을 접었다. 하로가 주사위를 주워 담는다.')};
const BOX_SHORT:Record<YachtCategory,string>={ones:'1',twos:'2',threes:'3',fours:'4',fives:'5',sixes:'6',choice:tr('초이'),
 'four-kind':tr('포카'),'full-house':tr('풀하'),'small-straight':tr('스몰'),'large-straight':tr('라지'),yacht:tr('요트')};
/** Left of Haro's seat: what his dice show now / what he just wrote, and all 12 of his boxes like my own score row. */
function RivalLog({match,aiTurn,cup,last}:{match:YachtMatch,aiTurn:boolean,cup:'idle'|'shaking'|'pouring',last:YachtMatch['last']}){
 const sheet=match.sheets[1],rolled=aiTurn&&match.rollsLeft<3&&cup==='idle',shape=rolled?yachtShape(match.dice):'';
 const box=(cat:YachtCategory)=>YACHT_UPPER.includes(cat)?tr('숫자 {0}',{0:YACHT_LABELS[cat]}):YACHT_LABELS[cat];
 const now=aiTurn?(cup!=='idle'?tr('흔드는 중'):rolled?(shape?`${YACHT_LABELS[shape]}!`:tr('족보 없음')):tr('차례 시작')):last?tr('방금 {0} {1}점{2}',{0:box(last.category),1:last.score,2:last.bonus?` +${last.bonus}`:''}):tr('아직 기록 없음');
 return <aside className={`yacht-rival-log ${aiTurn?'is-turn':''} ${shape?'is-shape':''}`} aria-label={tr('하로의 족보')} aria-live="polite">
  <header><p className="yacht-rival-now"><b>{tr('하로')}</b> {now}</p>{aiTurn&&<small>{tr('굴림')} {Math.max(0,3-match.rollsLeft)}/3</small>}</header>
  <ul>{YACHT_CATEGORIES.map(cat=>{const score=sheet[cat],isLast=!aiTurn&&last?.category===cat;
   return <li key={cat} className={`${YACHT_UPPER.includes(cat)?'is-upper':'is-lower'} ${score===undefined?'':score?'is-made':'is-zero'} ${isLast?'is-last':''}`} title={`${YACHT_LABELS[cat]}: ${score===undefined?tr('빈칸'):score?tr('{0}점 성공',{0:score}):tr('0점 (버림)')}`}>
    <span>{BOX_SHORT[cat]}</span><b>{score===undefined?'·':score}</b></li>;})}</ul>
 </aside>;
}
export default function YachtDiceTable({den,match,hp,equipped,busy,error,play,retry,leave,playerName='여행자',playerAvatar,settings,exit,practice=false}:Props){
 const playRef=useRef(play);playRef.current=play;
 const stamp=`${match.round}-${match.turn}-${match.rollsLeft}`,positions=scatter(stamp);
 const [rolled,setRolled]=useState({stamp:'',set:[] as number[]}),[confirmForfeit,setConfirmForfeit]=useState(false),[sheetOpen,setSheetOpen]=useState(false);
 // Practice games live in memory only: leaving mid-game needs a second tap (story games save on exit).
 const [exitArmed,setExitArmed]=useState(false),started=match.status==='playing'&&(Object.keys(match.sheets[0]).length>0||match.round>1||match.rollsLeft<3);
const leaveTable=()=>{if(practice&&started&&!exitArmed){setExitArmed(true);setTimeout(()=>setExitArmed(false),3000);return;}exit?.();};
 const [cup,setCup]=useState<'idle'|'shaking'|'pouring'>('idle'),[aiHeld,setAiHeld]=useState<boolean[]|null>(null),shakeStart=useRef(0),pendingThrow=useRef(false);
 const [flash,setFlash]=useState<Flash|null>(null),prevMatch=useRef<YachtMatch|null>(null);
 if(match.rollsLeft<3&&rolled.stamp!==stamp)setRolled({stamp,set:[0,1,2,3,4].filter(i=>match.rollsLeft===2||!match.held[i])});
 const myTurn=match.status==='playing'&&match.turn===0,aiTurn=match.status==='playing'&&match.turn===1;
 const canPick=myTurn&&match.rollsLeft<3&&cup==='idle',canShake=myTurn&&match.rollsLeft>0&&!busy&&cup!=='pouring';
 const inCup=match.rollsLeft===3,held=(aiTurn&&aiHeld)||match.held;
 // Keep row fills left→right in the order dice were picked (a reload falls back to dice order).
 const keepOrder=useRef<number[]>([]);
 {const order=keepOrder.current.filter(i=>held[i]);for(let i=0;i<5;i++)if(held[i]&&!order.includes(i))order.push(i);keepOrder.current=order;}
 const keepSlot=(i:number)=>keepOrder.current.indexOf(i);
 const rolledYacht=!inCup&&isYachtRoll(match.dice);

 // A new roll landed: settle the cup, clack, and buzz lightly on my own throws.
 useEffect(()=>{setCup('idle');setAiHeld(null);pendingThrow.current=false;if(match.rollsLeft<3){cue('item');cue('click',.12);cue('click',.26);if(match.turn===0)haptic(DICE_HAPTICS.land);}},[stamp]);// eslint-disable-line react-hooks/exhaustive-deps
 // A box was written: banner + sound + vibration scaled to the result.
 useEffect(()=>{const next=flashFor(prevMatch.current,match);prevMatch.current=match;if(!next)return;
  setFlash(next);if(next.tier==='yacht'){cue('relic');if(next.seat===0)haptic(DICE_HAPTICS.yacht);}else{cue('confirm');if(next.seat===0)haptic(DICE_HAPTICS.combo);}},[match]);
 useEffect(()=>{if(!flash)return;const timer=window.setTimeout(()=>setFlash(null),flash.tier==='yacht'?2000:1500);return()=>clearTimeout(timer);},[flash]);
 useEffect(()=>{if(error){setCup('idle');pendingThrow.current=false;}},[error]);
 // Rattle while the cup is shaking: clack sounds and short buzzes (my cup only).
 useEffect(()=>{if(cup!=='shaking')return;const mine=match.turn===0;let timer=0;const tick=()=>{cue('click');if(mine)haptic(DICE_HAPTICS.rattle());timer=window.setTimeout(tick,70+Math.random()*90);};tick();return()=>clearTimeout(timer);},[cup]);// eslint-disable-line react-hooks/exhaustive-deps
 const pour=()=>{setCup('pouring');pendingThrow.current=true;haptic(DICE_HAPTICS.pour);window.setTimeout(()=>playRef.current({kind:'roll'}),260);};
 const startShake=()=>{if(!canShake||cup==='shaking')return;shakeStart.current=Date.now();setCup('shaking');};
 const releaseShake=()=>{if(!myTurn||cup!=='shaking'||pendingThrow.current)return;pendingThrow.current=true;const wait=Math.max(0,MIN_SHAKE-(Date.now()-shakeStart.current));window.setTimeout(()=>{pendingThrow.current=false;pour();},wait);};
 // A tap on the table during Haro's turn skips the rest of his shake/keep animation for that turn.
 const [skipAi,setSkipAi]=useState(false);
 useEffect(()=>{if(!aiTurn)setSkipAi(false);},[aiTurn]);
 // The AI shows its keep, shakes, then the step runs (same deterministic plan as the rules).
 useEffect(()=>{if(!aiTurn||busy)return;const timers:number[]=[];
  if(skipAi){timers.push(window.setTimeout(()=>playRef.current({kind:'ai'}),80));return()=>timers.forEach(clearTimeout);}
  const plan=yachtAiPlan(match);
  if(plan.type==='score')timers.push(window.setTimeout(()=>playRef.current({kind:'ai'}),1100));
  else{const first=match.rollsLeft===3;if(!first)timers.push(window.setTimeout(()=>{setAiHeld(plan.held);cue('click');},550));
   timers.push(window.setTimeout(()=>setCup('shaking'),first?350:1150),window.setTimeout(()=>setCup('pouring'),first?1150:1950),window.setTimeout(()=>playRef.current({kind:'ai'}),first?1400:2200));}
  return()=>timers.forEach(clearTimeout);},[aiTurn,busy,match,skipAi]);

 const last=match.last,mine=seatTotal(match,0),theirs=seatTotal(match,1),own=match.sheets[0];
 const haroLast=useRef<YachtMatch['last']>(undefined);
 if(last?.seat===1)haroLast.current=last;else if(!Object.keys(match.sheets[1]).length)haroLast.current=undefined;
 const joker=canPick&&yachtJoker(own,match.dice),allowed=canPick?allowedCategories(own,match.dice):[];
 const previews=new Map(allowed.map(cat=>[cat,boxScore(own,cat,match.dice)] as const)),bestPreview=Math.max(0,...previews.values());
 const status=match.status==='ended'?tr('승부 종료'):myTurn?(inCup?tr('내 차례 · 컵을 흔들어 굴리세요'):match.rollsLeft===0?tr('내 차례 · 점수 칸을 고르세요'):tr('내 차례 · 남길 주사위 고르기')):tr('하로의 차례');
 const hint=joker?tr('조커! {0}{1}',{0:yachtJokerBonus(own,match.dice)?`요트 보너스 +${YACHT_JOKER_BONUS} · `:'',1:allowed.length===1?`${YACHT_LABELS[allowed[0]]} 칸에 적어야 해요`:'정해진 칸에 적어요'}):myTurn&&!inCup&&match.rollsLeft>0?tr('주사위를 누르면 위 칸에 남겨요'):myTurn&&inCup?tr('컵을 누르고 있으면 흔들고, 놓으면 굴러요'):aiTurn?(skipAi?tr('하로의 차례를 빠르게 넘기는 중'):tr('{0} · 판을 누르면 건너뛰기',{0:cup==='shaking'?'하로가 컵을 흔드는 중…':'하로가 고민하는 중'})):'';
 // Like the card table's lead label: who acts now, or what was just written.
 const leadLine=match.status!=='playing'?tr('✦ 승부 종료'):last&&inCup?tr('✦ {0} · {1} {2}점{3}',{0:last.seat===0?playerName:'하로',1:YACHT_LABELS[last.category],2:last.score,3:last.bonus?` · 보너스 +${last.bonus}`:''}):`✦ ${myTurn?playerName:tr('하로')} · ${inCup?tr('컵을 흔들 차례'):tr('굴림 {0}/3',{0:3-match.rollsLeft})}`;
 const result=den.result,ended=match.status==='ended'&&!!result,banter=aiTurn||last?.seat===1?haroLine(last):'';
 const outcomeLines=result==='win'?DICE_DEN_DIALOGUE.win:result==='lose'?DICE_DEN_DIALOGUE.lose:result==='draw'?DICE_DEN_DIALOGUE.draw:DICE_DEN_DIALOGUE.forfeit;
 const gathering=cup!=='idle',rolls=match.status==='playing'?match.rollsLeft:0;
 const tile=(cat:YachtCategory)=>{const written=own[cat],preview=previews.get(cat),blocked=canPick&&written===undefined&&preview===undefined,lastMine=last?.seat===0&&last.category===cat,upper=YACHT_UPPER.indexOf(cat);
  return <button type="button" key={cat} className={`yacht-cat ${upper>=0?'is-upper':'is-lower'} ${written!==undefined?'is-written':''} ${preview!==undefined?(preview?'is-pick':'is-zero'):''} ${preview&&preview===bestPreview?'is-best':''} ${blocked?'is-blocked':''} ${lastMine?'is-last':''}`} disabled={busy||preview===undefined} title={YACHT_HINTS[cat]}
   onClick={()=>{haptic(DICE_HAPTICS.score);cue('confirm');play({kind:'score',category:cat});}} aria-label={preview!==undefined?tr('{0}에 {1}점 기록',{0:YACHT_LABELS[cat],1:preview}):`${YACHT_LABELS[cat]}: ${written===undefined?(blocked?tr('조커 규칙으로 지금은 선택 불가'):tr('빈칸')):tr('{0}점',{0:written})}`}>
   {upper>=0?<span className="yacht-cat-icon" aria-hidden="true"><DieFace value={upper+1}/></span>:<small className="yacht-cat-label"><span className="is-full">{YACHT_LABELS[cat]}</span><span className="is-short">{SHORT[cat]||YACHT_LABELS[cat]}</span></small>}
   <b className="yacht-cat-score">{written??preview??''}</b>
   {TILE_HINT[cat]&&<small className="yacht-cat-hint"><span className="is-full">{TILE_HINT[cat]![0]}</span><span className="is-short">{TILE_HINT[cat]![1]}</span></small>}
   {written!==undefined&&<i className="yacht-cat-check" aria-hidden="true">✓</i>}
  </button>;};
 return <main className={`table-v211 turntale stage-mode rpg-mode rpg-journey-mode compact-game-hud rpg-phase-one in-game players-2 active-table portrait-table yacht-main`} data-turn-seat={match.turn} aria-label={tr('안개 나루 주사위판 · 요트다이스')}>
  <header className="topbar">
   <a className="brand" href="/" onClick={event=>{event.preventDefault();exit?.();}}><TurntaleWordmark className="ingame-wordmark" plain/></a>
   <span className="ingame-table-theme" title={tr('안개 나루 · 상아 주사위')}><strong>{tr('안개 나루')}</strong><small>{tr('상아 주사위')}</small></span>
   <strong className="ingame-round" aria-label={tr('주사위 승부 {0}라운드 / 12',{0:Math.min(match.round,12)})}>{tr('주사위')} {Math.min(match.round,12)}/12</strong>
   <div className="top-actions">{settings&&<button className="display-trigger settings-trigger" aria-label={tr('게임 설정')} onClick={settings}><Settings2/></button>}{exit&&<button className={`text-btn yacht-exit ${exitArmed?'is-armed':''}`} onClick={leaveTable}>{exitArmed?tr('정말 나가기?'):practice?tr('나가기'):tr('저장·나가기')}</button>}<span className="alpha">{APP_VERSION}</span></div>
  </header>
  <section className="game-layout">
   <div className="play-column">
    <TableSurface stage={5}/>
    <section className="felt yacht-felt-area" onPointerDown={aiTurn&&!skipAi?event=>{if(!(event.target as HTMLElement).closest?.('.seat-card,.yacht-rival-sheet')){setSkipAi(true);setAiHeld(null);setCup('idle');}}:undefined}>
     <div className="opponents"><RivalLog match={match} aiTurn={aiTurn} cup={cup} last={haroLast.current}/><div data-seat="1" className={`opponent persona-amber ${aiTurn?'is-turn':''}`}>
      <div className="seat-card" role="button" tabIndex={0} aria-expanded={sheetOpen} aria-label={tr('하로 {0}점 · 점수표 보기',{0:theirs})} onClick={()=>setSheetOpen(open=>!open)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSheetOpen(open=>!open);}}}><span className="stage-portrait portrait" role="img" aria-label={tr('하로 아바타')} style={{backgroundImage:`url('${HARO_PORTRAIT}')`,backgroundSize:'cover',backgroundPosition:'center'}}/>
       <div className="op-info"><strong className="opponent-name" title={DICE_NPC}><span className="opponent-character-name">{tr('하로')}</span></strong><span className="seat-hp-label">{theirs}{tr('점')}</span></div>
       <span className="rpg-seat-count yacht-open-count" aria-label={tr('하로 남은 칸 {0}개',{0:openCategories(match.sheets[1]).length})}><small aria-hidden="true">{tr('남은 칸')}</small><b>{openCategories(match.sheets[1]).length}</b></span>
      </div>
      <div className="opponent-status-row"><div className="seat-dialogue">{banter&&!sheetOpen&&<div className="seat-banter" role="status" aria-live="polite">{banter}</div>}</div></div>
      {sheetOpen&&<div className="yacht-rival-sheet" role="dialog" aria-label={tr('하로의 점수표')}><header><b>{tr('하로의 점수표')}</b><button type="button" aria-label={tr('닫기')} onClick={()=>setSheetOpen(false)}>×</button></header>
       <ol>{YACHT_CATEGORIES.map(cat=><li key={cat} className={last?.seat===1&&last.category===cat?'is-last':''}><span>{YACHT_LABELS[cat]}</span><b>{match.sheets[1][cat]??'·'}</b></li>)}</ol>
       <footer>{tr('보너스')} {upperSubtotal(match.sheets[1])}/{YACHT_BONUS.threshold}{yachtBonus(match.sheets[1])?' ✓':''}{match.yachtBonuses?.[1]?tr(' · 요트 보너스 ×{0}',{0:match.yachtBonuses[1]}):''}</footer></div>}
     </div></div>
     <div className="table-heading"><span className="table-lead-hint"><em className={`lead-lock-label ${joker?'is-joker':''}`}>{hint||(practice?tr('연습판 · 판돈 없음'):tr('판돈 HP {0} · 비기면 반환',{0:DICE_DEN_STAKE}))}</em></span>
      <span className="yacht-rolls" aria-label={tr('남은 굴림 {0}회',{0:rolls})}>{tr('굴림')} {[0,1,2].map(i=><i key={i} className={i<rolls?'is-left':''}/>)}</span></div>
     <div className="yacht-stage-box"><div className={`yacht-stage ${aiTurn?'is-ai':''} ${rolledYacht&&cup==='idle'?'is-yacht':''}`} role="group" aria-label={tr('주사위 트레이')}>
      <div className="yacht-keep" aria-hidden="true"><span>{tr('남길 주사위')}</span>{KEEP_X.map(x=><i key={x} style={{left:`${(x-4)/.92}%`}}/>)}</div>
      <div className="yacht-tray" aria-hidden="true"><div className="yacht-felt"/></div>
      {!inCup&&match.dice.map((value,i)=>{const keep=held[i],pos=positions[i],thrown=rolled.stamp===stamp&&rolled.set.includes(i),away=gathering&&!keep;
       const style={'--x':`${keep?KEEP_X[Math.max(0,keepSlot(i))]:pos.x}%`,'--y':`${keep?KEEP_Y:pos.y}%`,'--rot':`${keep?0:pos.rot}deg`,'--spin':`${pos.spin}deg`,'--cup-x':`${CUP.x}%`,'--cup-y':`${CUP.y}%`,'--n':i} as CSSProperties;
       return <button type="button" key={thrown?`${i}-${stamp}`:`${i}-still`} className={`yacht-die ${keep?'is-held':''} ${thrown?'is-thrown':''} ${away?'is-gathered':''}`} style={style} disabled={busy||!canPick||match.rollsLeft===0} aria-pressed={keep} aria-label={tr('주사위 {0}: {1}{2}',{0:i+1,1:value,2:keep?' · 남겨 둠':''})} onClick={()=>{cue('click');haptic(DICE_HAPTICS.pick);play({kind:'hold',index:i});}}><DieFace value={value}/></button>;})}
      <button type="button" className={`yacht-cup ${canShake?'is-ready':''}`} style={{left:`${CUP.x}%`,top:`${CUP.y}%`}} disabled={!myTurn||!canShake&&cup!=='shaking'} aria-label={inCup?tr('주사위 컵: 누르고 있으면 흔들고, 놓으면 굴려요'):tr('주사위 컵: 다시 굴리기 ({0}회 남음)',{0:match.rollsLeft})}
       onPointerDown={event=>{event.preventDefault();try{(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);}catch{/* capture is optional */}startShake();}} onPointerUp={releaseShake} onPointerCancel={releaseShake}
       onKeyDown={event=>{if((event.key==='Enter'||event.key===' ')&&!event.repeat){event.preventDefault();startShake();}}} onKeyUp={event=>{if(event.key==='Enter'||event.key===' ')releaseShake();}}>
       <DiceCup state={cup}/>
      </button>
      {flash&&<div key={flash.key} className={`yacht-flash is-${flash.tier} ${flash.seat===1?'is-rival':''}`} role="status" aria-live="polite"><small>{flash.seat===0?playerName:tr('하로')}</small><strong>{trv(flash.title)}</strong><b>{flash.score}</b></div>}
     </div></div>
    </section>
    <section className="trick-area has-lead yacht-trick"><div className="trick-label"><span className="lead-label">{leadLine}</span></div></section>
    <section className="hand-panel panel yacht-hand">
     <div className="hand-heading">
      <div><span className={`turn-dot ${myTurn?'on':''}`}/><strong>{status}</strong></div>
      <button type="button" className="own-status-card persona-coral" aria-label={tr('{0} {1}점',{0:playerName,1:mine})}><span className="own-status-fill" aria-hidden="true"/>{playerAvatar||<span className="avatar portrait persona-coral"><AnimalFace emoji="🦊" label=""/></span>}<span className="own-status-info"><strong>{playerName}</strong><small className="own-hp-line">{practice?tr('{0}점',{0:mine}):tr('{0}점 · HP {1}',{0:mine,1:hp})}</small></span></button>
      <div className="hand-tools yacht-bonus" aria-label={tr('숫자 보너스 진행')}><span>{tr('보너스')} {upperSubtotal(own)}/{YACHT_BONUS.threshold}{yachtBonus(own)?' ✓':''}</span>{!!match.yachtBonuses?.[0]&&<small>{tr('요트 보너스 ×')}{match.yachtBonuses[0]}</small>}</div>
     </div>
     <div className={`yacht-score-hand ${canPick?'is-picking':''}`} role="group" aria-label={tr('점수 칸')}>{YACHT_CATEGORIES.map(tile)}</div>
     <div className="action-bar"><span className="action-context" role="status">{error}</span><div className="action-buttons">
      {match.status==='playing'&&(confirmForfeit?<button type="button" className="secondary" disabled={busy} onClick={()=>{setConfirmForfeit(false);play({kind:'forfeit'});}} onBlur={()=>setConfirmForfeit(false)}>{practice?tr('기권 확정'):tr('기권 확정 · HP −{0}',{0:DICE_DEN_STAKE})}</button>:<button type="button" className="secondary" disabled={busy||!myTurn} onClick={()=>setConfirmForfeit(true)}>{tr('기권')}</button>)}
      <button type="button" className="primary" disabled={!canShake||cup!=='idle'} onClick={()=>{startShake();window.setTimeout(pour,MIN_SHAKE+200);}}><span className="play-action-label">{inCup?tr('컵 흔들어 굴리기'):match.rollsLeft===0?tr('점수 칸을 고르세요'):tr('다시 굴리기 ({0}회)',{0:match.rollsLeft})}</span></button>
     </div></div>
    </section>
   </div>
  </section>
  {ended&&<div className="modal-shade result-shade journey-match-result-shade"><section className="modal rpg-result journey-mini-result-panel yacht-result" role="dialog" aria-modal="true" aria-label={tr('주사위 승부 결과')}>
   <span className="eyebrow">{practice?tr('요트다이스'):tr('주사위 탁자')} · {result==='win'?tr('승리'):result==='draw'?tr('무승부'):result==='forfeit'?tr('기권'):tr('패배')}</span>
   <h2>{result==='win'?tr('하로를 이겼어요'):result==='draw'?tr('비겼어요'):tr('하로가 이겼어요')}</h2>
   <div className="journey-mini-standings"><div className="results result-standings single-rank-standings">
    <div className="result-head"><span>{tr('순위 · 이름')}</span><span>{tr('점수')}</span></div>
    {[{name:playerName,score:mine,me:true},{name:tr('하로'),score:theirs,me:false}].sort((a,b)=>b.score-a.score||(a.me?-1:1)).map((row,index)=><div key={row.name} className={index===0&&mine!==theirs?'winner-row':''}>
     <strong className="result-player-name"><small>{mine===theirs?tr('공동'):tr('{0}등',{0:index+1})}</small><span>{trv(row.name)}</span></strong><span>{row.score}{tr('점')}</span></div>)}
   </div></div>
   {(practice?[PRACTICE_LINES[result!]]:outcomeLines).map(line=><p key={line}>{line}</p>)}
   {practice?<>
    <button type="button" className="primary full" disabled={busy} onClick={retry}>{tr('한 판 더')}</button>
    <button type="button" className="secondary full" disabled={busy} onClick={leave}>{tr('메뉴로 돌아가기')}</button>
   </>:<>
   {result==='win'&&<div className="yacht-relic"><img src={relicImage(DICE_RELIC.id)} alt=""/><span><b>{trv(DICE_RELIC.name)}</b><small>{DICE_RELIC.effect}</small><small>{equipped.includes(DICE_RELIC.id)?tr('획득 · 자동 장착됨'):tr('획득 · 여행 가방에서 장착하세요')}</small></span></div>}
   {(result==='lose'||result==='forfeit')&&<p className="yacht-loss">{tr('판돈 HP −{0} · 현재 HP {1}',{0:DICE_DEN_STAKE,1:hp})}</p>}
   {result!=='win'&&<button type="button" className="primary full" disabled={busy||hp<=DICE_DEN_STAKE} onClick={retry}>{tr('다시 도전 · 판돈 HP')} {DICE_DEN_STAKE} →</button>}
   <button type="button" className={`${result==='win'?'primary':'secondary'} full`} disabled={busy} onClick={leave}>{tr('지도로 돌아가기')}</button>
   {result!=='win'&&hp<=DICE_DEN_STAKE&&<p className="yacht-error">{DICE_DEN_DIALOGUE.lowHp}</p>}
   </>}
  </section></div>}
 </main>;
}
