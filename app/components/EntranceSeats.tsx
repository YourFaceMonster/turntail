import type {CSSProperties} from 'react';
import SeatedCharacter from './SeatedCharacter';
import MonsterModel from './MonsterModel';
import StageModel from './StageModel';
import {STAGE_THEMES} from '../../lib/stage-theme';
import {entranceSeatLayout} from '../../lib/entrance-company';
export type EntranceCompany={name:string,avatar?:string,points:number,count:number}[];
/** Opponents sit beyond the rear rim, so the tabletop naturally occludes their lower bodies. */
export default function EntranceSeats({company,diameter,cx,cy,stage=0,viewport}:{company:EntranceCompany,diameter:number,cx:number,cy:number,stage?:number,viewport?:{width:number,height:number,overview:number}}){
 return <div className="entry-world-company" data-player-count={company.length+1}>{company.map((p,i)=>{const monster=!!p.avatar?.startsWith('korean-monster:'),painted=monster||!!p.avatar?.startsWith('stage-portrait:'),seat=entranceSeatLayout(diameter,cx,cy,i,company.length,painted,stage,viewport,p.avatar?.startsWith('stage-portrait:')?Number(p.avatar.split(':')[1]):undefined);return <div key={p.name+i} className={`entry-world-seat modeled-seat ${painted?'monster-seat':''}`} data-world-seat={i} style={{left:seat.left,top:seat.top,width:seat.width,height:seat.height,'--seat-floor':`${seat.support}px`} as CSSProperties}>
 {monster?<MonsterModel index={Number(p.avatar!.split(':')[1])}/>:p.avatar?.startsWith('stage-portrait:')?<StageModel index={Number(p.avatar.split(':')[1])} facing={i>=Math.ceil(company.length/2)?'left':'right'}/>:<SeatedCharacter name={p.name} avatar={p.avatar} index={i}/>}
 
 <span className="world-character-caption">{p.name}</span>
 </div>;})}</div>;
}

export function openingGreeting(avatar:string|undefined,_name:string){
 if(avatar?.startsWith('stage-portrait:'))return STAGE_THEMES.flatMap(t=>t.opponents).find(p=>p.portrait===Number(avatar.split(':')[1]))?.quote||'좋습니다. 한 수 겨뤄 보지요.';
 return avatar==='korean-monster:0'?'허허, 느긋하게 한 판 해볼까?':avatar==='korean-monster:1'?'좋아! 오늘은 내가 먼저 간다!':avatar==='korean-monster:2'?'끝까지 지켜보겠다. 시작하지.':'좋습니다. 한 수 겨뤄 보지요.';
}
