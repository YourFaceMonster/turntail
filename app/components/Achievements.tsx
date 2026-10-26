"use client";
import {useEffect,useRef} from 'react';
import {Check} from 'lucide-react';
import {ACHIEVEMENTS,achievementValue,orderedAchievements,type Achievement,type AchievementState} from '../../lib/achievements';
import AchievementMedal from './AchievementMedal';

export function AchievementToast({achievement}:{achievement:Achievement}){return <div className="achievement-toast" role="status"><AchievementMedal id={achievement.id} earned/><div><small>{achievement.completion?'모든 이야기 완성':achievement.hidden?'히든 업적 발견':'업적 달성'}</small><strong>{achievement.title}</strong></div></div>;}

export default function Achievements({state,close}:{state:AchievementState,close:()=>void}){
 const panel=useRef<HTMLElement>(null),listRef=useRef<HTMLDivElement>(null);
 const count=ACHIEVEMENTS.filter(a=>state.unlocked[a.id]).length,list=orderedAchievements(state);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;panel.current?.querySelector<HTMLButtonElement>('button')?.focus();return()=>previous?.focus();},[]);
 useEffect(()=>{if(listRef.current)listRef.current.scrollTop=0;},[count]);
 return <div className="modal-shade achievements-shade" onClick={close}><section ref={panel} className="modal achievements-modal" role="dialog" aria-modal="true" aria-label="업적" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const nodes=panel.current?.querySelectorAll<HTMLElement>('button,[tabindex="0"]');if(!nodes?.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}>
  <button className="close" onClick={close} aria-label="업적 닫기">×</button>
  <header className="achievement-header"><AchievementMedal id="all-achievements" earned={!!state.unlocked['all-achievements']}/><div><span className="eyebrow">TURNTALE · ACHIEVEMENTS</span><h2 className="turntale-menu-lettering">업적</h2><p>한 장의 선택이 남기는 작은 전설</p></div><div className="achievement-total"><strong>{count}<small> / {ACHIEVEMENTS.length}</small></strong><span>달성</span></div></header>
  <div ref={listRef} className="achievement-list" tabIndex={0} role="region" aria-label="업적 목록 · 달성한 업적부터 표시">{list.map(a=>{const at=state.unlocked[a.id],secret=a.hidden&&!at,value=Math.min(a.goal,achievementValue(a,state));return <article key={a.id} data-achievement={a.id} className={`achievement-card ${at?'unlocked':''} ${secret?'secret':''} ${a.completion?'completion-achievement':''}`}><AchievementMedal id={a.id} earned={!!at} secret={!!secret}/><div><div className="achievement-name"><h3>{secret?'??? · 숨겨진 업적':a.title}</h3>{at?<Check aria-label="달성"/>:null}</div><p>{secret?'아직 알려지지 않은 이야기입니다. 플레이하며 발견해 보세요.':a.description}</p>{at?<time dateTime={new Date(at).toISOString()}>{new Date(at).toLocaleDateString('ko-KR')} 달성</time>:!secret&&<div className="achievement-progress"><progress value={value} max={a.goal} aria-label={`${a.title} 진행률`}/><small>{value} / {a.goal}</small></div>}</div></article>;})}</div>
  <footer>달성한 업적이 위에 표시됩니다 · 이 기기·브라우저에 저장<br/>일반전 유효 라운드 기준 · 아이템전·시간 초과 대체 판 제외</footer>
 </section></div>;
}
