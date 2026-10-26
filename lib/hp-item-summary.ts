import {RPG_CONSUMABLES} from './rpg.ts';
import type {HpItemRoundReport} from './hp-item-shop.ts';
export function itemUsageLine(item:HpItemRoundReport['items'][number],players:readonly {name:string}[],me=0){
 const name=RPG_CONSUMABLES.find(entry=>entry.id===item.id)?.name||item.id;
 const target=item.kind==='scout'?'바닥 패':item.target===me?'나':players[item.target]?.name||'상대';
 const result=item.kind==='blocked'?'수호의 봉인에 막힘':item.kind==='failed'?'교환 불가 · 1·2 제외':item.kind==='damage'?`−${item.amount} HP`:item.kind==='heal'?`+${item.amount} HP`:item.kind==='reveal'?'손패 1장 확인':item.kind==='seal'?'방패 준비':item.kind==='exchange'?'패 교환':'투시';
 return `${name}${item.kind==='seal'?'':` → ${item.actor===item.target?'자신':target}`} · ${result}`;
}
