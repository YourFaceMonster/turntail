import type {CSSProperties} from 'react';
import SeatedCharacter from './SeatedCharacter';
import {tableWorldGeometry} from './EntranceWorld';
import MonsterModel from './MonsterModel';
import {ENTRANCE_MS} from '../../lib/atmosphere';
import {opponentSeats} from '../../lib/table-world';
export type EntranceCompany={name:string,avatar?:string,points:number,count:number}[];
/** Image planes sit beyond the rear rim, so the tabletop naturally occludes their lower bodies. */
export default function EntranceSeats({company,diameter,cx,cy,stage=0,greeting=false}:{company:EntranceCompany,diameter:number,cx:number,cy:number,stage?:number,greeting?:boolean}){
 const seats=opponentSeats(company.length),size=Math.max(150,Math.min(250,diameter*.18)),support=tableWorldGeometry(diameter,cx,cy,stage).height,height=support+size*1.25;
 return <div className="entry-world-company" data-player-count={company.length+1}>{company.map((p,i)=>{const monster=p.avatar?.startsWith('korean-monster:'),width=monster?height*2/3:size;return <div key={p.name+i} className={`entry-world-seat modeled-seat ${monster?'monster-seat':''}`} data-world-seat={i} style={{left:cx+seats[i].x*diameter-width/2,top:cy+(monster?-.53:seats[i].y)*diameter-height,width,height,'--seat-floor':`${support}px`,'--greeting-delay':`${i*ENTRANCE_MS.shuffle/company.length}ms`,'--greeting-ms':`${ENTRANCE_MS.shuffle/company.length}ms`} as CSSProperties}>
 {monster?<MonsterModel index={Number(p.avatar!.split(':')[1])}/>:<SeatedCharacter name={p.name} avatar={p.avatar} index={i}/>}
 {greeting&&<span className="entrance-greeting" role="status">{openingGreeting(p.avatar,p.name)}</span>}
 <span className="world-character-caption">{p.name}</span>
 </div>;})}</div>;
}

export function openingGreeting(avatar:string|undefined,name:string){return avatar==='korean-monster:0'?'허허, 느긋하게 한 판 해볼까?':avatar==='korean-monster:1'?'좋아! 오늘은 내가 먼저 간다!':avatar==='korean-monster:2'?'끝까지 지켜보겠다. 시작하지.':`${name}, 한 수 겨뤄 보지요.`;}
