'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import './yacht-online.css';
import {YACHT_CATEGORIES,YACHT_LABELS,YACHT_HINTS,YACHT_UPPER,YACHT_BONUS,YACHT_JOKER_BONUS,upperSubtotal,yachtBonus,boxScore,allowedCategories,yachtJokerBonus,type YachtCategory} from '../../lib/yacht-dice';
import {YACHT_REACTIONS,YACHT_TURN_MS,type YachtRoomView} from '../../lib/yacht-room';
import {cue} from '../../lib/sound-cues';

export const YACHT_ONLINE_SESSION='turntale-yacht-online';
export type YachtOnlineStart={kind:'create',size:2|3}|{kind:'join',code:string}|{kind:'resume',code:string,token:string};
type Session={code:string,token:string};
type History={summary:{games:number,wins:number,best:number}|null,records:{id:string,at:number,size:number,place:number,score:number,win:number}[]};
/** Narrow phone columns: 3 players + the label column. */
const SHORT_LABELS:Partial<Record<YachtCategory,string>>={'small-straight':'스몰 S','large-straight':'라지 S'};
const PIPS:Record<number,number[]>={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function Die({value,held,disabled,onClick,index}:{value:number,held:boolean,disabled:boolean,onClick:()=>void,index:number}){
 return <button className={`yo-die ${held?'is-held':''}`} disabled={disabled} aria-pressed={held} aria-label={`주사위 ${index+1}: ${value}${held?' · 남김':''}`} onClick={onClick}>{Array.from({length:9},(_,i)=><i key={i} className={PIPS[value]?.includes(i)?(value===1?'is-ace':'is-pip'):''}/>)}</button>;
}
export function readYachtSession():Session|null{try{const raw=localStorage.getItem(YACHT_ONLINE_SESSION);const s=raw?JSON.parse(raw):null;return s&&typeof s.code==='string'&&typeof s.token==='string'?s:null;}catch{return null;}}
function writeSession(s:Session|null){try{if(s)localStorage.setItem(YACHT_ONLINE_SESSION,JSON.stringify(s));else localStorage.removeItem(YACHT_ONLINE_SESSION);}catch{}}

export default function YachtOnline({start,name,avatar,profileToken,exit}:{start:YachtOnlineStart,name:string,avatar?:string,profileToken?:string|null,exit:()=>void}){
 const [room,setRoom]=useState<YachtRoomView|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[held,setHeld]=useState([false,false,false,false,false]);
 const [history,setHistory]=useState<History|null>(null),[left,setLeft]=useState(0),[copied,setCopied]=useState<''|'code'|'link'>('');
 const session=useRef<Session|null>(start.kind==='resume'?{code:start.code,token:start.token}:null),revision=useRef(0),playKey=useRef<string|undefined>(undefined),started=useRef(false),lastEvent=useRef<string|undefined>(undefined);
 const post=useCallback(async(action:string,extra:Record<string,unknown>={})=>{
  const response=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(12000),body:JSON.stringify({...session.current,profileToken,revision:revision.current,...(playKey.current?{playKey:playKey.current}:{}),...(action==='yachtCreate'||action==='yachtJoin'?{name,avatar}:{}),action,...extra})});
  const data:any=await response.json().catch(()=>({}));
  if(data.room){revision.current=data.revision;playKey.current=data.room.playKey;if(data.token&&data.room.code){session.current={code:data.room.code,token:data.token};writeSession(session.current);}setRoom(data.room);}
  if(!response.ok){if(response.status===403||response.status===404){writeSession(null);}throw Error(data.error||'처리하지 못했어요.');}
  return data;
 },[profileToken,name,avatar]);
 const loadHistory=useCallback(async()=>{if(!profileToken)return;try{const r=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(12000),body:JSON.stringify({action:'yachtHistory',profileToken})});const d=await r.json() as History;if(r.ok)setHistory(d);}catch{}},[profileToken]);
 // Enter the room once.
 useEffect(()=>{if(started.current)return;started.current=true;setBusy(true);
  const go=start.kind==='create'?post('yachtCreate',{size:start.size}):start.kind==='join'?post('yachtJoin',{code:start.code.toUpperCase()}):post('yachtState');
  go.then(()=>setError('')).catch(e=>setError(e.message)).finally(()=>setBusy(false));void loadHistory();
 },[]);
 // Poll while the page is visible.
 useEffect(()=>{if(!room)return;let stop=false;const tick=async()=>{if(stop||document.hidden||!session.current)return;try{await post('yachtState');}catch(e){if(!stop)setError((e as Error).message);}};
  const timer=setInterval(tick,1200);return()=>{stop=true;clearInterval(timer);};},[!!room,post]);
 // Local countdown between polls.
 useEffect(()=>{if(!room)return;setLeft(room.turnMsLeft);const began=performance.now(),from=room.turnMsLeft;const timer=setInterval(()=>setLeft(Math.max(0,from-(performance.now()-began))),250);return()=>clearInterval(timer);},[room?.eventId,room?.turnMsLeft]);
 const match=room?.match,me=room?.me??-1,myTurn=!!room&&room.phase==='playing'&&match?.turn===me&&!room.players[me]?.replaced;
 // Keep my hold choices while I am rolling; take the server's dice state otherwise.
 useEffect(()=>{if(!match)return;if(!myTurn||match.rollsLeft===3||match.rollsLeft===0)setHeld(match.held);},[match?.rollsLeft,match?.turn,match?.round,myTurn]);
 useEffect(()=>{const id=room?.eventId;if(!id||id===lastEvent.current)return;const first=lastEvent.current===undefined;lastEvent.current=id;if(first)return;
  if(room?.phase==='ended'){cue(room.result?.players[me]?.winner?'clear':'confirm');void loadHistory();}
  else if(match?.last&&match.last.seat!==me)cue('click');},[room?.eventId]);
 async function act(action:string,extra:Record<string,unknown>={}){if(busy)return;setBusy(true);setError('');try{await post(action,extra);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 function leave(){cue('back');if(room?.phase!=='playing')writeSession(null);exit();}
 async function copyCode(){if(!room)return;try{await navigator.clipboard.writeText(room.code);setCopied('code');setTimeout(()=>setCopied(''),1500);}catch{}}
 /** Link that opens the multiplayer menu with Yacht Dice picked and this code filled in. */
 async function copyLink(){if(!room)return;const url=`${location.origin}/?yacht=${room.code}`;try{if(navigator.share&&matchMedia('(pointer:coarse)').matches){await navigator.share({title:'턴테일 요트다이스',text:`요트다이스 ${room.size}인전에 같이 해요! 방 코드 ${room.code}`,url});return;}await navigator.clipboard.writeText(url);setCopied('link');setTimeout(()=>setCopied(''),1800);}catch{}}
 async function react(emoji:number){if(!session.current)return;cue('click');try{await post('yachtReact',{emoji});}catch{}}

 if(!room)return <div className="yacht-online"><section className="yo-panel yo-center"><h2>요트다이스</h2><p>{busy?'방에 들어가는 중…':error||'방 정보를 불러오지 못했어요.'}</p><button className="secondary" onClick={()=>{writeSession(null);exit();}}>돌아가기</button></section></div>;
 const host=me===room.host,players=room.players,canHold=myTurn&&!!match&&match.rollsLeft>0&&match.rollsLeft<3,canScore=myTurn&&!!match&&match.rollsLeft<3;
 const allowed=canScore&&match?allowedCategories(match.sheets[me],match.dice):[];
 const turnName=match?players[match.turn]?.name:'';
 return <div className="yacht-online">
  <header className="yo-top"><div><span className="yo-eyebrow">YACHT DICE · {room.size}인전</span><strong>방 코드 <button className="yo-code" onClick={copyCode} aria-label={`방 코드 ${room.code} 복사`}>{room.code}</button>{copied==='code'&&<small> 복사됨</small>}</strong></div><button className="text-btn" onClick={leave}>나가기</button></header>
  {error&&<p className="yo-error" role="alert">{error}</p>}
  {room.phase==='lobby'&&<section className="yo-panel">
   <h2>친구를 기다리는 중</h2><p>초대 링크나 방 코드를 친구에게 보내 주세요. {room.size}명이 모이면 방장이 시작해요.</p>
   <button className="secondary full yo-invite" onClick={()=>void copyLink()}>{copied==='link'?'초대 링크를 복사했어요':'초대 링크 보내기'}</button>
   <ol className="yo-lobby">{Array.from({length:room.size},(_,i)=><li key={i} className={players[i]?'':'is-empty'}>{players[i]?<>{players[i].name}{i===room.host&&<small>방장</small>}{i===me&&<small>나</small>}</>:'빈 자리'}</li>)}</ol>
   {host?<button className="primary full" disabled={busy||players.length!==room.size} onClick={()=>{cue('confirm');void act('yachtStart');}}>{players.length===room.size?'게임 시작 →':`${room.size-players.length}명 더 필요해요`}</button>:<p className="yo-note">방장이 시작하기를 기다리고 있어요.</p>}
   <p className="yo-note">차례마다 60초 · 시간을 넘기면 그 차례는 AI가 굴리고, 3번 연속이면 AI가 자리를 이어받아요.</p>
  </section>}
  {room.phase!=='lobby'&&match&&<>
   <div className="yo-seats">{players.map((p,i)=><div key={p.id} className={`yo-seat ${match.turn===i&&room.phase==='playing'?'is-turn':''} ${i===me?'is-me':''}`}><span>{p.name}{p.replaced&&<em>AI</em>}</span><b>{p.total}</b></div>)}</div>
   {room.phase==='playing'&&<div className="yo-turn"><span>{myTurn?'내 차례':`${turnName}의 차례`} · {match.round}/12 라운드 · 남은 굴림 {match.rollsLeft}</span><i style={{width:`${Math.round(left/YACHT_TURN_MS*100)}%`}} className={left<15000?'is-low':''}/></div>}
   {room.notice&&room.notice.id===room.eventId&&<p className="yo-notice">{room.notice.text}</p>}
   <div className="yo-dice">{match.dice.map((d,i)=><Die key={i} index={i} value={d} held={match.rollsLeft<3&&held[i]} disabled={!canHold||busy} onClick={()=>{cue('click');setHeld(h=>h.map((v,j)=>j===i?!v:v));}}/>)}</div>
   {room.phase==='playing'&&<button className="primary full yo-roll" disabled={!myTurn||busy||match.rollsLeft===0||match.rollsLeft<3&&held.every(Boolean)} onClick={()=>{cue('item');void act('yachtRoll',{held});}}>{match.rollsLeft===3?'주사위 굴리기':match.rollsLeft===0?'점수 칸을 골라 주세요':`다시 굴리기 (${match.rollsLeft}번 남음)`}</button>}
   {canHold&&<p className="yo-note">남길 주사위를 누른 뒤 다시 굴리거나, 아래 점수 칸을 골라요.</p>}
   <table className="yo-sheet"><thead><tr><th>칸</th>{players.map((p,i)=><th key={p.id} className={i===me?'is-me':''}>{p.name}</th>)}</tr></thead><tbody>
    {YACHT_CATEGORIES.map(cat=>{const pick=allowed.includes(cat);return <tr key={cat} className={cat==='choice'?'yo-split':''}><th title={`${YACHT_LABELS[cat]} · ${YACHT_HINTS[cat]}`}>{SHORT_LABELS[cat]||YACHT_LABELS[cat]}</th>{players.map((p,i)=>{const v=match.sheets[i]?.[cat];
     if(i===me&&pick){const s=boxScore(match.sheets[me],cat,match.dice)+yachtJokerBonus(match.sheets[me],match.dice);return <td key={p.id}><button className="yo-pick" disabled={busy} onClick={()=>{cue('confirm');void act('yachtScore',{category:cat as YachtCategory});}}>{s}</button></td>;}
     const fresh=match.last&&match.last.seat===i&&match.last.category===cat;return <td key={p.id} className={`${i===me?'is-me':''} ${fresh?'is-fresh':''}`}>{v??''}</td>;})}</tr>;})}
    <tr className="yo-sub"><th title={`1~6 합이 ${YACHT_BONUS.threshold}점 이상이면 +${YACHT_BONUS.points}`}>소계 /{YACHT_BONUS.threshold}</th>{players.map((p,i)=><td key={p.id}>{upperSubtotal(match.sheets[i]||{})}{yachtBonus(match.sheets[i]||{})?` +${YACHT_BONUS.points}`:''}</td>)}</tr>
    {match.bonuses.some(n=>n>0)&&<tr className="yo-sub"><th>요트 보너스</th>{players.map((p,i)=><td key={p.id}>{match.bonuses[i]?`+${match.bonuses[i]*YACHT_JOKER_BONUS}`:''}</td>)}</tr>}
    <tr className="yo-total"><th>합계</th>{players.map(p=><td key={p.id}>{p.total}</td>)}</tr>
   </tbody></table>
   <p className="yo-note">숫자 칸 {YACHT_UPPER.length}개 합이 {YACHT_BONUS.threshold}점 이상이면 +{YACHT_BONUS.points}점.</p>
  </>}
  {room.phase==='ended'&&room.result&&<section className="yo-panel">
   <h2>게임 끝</h2>
   <ol className="yo-result">{room.result.players.map((p,i)=>({...p,i})).sort((a,b)=>a.place-b.place).map(p=><li key={p.i} className={p.winner?'is-win':''}><b>{p.place}등</b><span>{p.name}{p.i===me&&' (나)'}{p.replaced&&<em>AI</em>}</span><strong>{p.total}점</strong></li>)}</ol>
   {room.players[me]?.replaced&&<p className="yo-note">AI가 자리를 이어받은 판이라 내 전적에는 남지 않아요.</p>}
   {host?<button className="primary full" disabled={busy} onClick={()=>{cue('confirm');void act('yachtRestart');}}>같은 멤버로 새 판 →</button>:<p className="yo-note">방장이 새 판을 시작하면 이어서 할 수 있어요.</p>}
  </section>}
  {room.phase!=='lobby'&&<div className="yo-react-bar" aria-label="반응 보내기">{YACHT_REACTIONS.map((emoji,i)=><button key={emoji} onClick={()=>void react(i)} aria-label={`반응 ${emoji} 보내기`}>{emoji}</button>)}</div>}
  <div className="yo-reactions" aria-live="polite">{room.reactions.map(r=><span key={r.id} className={r.seat===me?'is-me':''}><small>{players[r.seat]?.name}</small>{YACHT_REACTIONS[r.emoji]}</span>)}</div>
  {history?.summary&&history.summary.games>0&&<p className="yo-history">요트다이스 전적 · {history.summary.games}판 {history.summary.wins}승 · 최고 {history.summary.best}점</p>}
 </div>;
}
