"use client";
import {useEffect,useRef,useState} from 'react';
import {Award,LockKeyhole,Check} from 'lucide-react';
import {ACHIEVEMENTS,type Achievement,type AchievementState} from '../../lib/achievements';

export function AchievementToast({achievement}:{achievement:Achievement}){return <div className="achievement-toast" role="status"><span aria-hidden="true">{achievement.icon}</span><div><small>{achievement.hidden?'히든 업적 발견':'업적 달성'}</small><strong>{achievement.title}</strong></div><Award aria-hidden="true"/></div>;}

export default function Achievements({state,close}:{state:AchievementState,close:()=>void}){
 const [filter,setFilter]=useState('all');const panel=useRef<HTMLElement>(null);
 const count=ACHIEVEMENTS.filter(a=>state.unlocked[a.id]).length;
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;panel.current?.querySelector<HTMLButtonElement>('button')?.focus();return()=>previous?.focus();},[]);
 const list=ACHIEVEMENTS.filter(a=>filter==='all'||filter==='hidden'&&a.hidden||filter==='done'&&state.unlocked[a.id]||filter==='progress'&&!a.hidden&&!state.unlocked[a.id]);
 return <div className="modal-shade achievements-shade" onClick={close}><section ref={panel} className="modal achievements-modal" role="dialog" aria-modal="true" aria-label="업적 수첩" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const nodes=panel.current?.querySelectorAll<HTMLButtonElement>('button');if(!nodes?.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}>
  <button className="close" onClick={close} aria-label="업적 수첩 닫기">×</button>
  <header><span className="eyebrow">TURNTALE · ACHIEVEMENTS</span><h2><Award aria-hidden="true"/> 업적 수첩</h2><p>한 장의 선택이 남기는 작은 전설</p><div className="achievement-total"><strong>{count}<small> / {ACHIEVEMENTS.length}</small></strong><span>히든 {ACHIEVEMENTS.filter(a=>a.hidden&&state.unlocked[a.id]).length} / {ACHIEVEMENTS.filter(a=>a.hidden).length} 발견</span></div><progress value={count} max={ACHIEVEMENTS.length} aria-label="전체 업적 달성률"/></header>
  <nav className="achievement-filters" aria-label="업적 필터">{[['all','전체'],['progress','도전 중'],['done','달성'],['hidden','히든']].map(([id,label])=><button key={id} className={filter===id?'chosen':''} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</nav>
  <div className="achievement-list">{list.map(a=>{const at=state.unlocked[a.id],secret=a.hidden&&!at,value=Math.min(a.goal,a.value(state.stats));return <article key={a.id} className={`achievement-card ${at?'unlocked':''} ${secret?'secret':''}`}><span className="achievement-icon" aria-hidden="true">{secret?<LockKeyhole/>:a.icon}</span><div><div className="achievement-name"><h3>{secret?'??? · 숨겨진 업적':a.title}</h3>{at?<Check aria-label="달성"/>:a.hidden?<small>HIDDEN</small>:null}</div><p>{secret?'아직 알려지지 않은 이야기입니다. 플레이하며 발견해 보세요.':a.description}</p>{at?<time dateTime={new Date(at).toISOString()}>{new Date(at).toLocaleDateString('ko-KR')} 달성</time>:!secret&&<div className="achievement-progress"><progress value={value} max={a.goal} aria-label={`${a.title} 진행률`}/><small>{value} / {a.goal}</small></div>}</div></article>;})}{!list.length&&<p className="achievement-empty">아직 달성한 업적이 없어요. 첫 이야기를 시작해 보세요.</p>}</div>
  <footer>일반전·스테이지의 유효 라운드 종료 시 반영 · 아이템전·시간 초과 AI 대체 판 제외<br/>업적은 이 기기·브라우저에 저장됩니다.</footer>
 </section></div>;
}
