"use client";
import {useEffect,useState} from 'react';
import {Lightbulb} from 'lucide-react';
import type {CoachLine} from '../../lib/stage1-coach';
import {tr} from '../../lib/i18n/index.ts';
import './stage-one-coach.css';

/** 2026-11-24 player feedback: stage 1 explains each turn with an example from the player's own hand.
 *  A bubble over the middle of the table appears when the situation changes on my turn and fades after a while.
 *  Taps go through it (it never blocks the floor or the hand); only its own close button takes a tap. */
export const COACH_KEY='turntale-st1-coach';
export const FIRST_GUIDE_KEY='turntale-first-guide';
export const coachEnabled=()=>{try{return localStorage.getItem(COACH_KEY)!=='off';}catch{return true;}};

export function StageOneCoach({line,stamp,off}:{line:CoachLine|null,stamp:string,off:()=>void}){
 const [shown,setShown]=useState<string|null>(null);
 useEffect(()=>{if(!line||line.tone==='wait')return;setShown(stamp);const timer=setTimeout(()=>setShown(value=>value===stamp?null:value),line.tone==='draw'||line.tone==='last'?9000:7000);return()=>clearTimeout(timer);},[stamp]);
 if(!line||shown!==stamp)return null;
 return <div className={`stage-one-coach tone-${line.tone}`} role="status" aria-live="polite">
  <span className="coach-icon" aria-hidden="true"><Lightbulb/></span>
  <div><strong>{line.title}</strong><p>{line.text}</p></div>
  <button type="button" onClick={()=>{try{localStorage.setItem(COACH_KEY,'off');}catch{}off();}}>{tr('안내 끄기')}</button>
 </div>;
}

/** Shown once, when the first stage 1 table opens: a one-minute look at the rules, or straight into the game. */
export function FirstGuidePrompt({practice,rules,play}:{practice:()=>void,rules:()=>void,play:()=>void}){
 const done=(next:()=>void)=>{try{localStorage.setItem(FIRST_GUIDE_KEY,'seen');}catch{}next();};
 return <div className="modal-shade first-guide-shade"><section className="modal menu-surface first-guide" role="dialog" aria-modal="true" aria-labelledby="first-guide-title">
  <span className="first-guide-icon" aria-hidden="true"><Lightbulb/></span>
  <h2 id="first-guide-title">{tr('턴테일이 처음이세요?')}</h2>
  <p>{tr('손패를 가장 먼저 다 내면 이기는 게임이에요. 앞사람이 낸 패와 같은 장수로 더 강한 패를 내고, 낼 패가 없으면 바닥에서 한 장 가져와요.')}</p>
  <p className="first-guide-note">{tr('스테이지 1에서는 내 차례마다 짧은 안내가 나와요.')}</p>
  <button className="primary first-guide-practice" onClick={()=>done(practice)}>{tr('연습 판으로 배우기')}<small>{tr('실제 화면에서 하나씩 따라 해요 · 약 2분')}</small></button>
  <div className="first-guide-actions"><button className="secondary" onClick={()=>done(play)}>{tr('바로 시작')}</button><button className="secondary" onClick={()=>done(rules)}>{tr('규칙만 보기')}</button></div>
 </section></div>;
}
