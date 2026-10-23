import type {CSSProperties} from 'react';
import {StagePortrait} from './StagePortrait';
import {opponentSeats} from '../../lib/table-world';
import TileBack from './TileBack';
export type EntranceCompany={name:string,avatar?:string,points:number,count:number}[];
/** Upright busts and chairs occupy world seats, rather than floating in screen UI. */
export default function EntranceSeats({company,diameter,cx,cy}:{company:EntranceCompany,diameter:number,cx:number,cy:number}){
 const seats=opponentSeats(company.length),size=Math.max(120,Math.min(220,diameter*.18));
 return <div className="entry-world-company" data-player-count={company.length+1}>{company.map((p,i)=><div key={p.name+i} className="entry-world-seat" data-world-seat={i} style={{left:cx+seats[i].x*diameter-size/2,top:cy+seats[i].y*diameter-size*1.45,width:size,height:size*1.45,'--seat-color':['#526d74','#8c6b58','#61785b'][i]} as CSSProperties}>
 <div className="world-chair"/><div className="world-companion-body"><i/><b/></div>
 <div className="world-companion-portrait">{p.avatar?.startsWith('stage-portrait:')?<StagePortrait index={Number(p.avatar.split(':')[1])}/>:p.avatar?<img src={p.avatar} alt=""/>:<span>{['🦉','🐯','🐼'][i]}</span>}</div>
 <div className="world-held-tiles">{Array.from({length:Math.min(3,p.count)},(_,n)=><TileBack flat key={n}/>)}</div>
 <strong>{p.name}</strong><small>{p.points}점 · {p.count}장</small>
 </div>)}</div>;
}
