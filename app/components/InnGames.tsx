'use client';
import {useMemo,useState} from 'react';
import TileFace from './TileFace';
import {rank,suitRank,type Tile} from '../../lib/game';
import {HIGH_LOW_GOAL,MEMORY_GOAL,MEMORY_PAIRS} from '../../lib/rpg-inns';
import './inn-games.css';

const shuffle=<T,>(items:T[])=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
/** The table's own deck: numbers 1~15 in four suits (lib/game.ts). */
const fullDeck=()=>Array.from({length:60},(_,i)=>({id:i,n:Math.floor(i/4)+1,s:i%4}) as Tile);
/** Same order as the table: number strength first (2 strongest, then 1), suit breaks ties, so there is never a draw. */
const stronger=(a:Tile,b:Tile)=>rank(a)-rank(b)||suitRank(a.s)-suitRank(b.s);

/** 안개 나루 주점 · 높을까 낮을까. Stop any time to keep the streak; a miss ends the play with nothing (score 0). */
export function HighLowGame({finish,quit}:{finish:(streak:number)=>void,quit:()=>void}){
 const [deck]=useState(()=>shuffle(fullDeck())),[index,setIndex]=useState(0),[streak,setStreak]=useState(0),[miss,setMiss]=useState<Tile|null>(null);
 const current=deck[index],next=deck[index+1];
 const guess=(up:boolean)=>{if(miss||!next)return;const right=up?stronger(next,current)>0:stronger(next,current)<0;if(right){setStreak(streak+1);setIndex(index+1);}else setMiss(next);};
 const reached=streak>=HIGH_LOW_GOAL;
 return <div className="inn-game" role="group" aria-label="높을까 낮을까">
  <p className="inn-game-rule">다음 패가 지금 패보다 <b>셀까</b>, <b>약할까</b>? 세기 순서는 대결과 같아요(2가 가장 세고, 같은 숫자는 문양 순서).</p>
  <div className="inn-hl-table"><div className="inn-hl-card"><TileFace tile={current}/><small>지금 패</small></div><div className="inn-hl-card">{miss?<TileFace tile={miss}/>:<span className="inn-card-back" aria-label="엎어 둔 다음 패"/>}<small>다음 패</small></div></div>
  <p className="inn-game-score" aria-live="polite">연속 <b>{streak}</b>번 · 목표 {HIGH_LOW_GOAL}번{reached&&' · 달성!'}</p>
  {miss?<><p className="inn-game-note">빗나갔어요. 이번 판은 보상이 없어요.</p><div className="inn-game-actions"><button className="primary" onClick={()=>finish(0)}>결과 확인</button></div></>:
   <div className="inn-game-actions"><button className="primary" onClick={()=>guess(true)} disabled={!next}>더 세다 ↑</button><button className="primary" onClick={()=>guess(false)} disabled={!next}>더 약하다 ↓</button><button className="secondary" onClick={()=>streak?finish(streak):quit()}>{streak?`여기서 멈추기 (${streak}연속)`:'그만두기'}</button></div>}
 </div>;
}

/** 달빛 등불 주점 · 기록 맞추기. Six pairs of identical tiles; the score is the number of flips (perfect = 12). */
export function MemoryGame({finish,quit}:{finish:(flips:number)=>void,quit:()=>void}){
 const cards=useMemo(()=>{const picks=shuffle(fullDeck()).slice(0,MEMORY_PAIRS);return shuffle(picks.flatMap((tile,i)=>[{key:`${i}a`,pair:i,tile},{key:`${i}b`,pair:i,tile}]));},[]);
 const [open,setOpen]=useState<number[]>([]),[found,setFound]=useState<number[]>([]),[flips,setFlips]=useState(0),[lock,setLock]=useState(false);
 const done=found.length===MEMORY_PAIRS;
 const flip=(i:number)=>{
  if(lock||done||open.includes(i)||found.includes(cards[i].pair))return;
  const now=[...open,i];setOpen(now);setFlips(flips+1);
  if(now.length===2){const [a,b]=now;if(cards[a].pair===cards[b].pair){setFound([...found,cards[a].pair]);setOpen([]);}else{setLock(true);setTimeout(()=>{setOpen([]);setLock(false);},800);}}
 };
 return <div className="inn-game" role="group" aria-label="기록 맞추기">
  <p className="inn-game-rule">엎어 둔 패 {MEMORY_PAIRS*2}장에서 <b>똑같은 패</b> 두 장씩 찾아요. 적게 뒤집을수록 좋아요.</p>
  <div className="inn-memory-grid">{cards.map((card,i)=>{const shown=open.includes(i)||found.includes(card.pair);return <button key={card.key} className="inn-memory-card" data-found={found.includes(card.pair)||undefined} aria-label={shown?`${card.tile.n}`:'엎어 둔 패'} onClick={()=>flip(i)}>{shown?<TileFace tile={card.tile}/>:<span className="inn-card-back"/>}</button>;})}</div>
  <p className="inn-game-score" aria-live="polite">뒤집은 횟수 <b>{flips}</b> · 목표 {MEMORY_GOAL}번 이내 · 찾은 짝 {found.length}/{MEMORY_PAIRS}</p>
  <div className="inn-game-actions">{done?<button className="primary" onClick={()=>finish(flips)}>결과 확인</button>:<button className="secondary" onClick={quit}>그만두기</button>}</div>
 </div>;
}
