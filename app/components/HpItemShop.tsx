'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Check,Coins,Info,ShoppingBag,Store,X} from 'lucide-react';
import type {view} from '../../lib/game.ts';
import {RPG_SHOP_ITEMS,type RpgTacticalItem} from '../../lib/rpg-items.ts';
import {RPG_CONSUMABLES} from '../../lib/rpg.ts';
import {HP_ITEM_PRICES,hpItemShopAfterResult} from '../../lib/hp-item-shop.ts';
import RpgItemIcon from './RpgItemIcon';
type View=ReturnType<typeof view>;
const nameOf=(id:string)=>RPG_CONSUMABLES.find(item=>item.id===id)?.name||id;
const descriptions:Record<string,string>={
 'scout-lens':'바닥 2층의 패 1장을 나만 확인해요. 그 패를 누군가 가져갈 때까지 투시가 유지돼요.',
 'swapped-fate':'내 패 1장과 상대의 무작위 패 1장을 교환해요. 양쪽 손패가 4장 이상이어야 하며 1·2는 교환에서 제외돼요.',
 'ward-seal':'다음 공격 또는 패 교환 1회를 막아요. 도적의 패 교환도 방어하며, 막은 뒤 봉인은 사라져요.',
 'ember-bomb':'선택한 상대에게 최대 HP 8 피해를 줘요. 작열탄이 부딪히는 순간 체력과 피해가 표시돼요.',
 'emergency-herb':'내 HP를 최대 10 회복해요. HP 100을 넘지 않으며, 실제로 회복한 양이 표시돼요.',
 'whisper-eye':'선택한 상대의 손패에서 무작위 1장을 나만 확인해요. 내 손패를 먼저 선택할 필요는 없어요.',
};
export function HpItemShop({game,busy,error,buy,exit}:{game:View,busy:boolean,error:string,buy:(cart:string[])=>void,exit:()=>void}){
 const [cart,setCart]=useState<string[]>([]),[selected,setSelected]=useState<RpgTacticalItem|null>(null),[hint,setHint]=useState(''),lastTap=useRef({id:'',at:0});
 const points=game.hpItemMatch?.points[game.me]||0,total=cart.reduce((sum,id)=>sum+HP_ITEM_PRICES[id],0),held=(game.rpgRun?.consumables||[]).filter(id=>id!=='spark-dart'),groups=[...new Set(held)].map(id=>({id,count:held.filter(item=>item===id).length})),round=game.round+(hpItemShopAfterResult(game)?1:0);
 const [flight,setFlight]=useState<{id:string,from:DOMRect}|null>(null);
 const add=(id:string)=>{if(busy)return;if(cart.includes(id)){setHint('이번 판에는 종류마다 1개씩만 담을 수 있어요.');return;}if(total+HP_ITEM_PRICES[id]>points){setHint('남은 주화가 부족해요.');return;}const source=document.querySelector<HTMLElement>(`[data-shop-card="${id}"]`);if(source)setFlight({id,from:source.getBoundingClientRect()});setCart(old=>old.includes(id)?old:[...old,id]);setHint(`${nameOf(id)}을 담았어요.`);};
 const activate=(id:RpgTacticalItem,clicks:number)=>{const now=Date.now(),twice=clicks>=2||lastTap.current.id===id&&now-lastTap.current.at<=450;setSelected(id);setHint('');if(twice){add(id);lastTap.current={id:'',at:0};}else lastTap.current={id,at:now};};
 return <div className="modal-shade market-shop-shade"><section className="modal hp-item-shop market-item-shop" role="dialog" aria-modal="true" aria-label="이번 판 아이템 상점"><header className="market-header"><div className="market-sign"><Store aria-hidden="true"/><div><span className="eyebrow">여행자의 물품점 · {round}판 준비</span><h2>별빛 상점</h2></div></div><div className="market-wallet"><Coins aria-hidden="true"/><strong>{points}<small>P</small></strong><span>담은 금액 {total}P<br/>남은 주화 <b>{points-total}P</b></span></div></header>
  <div className="market-body"><div className="market-shelf" data-shop-catalog>{RPG_SHOP_ITEMS.map(id=><button type="button" data-shop-card={id} key={id} disabled={busy||!cart.includes(id)&&HP_ITEM_PRICES[id]>points-total} aria-pressed={selected===id} className={`${selected===id?'is-inspected':''} ${cart.includes(id)?'is-in-cart':''} ${!cart.includes(id)&&HP_ITEM_PRICES[id]>points-total?'is-unaffordable':''}`} onClick={event=>activate(id,event.detail)} onDoubleClick={event=>event.preventDefault()} title={`${nameOf(id)} · ${HP_ITEM_PRICES[id]}P · ${!cart.includes(id)&&HP_ITEM_PRICES[id]>points-total?"남은 주화 부족":"한 번 누르면 설명, 두 번 누르면 담기"}`}><RpgItemIcon id={id}/><strong>{nameOf(id)}</strong><b>{HP_ITEM_PRICES[id]}<small>P</small></b>{cart.includes(id)&&<span className="market-added"><Check aria-hidden="true"/></span>}</button>)}</div>
  <section className="market-description" aria-live="polite"><Info aria-hidden="true"/><div><h3>{selected?nameOf(selected):'필요한 물품을 살펴보세요'}</h3><p>{selected?(game.rpgRun?.combat?.itemBattle&&selected==='scout-lens'?'바닥패 1장을 나만 확인하고 적의 함정도 찾아요. 투시한 패를 가져오는 것만으로 공격하지는 않아요.':game.rpgRun?.combat?.itemBattle&&selected==='ward-seal'?'다음 아이템 공격 또는 패 교환 1회를 막아요. 막은 뒤 봉인은 사라져요.':descriptions[selected]):'한 번 누르면 설명을 보고, 두 번 누르면 구매 목록에 담아요.'}</p></div><small>종류마다 판당 1개 구매</small></section>
  <section className="market-stock"><h3><ShoppingBag aria-hidden="true"/>내 아이템 <small>보유 {held.length}개 · 수량 제한 없음</small></h3><div className="market-stock-row" data-shop-stock>{groups.map(({id,count})=><span className="market-owned" key={id} title={`${nameOf(id)} ${count}개`}><RpgItemIcon id={id}/><strong>{nameOf(id)}</strong><b>×{count}</b></span>)}{!groups.length&&<p className="market-empty">아직 보유한 아이템이 없어요. 쓰지 않은 아이템은 다음 판에도 남아요.</p>}</div></section>
  <section className="market-basket"><h3>이번 구매 <small>{cart.length}종 · {total}P</small></h3><div className="market-cart-row" data-shop-cart>{cart.map(id=><button type="button" data-cart-item={id} className={flight?.id===id?"is-arriving":""} key={id} disabled={busy} onClick={()=>{setCart(old=>old.filter(item=>item!==id));if(flight?.id===id)setFlight(null);setHint('');}} aria-label={`${nameOf(id)} 구매 취소`} title={`${nameOf(id)} · 눌러서 담기 취소`}><RpgItemIcon id={id}/><span>{nameOf(id)}</span><X aria-hidden="true"/></button>)}{!cart.length&&<p className="market-empty">아이템을 두 번 눌러 담으세요. 구매 없이 시작할 수도 있어요.</p>}</div></section></div>
  <footer className="market-checkout"><div className="market-shop-message" role="status">{error||hint}</div><p>판당 아이템 2개 사용 · 자동 준비금 없음</p><div><button type="button" className="primary" disabled={busy||total>points} onClick={()=>buy(cart)}>{cart.length?`${total}P 구매하고 시작`:'구매 없이 시작'} →</button><button type="button" className="secondary" disabled={busy} onClick={exit}>저장하고 나가기</button></div></footer>
 </section>{flight&&cart.includes(flight.id)&&<ShopArrival id={flight.id} from={flight.from} done={()=>setFlight(null)}/>}</div>;
}

function ShopArrival({id,from,done}:{id:string,from:DOMRect,done:()=>void}){
 const element=useRef<HTMLSpanElement>(null),complete=useRef(done);complete.current=done;
 useLayoutEffect(()=>{
  const target=document.querySelector<HTMLElement>(`[data-cart-item="${id}"] .rpg-item-icon`)||document.querySelector<HTMLElement>(`[data-cart-item="${id}"]`),to=target?.getBoundingClientRect();
  if(!to||!element.current){complete.current();return;}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,x=from.left+from.width/2,y=from.top+from.height/2,tx=to.left+to.width/2,ty=to.top+to.height/2;
  const animation=element.current.animate(reduced?[{opacity:0},{opacity:1}]:[{transform:`translate(${x}px,${y}px) translate(-50%,-50%) scale(1.2)`,opacity:1},{transform:`translate(${tx}px,${ty}px) translate(-50%,-50%) scale(.75)`,opacity:1}],{duration:reduced?90:360,easing:'cubic-bezier(.2,.65,.25,1)',fill:'both'});
  animation.onfinish=()=>complete.current();return()=>{animation.onfinish=null;animation.cancel();};
 },[id,from]);
 return createPortal(<span className="market-item-arrival" ref={element} aria-hidden="true"><RpgItemIcon id={id}/></span>,document.body);
}
