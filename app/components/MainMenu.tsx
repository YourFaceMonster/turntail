"use client";
import {useEffect,useState} from 'react';
import {APP_VERSION} from '../../lib/version';
import RoomAmbience from './RoomAmbience';
import TurntaleWordmark from './TurntaleWordmark';
import {tr} from '../../lib/i18n/index.ts';
import {BookOpen,BookMarked,Settings,Award,UserRound,ChevronRight,ScrollText} from 'lucide-react';
import './title-gate.css';

// 2026-11-19 user decision: the records room (기록실) left the menu; its screen code stays for now, scores are still saved.
// 2026-11-25 user request: the tutorial button starts the guided practice duel itself; the rule pages moved to "규칙".
// 2026-11-25 user decision: the painted UI kit made the screens look busy, so the menu keeps its 0.8.2 look
// (pixel wordmark, line icons). The kit files stay in public/ui/kit for parts that may come back one at a time.
type Props={bomb?:boolean,single:()=>void,multi:()=>void,tutorial:()=>void,rules?:()=>void,achievements:()=>void,codex?:()=>void,settings:()=>void,profile:()=>void,resume:()=>void,canResume:boolean,name:string,avatar:string};

/** 2026-11-25 user request: opening the app fades the title in and waits for a tap before the menu shows.
 *  Once per app session, so coming back from a table goes straight to the menu. */
const TITLE_KEY='turntale-title-opened';
const titleOpened=()=>{try{return sessionStorage.getItem(TITLE_KEY)==='1';}catch{return true;}};

export default function MainMenu(p:Props){
 // null until mounted: the server render has no session storage, so the menu stays hidden for that first frame.
 const [gated,setGated]=useState<boolean|null>(null);
 useEffect(()=>{setGated(!titleOpened());},[]);
 const [revealed,setRevealed]=useState(false);
 const open=()=>{try{sessionStorage.setItem(TITLE_KEY,'1');}catch{}setRevealed(true);setGated(false);};
 useEffect(()=>{if(!gated)return;const key=(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key);},[gated]);
 return <section className={`title-screen ${gated===null?'is-checking':gated?'is-gated':revealed?'is-opened is-revealed':'is-opened'}`}>
 <div className="title-atmosphere" aria-hidden="true"/>
 <RoomAmbience/>

 <div className="title-sparks" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{left:`${8+(i*31)%84}%`,top:`${9+(i*17)%79}%`,animationDelay:`${i*-.73}s`}}/>)}</div>
 <button className="menu-profile title-menu-part" onClick={p.profile} aria-label={tr('내 프로필 설정')}>{p.avatar?<img src={p.avatar} alt=""/>:<UserRound aria-hidden="true"/>}<span>{p.name||tr('내 프로필')}</span><ChevronRight aria-hidden="true"/></button>
 <div className="title-content">
  <div className="title-crest" aria-hidden="true"><span/><b>✦</b><span/></div>
  <div className="title-logo title-logo-premium title-logo-approved"><h1 aria-label={tr('턴테일')}><TurntaleWordmark className="title-wordmark-crop"/></h1></div><p className="title-english">TURNTALE</p>
  <div className="title-play title-menu-part">
   <button className="pixel-button menu-single" onClick={p.single}><span className="menu-button-copy"><strong>{p.bomb?tr('폭탄시장전 시작'):tr('싱글플레이')}</strong><small>{p.bomb?tr('3인 · 공개 시장 · 총 5판'):tr('일반 대전 · 요트다이스 · 스토리모드')}</small></span></button>
   <button className="pixel-button menu-continue" disabled={!p.canResume} onClick={p.resume} title={p.canResume?tr('저장된 게임을 이어서 플레이합니다'):tr('저장된 게임이 없어요')}><span className="menu-button-copy"><strong>{tr('이어서 하기')}</strong><small>{p.canResume?tr('멈춰 둔 테이블로 돌아가기'):tr('저장된 게임이 없어요')}</small></span></button>
   <button className="pixel-button menu-multi" onClick={p.multi}><span className="menu-button-copy"><strong>{p.bomb?tr('일반모드로'):tr('멀티플레이')}</strong><small>{p.bomb?tr('기존 턴테일 메인으로 돌아가기'):tr('초대 코드로 친구와 한 테이블')}</small></span></button>
  </div>
  <button className="menu-tutorial title-menu-part" onClick={p.tutorial}><BookOpen aria-hidden="true"/><span className="menu-tutorial-copy">{p.bomb?tr('폭탄시장전 규칙'):tr('튜토리얼')}{p.bomb&&<small>{tr('공개 시장 · 폭탄 반응 · 5판 정산')}</small>}</span><ChevronRight aria-hidden="true"/></button>

  <nav className="title-tools title-menu-part" aria-label={tr('메인 메뉴')}><button className="menu-tool-achievements" onClick={p.achievements}><span className="menu-tool-icon"><Award aria-hidden="true"/></span><span className="menu-tool-label">{tr('업적')}</span></button>{p.codex&&!p.bomb&&<button className="menu-tool-codex" onClick={p.codex}><span className="menu-tool-icon"><BookMarked aria-hidden="true"/></span><span className="menu-tool-label">{tr('도감')}</span></button>}{p.rules&&!p.bomb&&<button className="menu-tool-rules" onClick={p.rules}><span className="menu-tool-icon"><ScrollText aria-hidden="true"/></span><span className="menu-tool-label">{tr('규칙')}</span></button>}<button className="menu-tool-settings" onClick={p.settings}><span className="menu-tool-icon"><Settings aria-hidden="true"/></span><span className="menu-tool-label">{tr('설정')}</span></button></nav>
  
 </div>
 {gated&&<button type="button" className="title-gate" onClick={open} aria-label={tr('화면을 눌러 시작')}><span className="title-gate-prompt">{tr('화면을 눌러 시작')}</span></button>}
 <small className="title-version">TURNTALE · {APP_VERSION}</small>
 </section>;}
