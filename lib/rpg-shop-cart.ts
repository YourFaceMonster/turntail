import {buyRpgItem,currentRpgShop,type RpgRun} from './rpg.ts';

/** Quote with the same sequential prices, one-use discount and stock rules as checkout. */
export function quoteRpgCart(run:RpgRun,cart:readonly string[]):RpgRun{
 return cart.reduce((next,id)=>{
  const shop=currentRpgShop(next),entry=shop?.stock.find(item=>item.id===id);
  if(entry?.kind==='relic'&&(id==='second-heart'&&!next.unlocked?.includes(id)||!!shop&&shop.area<4&&['mor-quill','twin-needle-compass','split-mirror'].includes(id)))throw Error('아직 해금되지 않은 유물이에요.');
  return buyRpgItem(next,id);
 },run);
}
/** Return only a fully validated purchase; failures leave the original save untouched. */
export function buyRpgCart(run:RpgRun,cart:unknown):RpgRun{
 if(!Array.isArray(cart)||!cart.length||cart.some(id=>typeof id!=='string'))throw Error('구매할 물품을 먼저 담아 주세요.');
 return quoteRpgCart(run,cart);
}
