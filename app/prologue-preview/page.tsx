'use client';
import {useEffect,useRef,useState} from 'react';
import RpgPrologue from '../components/RpgPrologue';

export default function ProloguePreview(){
 const [playing,setPlaying]=useState(false),[finished,setFinished]=useState(false);
 const audio=useRef<AudioContext|null>(null);
 useEffect(()=>()=>{void audio.current?.close();},[]);
 function play(){
  try{audio.current??=new AudioContext();void audio.current.resume().catch(()=>{});}catch{/* Visual playback remains available when audio is blocked. */}
  setPlaying(true);
 }
 return <main className="prologue-preview-page">
  <div className="prologue-preview-cover" aria-hidden="true"/>
  <section className="prologue-preview-intro"><small>TURNTALE · PROLOGUE</small><h1>한 장의 패,<br/>길의 시작.</h1><p>설원에서 시작해 달의 영역으로 이어지는 이야기</p><p className="prologue-preview-note">약 68초 · 화면을 누르면 다음 장면</p><button className="prologue-preview-play" onClick={play}>{finished?'처음부터 다시 재생':'프롤로그 전체 재생'} <span aria-hidden="true">↗</span></button><a href="/">게임으로 돌아가기</a></section>
  {playing&&<RpgPrologue context={audio.current} enter={()=>{setPlaying(false);setFinished(true);}}/>}
 </main>;
}
