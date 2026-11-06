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

export function HpItemLobby({archive,start,resume,close,error,character,chooseCharacter,profession='swordsman',chooseProfession=()=>{}}:{archive:HpItemArchive,profession?:RpgProfessionId,chooseProfession?:(id:RpgProfessionId)=>void,start:()=>void,resume:()=>void,close:()=>void,error:string,character?:HpCharacterId,chooseCharacter?:(id:HpCharacterId)=>void}){
 const starter=RPG_SHOP_ITEMS,legacy=!!archive.active&&!archive.active.rpgRun?.combat?.itemBattle;
 return <div className="modal-shade" onClick={close}><section className="modal hp-item-lobby menu-surface menu-theme-items" role="dialog" aria-modal="true" aria-label="싱글플레이 아이템전" onClick={event=>event.stopPropagation()}>
  <button className="close" onClick={close} aria-label="아이템전 닫기">×</button><h2>아이템전</h2>
  <p>포인트 상점 · 족보 자동 스킬 · 판 종료 일괄 정산</p>
  <p className="hp-random-opponents">세계의 주민 30명 중 상대 2명이 무작위로 찾아와요.<small>한 대전 동안 같은 상대와 겨루며, 새 대전을 시작하면 다시 만나요.</small></p>
  <details className="hp-item-rule-details"><summary>규칙 보기</summary><div className="hp-item-rules">
   <span>나와 AI 2명 · 시작 HP {NEW_ITEM_MATCH_HP} · 누군가 HP 0이면 대전 종료</span>
   <span>매 라운드 첫 결투 종료 후 사용 · 자기 차례 아이템 1개 · 판당 아이템 2개</span>
   <span>족보 승리로 직업 효과 적립 · 한 명이 손패를 비우면 일괄 정산</span><span>싱글은 상대 각각 피해 1 · 페어 이상은 직업별 효과 적용</span>
   <span>공격·회복·함정·아이템 피해는 판 종료에 동시 반영</span><span>시작 20P · 정상 판 점수는 돈으로 정산 · 부족한 1P당 HP −1</span>
   <span>첫판 20P로 선택 구매 · 자동 준비금 없음</span><span>주화는 판 종료 시 남은 패 차이 점수로 정산 · HP 피해 추가 보상 없음</span>
   <span>도적은 페어 이상 바닥패 확인 · 트리플 이상 함정 자동 설치</span><span>미사용 아이템 계속 보관 · 무작위 유물 3개</span>
  </div></details>
  <RpgProfessionPicker selected={profession} choose={chooseProfession} itemBattle/>
  <p className="muted">20P로 상점에서 선택 구매 · 무료 시작 지급 없음</p><div className="hp-item-start-kit">{starter.map(id=><span key={id}><img src={itemImage(id)} alt=""/><small>{itemName(id)}<br/>{HP_ITEM_PRICES[id]}P</small></span>)}</div>
  {error&&<p className="stage-error" role="alert">{error}</p>}{legacy&&<p className="hp-legacy-save-note">저장된 대전은 이전 규칙으로 이어져요. 새 구성은 새 아이템전부터 적용해요.</p>}
  {archive.active&&<button className="primary full" onClick={resume}>아이템전 이어하기{legacy?' · 이전 규칙':''} →</button>}<button className={`${archive.active?'secondary':'primary'} full`} onClick={start}>새 아이템전 시작 →</button>
  {archive.records.length>0&&<details><summary>최근 아이템전 기록</summary><RecordList archive={archive}/></details>}
 </section></div>;
}
export {HpItemShop} from './HpItemShop';
export function HpItemResult({game,busy,next,restart,exit,rpg=false}:{game:View,busy:boolean,next:()=>void,restart:()=>void,exit:()=>void,rpg?:boolean}){
 const [reveal,setReveal]=useState(false);useEffect(()=>{const timer=setTimeout(()=>setReveal(true),120);return()=>clearTimeout(timer);},[]);
 const run=game.rpgRun;if(!run)return null;
 const complete=run.status==='complete',ranks=rpgRanks(run.hp,game.players.map(player=>player.count)),report=game.hpItemMatch?.report,variant=game.hpItemVariant,items=report?.items||[],battleMode=isBattleItemMode(game);
 return <div className="modal-shade result-shade"><section className="modal hp-item-result compact-item-result" role="dialog" aria-modal="true" aria-label={rpg?"RPG 판 정산":"아이템전 결과"}><header className="settlement-header"><span className="eyebrow">{rpg?`RPG · STAGE ${run.stage}`:"아이템전"} · {game.round}판</span><h2>{complete?`대전 종료 · ${ranks[game.me]}등`:'이번 판 정산'}</h2><p>{rpg?"이번 판의 체력과 주화 정산을 확인하세요.":"이번 판의 체력과 주화 변화를 확인하세요."}</p></header>{report?.moneySkipped&&<p className="battle-no-settlement" role="status">{report.endReason==='trap'?'함정으로':report.endReason==='ambush'?'투시 회수 기습으로':report.endReason==='active'?'직업 스킬로':report.endReason==='item'?'아이템으로':'싸움 종료 피해로'} 대전 종료 · 이번 판 돈 정산 없음{!!report?.skillMoney?.some(value=>value>0)&&<small> · 이미 얻은 스킬 주화는 유지</small>}</p>}<div className="hp-settlement">{game.players.map((player,index)=>({player,index})).sort((a,b)=>ranks[a.index]-ranks[b.index]).map(({player,index})=>{
 const health=rpg&&run.roundHealth?.round===game.round?run.roundHealth:undefined,before=health?.before[index]??report?.hpBefore[index]??run.hp[index],theme=seatPanelTheme(index);
 return <article key={player.id} style={{'--result-light':theme.light,'--result-dark':theme.dark,'--result-border':theme.border} as CSSProperties}><RpgHpBar maxHp={hpLimit(run)} hp={reveal?run.hp[index]:before} owner={player.name} summary={rpg?<span className="round-hp-totals">{health?<><span className="hp-lost">{health.partial?'기록된 피해':'이번 판 피해'} −{health.damage[index]}</span><span className="hp-recovered">회복 +{health.healing[index]}</span></>:<span>이전 저장 · 이번 판 상세 기록 없음</span>}</span>:<HpRoundTotals game={game} seat={index} before={before}/>} identity={<><SeatPortrait avatar={player.avatar} seat={index}/><strong>{player.name}<small>{ranks[index]}등</small></strong></>}/>{rpg?<div className="compact-hp-breakdown"><p className="round-money-detail">남은 패 {player.count}장 · 판 정산 <b>{(game.result?.players.find(row=>row.id===player.id)?.delta||0)>0?"+":""}{game.result?.players.find(row=>row.id===player.id)?.delta||0}P</b>{index===game.me&&<span className="money-balance"> · 보유 주화 {run.coins}P</span>}</p>{index===game.me&&!!health?.moneyDamage[index]&&<p className="round-money-shortage">주화 부족분 → HP −{health.moneyDamage[index]} (위 피해 합계에 포함)</p>}{run.hp[index]<=0&&<p>전투 퇴장</p>}</div>:<HpRoundBreakdown game={game} seat={index} before={before}/>}</article>;
 })}</div>{!rpg&&<details className="result-details"><summary>사용 아이템 <small>{items.length}회</small></summary>{game.players.map((player,seat)=>{const used=items.filter(item=>item.actor===seat);return used.length?<section className="actor-item-history" key={player.id}><h3><SeatPortrait avatar={player.avatar} seat={seat}/>{player.name}</h3>{used.map((item,index)=><p key={index}><img src={itemImage(item.id)} alt=""/><span>{itemUsageLine(item,game.players,game.me)}</span></p>)}</section>:null;})}{!items.length&&<p>사용한 아이템이 없어요.</p>}</details>}{!!report?.skills?.length&&<details className="result-details"><summary>고유스킬 사용 내역 <small>{report.skills.length}회</small></summary>{report.skills.map(skill=><p key={skill.id}>{game.players[skill.actor].name} · {hpSkillUseText(skill)}</p>)}</details>}<RpgProfessionHistory game={game}/><details className="result-details"><summary>남은 손패 보기</summary>{game.players.map((player,seat)=><section className="result-hand-row" key={player.id}><h3><SeatPortrait avatar={player.avatar} seat={seat}/>{player.name}<small>{player.count}장</small></h3><div>{player.hand?.length?player.hand.map(tile=><TileFace tile={tile} key={tile.id}/>):<small>{player.count?`남은 패 ${player.count}장`:'모두 냈어요.'}</small>}</div></section>)}</details>{!complete&&<button className="primary full" disabled={busy} onClick={next}>{!rpg&&(variant===2||battleMode)?'상점 · 다음 판 →':'다음 판 →'}</button>}{complete&&<button className="primary full" disabled={busy} onClick={restart}>새 아이템전 시작 →</button>}<button className="text-btn full" disabled={busy} onClick={exit}>{complete?'메인으로':'저장하고 나가기'}</button></section></div>;
}
function RecordList({archive}:{archive:HpItemArchive}){return <ol className="hp-item-records">{archive.records.map(record=><li key={record.id}><strong>{record.name}</strong> · {record.status==='abandoned'?'중단':`${record.rank}등 · HP ${record.hp[0]}`} · {record.rounds}라운드</li>)}</ol>;}
export function HpItemRecords({archive,error,close}:{archive:HpItemArchive,error:string,close:()=>void}){return <div className="modal-shade" onClick={close}><section className="modal hp-item-records-panel" role="dialog" aria-modal="true" aria-label="아이템전 기록" onClick={event=>event.stopPropagation()}><button className="close" onClick={close} aria-label="아이템전 기록 닫기">×</button><h2>아이템전 기록</h2>{error&&<p role="alert" className="stage-error">{error}</p>}{archive.records.length?<RecordList archive={archive}/>:<p className="muted">아직 완료한 아이템전이 없어요.</p>}<p className="foot muted">각 아이템전의 최근 10개 기록을 보관해요.</p></section></div>;}
