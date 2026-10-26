import type {ExchangeRect} from './rpg-exchange-motion.ts';

export const RPG_ITEM_IMPACT_MS=650;
export const RPG_ITEM_SCENE_MS=1850;
const bound=(value:number,min:number,max:number)=>Math.max(min,Math.min(Math.max(min,max),value));
/** Visual coordinates use public seat rectangles, never hands or prepared defenses. */
export function itemScenePoints(width:number,height:number,source:ExchangeRect,target:ExchangeRect,board:ExchangeRect){
 const point=(rect:ExchangeRect)=>({x:bound(rect.left+rect.width/2,24,width-24),y:bound(rect.top+rect.height/2,24,height-24)});
 const from=point(source),to=point(target),center={x:bound(board.left+board.width/2,80,width-80),y:bound(board.top+board.height/2,100,height-120)};
 const distance=Math.hypot(from.x-center.x,from.y-center.y)||1,ux=(from.x-center.x)/distance,uy=(from.y-center.y)/distance;
 return {from,to,center,apex:{x:to.x,y:Math.max(28,to.y-150)},blockHit:{x:center.x+ux*42,y:center.y+uy*42},recoil:{x:center.x+ux*120,y:center.y+uy*120}};
}
