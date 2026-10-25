"use client";
import type {view} from '../../lib/game.ts';
import {RPG_RELICS} from '../../lib/rpg.ts';

type View=ReturnType<typeof view>;

export function RpgStatusPanel({game,close,openItems,openProfile}:{game:View,close:()=>void,openItems:()=>void,openProfile:()=>void}){
 const run=game.rpgRun;
 if(!run)return null;
 const player=game.players[game.me];
 return <div className="modal-shade rpg-status-shade" onClick={close}><section className="modal rpg-status-panel" role="dialog" aria-modal="true" aria-label="내 RPG 상태" onClick={event=>event.stopPropagation()}>
  <button className="close" aria-label="상태창 닫기" onClick={close}>×</button>
  <span className="eyebrow">WANDERER · STAGE {run.stage}</span><h2>{player.name}의 상태</h2>
  <p>최고의 승부를 찾아 여행하는 방랑자입니다. 수호자에게 인정받으며 문양을 모아 해의 왕좌로 향합니다.</p>
  <div className="rpg-status-stats"><div><small>체력</small><b>{run.hp[0]}/100</b><span>0이 되면 여정이 끝나요.</span></div><div><small>운명</small><b>{run.fate}</b><span>준비 구간에서 회복에 사용해요.</span></div><div><small>주화</small><b>{run.coins}</b><span>준비 구간 상점에서 사용해요.</span></div><div><small>포인트</small><b>{run.points}</b><span>판 종료 후 강화에 사용해요.</span></div></div>
  <h3>장착 유물 {run.equipped.length}/3</h3><div className="rpg-equipped-list">{run.equipped.map(id=>{const relic=RPG_RELICS.find(item=>item.id===id);return <div key={id}><img src={`/rpg-items-v1/relics/${id}.webp`} alt=""/><strong>{relic?.name||id}</strong><small>{relic?.effect}</small></div>;})}{!run.equipped.length&&<p>장착한 유물이 없어요. 스테이지 보상으로 얻어 준비 구간에서 장착할 수 있어요.</p>}</div>
  <div className="rpg-status-actions"><button className="primary" onClick={openItems}>🎒 아이템창 열기</button><button className="text-btn" onClick={openProfile}>프로필 편집</button></div>
 </section></div>;
}
