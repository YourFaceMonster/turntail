"use client";
import {APP_VERSION} from '../../lib/version';
import RoomAmbience from './RoomAmbience';
import TurntaleWordmark from './TurntaleWordmark';
import {SuitEmblem} from './TileFace';
import {BookOpen,Settings,Trophy,Award,UserRound,ChevronRight} from 'lucide-react';

type Props={bomb?:boolean,single:()=>void,multi:()=>void,tutorial:()=>void,scores:()=>void,achievements:()=>void,settings:()=>void,profile:()=>void,resume:()=>void,canResume:boolean,name:string,avatar:string};

export default function MainMenu(p:Props){return <section className="title-screen">
 <div className="title-atmosphere" aria-hidden="true"/>
 <RoomAmbience/>

 <div className="title-sparks" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{left:`${8+(i*31)%84}%`,top:`${9+(i*17)%79}%`,animationDelay:`${i*-.73}s`}}/>)}</div>
 <button className="menu-profile" onClick={p.profile} aria-label="내 프로필 설정">{p.avatar?<img src={p.avatar} alt=""/>:<UserRound aria-hidden="true"/>}<span>{p.name||'내 프로필'}</span><ChevronRight aria-hidden="true"/></button>
 <div className="title-content">
  <div className="title-crest" aria-hidden="true"><span/><b>✦</b><span/></div>
  <div className="title-logo title-logo-premium title-logo-approved"><h1 aria-label="턴테일"><TurntaleWordmark className="title-wordmark-crop"/></h1></div><p className="title-english">TURNTALE</p><div className="wordmark-rule" aria-hidden="true"><span/>✧<span/></div>
  <p className="title-tagline">한 장의 선택, 새로운 이야기</p>
  <div className="title-suits" aria-label="해 · 별 · 달 · 구름">{[3,1,2,0].map(s=><span key={s} className={`title-suit-${s}`}><SuitEmblem s={s}/></span>)}</div>
  <div className="title-play">
   <button className="pixel-button menu-single" onClick={p.single}><span className="menu-button-copy"><strong>{p.bomb?"폭탄시장전 시작":"싱글플레이"}</strong><small>{p.bomb?"3인 · 공개 시장 · 총 5판":"일반 대전 · 아이템전 · RPG 여정"}</small></span><ChevronRight className="menu-button-arrow" aria-hidden="true"/></button>
   <button className="pixel-button menu-continue" disabled={!p.canResume} onClick={p.resume} title={p.canResume?'저장된 게임을 이어서 플레이합니다':'저장된 게임이 없어요'}><span className="menu-button-copy"><strong>이어서 하기</strong><small>{p.canResume?'멈춰 둔 테이블로 돌아가기':'저장된 게임이 없어요'}</small></span><ChevronRight className="menu-button-arrow" aria-hidden="true"/></button>
   <button className="pixel-button menu-multi" onClick={p.multi}><span className="menu-button-copy"><strong>{p.bomb?"일반모드로":"멀티플레이"}</strong><small>{p.bomb?"기존 턴테일 메인으로 돌아가기":"초대 코드로 친구와 한 테이블"}</small></span><ChevronRight className="menu-button-arrow" aria-hidden="true"/></button>
  </div>
  <button className="menu-tutorial" onClick={p.tutorial}><BookOpen aria-hidden="true"/><span className="menu-tutorial-copy">{p.bomb?"폭탄시장전 규칙":"튜토리얼"}<small>{p.bomb?"공개 시장 · 폭탄 반응 · 5판 정산":"패 내기부터 직업·주화까지"}</small></span><ChevronRight aria-hidden="true"/></button>

  <nav className="title-tools" aria-label="메인 메뉴"><button className="menu-tool-records" onClick={p.scores}><span className="menu-tool-icon"><Trophy aria-hidden="true"/></span><span className="menu-tool-label">기록실</span></button><button className="menu-tool-achievements" onClick={p.achievements}><span className="menu-tool-icon"><Award aria-hidden="true"/></span><span className="menu-tool-label">업적</span></button><button className="menu-tool-settings" onClick={p.settings}><span className="menu-tool-icon"><Settings aria-hidden="true"/></span><span className="menu-tool-label">설정</span></button></nav>
  <div className="title-ornament" aria-hidden="true"><span/>✧<span/></div>
 </div>
 <small className="title-version">TURNTALE · {APP_VERSION}</small>
 </section>;}
