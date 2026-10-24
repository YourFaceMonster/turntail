import type {CSSProperties} from 'react';
import {ENTRANCE_MS} from '../../lib/atmosphere';
import {openingGreeting,type EntranceCompany} from './EntranceSeats';
import {entranceSeatLayout,greetingPlacement,type CompanyViewport} from '../../lib/entrance-company';
export default function EntranceGreetings({company,diameter=1900,cx=681,cy=468,stage=0,viewport={width:1363,height:936,overview:.38}}:{company:EntranceCompany,diameter?:number,cx?:number,cy?:number,stage?:number,viewport?:CompanyViewport}){
 return <div className="entrance-greetings">{company.map((p,i)=>{
 const seat=entranceSeatLayout(diameter,cx,cy,i,company.length,!!p.avatar?.startsWith('korean-monster:')||!!p.avatar?.startsWith('stage-portrait:'),stage,viewport),bubble=greetingPlacement(seat.head,viewport,i,company.length);
 return <div className="intro-speech" data-speaker={p.name} key={p.name+i} style={{left:bubble.left,top:bubble.top,width:bubble.width,'--bubble-tail':`${bubble.tail}px`,'--tail-angle':`${bubble.headX>bubble.left+bubble.tail?60:-60}deg`,'--greeting-delay':`${i*ENTRANCE_MS.shuffle/company.length}ms`,'--greeting-ms':`${ENTRANCE_MS.shuffle/company.length}ms`} as CSSProperties}><span>{openingGreeting(p.avatar,p.name)}</span></div>;
 })}</div>;
}
