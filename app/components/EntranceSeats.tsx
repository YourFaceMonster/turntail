import type {CSSProperties} from 'react';
import SeatedCharacter from './SeatedCharacter';
import {tableWorldGeometry} from './EntranceWorld';
import MonsterModel from './MonsterModel';
import {projectEntrancePoint} from '../../lib/entrance-gpu';
import {SEATED_TILT,seatedScale} from '../../lib/entrance-camera';
import {opponentSeats} from '../../lib/table-world';
export type EntranceCompany={name:string,avatar?:string,points:number,count:number}[];
/** Opponents sit beyond the rear rim, so the tabletop naturally occludes their lower bodies. */
export default function EntranceSeats({company,diameter,cx,cy,stage=0,viewport}:{company:EntranceCompany,diameter:number,cx:number,cy:number,stage?:number,viewport?:{width:number,height:number,overview:number}}){
 const seats=opponentSeats(company.length),size=Math.max(150,Math.min(250,diameter*.18)),support=tableWorldGeometry(diameter,cx,cy,stage).height,desired=support+Math.max(450,diameter*.5);
 let height=desired;
 if(viewport){const camera={width:viewport.width,height:viewport.height,scale:seatedScale(viewport.overview),tilt:SEATED_TILT};let lo=support+size,hi=desired;for(let j=0;j<20;j++){const mid=(lo+hi)/2,head=projectEntrancePoint(cx,cy-.53*diameter,mid-support,camera);if(head.y<viewport.height*.09)hi=mid;else lo=mid;}height=lo;}
 return <div className="entry-world-company" data-player-count={company.length+1}>{company.map((p,i)=>{const monster=p.avatar?.startsWith('korean-monster:'),seatHeight=monster?height:support+size*1.6,width=monster?height*2/3:size*1.45;return <div key={p.name+i} className={`entry-world-seat modeled-seat ${monster?'monster-seat':''}`} data-world-seat={i} style={{left:cx+seats[i].x*diameter-width/2,top:cy-.53*diameter-seatHeight,width,height:seatHeight,'--seat-floor':`${support}px`} as CSSProperties}>
 {monster?<MonsterModel index={Number(p.avatar!.split(':')[1])}/>:<SeatedCharacter name={p.name} avatar={p.avatar} index={i}/>}
 
 <span className="world-character-caption">{p.name}</span>
 </div>;})}</div>;
}

export function openingGreeting(avatar:string|undefined,name:string){return avatar==='korean-monster:0'?'허허, 느긋하게 한 판 해볼까?':avatar==='korean-monster:1'?'좋아! 오늘은 내가 먼저 간다!':avatar==='korean-monster:2'?'끝까지 지켜보겠다. 시작하지.':`${name}, 한 수 겨뤄 보지요.`;}
