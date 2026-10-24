import type {CSSProperties} from 'react';
import {ENTRANCE_MS} from '../../lib/atmosphere';
import {openingGreeting,type EntranceCompany} from './EntranceSeats';
import MonsterPortrait from './MonsterPortrait';
import {StagePortrait} from './StagePortrait';
export default function EntranceGreetings({company}:{company:EntranceCompany}){
 return <div className="entrance-greetings">{company.map((p,i)=><div className="intro-speech" key={p.name+i} style={{'--greeting-delay':`${i*ENTRANCE_MS.shuffle/company.length}ms`,'--greeting-ms':`${ENTRANCE_MS.shuffle/company.length}ms`} as CSSProperties}>
 {p.avatar?.startsWith('korean-monster:')?<MonsterPortrait index={Number(p.avatar.split(':')[1])}/>:<StagePortrait index={Number(p.avatar?.split(':')[1]||0)}/>}<span>{openingGreeting(p.avatar,p.name)}</span>
 </div>)}</div>;
}
