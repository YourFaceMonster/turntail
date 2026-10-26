"use client";
import {useState} from 'react';
import type {view} from '../../lib/game.ts';
import {RPG_CONSUMABLES} from '../../lib/rpg.ts';
import type {RpgTacticalItem} from '../../lib/rpg-items.ts';

type View=ReturnType<typeof view>;
const tacticalIds:readonly string[]=['swapped-fate','fates-scales','scout-lens'];

export function RpgTacticalPouch({game,enabled,use,selectScout,close}:{game:View,enabled:boolean,use:(id:RpgTacticalItem,target:number)=>void,selectScout:()=>void,close:()=>void}){
 const run=game.rpgRun;
 const [exchangeItem,setExchangeItem]=useState<Exclude<RpgTacticalItem,'scout-lens'>|null>(null);
 if(!run)return null;
 const used=run.tacticalRound===game.round?(run.tacticalUsed||0):0;
 const usedTurn=run.tacticalRound===game.round&&run.tacticalTurn===game.roundActions;
 const scoutTargets=game.stacks.some(stack=>stack.available&&stack.upper);
 const owned=[...new Set(run.consumables)];
 const exchange=RPG_CONSUMABLES.find(item=>item.id===exchangeItem),exchangeCount=exchangeItem==='fates-scales'?2:1;
 return <div className="modal-shade item-shade rpg-pouch-shade" onClick={close}><section className={`modal item-pouch rpg-equipment-pouch ${exchangeItem?'rpg-exchange-pouch':''}`} role="dialog" aria-modal="true" aria-label={exchangeItem?'교환 상대 선택':'RPG 아이템창'} onClick={event=>event.stopPropagation()}>
  <header className="rpg-pouch-heading"><div><span className="eyebrow">RPG · STAGE {run.stage}</span><h2>{exchangeItem?'누구와 교환하시겠습니까?':`아이템 ${run.consumables.length}/3`}</h2></div><button className="close" aria-label="아이템창 닫기" onClick={close}>×</button></header>
  {exchangeItem?<>
   <div className="rpg-exchange-item"><img src={`/rpg-items-v1/consumables/${exchangeItem}.webp`} alt=""/><p><strong>{exchange?.name}</strong><span>서로 무작위 패 {exchangeCount}장을 교환해요.</span></p></div>
   <div className="rpg-exchange-targets">{game.players.map((player,index)=>{if(index===game.me)return null;const enough=player.count>=exchangeCount&&game.players[game.me].count>=exchangeCount;return <button key={player.id} disabled={!enabled||used>=2||usedTurn||!enough} onClick={()=>{use(exchangeItem,index);close();}}><strong>{player.name}</strong><span>{enough?`손패 ${player.count}장 · 선택하여 교환`:`손패 ${exchangeCount}장 이상 필요`}</span></button>;})}</div>
   <button className="text-btn rpg-exchange-back" onClick={()=>setExchangeItem(null)}>← 아이템 다시 선택</button>
  </>:<>
  <p className="rpg-item-help">내 차례에 전술 아이템을 눌러 사용해요. 한 차례에 1개, 한 판에 최대 2개. 준비 아이템은 판 사이에 사용해요.</p>
  <div className="item-cards">{owned.map(id=>{const item=RPG_CONSUMABLES.find(entry=>entry.id===id),count=run.consumables.filter(entry=>entry===id).length,tactical=tacticalIds.includes(id),required=id==='fates-scales'?2:1,canExchange=game.players[game.me].count>=required&&game.players.some((player,index)=>index!==game.me&&player.count>=required);
   const content=<><img src={`/rpg-items-v1/consumables/${id}.webp`} alt=""/><strong>{item?.name||id}<small>{count}개</small></strong><p>{item?.effect}</p><b>{tactical?usedTurn?'이번 차례 사용 완료':id==='scout-lens'?'바닥에서 선택':'사용하기':'준비 구간에서 사용'}</b></>;
   return tactical?<button key={id} disabled={!enabled||used>=2||usedTurn||(id==='scout-lens'?!game.trick.length||!scoutTargets:!canExchange)} onClick={()=>id==='scout-lens'?selectScout():setExchangeItem(id as Exclude<RpgTacticalItem,'scout-lens'>)}>{content}</button>:<div className="rpg-owned-item" key={id}>{content}</div>;
  })}{!owned.length&&<p>보유 아이템이 없어요. 스테이지 보상과 상점에서 획득할 수 있어요.</p>}</div>
  {run.tacticalPeek?.round===game.round&&run.tacticalTurn===game.roundActions&&<p className="rpg-scout-note">정찰한 패는 이번 차례 동안 바닥에 앞면으로 표시돼요.</p>}
  </>}
 </section></div>;
}
