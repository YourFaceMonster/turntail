"use client";
import {useState} from 'react';
import type {view} from '../../lib/game.ts';
import {RPG_CONSUMABLES} from '../../lib/rpg.ts';
import {exchangeMinimum,exchangeTargetAvailable,itemImage,rpgItemAvailability,type RpgExchangeItem,type RpgTacticalItem} from '../../lib/rpg-items.ts';

type View=ReturnType<typeof view>;
const shortEffects:Record<string,string>={'scout-lens':'2층 패 1장 투시','swapped-fate':'내 패 ↔ 상대 무작위 패','fates-scales':'2장씩 교환','ember-bomb':'상대 HP −8','emergency-herb':'내 HP +10','ward-seal':'공격·교환 1회 방어'};
export function RpgTacticalPouch({game,enabled,selectExchange,selectScout,selectSeal,useItem,close,initialItem=null}:{game:View,enabled:boolean,selectExchange:(id:RpgExchangeItem,target:number)=>void,selectScout:()=>void,selectSeal:()=>void,useItem:(id:RpgTacticalItem,target?:number)=>void,close:()=>void,initialItem?:RpgExchangeItem|null}){
 const run=game.rpgRun,[targetItem,setTargetItem]=useState<RpgExchangeItem|'ember-bomb'|null>(initialItem);
 if(!run)return null;
 const owned=[...new Set(run.consumables)].sort((a,b)=>Number(rpgItemAvailability(game,b,enabled).usable)-Number(rpgItemAvailability(game,a,enabled).usable));
 const item=RPG_CONSUMABLES.find(entry=>entry.id===targetItem),description=targetItem?shortEffects[targetItem]:undefined,isBomb=targetItem==='ember-bomb',minimum=exchangeMinimum(targetItem||'');
 function pick(id:string){if(id==='scout-lens')selectScout();else if(id==='ward-seal')selectSeal();else if(id==='emergency-herb')useItem(id);else setTargetItem(id as RpgExchangeItem|'ember-bomb');}
 function itemCard(id:string){const entry=RPG_CONSUMABLES.find(row=>row.id===id),count=run!.consumables.filter(row=>row===id).length,state=rpgItemAvailability(game,id,enabled);return <button key={id} className={state.usable?'is-usable':'is-unavailable'} disabled={!state.usable} title={state.usable?shortEffects[id]:state.reason} aria-label={`${entry?.name||id} ${count}개 · ${state.usable?shortEffects[id]:state.reason}`} onClick={()=>pick(id)}><span className="pouch-item-art"><img src={itemImage(id)} alt=""/><small>×{count}</small></span><strong>{entry?.name||id}</strong><p>{shortEffects[id]||entry?.effect}</p></button>;}
 return <div className="modal-shade item-shade rpg-pouch-shade" onClick={close}><section className={`modal item-pouch rpg-equipment-pouch ${targetItem?'rpg-exchange-pouch':''}`} role="dialog" aria-modal="true" aria-label={targetItem?'아이템 상대 선택':'RPG 아이템창'} onClick={event=>event.stopPropagation()}>
  <header className="rpg-pouch-heading"><div><span className="eyebrow">{game.hpItemMode?`아이템전 · 라운드 ${game.round}`:`RPG · STAGE ${run.stage}`}</span><h2>{targetItem?isBomb?'누구에게 작열탄을 사용할까요?':'누구와 교환하시겠습니까?':`아이템 ${run.consumables.length}개`}</h2></div><button className="close" aria-label="아이템창 닫기" onClick={close}>×</button></header>
  {targetItem?<>
   <div className="rpg-exchange-item"><img src={itemImage(targetItem)} alt=""/><p><strong>{item?.name}</strong><span>{description}</span></p></div>
   <div className="rpg-exchange-targets">{game.players.map((player,index)=>{if(index===game.me)return null;const enough=isBomb?run.hp[index]>(game.hpItemMode?0:1):exchangeTargetAvailable(game,targetItem,index);return <button key={player.id} disabled={!rpgItemAvailability(game,targetItem,enabled).usable||!enough} onClick={()=>{close();if(isBomb)useItem('ember-bomb',index);else selectExchange(targetItem,index);}}><strong>{player.name}</strong><span>{isBomb?`HP ${run.hp[index]}/100`:enough?`손패 ${player.count}장`:`양쪽 ${minimum}장 이상 · 교환 가능 패 필요`}</span></button>;})}</div>
   <button className="text-btn rpg-exchange-back" onClick={()=>setTargetItem(null)}>← 아이템 다시 선택</button>
  </>:<>
   <div className="item-cards">{owned.map(itemCard)}</div>
   {!owned.length&&<p>보유 아이템이 없어요.</p>}
  </>}
 </section></div>;
}
