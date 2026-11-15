"use client";
import {useEffect,useState} from 'react';
import TileFace from './TileFace';
import {combo,sorted} from '../../lib/game';
import {PUZZLES,playPuzzle,startPuzzle,type Puzzle,type PuzzleState} from '../../lib/puzzles';
import {PUZZLE_TITLE,allPuzzlesCleared,readPuzzleRecords,recordPuzzleClear,savePuzzleRecords,type PuzzleRecords} from '../../lib/puzzle-records';
import {cue} from '../../lib/sound-cues';
import './one-move-puzzle.css';

/** 한 수 퍼즐: ten fixed problems on the real rules. The opponent's hand is face up and its reply rule is fixed. */
export default function OneMovePuzzle(){
 const [records,setRecords]=useState<PuzzleRecords>({cleared:{}}),[current,setCurrent]=useState<Puzzle|null>(null);
 useEffect(()=>{setRecords(readPuzzleRecords(localStorage));},[]);
 const ids=PUZZLES.map(p=>p.id),master=allPuzzlesCleared(records,ids);
 if(current)return <PuzzleBoard puzzle={current} cleared={!!records.cleared[current.id]} back={()=>setCurrent(null)}
  next={PUZZLES[PUZZLES.indexOf(current)+1]?()=>setCurrent(PUZZLES[PUZZLES.indexOf(current)+1]):undefined}
  solved={tries=>{const next=recordPuzzleClear(records,current.id,tries);savePuzzleRecords(localStorage,next);setRecords(next);}}/>;
 return <div className="puzzle-select">
  <p className="puzzle-intro">정해진 손패로 <b>정해진 수 안에 손패를 모두 비우세요.</b> 상대 손패는 공개돼 있고, 상대는 늘 <b>가장 약하게 이길 수 있는 패</b>로 받아요. 받을 수 없으면 넘겨요.</p>
  {master&&<p className="puzzle-title-badge" role="status">칭호 · <b>{PUZZLE_TITLE}</b> · 10문제를 모두 풀었어요</p>}
  <ol className="puzzle-list">{PUZZLES.map((p,i)=>{const rec=records.cleared[p.id];return <li key={p.id}><button onClick={()=>{cue('click');setCurrent(p);}} className={rec?'is-cleared':''}>
   <span className="puzzle-no">{i+1}</span><span className="puzzle-name"><strong>{p.title}</strong><small>{p.moves}수 안에 · {rec?`풀었어요 · 최소 ${rec.tries}번째 도전`:'아직 안 풀었어요'}</small></span><span aria-hidden="true">{rec?'✓':'›'}</span></button></li>;})}</ol>
  <p className="puzzle-count">{Object.keys(records.cleared).filter(id=>ids.includes(id)).length} / {PUZZLES.length} 풀었어요</p>
 </div>;
}

function PuzzleBoard({puzzle,cleared,back,next,solved}:{puzzle:Puzzle,cleared:boolean,back:()=>void,next?:()=>void,solved:(tries:number)=>void}){
 const [state,setState]=useState<PuzzleState>(()=>startPuzzle(puzzle)),[picked,setPicked]=useState<number[]>([]),[tries,setTries]=useState(1),[hint,setHint]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setState(startPuzzle(puzzle));setPicked([]);setTries(1);setHint(false);setError('');},[puzzle]);
 const chosen=state.mine.filter(t=>picked.includes(t.id)),label=chosen.length?combo(chosen)?.label:null;
 function submit(){
  try{const after=playPuzzle(puzzle,state,chosen);setState(after);setPicked([]);setError('');
   if(after.status==='won'){cue('confirm');solved(tries);}else if(after.status==='lost')cue('back');else cue('click');
  }catch(e){setError(e instanceof Error?e.message:'낼 수 없는 조합이에요.');}
 }
 function retry(){setState(startPuzzle(puzzle));setPicked([]);setError('');setTries(t=>t+1);}
 const left=puzzle.moves-state.used;
 return <div className="puzzle-board" data-status={state.status}>
  <header className="puzzle-board-head"><button className="text-btn" onClick={back}>‹ 문제 목록</button><span>{cleared?'✓ 푼 문제':`${tries}번째 도전`}</span></header>
  <h4>{puzzle.title}</h4><p className="puzzle-lesson">{puzzle.lesson}</p>
  <p className="puzzle-goal"><b>{puzzle.moves}수</b> 안에 손패를 모두 비우기 · 남은 수 <b>{Math.max(0,left)}</b></p>
  <section className="puzzle-row puzzle-opponent" aria-label="상대 손패 (공개)"><small>상대 손패 · {state.theirs.length}장</small><div className="puzzle-tiles">{state.theirs.map(t=><TileFace key={t.id} tile={t}/>)}</div></section>
  <section className="puzzle-row puzzle-table" aria-label="바닥에 놓인 패"><small>{state.status==='won'?'내가 낸 마지막 패':state.table.length?'받아야 할 패':'내가 선 · 원하는 조합으로 시작'}</small><div className="puzzle-tiles">{state.table.map(t=><TileFace key={t.id} tile={t}/>)}{!state.table.length&&<span className="puzzle-mark" aria-hidden="true">✦</span>}</div></section>
  <p className={`puzzle-note ${state.status}`} role="status">{error||state.note||(hint?puzzle.hint:'패를 골라 내 보세요.')}</p>
  {hint&&!error&&state.note&&<p className="puzzle-hint">힌트 · {puzzle.hint}</p>}
  <section className="puzzle-row puzzle-hand" aria-label="내 손패"><small>내 손패{label?` · ${label}`:chosen.length?' · 조합이 아니에요':''}</small><div className="puzzle-tiles">{sorted(state.mine).map(t=><button key={t.id} className={picked.includes(t.id)?'selected':''} aria-pressed={picked.includes(t.id)} disabled={state.status!=='playing'} onClick={()=>setPicked(p=>p.includes(t.id)?p.filter(id=>id!==t.id):[...p,t.id])}><TileFace tile={t}/></button>)}</div></section>
  <footer className="puzzle-actions">
   {state.status==='playing'?<><button className="primary" disabled={!chosen.length} onClick={submit}>선택한 패 내기</button><button className="secondary" disabled={hint} onClick={()=>setHint(true)}>힌트</button><button className="secondary" onClick={retry}>처음부터</button></>
    :state.status==='won'?<><button className="primary" onClick={next||back}>{next?'다음 문제':'문제 목록'}</button><button className="secondary" onClick={retry}>다시 풀기</button></>
    :<button className="primary" onClick={retry}>다시 도전</button>}
  </footer>
 </div>;
}
