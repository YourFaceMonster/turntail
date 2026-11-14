"use client";
import {NEW_ITEM_MATCH_HP,hpLimit} from '../../lib/hp-limit';
import {useEffect,useState,type CSSProperties} from 'react';
import type {view} from '../../lib/game.ts';
import type {HpItemArchive} from '../../lib/hp-item-mode.ts';
import {RPG_SHOP_ITEMS,itemImage} from '../../lib/rpg-items.ts';
import {rpgRanks,RPG_CONSUMABLES} from '../../lib/rpg.ts';
import {isBattleItemMode} from '../../lib/hp-item-battle';
import {HP_ITEM_PRICES} from '../../lib/hp-item-shop.ts';
import {seatPanelTheme} from '../../lib/seat-presentation';
import {itemUsageLine} from '../../lib/hp-item-summary';
import {hpSkillUseText,type HpCharacterId} from '../../lib/hp-item-skills.ts';
import {RpgProfessionPicker,RpgProfessionHistory} from './RpgProfessions';
import type {RpgProfessionId} from '../../lib/rpg-professions.ts';
import SeatPortrait from './SeatPortrait';
import TileFace from './TileFace';
import {RpgHpBar} from './RpgHpBar';
import {HpRoundBreakdown,HpRoundTotals} from './HpRoundBreakdown';
type View=ReturnType<typeof view>;
const itemName=(id:string)=>RPG_CONSUMABLES.find(item=>item.id===id)?.name||id;

export {HpItemShop} from './HpItemShop';
export function HpItemResult({game,busy,next,restart,exit,rpg=false}:{game:View,busy:boolean,next:()=>void,restart:()=>void,exit:()=>void,rpg?:boolean}){
 const [reveal,setReveal]=useState(false);useEffect(()=>{const timer=setTimeout(()=>setReveal(true),120);return()=>clearTimeout(timer);},[]);
 const run=game.rpgRun;if(!run)return null;
 const complete=run.status==='complete',ranks=rpgRanks(run.hp,game.players.map(player=>player.count)),report=game.hpItemMatch?.report,variant=game.hpItemVariant,items=report?.items||[],battleMode=isBattleItemMode(game);
 return <div className="modal-shade result-shade"><section className="modal hp-item-result compact-item-result" role="dialog" aria-modal="true" aria-label={rpg?"스토리 판 정산":"아이템전 결과"}><header className="settlement-header"><span className="eyebrow">{rpg?`STORY · STAGE ${run.stage}`:"아이템전"} · {game.round}판</span><h2>{complete?`대전 종료 · ${ranks[game.me]}등`:'이번 판 정산'}</h2><p>{rpg?"이번 판의 체력과 주화 정산을 확인하세요.":"이번 판의 체력과 주화 변화를 확인하세요."}</p></header>{report?.moneySkipped&&<p className="battle-no-settlement" role="status">{report.endReason==='trap'?'함정으로':report.endReason==='ambush'?'투시 회수 기습으로':report.endReason==='active'?'직업 스킬로':report.endReason==='item'?'아이템으로':'싸움 종료 피해로'} 대전 종료 · 이번 판 돈 정산 없음{!!report?.skillMoney?.some(value=>value>0)&&<small> · 이미 얻은 스킬 주화는 유지</small>}</p>}<div className="hp-settlement">{game.players.map((player,index)=>({player,index})).sort((a,b)=>ranks[a.index]-ranks[b.index]).map(({player,index})=>{
 const health=rpg&&run.roundHealth?.round===game.round?run.roundHealth:undefined,before=health?.before[index]??report?.hpBefore[index]??run.hp[index],theme=seatPanelTheme(index);
 return <article key={player.id} style={{'--result-light':theme.light,'--result-dark':theme.dark,'--result-border':theme.border} as CSSProperties}><RpgHpBar maxHp={hpLimit(run)} hp={reveal?run.hp[index]:before} owner={player.name} summary={rpg?<span className="round-hp-totals">{health?<><span className="hp-lost">{health.partial?'기록된 피해':'이번 판 피해'} −{health.damage[index]}</span><span className="hp-recovered">회복 +{health.healing[index]}</span></>:<span>이전 저장 · 이번 판 상세 기록 없음</span>}</span>:<HpRoundTotals game={game} seat={index} before={before}/>} identity={<><SeatPortrait avatar={player.avatar} seat={index}/><strong>{player.name}<small>{ranks[index]}등</small></strong></>}/>{rpg?<div className="compact-hp-breakdown"><p className="round-money-detail">남은 패 {player.count}장 · 판 정산 <b>{(game.result?.players.find(row=>row.id===player.id)?.delta||0)>0?"+":""}{game.result?.players.find(row=>row.id===player.id)?.delta||0}P</b>{index===game.me&&<span className="money-balance"> · 보유 주화 {run.coins}P</span>}</p>{index===game.me&&!!health?.moneyDamage[index]&&<p className="round-money-shortage">주화 부족분 → HP −{health.moneyDamage[index]} (위 피해 합계에 포함)</p>}{run.hp[index]<=0&&<p>전투 퇴장</p>}</div>:<HpRoundBreakdown game={game} seat={index} before={before}/>}</article>;
 })}</div>{!rpg&&<details className="result-details"><summary>사용 아이템 <small>{items.length}회</small></summary>{game.players.map((player,seat)=>{const used=items.filter(item=>item.actor===seat);return used.length?<section className="actor-item-history" key={player.id}><h3><SeatPortrait avatar={player.avatar} seat={seat}/>{player.name}</h3>{used.map((item,index)=><p key={index}><img src={itemImage(item.id)} alt=""/><span>{itemUsageLine(item,game.players,game.me)}</span></p>)}</section>:null;})}{!items.length&&<p>사용한 아이템이 없어요.</p>}</details>}{!!report?.skills?.length&&<details className="result-details"><summary>고유스킬 사용 내역 <small>{report.skills.length}회</small></summary>{report.skills.map(skill=><p key={skill.id}>{game.players[skill.actor].name} · {hpSkillUseText(skill)}</p>)}</details>}<RpgProfessionHistory game={game}/><details className="result-details"><summary>남은 손패 보기</summary>{game.players.map((player,seat)=><section className="result-hand-row" key={player.id}><h3><SeatPortrait avatar={player.avatar} seat={seat}/>{player.name}<small>{player.count}장</small></h3><div>{player.hand?.length?player.hand.map(tile=><TileFace tile={tile} key={tile.id}/>):<small>{player.count?`남은 패 ${player.count}장`:'모두 냈어요.'}</small>}</div></section>)}</details>{!complete&&<button className="primary full" disabled={busy} onClick={next}>{!rpg&&(variant===2||battleMode)?'상점 · 다음 판 →':'다음 판 →'}</button>}{complete&&<button className="primary full" disabled={busy} onClick={restart}>새 아이템전 시작 →</button>}<button className="text-btn full" disabled={busy} onClick={exit}>{complete?'메인으로':'저장하고 나가기'}</button></section></div>;
}
