'use client';
import {userMessage} from '../../lib/user-message';
import {useEffect,useRef,useState} from 'react';
import {currentRpgShop,RPG_CONSUMABLES,type RpgRun} from '../../lib/rpg.ts';
import {isRpgDemo} from '../../lib/rpg-demo-catalog.ts';
import {quoteRpgCart} from '../../lib/rpg-shop-cart.ts';
import {gameRelic,relicImage} from '../../lib/item-battle-relics.ts';
import {shopEffectSummary} from '../../lib/shop-effect-summary';
import EffectText from './EffectText';
import RpgItemIcon from './RpgItemIcon';
import {tr} from '../../lib/i18n/index.ts';

type Props={run:RpgRun,busy:boolean,error:string,action:(action:string,extra?:Record<string,unknown>)=>void};
type Entry=RpgRun['shops'][number]['stock'][number];
const nameOf=(id:string)=>RPG_CONSUMABLES.find(item=>item.id===id)?.name||gameRelic(id)?.name||id;
function ItemArt({id,relic=false}:{id:string,relic?:boolean}){return relic?<img src={relicImage(id)} alt=""/>:<RpgItemIcon id={id}/>;}

export default function JourneyVillageShop({run,busy,error,action}:Props){
 const [cart,setCart]=useState<string[]>([]),[notice,setNotice]=useState(''),[checkingOut,setCheckingOut]=useState(false);
 const [selectedHeld,setSelectedHeld]=useState<{id:string,relic:boolean}|null>(null);
 const pending=useRef<{consumables:number,relics:number}|null>(null);
 useEffect(()=>{
  if(!pending.current)return;
  if(run.consumables.length>pending.current.consumables||run.relics.length>pending.current.relics){setCart([]);setNotice(tr('구매 완료 · 여행 가방에 넣었어요.'));pending.current=null;setCheckingOut(false);}
  else if(error){pending.current=null;setCheckingOut(false);}
 },[run.consumables,run.relics,error]);
 let quoted=run,quoteError='';try{quoted=quoteRpgCart(run,cart);}catch(e){quoteError=userMessage(e,tr('구매 목록을 확인해 주세요.'));}
 const total=run.coins-quoted.coins,shop=currentRpgShop(run),stock=shop?.stock||[],disabled=busy||checkingOut;
 const add=(id:string)=>{if(disabled)return;try{quoteRpgCart(run,[...cart,id]);setCart([...cart,id]);setNotice(tr('{0} 담음 · 아직 구매 전이에요.',{0:nameOf(id)}));}catch(e){setNotice(userMessage(e,tr('담을 수 없어요.')));}};
 const remove=(id:string)=>{if(disabled)return;const index=cart.lastIndexOf(id);setCart(cart.filter((_,i)=>i!==index));setNotice('');};
 const checkout=()=>{if(disabled||!cart.length||quoteError)return;pending.current={consumables:run.consumables.length,relics:run.relics.length};setCheckingOut(true);setNotice('');action('rpg-buy',{cart});};
 const ownedRow=(relic:boolean)=>{
  const held=relic?run.relics:run.consumables,ids=[...new Set([...held,...cart.filter(id=>stock.find(item=>item.id===id)?.kind===(relic?'relic':'consumable'))])];
  return <div className="village-holdings-row"><strong>{relic?tr('유물'):tr('소비 아이템')}</strong><div className="village-holdings-scroll" aria-label={relic?tr('보유·구매 예정 유물'):tr('보유·구매 예정 소비 아이템')}>{ids.map(id=>{const count=held.filter(item=>item===id).length,added=cart.filter(item=>item===id).length;return <button type="button" className={`village-held-item ${added?'has-pending':''}`} key={id} aria-label={tr('{0} · 보유 {1}개{2} · 상세 보기',{0:nameOf(id),1:count,2:added?` · 구매 예정 ${added}개`:''})} aria-pressed={selectedHeld?.id===id} onClick={()=>setSelectedHeld(selectedHeld?.id===id?null:{id,relic})}><ItemArt id={id} relic={relic}/><small>{count>0&&`×${count}`}{added>0&&<em> +{added}</em>}{count===0&&added===0&&'×0'}</small></button>;})}{Array.from({length:Math.max(0,6-ids.length)},(_,index)=><span className="village-held-empty" key={`empty-${index}`} aria-hidden="true">◇</span>)}</div></div>;

 };
 const heldDetail=selectedHeld&&(()=>{const {id,relic}=selectedHeld,count=(relic?run.relics:run.consumables).filter(item=>item===id).length,added=cart.filter(item=>item===id).length,entry=stock.find(item=>item.id===id),effect=(relic?gameRelic(id):RPG_CONSUMABLES.find(item=>item.id===id))?.effect||'';return <div className="village-held-details" role="group" aria-label={tr('선택한 보유 물품')}><span className="village-held-detail-art"><ItemArt id={id} relic={relic}/></span><div><strong>{nameOf(id)}</strong><p><EffectText text={isRpgDemo(run)&&id==='emergency-herb'?tr('전투 준비 중·전투 중 자신의 차례에 HP +10 · 푸른 유리 장착 시 +15'):effect}/></p><small>{tr('보유')} {count}{tr('개 · 구매 예정')} <em>+{added}</em>{tr('개')}</small></div><div className="village-held-adjust"><button type="button" disabled={disabled||!added} aria-label={tr('{0} 구매 예정 1개 취소',{0:nameOf(id)})} onClick={()=>remove(id)}>−</button><button type="button" disabled={disabled||!entry?.quantity||relic&&(count>0||added>0)} aria-label={tr('{0} 구매 예정 1개 추가',{0:nameOf(id)})} onClick={()=>add(id)}>+</button></div><button type="button" className="village-held-detail-close" aria-label={tr('보유 물품 설명 닫기')} onClick={()=>setSelectedHeld(null)}>×</button></div>;})();
 const product=(entry:Entry)=>{
  const relic=entry.kind==='relic',data=relic?gameRelic(entry.id):RPG_CONSUMABLES.find(item=>item.id===entry.id),count=(relic?run.relics:run.consumables).filter(id=>id===entry.id).length,added=cart.filter(id=>id===entry.id).length;
  const projectedShop=currentRpgShop(quoted),discount=quoted.equipped.includes('merchants-scales')&&projectedShop&&!quoted.scaleUsed?.includes(projectedShop.area),price=Math.max(0,entry.price-(discount?20:0));
  const locked=entry.id==='second-heart'&&!run.unlocked?.includes(entry.id)||relic&&!!shop&&shop.area<4&&['mor-quill','twin-needle-compass','split-mirror'].includes(entry.id);
  const status=relic&&count?tr('보유 중'):relic&&added?tr('담음'):locked?tr('미해금'):!entry.quantity?tr('품절'):quoted.coins<price?tr('주화 부족'):null;
  return <article className={`village-product compact-product ${status?'product-unavailable':'product-available'}`} key={entry.id}><div className="shop-product-summary"><span className="village-product-art"><ItemArt id={entry.id} relic={relic}/></span><span className="shop-product-name"><strong>{(data?.name||entry.id).split(' ').map((word,index)=><span className="shop-name-word" key={index}>{word}</span>)}</strong></span></div><div className="shop-product-effect">{(isRpgDemo(run)&&entry.id==='emergency-herb'?tr('전투 전·중 HP +10\n푸른 유리 장착 시 +15'):isRpgDemo(run)&&entry.id==='ember-bomb'?tr('상대 HP -8\nHP 0이면 퇴장'):shopEffectSummary(entry.id,data?.effect||'')).split('\n').map((line,index)=><span key={index}><EffectText text={line}/></span>)}</div><span className="shop-product-price"><b>{tr('{0}주화',{0:price})}</b><small className="shop-owned-count">{tr('보유')} {count}{tr('개')}{added>0&&` · +${added}`}</small></span><button type="button" className="shop-product-buy" disabled={!!status||disabled||run.status!=='ready'} onClick={()=>add(entry.id)} aria-label={`${nameOf(entry.id)} ${status||tr('구매 목록에 담기')}`}>{status||tr('구매')}</button></article>;
 };
 return <div className="village-market village-cart-market"><header className="village-market-heading"><h3>{tr('마을 잡화점')}</h3><strong className="market-wallet">{tr('주화')} <b>{run.coins}</b></strong></header><section className="village-holdings" aria-label={tr('내 물품과 구매 예정 목록')}>{ownedRow(false)}{ownedRow(true)}{heldDetail}</section><div className="village-market-layout"><section className="village-market-shelf" aria-label={tr('잡화점 상품')}>{(['consumable','relic'] as const).map(kind=><section className="village-market-group" key={kind}><h4>{kind==='consumable'?tr('소비 아이템'):tr('유물')}<small>{stock.filter(item=>item.kind===kind).length}{tr('종')}</small></h4><div className="village-market-grid" role="region" tabIndex={0} aria-label={tr('{0} 상품 목록',{0:kind==='consumable'?'소비 아이템':'유물'})}>{stock.filter(item=>item.kind===kind).map(product)}</div></section>)}</section></div><footer className="village-checkout"><div className="village-checkout-message" role="status">{error||quoteError||notice||tr('구매를 눌러 담고, 마지막에 확정하세요.')}</div><div className="village-checkout-actions"><span>{tr('합계')} <b>{tr('{0}주화',{0:total})}</b><small>{tr('구매 후')} {tr('{0}주화',{0:quoted.coins})}</small></span><button type="button" className="secondary" disabled={!cart.length||disabled} onClick={()=>{setCart([]);setNotice('');}}>{tr('비우기')}</button><button type="button" className="primary" disabled={!cart.length||disabled||!!quoteError} onClick={checkout}>{checkingOut?tr('구매 중…'):tr('구매 확정{0}',{0:cart.length?` (${cart.length})`:''})}</button></div></footer></div>;
}
