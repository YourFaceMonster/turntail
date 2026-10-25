import type {Game,Tile} from './game.ts';
import {accessibleStack} from './table-access.ts';
import {sorted} from './game.ts';

export type RpgTacticalItem='swapped-fate'|'fates-scales'|'scout-lens';
const tacticalItems:readonly string[]=['swapped-fate','fates-scales','scout-lens'];
function randomIndex(length:number){const value=new Uint32Array(1);crypto.getRandomValues(value);return value[0]%length;}
function takeRandom(hand:Tile[],count:number){const pool=[...hand],picked:Tile[]=[];for(let i=0;i<count;i++)picked.push(pool.splice(randomIndex(pool.length),1)[0]);return picked;}

export function useRpgTacticalItem(g:Game,id:RpgTacticalItem,target=-1){
 const run=g.rpgRun;
 if(!g.practice||!run||run.status!=='playing'||g.phase!=='playing'||g.turn!==0)throw Error('RPG 전술 아이템은 진행 중인 내 차례에만 사용할 수 있어요.');
 if(!tacticalItems.includes(id)||!run.consumables.includes(id))throw Error('보유한 전술 아이템을 확인해 주세요.');
 const used=run.tacticalRound===g.round?(run.tacticalUsed||0):0;
 if(used>=2)throw Error('전술 아이템은 한 카드 판에 최대 2개까지 사용할 수 있어요.');
 if(run.tacticalRound===g.round&&run.tacticalTurn===g.roundActions)throw Error('이번 차례에는 이미 전술 아이템을 사용했어요.');
 if(id==='scout-lens'){
  if(!g.trick.length||!Number.isInteger(target)||!g.stacks[target]?.[1]||!accessibleStack(g.stacks,g.cols||5,g.rows||3,target))throw Error('가져올 수 있는 외곽 위층 패를 선택해 주세요.');
  run.tacticalPeek={round:g.round,index:target,tile:{...g.stacks[target][1]!}};
 }else{
  const count=id==='fates-scales'?2:1;
  if(![1,2].includes(target)||g.players[0].hand.length<count||g.players[target].hand.length<count)throw Error(`나와 상대에게 각각 손패 ${count}장 이상이 필요해요.`);
  const mine=g.players[0],other=g.players[target],out=takeRandom(mine.hand,count),incoming=takeRandom(other.hand,count);
  mine.hand=sorted([...mine.hand.filter(tile=>!out.some(t=>t.id===tile.id)),...incoming]);
  other.hand=sorted([...other.hand.filter(tile=>!incoming.some(t=>t.id===tile.id)),...out]);
  // Exchanged public draws no longer establish who holds those cards.
  if(g.publicDraws){g.publicDraws[mine.id]=(g.publicDraws[mine.id]||[]).filter(tile=>!out.some(t=>t.id===tile.id));g.publicDraws[other.id]=(g.publicDraws[other.id]||[]).filter(tile=>!incoming.some(t=>t.id===tile.id));}
  run.tacticalPeek=undefined;
 }
 const at=run.consumables.indexOf(id);run.consumables.splice(at,1);
 run.tacticalRound=g.round;run.tacticalUsed=used+1;run.tacticalTurn=g.roundActions;run.updatedAt=Date.now();
 g.log=[`${g.players[0].name} · ${id==='scout-lens'?'정찰 렌즈':id==='fates-scales'?'운명의 저울':'뒤바뀐 운명'} 사용`,...g.log].slice(0,40);
}
