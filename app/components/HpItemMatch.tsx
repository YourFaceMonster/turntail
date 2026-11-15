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
type View=ReturnType<typeof view>;

/** Story round settlement for legacy (pre-rework) journeys. The item-battle result screen was removed 2026-11-15. */
export function HpItemResult({game,busy,next,restart,exit}:{game:View,busy:boolean,next:()=>void,restart:()=>void,exit:()=>void,rpg?:boolean}){
 const [reveal,setReveal]=useState(false);useEffect(()=>{const timer=setTimeout(()=>setReveal(true),120);return()=>clearTimeout(timer);},[]);
 const run=game.rpgRun;if(!run)return null;
 const complete=run.status==='complete',ranks=rpgRanks(run.hp,game.players.map(player=>player.count));
 return <div className="modal-shade result-shade"><section className="modal hp-item-result compact-item-result" role="dialog" aria-modal="true" aria-label="스토리 판 정산"><header className="settlement-header"><span className="eyebrow">{`STORY · STAGE ${run.stage}`} · {game.round}판</span><h2>{complete?`대전 종료 · ${ranks[game.me]}등`:'이번 판 정산'}</h2><p>이번 판의 체력과 주화 정산을 확인하세요.</p></header><div className="hp-settlement">{game.players.map((player,index)=>({player,index})).sort((a,b)=>ranks[a.index]-ranks[b.index]).map(({player,index})=>{
  const health=run.roundHealth?.round===game.round?run.roundHealth:undefined,before=health?.before[index]??run.hp[index],theme=seatPanelTheme(index);
  const delta=game.result?.players.find(row=>row.id===player.id)?.delta||0;
  return <article key={player.id} style={{'--result-light':theme.light,'--result-dark':theme.dark,'--result-border':theme.border} as CSSProperties}><RpgHpBar maxHp={hpLimit(run)} hp={reveal?run.hp[index]:before} owner={player.name} summary={<span className="round-hp-totals">{health?<><span className="hp-lost">{health.partial?'기록된 피해':'이번 판 피해'} −{health.damage[index]}</span><span className="hp-recovered">회복 +{health.healing[index]}</span></>:<span>이전 저장 · 이번 판 상세 기록 없음</span>}</span>} identity={<><SeatPortrait avatar={player.avatar} seat={index}/><strong>{player.name}<small>{ranks[index]}등</small></strong></>}/><div className="compact-hp-breakdown"><p className="round-money-detail">남은 패 {player.count}장 · 판 정산 <b>{delta>0?"+":""}{delta}P</b>{index===game.me&&<span className="money-balance"> · 보유 주화 {run.coins}P</span>}</p>{index===game.me&&!!health?.moneyDamage[index]&&<p className="round-money-shortage">주화 부족분 → HP −{health.moneyDamage[index]} (위 피해 합계에 포함)</p>}{run.hp[index]<=0&&<p>전투 퇴장</p>}</div></article>;
 })}</div><RpgProfessionHistory game={game}/><details className="result-details"><summary>남은 손패 보기</summary>{game.players.map((player,seat)=><section className="result-hand-row" key={player.id}><h3><SeatPortrait avatar={player.avatar} seat={seat}/>{player.name}<small>{player.count}장</small></h3><div>{player.hand?.length?player.hand.map(tile=><TileFace tile={tile} key={tile.id}/>):<small>{player.count?`남은 패 ${player.count}장`:'모두 냈어요.'}</small>}</div></section>)}</details>{!complete&&<button className="primary full" disabled={busy} onClick={next}>다음 판 →</button>}{complete&&<button className="primary full" disabled={busy} onClick={restart}>새 여정 시작 →</button>}<button className="text-btn full" disabled={busy} onClick={exit}>{complete?'메인으로':'저장하고 나가기'}</button></section></div>;
}
