"use client";
import {STAGE_THEMES} from '../../lib/stage-theme';
import {StageVisuals} from './StageVisuals';
import TileFace from './TileFace';
import TileBack from './TileBack';
import TableSurface from './TableSurface';
import {tr} from '../../lib/i18n/index.ts';
export default function TableCollection({selected,unlocked,choose,disabled=false}:{selected:number,unlocked:number[],choose:(set:number)=>void,disabled?:boolean}){
 return <section className="table-collection" aria-labelledby="collection-title"><div className="collection-heading"><h3 id="collection-title">{tr('나의 패 · 테이블 세트')}</h3><span>{unlocked.length}{tr('개 보유')}</span></div><p>{tr('보유한 패와 테이블 세트를 선택해 주세요.')}</p>
 <div className="collection-grid">{[0,...STAGE_THEMES.map(t=>t.stage)].filter(set=>unlocked.includes(set)).map(set=>{const name=set?STAGE_THEMES[set-1].name:tr('오리지널');return <button key={set} type="button" disabled={disabled} aria-pressed={selected===set} aria-label={tr('{0} 세트 · {1}',{0:name,1:selected===set?'선택됨':'선택 가능'})} className={`collection-set ${selected===set?'chosen':''} unlocked`} onClick={()=>choose(set)}>
  <StageVisuals stage={set||undefined}><div className="collection-scene"><TableSurface/><div className="collection-tiles"><TileBack/><TileFace tile={{id:26,n:7,s:2}}/></div></div></StageVisuals>
  <strong>{name}</strong><small>{selected===set?tr('✓ 선택한 세트'):set?tr('보유한 세트'):tr('기본 세트')}</small>
 </button>;})}</div><small className="collection-note">{tr('일반 게임에는 선택한 세트가 적용돼요.')}</small></section>;
}
