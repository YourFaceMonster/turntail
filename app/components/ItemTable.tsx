"use client";
import {TABLE_ITEMS,type ItemKind} from '../../lib/items';
import type {Game} from '../../lib/game';
import {suits,combo,type view} from '../../lib/game';
import type {ItemArchive} from '../../lib/item-records';
import TileFace from './TileFace';
import {tr,trv} from '../../lib/i18n/index.ts';
type View=ReturnType<typeof view>;
export function ItemPouch({game,enabled,pick,use,close}:{game:View,enabled:boolean,pick:number|null,use:(kind:ItemKind)=>void,close:()=>void}){
 const items=game.items;if(!items)return null;const intel=items.intel,move=intel?.suggestion;
 return <div className="modal-shade item-shade" onClick={close}><section className="modal item-pouch" role="dialog" aria-modal="true" aria-label={tr('아이템 가방')} onClick={e=>e.stopPropagation()}><button className="close" aria-label={tr('아이템 가방 닫기')} onClick={close}>×</button><span className="eyebrow">TEN ROUND · ITEM TABLE</span><h2>{tr('도전자의 가방')}</h2><p>{tr('각 아이템 3개로 10판을 버텨요. 한 판에 하나만 사용하며, AI도 같은 제한을 따릅니다.')}</p><div className="item-cards">{TABLE_ITEMS.map(item=><button key={item.id} disabled={!enabled||items.usedThisRound||items.stock[item.id]<=0||item.id==='lens'&&(pick===null||!game.stacks[pick]?.upper||!game.stacks[pick]?.available)} onClick={()=>use(item.id)}><span aria-hidden="true">{item.icon}</span><strong>{trv(item.name)}<small>{items.stock[item.id]}{tr('개')}</small></strong><p>{item.description}</p><b>{items.usedThisRound?tr('이번 판 사용 완료'):item.id==='lens'&&pick===null?tr('바닥 패 선택 후 사용'):tr('사용하기')}</b></button>)}</div>
 {intel&&<section className="item-intel" role="status"><strong>{trv(TABLE_ITEMS.find(i=>i.id===intel.kind)?.name)} {tr('· 이번 차례')}</strong>{intel.peek&&<div className="item-scout"><TileFace tile={intel.peek.tile}/><span>{tr('선택한 패는')} {suits[intel.peek.tile.s]} {intel.peek.tile.n}<small>{tr('가져오기·제출 규칙은 그대로 적용돼요.')}</small></span></div>}{intel.kind==='ledger'&&<div className="item-ledger">{game.played.length?<>{[0,1,2,3].map(s=><p key={s}><b>{suits[s]}</b><span>{game.played.filter(t=>t.s===s).map(t=>t.n).sort((a,b)=>a-b).join(' · ')||tr('아직 없음')}</span></p>)}</>:<p>{tr('아직 제출된 패가 없어요.')}</p>}</div>}{move&&<p>{move.type==='play'?tr('{0} · {1} 제출 제안',{0:combo(move.tiles)?.label,1:move.tiles.map(t=>`${suits[t.s]} ${t.n}`).join(' / ')}):move.type==='draw'?tr('{0}행 {1}열 패 가져오기 제안',{0:Math.floor(move.index/game.cols)+1,1:move.index%game.cols+1}):tr('이번 차례는 패스를 제안해요.')}</p>}</section>}
 <p className="item-rule">{tr('패 탈취·점수 변경·추가 차례 없음 · 일반전 전적과 분리')}</p><button className="primary full" onClick={close}>{tr('테이블로 돌아가기')}</button></section></div>;
}
const signed=(n:number)=>`${n>0?'+':''}${n}`;
