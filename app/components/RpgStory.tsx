"use client";
import {useState} from 'react';
import {StagePortrait} from './StagePortrait';
import {TwinPortrait} from './TwinPortrait';
import RpgPrologue from './RpgPrologue';

type Beat={speaker:string,line:string,portrait?:number,twin?:0|1,title?:string};
const camp:Beat[]=[
 {speaker:'이야기',line:'별빛 관문을 지나자, 천막과 등불이 모인 야영지가 나타난다.'},
 {speaker:'포코 · 행상인',line:'좋은 패는 팔지 않아. 직접 얻어야지.',portrait:3},
 {speaker:'밀라 · 야영지 요리사',line:'식기 전에 끝내자고? 그건 네 패에 달렸지.',portrait:4},
];
const boss:Beat[]=[
 {speaker:'이야기',line:'야영지의 불빛을 지나면, 오래된 이끼 돌계단이 구름 사이로 이어진다.'},
 {speaker:'첫째',line:'그 패는 네가 가지고 있잖아.',twin:0},
 {speaker:'둘째',line:'쉿. 아직 저자는 모르고 있어.',twin:1},
 {speaker:'둘째',line:'우리는 늘 둘이었어. 하지만 이번에는 각자의 승부야.',twin:1},
];

export default function RpgStory({kind,enter,close}:{kind:'opening'|'camp'|'boss',enter:()=>void,close:()=>void}){
 const [index,setIndex]=useState(0);
 if(kind==='opening')return <RpgPrologue enter={enter}/>;
 const beats=kind==='camp'?camp:boss;
 const beat=beats[index],last=index===beats.length-1;
 const title=beat.title||(kind==='camp'?'등불 야영지':'이끼 돌계단');
 return <div className="modal-shade rpg-story-shade">
  <section className="rpg-story" role="dialog" aria-modal="true" aria-label={kind==='camp'?'등불 야영지':'첫 보스 등장'}>
   <button className="rpg-story-close" onClick={close} aria-label="이야기 닫기">×</button>
   <div className="rpg-story-scene" data-scene={kind}><img src="/turntale-stage-map-0515.webp" alt="공중섬 지도"/><div className="rpg-story-vignette"/></div>
   <div className="rpg-story-content">
    <span className="eyebrow">{kind==='camp'?'STAGE 2 · CAMP':'STAGE 3 · FIRST BOSS'}</span>
    <h2>{title}</h2>
    <div className="rpg-story-dialogue" key={index}>
     {beat.portrait!==undefined&&<StagePortrait index={beat.portrait}/>}
     {beat.twin!==undefined&&<TwinPortrait index={beat.twin}/>}
     <div><strong>{beat.speaker}</strong><p>{beat.line}</p></div>
    </div>
    <div className="rpg-story-progress" aria-label={`장면 ${index+1} / ${beats.length}`}>{beats.map((_,i)=><i key={i} className={i===index?'active':''}/>)}</div>
    <div className="rpg-story-actions">
     <button className="text-btn" onClick={enter}>건너뛰고 시작</button>
     <button className="secondary" disabled={index===0} onClick={()=>setIndex(index-1)}>이전</button>
     <button className="primary" onClick={()=>last?enter():setIndex(index+1)}>{last?'승부 시작 →':'다음 →'}</button>
    </div>
   </div>
  </section>
 </div>;
}
