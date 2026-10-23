"use client";
import {useEffect,useState} from 'react';
import {topScores,type HighScore} from '../../lib/challenge';
import {syncPersonalScores} from '../../lib/score-sync';
import type {Leaderboard} from '../../lib/leaderboard';
const signed=(n:number)=>`${n>0?'+':''}${n}`;
const date=(at:number)=>new Date(at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
export default function HighScores({close,personal,profileToken,name,openHistory,initialMode='single',initialSize=3,initialKind='single'}:{close:()=>void,personal:HighScore[],profileToken:string,name:string,openHistory:()=>void,initialMode?:'single'|'multi',initialSize?:number,initialKind?:'single'|'ten'}){
 const [scope,setScope]=useState<'global'|'personal'>('global'),[mode,setMode]=useState<'single'|'multi'>(initialMode),[size,setSize]=useState(initialSize),[kind,setKind]=useState<'single'|'ten'>(initialKind),[page,setPage]=useState(0);
 const [board,setBoard]=useState<Leaderboard|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[refresh,setRefresh]=useState(0);
 const syncKey=JSON.stringify(personal.filter(r=>r.mode==='single'));
 useEffect(()=>{
  if(scope!=='global')return;const controller=new AbortController();let active=true;
  setBusy(true);setError('');setBoard(null);
  void (async()=>{let syncError='';try{await syncPersonalScores(profileToken,name,JSON.parse(syncKey),controller.signal);}catch{syncError='내 싱글 기록 동기화가 지연되고 있어요. 다시 시도하면 저장된 기록을 전송합니다.';}
   if(!active)return;
   try{const response=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.any([controller.signal,AbortSignal.timeout(10000)]),body:JSON.stringify({action:'leaderboard',profileToken,mode,size,kind,page})}),data=await response.json() as Leaderboard&{error?:string};if(!response.ok)throw Error(data.error||'순위를 불러오지 못했어요.');if(active){setBoard(data);setError(syncError);}}
   catch(e){if(active)setError(e instanceof Error?e.message:'전체 순위에 연결하지 못했어요.');}finally{if(active)setBusy(false);}
  })();return()=>{active=false;controller.abort();};
 },[scope,mode,size,kind,page,profileToken,name,syncKey,refresh]);
 useEffect(()=>{const refreshVisible=()=>{if(!document.hidden)setRefresh(x=>x+1);};window.addEventListener('online',refreshVisible);document.addEventListener('visibilitychange',refreshVisible);return()=>{window.removeEventListener('online',refreshVisible);document.removeEventListener('visibilitychange',refreshVisible);};},[]);
 function filter(change:()=>void){change();setPage(0);}
 return <div className="modal-shade score-shade" onClick={close}><section className="modal highscore-modal" role="dialog" aria-modal="true" aria-label="하이스코어" onClick={e=>e.stopPropagation()}>
  <button className="close" aria-label="기록실 닫기" onClick={close}>×</button><span className="eyebrow">TURNTALE HALL OF FAME</span><h2>HIGH SCORE</h2><p>모두의 한 수가 남긴 기록</p>
  <div className="segmented score-scope" aria-label="순위 범위"><button className={scope==='global'?'chosen':''} onClick={()=>filter(()=>setScope('global'))}>전체 순위</button><button className={scope==='personal'?'chosen':''} onClick={()=>filter(()=>setScope('personal'))}>내 기록 TOP 3</button></div>
  <div className="segmented" aria-label="플레이 모드"><button className={mode==='single'?'chosen':''} onClick={()=>filter(()=>setMode('single'))}>싱글플레이</button><button className={mode==='multi'?'chosen':''} onClick={()=>filter(()=>setMode('multi'))}>멀티플레이</button></div>
  <div className="segmented" aria-label="참가 인원">{[2,3,4].map(n=><button key={n} className={size===n?'chosen':''} onClick={()=>filter(()=>setSize(n))}>{n}인전</button>)}</div>
  <div className="score-kind"><button aria-pressed={kind==='ten'} className={kind==='ten'?'chosen':''} onClick={()=>filter(()=>setKind('ten'))}>10판 합산</button><button aria-pressed={kind==='single'} className={kind==='single'?'chosen':''} onClick={()=>filter(()=>setKind('single'))}>단판 기록</button></div>
  {scope==='personal'?<ol className="highscore-board">{[0,1,2].map(i=>{const row=topScores(personal,mode,size,kind)[i];return <li key={i}><span>{['1ST','2ND','3RD'][i]}</span><strong>{row?signed(row.score):'—'}</strong><small>{row?date(row.at):'아직 기록이 없어요'}</small></li>;})}</ol>:<>
   {busy?<p className="leaderboard-status" role="status">전체 순위 확인 중…</p>:board&&<>
    <div className="my-global-rank">{board.mine?<><span>내 최고 순위 <b>{board.mine.rank}위</b> / {board.total}개 기록</span><strong>{signed(board.mine.score)}점</strong></>:<span>전체 {board.total}개 기록 · 한 판의 기록을 남겨보세요</span>}</div>
    <ol className="global-board" start={page*board.pageSize+1}>{board.rows.map(row=><li key={row.rank} className={`${row.isMe?'is-me':''} ${row.rank<=3?'podium podium-'+row.rank:''}`}><span className="global-place">{row.rank<=3?['🥇','🥈','🥉'][row.rank-1]:row.rank}</span><div><strong>{row.name}{row.isMe&&<em>나</em>}</strong><small>{date(row.at)}</small></div><b>{signed(row.score)}<small>점</small></b></li>)}</ol>
    {!board.rows.length&&<p className="leaderboard-status">아직 등록된 기록이 없어요.<br/>이 부문의 첫 주인공이 되어보세요!</p>}
    {board.total>board.pageSize&&<nav className="leaderboard-pages" aria-label="순위 페이지"><button className="secondary" disabled={page===0} onClick={()=>setPage(page-1)}>이전</button><span>{page+1} / {Math.ceil(board.total/board.pageSize)}</span><button className="secondary" disabled={(page+1)*board.pageSize>=board.total} onClick={()=>setPage(page+1)}>다음</button></nav>}
   </>}
   {error&&<p className="score-note" role="status">{error}</p>}
   <button className="text-btn" disabled={busy} onClick={()=>setRefresh(x=>x+1)}>↻ 전체 순위 새로고침</button>
  </>}
  <p className="score-note">{scope==='global'?'경기별 기록 누적 · 같은 플레이어도 여러 번 등재':'이 브라우저에 저장된 개인 역대 TOP 3'}<br/>{kind==='ten'?'완료한 10판 합산':'일반 대전 + 도전의 각 판'} · 높은 점수순 · 동점은 먼저 달성한 순서 · 무효 판 제외</p>
  <button className="text-btn" onClick={openHistory}>일반 대전·친구 누적 전적 보기 →</button>
 </section></div>;
}
