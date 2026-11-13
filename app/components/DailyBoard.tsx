'use client';
import {useEffect,useRef,useState} from 'react';
import './daily-board.css';

type Row={name:string,score:number,win:boolean,rank:number,tries?:number,isMe?:boolean};
type Board={date:string,today:string,rows:Row[],total:number,mine:Row|null,attempt:'none'|'started'|'again'|'done',tries?:number,maxTries?:number};
const fmt=(date:string)=>{const [,m,d]=date.split('-');return `${Number(m)}월 ${Number(d)}일`;};
const signed=(n:number)=>n>0?`+${n}`:String(n);

/** 오늘의 판: today's ranking and the start button. The score is recorded by the server from the round itself. */
export default function DailyBoard({profileToken,start,close}:{profileToken:string|null,start:()=>void,close:()=>void}){
 const [board,setBoard]=useState<Board|null>(null),[error,setError]=useState(''),[day,setDay]=useState<'today'|'yesterday'>('today');
 const panel=useRef<HTMLElement>(null);
 useEffect(()=>{panel.current?.focus();},[]);
 useEffect(()=>{let stop=false;setError('');
  const date=day==='yesterday'&&board?new Date(Date.parse(board.today+'T00:00:00Z')-86400000).toISOString().slice(0,10):undefined;
  fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(12000),body:JSON.stringify({action:'dailyBoard',profileToken,...(date?{date}:{})})})
   .then(async r=>{const d:any=await r.json();if(!r.ok)throw Error(d.error||'순위를 불러오지 못했어요.');if(!stop)setBoard(d);})
   .catch(e=>{if(!stop)setError(e instanceof Error?e.message:'순위를 불러오지 못했어요.');});
  return()=>{stop=true;};
 },[day,profileToken]);
 const showingToday=!board||board.date===board.today;
 const max=board?.maxTries||2,used=board?.tries||0;
 const note=!board?'':board.attempt==='done'?`오늘 도전 ${max}번을 모두 했어요. 다시 하면 연습판이에요(같은 패, 순위 반영 안 됨).`:board.attempt==='started'?`${used+1}번째 도전이 아직 끝나지 않았어요. 새로 시작하면 그 판이 이 도전을 이어받아요(끝까지 마친 판만 기록).`:board.attempt==='again'?`도전 ${max-used}번이 남았어요. 더 높은 점수만 순위에 남아요.`:`하루 ${max}번까지 도전할 수 있어요. 더 높은 점수가 순위에 남고, 동점이면 도전 횟수가 적은 쪽이 위예요.`;
 const startLabel=board?.attempt==='done'?'연습판으로 다시 하기 →':board?.attempt==='started'?`오늘의 판 다시 시작 (${used+1}/${max}) →`:board?.attempt==='again'?`다시 도전 (${used+1}/${max}) →`:`오늘의 판 시작 (1/${max}) →`;
 return <div className="modal-shade" onClick={close}><section ref={panel} tabIndex={-1} className="modal daily-board" role="dialog" aria-modal="true" aria-labelledby="daily-title" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')close();}}>
  <button className="close" onClick={close} aria-label="닫기">×</button>
  <div className="daily-hero" aria-hidden="true"><img src="/ui/daily-table-banner-v1.webp" alt="" decoding="async"/></div>
  <div className="daily-head"><span className="eyebrow">DAILY TABLE</span><h2 id="daily-title">오늘의 판{board?` · ${fmt(board.date)}`:''}</h2></div>
  <p>오늘은 모두가 같은 패를 받아요. AI 2명과 3인전 한 판, 판 점수로 순위를 겨뤄요. 자정(한국 시간)에 새 판이 열려요.</p>
  <div className="segmented daily-days"><button className={day==='today'?'chosen':''} onClick={()=>setDay('today')}>오늘</button><button className={day==='yesterday'?'chosen':''} disabled={!board&&day==='today'} onClick={()=>setDay('yesterday')}>어제</button></div>
  {error?<p role="alert" className="daily-error">{error}</p>:!board?<p className="daily-empty" role="status">순위를 불러오는 중…</p>:
   board.rows.length?<ol className="daily-rows">{board.rows.map((r,i)=><li key={i} className={r.isMe?'is-me':''} data-medal={r.rank<=3?r.rank:undefined}><b>{r.rank}</b><span>{r.name}{r.win&&<em>1등</em>}{!!r.tries&&<small className="daily-tries">도전 {r.tries}회</small>}</span><strong>{signed(r.score)}점</strong></li>)}</ol>:<p className="daily-empty">아직 기록이 없어요. 첫 기록을 남겨 보세요!</p>}
  {board&&<p className="daily-mine">{board.mine?`내 순위 ${board.mine.rank}위 / ${board.total}명 · ${signed(board.mine.score)}점${board.mine.tries?` · 도전 ${board.mine.tries}회`:''}`:`참가 ${board.total}명`}</p>}
  {showingToday&&<><button className="primary full" onClick={start}>{startLabel}</button><p className="daily-note">{note}{!profileToken&&' 이 기기 기록을 확인하지 못해 순위에는 올라가지 않아요.'}</p></>}
 </section></div>;
}
