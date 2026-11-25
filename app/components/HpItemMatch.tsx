"use client";
import {hpLimit} from '../../lib/hp-limit';
import {useEffect,useState,type CSSProperties} from 'react';
import type {view} from '../../lib/game.ts';
import {rpgRanks} from '../../lib/rpg.ts';
import {seatPanelTheme} from '../../lib/seat-presentation';
import {RpgProfessionHistory} from './RpgProfessions';
import SeatPortrait from './SeatPortrait';
import TileFace from './TileFace';
import {RpgHpBar} from './RpgHpBar';
import {tr,trv} from '../../lib/i18n/index.ts';
type View=ReturnType<typeof view>;

/** Story round settlement for legacy (pre-rework) journeys. The item-battle result screen was removed 2026-11-15. */
export function HpItemResult({game,busy,next,restart,exit}:{game:View,busy:boolean,next:()=>void,restart:()=>void,exit:()=>void,rpg?:boolean}){
 const [reveal,setReveal]=useState(false);useEffect(()=>{const timer=setTimeout(()=>setReveal(true),120);return()=>clearTimeout(timer);},[]);
 const run=game.rpgRun;if(!run)return null;
 const complete=run.status==='complete',ranks=rpgRanks(run.hp,game.players.map(player=>player.count));
 return <div className="modal-shade result-shade"><section className="modal hp-item-result compact-item-result" role="dialog" aria-modal="true" aria-label={tr('스토리 판 정산')}><header className="settlement-header"><span className="eyebrow">{tr('스토리 · {0}스테이지 · {1}판',{0:run.stage,1:game.round})}</span><h2>{complete?tr('대전 종료 · {0}등',{0:ranks[game.me]}):tr('이번 판 정산')}</h2><p>{tr('이번 판의 체력과 주화 정산을 확인하세요.')}</p></header><div className="hp-settlement">{game.players.map((player,index)=>({player,index})).sort((a,b)=>ranks[a.index]-ranks[b.index]).map(({player,index})=>{
  const health=run.roundHealth?.round===game.round?run.roundHealth:undefined,before=health?.before[index]??run.hp[index],theme=seatPanelTheme(index);
  const delta=game.result?.players.find(row=>row.id===player.id)?.delta||0;
  return <article key={player.id} style={{'--result-light':theme.light,'--result-dark':theme.dark,'--result-border':theme.border} as CSSProperties}><RpgHpBar maxHp={hpLimit(run)} hp={reveal?run.hp[index]:before} owner={player.name} summary={<span className="round-hp-totals">{health?<><span className="hp-lost">{health.partial?tr('기록된 피해'):tr('이번 판 피해')} −{health.damage[index]}</span><span className="hp-recovered">{tr('회복 +')}{health.healing[index]}</span></>:<span>{tr('이전 저장 · 이번 판 상세 기록 없음')}</span>}</span>} identity={<><SeatPortrait avatar={player.avatar} seat={index}/><strong>{trv(player.name)}<small>{ranks[index]}{tr('등')}</small></strong></>}/><div className="compact-hp-breakdown"><p className="round-money-detail">{tr('남은 패')} {player.count}{tr('장 · 판 정산')} <b>{delta>0?"+":""}{delta}P</b>{index===game.me&&<span className="money-balance"> {tr('· 보유 주화')} {run.coins}P</span>}</p>{index===game.me&&!!health?.moneyDamage[index]&&<p className="round-money-shortage">{tr('주화 부족분 → HP −')}{health.moneyDamage[index]} {tr('(위 피해 합계에 포함)')}</p>}{run.hp[index]<=0&&<p>{tr('전투 퇴장')}</p>}</div></article>;
 })}</div><RpgProfessionHistory game={game}/><details className="result-details"><summary>{tr('남은 손패 보기')}</summary>{game.players.map((player,seat)=><section className="result-hand-row" key={player.id}><h3><SeatPortrait avatar={player.avatar} seat={seat}/>{trv(player.name)}<small>{player.count}{tr('장')}</small></h3><div>{player.hand?.length?player.hand.map(tile=><TileFace tile={tile} key={tile.id}/>):<small>{player.count?tr('남은 패 {0}장',{0:player.count}):tr('모두 냈어요.')}</small>}</div></section>)}</details>{!complete&&<button className="primary full" disabled={busy} onClick={next}>{tr('다음 판')}</button>}{complete&&<button className="primary full" disabled={busy} onClick={restart}>{tr('새 여정 시작')}</button>}<button className="text-btn full" disabled={busy} onClick={exit}>{complete?tr('메인으로'):tr('저장하고 나가기')}</button></section></div>;
}
