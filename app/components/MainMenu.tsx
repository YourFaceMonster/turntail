"use client";
import RoomAmbience from './RoomAmbience';
import {SuitEmblem} from './TileFace';
import {BookOpen,Settings,Trophy,UserRound,ChevronRight} from 'lucide-react';

type Props={single:()=>void,multi:()=>void,tutorial:()=>void,scores:()=>void,settings:()=>void,profile:()=>void,resume:()=>void,canResume:boolean,name:string,avatar:string};

export default function MainMenu(p:Props){return <section className="title-screen">
 <div className="title-atmosphere" aria-hidden="true"/>
 <RoomAmbience/>

 <div className="title-sparks" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{left:`${8+(i*31)%84}%`,top:`${9+(i*17)%79}%`,animationDelay:`${i*-.73}s`}}/>)}</div>
 <button className="menu-profile" onClick={p.profile} aria-label="내 프로필 설정">{p.avatar?<img src={p.avatar} alt=""/>:<UserRound aria-hidden="true"/>}<span>{p.name||'내 프로필'}</span><ChevronRight aria-hidden="true"/></button>
 <div className="title-content">
  <div className="title-crest" aria-hidden="true"><span/><b>✦</b><span/></div>
  <div className="title-logo title-logo-premium title-logo-approved"><h1 aria-label="턴테일"><svg className="title-wordmark-crop" viewBox="489 54 1210 613" width="1210" height="613" aria-hidden="true"><image href="/turntale-wordmark-v035.png" x="0" y="0" width="2172" height="724"/></svg></h1></div><p className="title-english">TURNTALE</p><div className="wordmark-rule" aria-hidden="true"><span/>✧<span/></div>
  <p className="title-tagline">한 장의 선택, 새로운 이야기</p>
  <div className="title-suits" aria-label="해 · 별 · 달 · 구름">{[3,1,2,0].map(s=><span key={s} className={`title-suit-${s}`}><SuitEmblem s={s}/></span>)}</div>
  <div className="title-play">
   <button className="pixel-button menu-single" onClick={p.single}><span className="button-jewel" aria-hidden="true">✧</span><span>싱글플레이</span><span className="button-jewel" aria-hidden="true">✧</span></button>
   <button className="pixel-button menu-continue" disabled={!p.canResume} onClick={p.resume} title={p.canResume?'저장된 게임을 이어서 플레이합니다':'저장된 게임이 없어요'}><span className="button-jewel" aria-hidden="true">✧</span><span>이어서 하기</span><span className="button-jewel" aria-hidden="true">✧</span></button>
   <button className="pixel-button menu-multi" onClick={p.multi}><span className="button-jewel" aria-hidden="true">✧</span><span>멀티플레이</span><span className="button-jewel" aria-hidden="true">✧</span></button>
  </div>
  <button className="menu-tutorial" onClick={p.tutorial}><BookOpen aria-hidden="true"/>튜토리얼<span aria-hidden="true">✦</span></button>

  <nav className="title-tools" aria-label="메인 메뉴"><button onClick={p.scores}><span><Trophy aria-hidden="true"/></span>기록실</button><button onClick={p.settings}><span><Settings aria-hidden="true"/></span>설정</button></nav>
  <div className="title-ornament" aria-hidden="true"><span/>✧<span/></div>
 </div>
 <small className="title-version">TURNTALE · 0.3.10</small>
 </section>;}
