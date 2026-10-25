"use client";
import {useState} from 'react';
import type {view} from '../../lib/game.ts';
import {suits} from '../../lib/game.ts';
import {RPG_CONSUMABLES,RPG_RELICS} from '../../lib/rpg.ts';
import type {RpgTacticalItem} from '../../lib/rpg-items.ts';
import TileFace from './TileFace';

type View=ReturnType<typeof view>;
const tacticalIds:readonly string[]=['swapped-fate','fates-scales','scout-lens'];
export function RpgTacticalPouch({game,enabled,use,close}:{game:View,enabled:boolean,use:(id:RpgTacticalItem,target:number)=>void,close:()=>void}){
 const run=game.rpgRun;
 const [opponent,setOpponent]=useState(1),[stack,setStack]=useState(-1);
 if(!run)return null;
 const used=run.tacticalRound===game.round?(run.tacticalUsed||0):0;
 const usedTurn=run.tacticalRound===game.round&&run.tacticalTurn===game.roundActions;
 const stacks=game.stacks.flatMap((item,index)=>item.available&&item.upper?[index]:[]);
 const peek=run.tacticalPeek?.round===game.round&&game.turn===game.me&&usedTurn?run.tacticalPeek:undefined;
 const owned=[...new Set(run.consumables)];
 const hasExchange=owned.some(id=>id==='swapped-fate'||id==='fates-scales');
 const hasLens=owned.includes('scout-lens');
 return <div className="modal-shade item-shade" onClick={close}><section className="modal item-pouch rpg-equipment-pouch" role="dialog" aria-modal="true" aria-label="RPG 장비와 가방" onClick={event=>event.stopPropagation()}>
  <button className="close" aria-label="가방 닫기" onClick={close}>×</button><span className="eyebrow">RPG JOURNEY · STAGE {run.stage}</span><h2>장비와 가방</h2>
  <h3>장착 유물 {run.equipped.length}/3</h3><div className="rpg-equipped-list">{run.equipped.map(id=>{const relic=RPG_RELICS.find(item=>item.id===id);return <div key={id}><img src={`/rpg-items-v1/relics/${id}.webp`} alt=""/><strong>{relic?.name||id}</strong><small>{relic?.effect}</small></div>;})}{!run.equipped.length&&<p>장착한 유물이 없어요. 스테이지 보상을 받으면 준비 구간에서 장착할 수 있어요.</p>}</div>
  <h3>보유 아이템 {run.consumables.length}/3</h3><p>전술 아이템은 내 차례에 본 행동 전 1개, 한 카드 판에 최대 2개를 사용할 수 있어요. 생존 아이템은 전투 사이 준비 구간에서 사용합니다.</p><p>이번 판 전술 아이템 {used}/2개 사용</p>
  {hasExchange&&<label>교환할 상대<select value={opponent} onChange={event=>setOpponent(Number(event.target.value))}>{game.players.map((player,index)=>index===game.me?null:<option key={player.id} value={index}>{player.name} · 손패 {player.count}장</option>)}</select></label>}
  {hasLens&&<label>정찰할 외곽 위층<select value={stack} onChange={event=>setStack(Number(event.target.value))}><option value={-1}>바닥 위치 선택</option>{stacks.map(index=><option key={index} value={index}>{Math.floor(index/game.cols)+1}행 {index%game.cols+1}열</option>)}</select></label>}
  <div className="item-cards">{owned.map(id=>{const item=RPG_CONSUMABLES.find(entry=>entry.id===id),count=run.consumables.filter(entry=>entry===id).length,tactical=tacticalIds.includes(id),required=id==='fates-scales'?2:1,canExchange=game.players[game.me].count>=required&&game.players[opponent]?.count>=required;
   const content=<><img src={`/rpg-items-v1/consumables/${id}.webp`} alt=""/><strong>{item?.name||id}<small>{count}개</small></strong><p>{item?.effect}</p><b>{tactical?id==='scout-lens'&&stack<0?'위치 선택 후 사용':usedTurn?'이번 차례 사용 완료':'사용하기':'준비 구간에서 사용'}</b></>;
   return tactical?<button key={id} disabled={!enabled||used>=2||usedTurn||(id==='scout-lens'?stack<0:!canExchange)} onClick={()=>use(id as RpgTacticalItem,id==='scout-lens'?stack:opponent)}>{content}</button>:<div className="rpg-owned-item" key={id}>{content}</div>;
  })}{!owned.length&&<p>보유 아이템이 없어요. 스테이지 보상과 상점에서 획득할 수 있어요.</p>}</div>
  {peek&&<section className="item-intel" role="status"><strong>정찰 렌즈 · {Math.floor(peek.index/game.cols)+1}행 {peek.index%game.cols+1}열</strong><div className="item-scout"><TileFace tile={peek.tile}/><span>{suits[peek.tile.s]} {peek.tile.n}<small>이번 차례에만 표시됩니다.</small></span></div></section>}
  <button className="primary full" onClick={close}>테이블로 돌아가기</button>
 </section></div>;
}
