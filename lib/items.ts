import type {Game,Tile,BotAction} from './game';
import {accessibleStack} from './table-access';
export type ItemKind='lens'|'ledger'|'guide';
export const TABLE_ITEMS=[
 {id:'lens' as const,name:'정찰 렌즈',icon:'◉',description:'선택한 외곽의 위층 비공개 패 1장을 이번 차례에만 확인합니다.'},
 {id:'ledger' as const,name:'기록 두루마리',icon:'▤',description:'이번 판에 이미 제출된 패를 문양·숫자별로 한눈에 확인합니다.'},
 {id:'guide' as const,name:'전술 부적',icon:'✧',description:'이번 차례의 제출·가져오기 후보 한 가지를 제안받습니다.'},
];
export type ItemIntel={kind:ItemKind,round:number,event:string,peek?:{index:number,tile:Tile},suggestion?:BotAction};
export type ItemSeat={stock:Record<ItemKind,number>,usedRound:number,intel?:ItemIntel};
export type ItemRun={version:1,seats:ItemSeat[]};
export function newItemRun(size:number):ItemRun{return {version:1,seats:Array.from({length:size},()=>({stock:{lens:3,ledger:3,guide:3},usedRound:0}))};}
const accessible=(g:Game,i:number)=>accessibleStack(g.stacks,g.cols||5,g.rows||3,i);
export function useTableItem(g:Game,who:number,kind:ItemKind,index=-1,suggestion?:BotAction){
 if(!g.practice||!g.challenge?.itemMode||g.stageRun||!g.itemRun)throw Error('아이템은 싱글 10판 아이템전에서만 사용할 수 있어요.');
 if(g.phase!=='playing'||g.turn!==who||g.challenge.complete||g.challenge.abandoned)throw Error('진행 중인 내 차례에만 사용할 수 있어요.');
 const seat=g.itemRun.seats[who];if(!seat||!TABLE_ITEMS.some(i=>i.id===kind))throw Error('남은 아이템을 확인해 주세요.');
 if(seat.usedRound===g.round)throw Error('한 판에는 아이템 하나만 사용할 수 있어요.');
 if(!(seat.stock[kind]>0))throw Error('남은 아이템을 확인해 주세요.');
 const intel:ItemIntel={kind,round:g.round,event:g.lastEvent?.id||''};
 if(kind==='lens'){
  if(!g.trick.length||!Number.isInteger(index)||!g.stacks[index]?.[1]||!accessible(g,index))throw Error('가져올 수 있는 외곽 위층 패를 먼저 선택해 주세요.');
  intel.peek={index,tile:{...g.stacks[index][1]!}};
 }
 if(kind==='guide'){if(!suggestion)throw Error('전술 후보를 확인하지 못했어요.');intel.suggestion=structuredClone(suggestion);}
 seat.stock[kind]--;seat.usedRound=g.round;seat.intel=intel;
 g.log=[`${g.players[who].name} · ${TABLE_ITEMS.find(i=>i.id===kind)!.name} 사용`,...g.log].slice(0,40);
}
export function itemView(g:Game,who:number){
 if(!g.itemRun)return null;const seat=g.itemRun.seats[who];if(!seat)return null;
 const intel=g.phase==='playing'&&g.turn===who&&seat.intel?.round===g.round&&seat.intel.event===(g.lastEvent?.id||'')?seat.intel:undefined;
 return {stock:{...seat.stock},usedThisRound:seat.usedRound===g.round,intel};
}
/** A bot can inspect only the same one legal face a human could inspect. */
export function scoutBotDraw(g:Game,who:number,fallback:number){
 const seat=g.itemRun?.seats[who];if(!seat||seat.usedRound===g.round||seat.stock.lens<=0)return fallback;
 const candidates=g.stacks.flatMap((s,i)=>s[1]&&accessible(g,i)?[i]:[]);if(!candidates.length)return fallback;
 const index=candidates[(g.round+who)%candidates.length];useTableItem(g,who,'lens',index);
 const peek=seat.intel!.peek!,hand=g.players[who].hand;
 const value=(t:Tile)=>hand.filter(h=>h.n===t.n).length*4+hand.filter(h=>h.s===t.s).length*.3+(t.n===2?1:0);
 let best=index,bestValue=value(peek.tile);
 for(let i=0;i<g.stacks.length;i++)if(!g.stacks[i][1]&&g.stacks[i][0]&&accessible(g,i)){const score=value(g.stacks[i][0]!);if(score>bestValue){best=i;bestValue=score;}}
 // An unhelpful scout may be declined; no other concealed face is read.
 return bestValue>=1?best:fallback===index?(candidates.find(i=>i!==index)??fallback):fallback;
}
