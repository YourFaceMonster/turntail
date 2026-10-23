"use client";
import {STAGE_THEMES} from '../../lib/stage-theme';
import {StageVisuals} from './StageVisuals';
import TileFace from './TileFace';
import TileBack from './TileBack';
import TableSurface from './TableSurface';
export default function TableCollection({selected,unlocked,choose,disabled=false}:{selected:number,unlocked:number[],choose:(set:number)=>void,disabled?:boolean}){
 return <section className="table-collection" aria-labelledby="collection-title"><div className="collection-heading"><h3 id="collection-title">나의 패 · 테이블 세트</h3><span>{unlocked.length}/11</span></div><p>스테이지를 클리어할 때마다 그곳의 세트가 열려요.</p>
 <div className="collection-grid">{[0,...STAGE_THEMES.map(t=>t.stage)].map(set=>{const open=unlocked.includes(set),name=set?STAGE_THEMES[set-1].name:'오리지널';return <button key={set} type="button" disabled={disabled||!open} aria-pressed={selected===set} aria-label={`${name} 세트 · ${!open?`${set}스테이지 클리어 시 해금`:selected===set?'선택됨':'선택 가능'}`} className={`collection-set ${selected===set?'chosen':''} ${open?'unlocked':'locked'}`} onClick={()=>choose(set)}>
  <StageVisuals stage={set||undefined}><div className="collection-scene"><TableSurface/><div className="collection-tiles"><TileBack/><TileFace tile={{id:26,n:7,s:2}}/></div>{!open&&<span className="collection-lock" aria-hidden="true">◇</span>}</div></StageVisuals>
  <strong>{name}</strong><small>{!open?`STAGE ${set} 클리어`:selected===set?'✓ 선택한 세트':set?'해금 완료':'기본 세트'}</small>
 </button>;})}</div><small className="collection-note">일반 게임에는 선택한 세트가 적용돼요. 도전모드의 바닥은 해당 지역의 재질로 꾸며져요.</small></section>;
}
