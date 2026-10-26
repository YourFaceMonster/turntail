"use client";
import {suits,type view} from '../../lib/game.ts';
import TileFace from './TileFace';
export function RpgExchangeHistory({game,close}:{game:ReturnType<typeof view>,close:()=>void}){
 const event=game.rpgRun?.lastExchange;if(!event)return null;
 return <div className="modal-shade" onClick={close}><section className="modal exchange-history" role="dialog" aria-modal="true" aria-label="최근 패 교환 내역" onClick={e=>e.stopPropagation()}><button className="close" onClick={close} aria-label="교환 내역 닫기">×</button><h2>방금 바뀐 내 패</h2><p>{game.players[event.target]?.name}과 {event.outgoing.length}장 교환 · 받은 패에는 ‘교환’ 표시가 남아요.</p>{[{label:'보낸 패',tiles:event.outgoing},{label:'받은 패',tiles:event.incoming}].map(row=><div className="exchange-history-row" key={row.label}><strong>{row.label}</strong>{row.tiles.map(tile=><span key={tile.id}><TileFace tile={tile}/><small>{suits[tile.s]} {tile.n}</small></span>)}</div>)}<button className="primary full" onClick={close}>확인</button></section></div>;
}
