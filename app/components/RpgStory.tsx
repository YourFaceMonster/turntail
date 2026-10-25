"use client";
import {useState} from 'react';
import {StagePortrait} from './StagePortrait';
import {TwinPortrait} from './TwinPortrait';

type Beat={speaker:string,line:string,portrait?:number,twin?:0|1,title?:string};
const opening:Beat[]=[
 {speaker:'프롤로그',title:'네 문양의 전설',line:'오래전, 하늘에는 네 개의 문양이 있었다.\n달은 밤의 길을 열었고, 구름은 운명을 감추었으며, 별은 수많은 가능성을 비추었다.\n그리고 해는 그 모든 것 위에서 질서를 지켰다.'},
 {speaker:'프롤로그',title:'2의 법칙',line:'세상에는 숫자만큼이나 오래된 법칙이 있었다.\n가장 높은 자리에 앉는 것은 언제나 2.\n그러나 그 법칙이 어떻게 생겨났는지 아는 자는 없었다.'},
 {speaker:'프롤로그',title:'닫힌 왕좌',line:'어느 날, 네 문양을 이어 주던 힘이 흩어지고 해의 왕좌로 향하는 길이 닫혔다.\n이제 여행자는 세 영역의 수호자에게 인정받아 문양을 모아야 한다.\n그리고 마지막 해의 영역에서 질문의 답을 마주하게 된다.\n“왜 첫 번째가 아닌, 두 번째가 왕인가?”'},
 {speaker:'로웬 · 관문지기',line:'들어오는 건 쉬워도, 이 테이블은 그냥 지나칠 수 없지.',portrait:0},
 {speaker:'루미 · 등불 안내자',line:'길은 내가 비춰줄게. 다음 수는 네가 찾아봐!',portrait:1},
 {speaker:'이야기',line:'낡은 뼈 패가 탁자 위에 놓인다. 공중섬에서의 첫 승부가 시작된다.'},
];
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
 const beats=kind==='opening'?opening:kind==='camp'?camp:boss;
 const beat=beats[index],last=index===beats.length-1;
 const title=beat.title||(kind==='opening'?'별빛 관문':kind==='camp'?'등불 야영지':'이끼 돌계단');
 return <div className="modal-shade rpg-story-shade">
  <section className="rpg-story" role="dialog" aria-modal="true" aria-label={kind==='opening'?'RPG 여정 인트로':kind==='camp'?'등불 야영지':'첫 보스 등장'}>
   <button className="rpg-story-close" onClick={close} aria-label="이야기 닫기">×</button>
   <div className="rpg-story-scene" data-scene={kind}><img src="/turntale-stage-map-0515.webp" alt="공중섬 지도"/><div className="rpg-story-vignette"/></div>
   <div className="rpg-story-content">
    <span className="eyebrow">{kind==='opening'?'THE FLOATING ISLES · PROLOGUE':kind==='camp'?'STAGE 2 · CAMP':'STAGE 3 · FIRST BOSS'}</span>
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
