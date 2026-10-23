"use client";
import {BookOpen,Settings,Trophy,UserRound,Users,ChevronRight,RotateCcw} from 'lucide-react';

type Props={single:()=>void,multi:()=>void,tutorial:()=>void,scores:()=>void,settings:()=>void,profile:()=>void,resume:()=>void,canResume:boolean,name:string,avatar:string};

export default function MainMenu(p:Props){return <section className="title-screen">
 <div className="title-atmosphere" aria-hidden="true"/>
 <div className="title-sparks" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{left:`${8+(i*31)%84}%`,top:`${9+(i*17)%79}%`,animationDelay:`${i*-.73}s`}}/>)}</div>
 <button className="menu-profile" onClick={p.profile} aria-label="내 프로필 설정">{p.avatar?<img src={p.avatar} alt=""/>:<UserRound aria-hidden="true"/>}<span>{p.name||'내 프로필'}</span><ChevronRight aria-hidden="true"/></button>
 <div className="title-content">
  <div className="title-crest" aria-hidden="true"><span/><b>✦</b><span/></div>
  <h1>턴테일</h1><p className="title-english">TURNTALE</p>
  <p className="title-tagline">한 장의 선택, 새로운 이야기</p>
  <div className="title-suits" aria-label="해 · 별 · 달 · 구름"><span>☀</span><span>✦</span><span>☾</span><span>☁</span></div>
  <div className="title-play">
   <button className="pixel-button menu-single" onClick={p.single}><UserRound aria-hidden="true"/><span>싱글플레이</span><ChevronRight aria-hidden="true"/></button>
   <button className="pixel-button menu-multi" onClick={p.multi}><Users aria-hidden="true"/><span>멀티플레이</span><ChevronRight aria-hidden="true"/></button>
  </div>
  <button className="menu-tutorial" onClick={p.tutorial}><BookOpen aria-hidden="true"/>튜토리얼<span aria-hidden="true">✦</span></button>
  {p.canResume&&<button className="menu-resume" onClick={p.resume}><RotateCcw aria-hidden="true"/> 이어서 하기</button>}
  <nav className="title-tools" aria-label="메인 메뉴"><button onClick={p.scores}><span><Trophy aria-hidden="true"/></span>기록실</button><button onClick={p.settings}><span><Settings aria-hidden="true"/></span>설정</button></nav>
  <div className="title-ornament" aria-hidden="true"><span/>✧<span/></div>
 </div>
 <small className="title-version">TURNTALE · 0.3.1</small>
 </section>;}
