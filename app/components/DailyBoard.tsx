'use client';
import {gameFetch} from '../../lib/distribution';

import {userMessage} from '../../lib/user-message';
import {useEffect,useRef,useState} from 'react';
import './daily-board.css';
import {tr,trv} from '../../lib/i18n/index.ts';

type Row={name:string,score:number,win:boolean,rank:number,tries?:number,isMe?:boolean};
type Board={date:string,today:string,rows:Row[],total:number,mine:Row|null,attempt:'none'|'started'|'again'|'done',tries?:number,maxTries?:number};
const fmt=(date:string)=>{const [,m,d]=date.split('-');return tr('{0}월 {1}일',{0:Number(m),1:Number(d)});};
const signed=(n:number)=>n>0?`+${n}`:String(n);

/** 오늘의 판: today's ranking and the start button. The score is recorded by the server from the round itself. */
export default function DailyBoard({profileToken,start,close}:{profileToken:string|null,start:(again:boolean)=>void,close:()=>void}){
 const [board,setBoard]=useState<Board|null>(null),[error,setError]=useState(''),[day,setDay]=useState<'today'|'yesterday'>('today');
 const panel=useRef<HTMLElement>(null);
 useEffect(()=>{panel.current?.focus();},[]);
 useEffect(()=>{let stop=false;setError('');
  const date=day==='yesterday'&&board?new Date(Date.parse(board.today+'T00:00:00Z')-86400000).toISOString().slice(0,10):undefined;
  gameFetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(12000),body:JSON.stringify({action:'dailyBoard',profileToken,...(date?{date}:{})})})
   .then(async r=>{const d:any=await r.json();if(!r.ok)throw Error(d.error||tr('순위를 불러오지 못했어요.'));if(!stop)setBoard(d);})
   .catch(e=>{if(!stop)setError(userMessage(e,tr('순위를 불러오지 못했어요.')));});
  return()=>{stop=true;};
 },[day,profileToken]);
 const showingToday=!board||board.date===board.today;
 const max=board?.maxTries||2,used=board?.tries||0;
 const note=!board?'':board.attempt==='done'?tr('오늘 도전 {0}번을 모두 했어요. 다시 하면 연습판이에요(같은 패, 순위 반영 안 됨).',{0:max}):board.attempt==='started'?tr('{0}번째 도전이 아직 끝나지 않았어요. 새로 시작하면 그 판이 이 도전을 이어받아요(끝까지 마친 판만 기록).',{0:used+1}):board.attempt==='again'?tr('도전 {0}번이 남았어요. 더 높은 점수만 순위에 남아요.',{0:max-used}):tr('하루 {0}번까지 도전할 수 있어요. 더 높은 점수가 순위에 남고, 동점이면 도전 횟수가 적은 쪽이 위예요.',{0:max});
 const startLabel=board?.attempt==='done'?tr('연습판으로 다시 하기'):board?.attempt==='started'?tr('오늘의 판 다시 시작 ({0}/{1})',{0:used+1,1:max}):board?.attempt==='again'?tr('다시 도전 ({0}/{1})',{0:used+1,1:max}):tr('오늘의 판 시작 (1/{0})',{0:max});
 return <div className="modal-shade" onClick={close}><section ref={panel} tabIndex={-1} className="modal daily-board" role="dialog" aria-modal="true" aria-labelledby="daily-title" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')close();}}>
  <button className="close" onClick={close} aria-label={tr('닫기')}>×</button>
  <div className="daily-hero" aria-hidden="true"><img src="/ui/daily-table-banner-v1.webp" alt="" decoding="async"/></div>
  <div className="daily-head"><h2 id="daily-title">{tr('오늘의 판')}{board?` · ${fmt(board.date)}`:''}</h2></div>
  <p>{tr('오늘은 모두가 같은 패를 받아요. 상대 2명과 3인전 한 판, 판 점수로 순위를 겨뤄요. 자정(한국 시간)에 새 판이 열려요.')}</p>
  <div className="segmented daily-days"><button className={day==='today'?'chosen':''} onClick={()=>setDay('today')}>{tr('오늘')}</button><button className={day==='yesterday'?'chosen':''} disabled={!board&&day==='today'} onClick={()=>setDay('yesterday')}>{tr('어제')}</button></div>
  {error?<p role="alert" className="daily-error">{error}</p>:!board?<p className="daily-empty" role="status">{tr('순위를 불러오는 중…')}</p>:
   board.rows.length?<ol className="daily-rows">{board.rows.map((r,i)=><li key={i} className={r.isMe?'is-me':''} data-medal={r.rank<=3?r.rank:undefined}><b>{r.rank}</b><span>{trv(r.name)}{r.win&&<em>{tr('1등')}</em>}{!!r.tries&&<small className="daily-tries">{tr('도전')} {r.tries}{tr('회')}</small>}</span><strong>{signed(r.score)}{tr('점')}</strong></li>)}</ol>:<p className="daily-empty">{tr('아직 기록이 없어요. 첫 기록을 남겨 보세요!')}</p>}
  {board&&<p className="daily-mine">{board.mine?tr('내 순위 {0}위 / {1}명 · {2}점{3}',{0:board.mine.rank,1:board.total,2:signed(board.mine.score),3:board.mine.tries?` · 도전 ${board.mine.tries}회`:''}):tr('참가 {0}명',{0:board.total})}</p>}
  {showingToday&&<><button className="primary full" onClick={()=>start(!!board&&(board.attempt==='again'||board.attempt==='done'||used>0))}>{startLabel}</button><p className="daily-note">{note}{!profileToken&&tr(' 이 기기 기록을 확인하지 못해 순위에는 올라가지 않아요.')}</p></>}
 </section></div>;
}
