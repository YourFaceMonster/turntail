'use client';
import {useEffect,useRef,useState} from 'react';
import RpgPrologue from '../components/RpgPrologue';
import {RPG_STORY_REEL} from '../../lib/rpg-connection-scenes';
const storySeconds=Math.ceil(RPG_STORY_REEL.reduce((sum,cut)=>sum+cut.duration,0)/1000);

export default function ProloguePreview(){
 const [playing,setPlaying]=useState(false),[finished,setFinished]=useState(false),[full,setFull]=useState(false);
 const audio=useRef<AudioContext|null>(null);
 useEffect(()=>()=>{void audio.current?.close();},[]);
 function play(){
  try{audio.current??=new AudioContext();void audio.current.resume().catch(()=>{});}catch{/* Visual playback remains available when audio is blocked. */}
  setPlaying(true);
 }
 return <main className="prologue-preview-page">
  <div className="prologue-preview-cover" aria-hidden="true"/>
  <section className="prologue-preview-intro"><small>TURNTALE · STORY</small><h1>한 장의 패,<br/>길의 시작.</h1><p>설원에서 시작해 노르문 마을로 이어지는 이야기</p><p className="prologue-preview-note">전체 감상 약 {Math.floor(storySeconds/60)}분 {storySeconds%60}초 · 전투 없이 자동 재생<br/>화면을 누르면 다음 장면 · 저장과 보상에 영향이 없습니다.</p><button className="prologue-preview-play" onClick={()=>{setFull(true);play();}}>프롤로그~ST3 전체 이어 보기 ↗</button><button className="prologue-preview-play" onClick={()=>{setFull(false);play();}}>{finished?'프롤로그 다시 재생':'프롤로그만 재생'} <span aria-hidden="true">↗</span></button><a href="/">게임으로 돌아가기</a></section>
  {playing&&<RpgPrologue key={full?'full-story':'prologue'} cuts={full?RPG_STORY_REEL:undefined} label={full?'프롤로그부터 ST3까지 전체 이야기':'턴테일 프롤로그'} context={audio.current} skipLabel={full?'전체 감상 종료':'건너뛰기'} enter={()=>{setPlaying(false);setFinished(true);}}/>}
 </main>;
}
