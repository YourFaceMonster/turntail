import type {CSSProperties} from 'react';
import SeatedCharacter from './SeatedCharacter';
import {tableWorldGeometry} from './EntranceWorld';
import MonsterModel from './MonsterModel';
import {opponentSeats} from '../../lib/table-world';
export type EntranceCompany={name:string,avatar?:string,points:number,count:number}[];
/** Upright busts and chairs occupy world seats, rather than floating in screen UI. */
export default function EntranceSeats({company,diameter,cx,cy,stage=0}:{company:EntranceCompany,diameter:number,cx:number,cy:number,stage?:number}){
 const seats=opponentSeats(company.length),size=Math.max(150,Math.min(250,diameter*.18)),support=tableWorldGeometry(diameter,cx,cy,stage).height,height=support+size*1.25;
 return <div className="entry-world-company" data-player-count={company.length+1}>{company.map((p,i)=>{const monster=p.avatar?.startsWith('korean-monster:'),width=monster?height*2/3:size;return <div key={p.name+i} className={`entry-world-seat modeled-seat ${monster?'monster-seat':''}`} data-world-seat={i} style={{left:cx+seats[i].x*diameter-width/2,top:cy+seats[i].y*diameter-height,width,height,'--seat-floor':`${support}px`,'--monster-lift':`${height*.24}px`} as CSSProperties}>
 {monster?<MonsterModel index={Number(p.avatar!.split(':')[1])}/>:<SeatedCharacter name={p.name} avatar={p.avatar} index={i}/>}
 <span className="world-character-caption">{p.name}</span>
 </div>;})}</div>;
}
