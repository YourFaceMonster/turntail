import {StageVisuals} from './StageVisuals';
import {StagePortrait} from './StagePortrait';
import TileFace from './TileFace';
import TileBack from './TileBack';
import TableSurface from './TableSurface';
import {stageTheme,stageOpponents} from '../../lib/stage-theme';
import {stagePalette} from '../../lib/stage-presentation';
import type {CSSProperties} from 'react';
/** One destination-specific reveal appears only on a stage clear, never every round. */
export default function StageClearReveal({stage,reason,complete=false}:{stage:number,reason:string,complete?:boolean}){
 const theme=stageTheme(stage),next=stage<10?stageTheme(stage+1):null;
 return <div className={`stage-clear-reveal ${complete?'journey-complete':''}`} data-cleared-stage={stage} style={{'--clear-accent':theme.accent,'--clear-base':stagePalette(stage).base,'--clear-image':`url('/environments/stage-${stage}-055.webp')`} as CSSProperties}>
  <div className="clear-destination-art" aria-hidden="true"/><div className="clear-stardust" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{left:`${8+(i*37)%87}%`,top:`${12+(i*23)%65}%`,animationDelay:`${i*.16}s`}}/>)}</div>
  <span className="clear-stage-stamp">{String(stage).padStart(2,'0')}<small>REGION CLEARED</small></span>
  <div className="clear-reveal-copy"><span className="eyebrow">{complete?'THE JOURNEY IS COMPLETE':'A NEW CHAPTER OPENS'}</span><h2>{complete?'붉은 세계수, 여정의 완성':`${theme.name} 클리어`}</h2><p>{reason}</p></div>
  <div className="clear-guardians" aria-label="이번 지역의 상대">{stageOpponents(stage).map(p=><div key={p.name}><StagePortrait index={p.portrait}/><small>{p.name}</small></div>)}</div>
  <StageVisuals stage={stage}><div className="clear-unlocked-set"><div className="clear-material-preview"><TableSurface stage={stage}/><TileBack/><TileFace tile={{id:51,n:7,s:3}}/><TileFace tile={{id:24,n:10,s:2}}/></div><div><span>NEW COLLECTION</span><strong>{theme.name} 세트 해금</strong><small>{theme.material} 패 · 프로필에서 선택할 수 있어요</small></div></div></StageVisuals>
  {next?<div className="clear-next-destination"><small>NEXT DESTINATION · {String(stage+1).padStart(2,'0')}</small><strong>{next.name}</strong><span>{next.short}</span></div>:<div className="clear-next-destination"><small>ALL 10 COLLECTIONS UNLOCKED</small><strong>모든 지역이 당신의 승부를 기억합니다.</strong></div>}
 </div>;
}
