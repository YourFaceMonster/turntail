import type {ExchangeRect} from './rpg-exchange-motion.ts';
import type {RpgItemEvent} from './rpg-items.ts';

export const RPG_ITEM_SCENE_MS=2400;
export const RPG_ITEM_IMPACT_MS=1488;
export const RPG_ITEM_GAP_MS=100;
/** One timeline owns the projectile, shield, HP feedback, and turn unlock. */
export function itemSceneTiming(event:Pick<RpgItemEvent,'kind'|'actor'|'target'>,me=0){
 const other=event.actor!==me&&event.target!==me;
 const duration=event.kind==='seal'?(event.actor===me?1200:0):['heal','scout'].includes(event.kind)?(other?1000:1500):other?1400:RPG_ITEM_SCENE_MS;
 return {duration,impact:duration*.62,shield:duration*.53,gap:duration?RPG_ITEM_GAP_MS:0};
}
export function itemTurnReadyAt(event:RpgItemEvent,me=0){const timing=itemSceneTiming(event,me);return event.at+timing.duration+timing.gap;}
const bound=(value:number,min:number,max:number)=>Math.max(min,Math.min(Math.max(min,max),value));
/** Visual coordinates use public seat rectangles, never hands or prepared defenses. */
export function itemScenePoints(width:number,height:number,source:ExchangeRect,target:ExchangeRect,board:ExchangeRect){
 const point=(rect:ExchangeRect)=>({x:bound(rect.left+rect.width/2,24,width-24),y:bound(rect.top+rect.height/2,24,height-24)});
 const from=point(source),to=point(target),center={x:width/2,y:bound(height/2+28,100,height-100)};
 return {from,to,center,apex:{x:center.x,y:Math.max(48,Math.min(from.y,to.y,center.y)-70)},blockHit:{x:to.x,y:to.y},recoil:{x:to.x+(from.x<to.x?-100:100),y:Math.max(45,to.y-110)}};
}
type Point={x:number,y:number};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
function bezier(a:Point,b:Point,c:Point,d:Point,t:number){const v=1-t;return {x:v*v*v*a.x+3*v*v*t*b.x+3*v*t*t*c.x+t*t*t*d.x,y:v*v*v*a.y+3*v*v*t*b.y+3*v*t*t*c.y+t*t*t*d.y};}
/** Dense samples and linear interpolation avoid the stop at each CSS waypoint. */
export function itemProjectileFrames(points:ReturnType<typeof itemScenePoints>,blocked:boolean,exchange=false):Keyframe[]{
 return Array.from({length:101},(_,index)=>{
  const time=index/100,travel=Math.min(1,time/.62);let p:Point,scale:number,opacity=1,rotation=0;
  if(time<=.62){
   // Join at the enlarged central reveal with matching upward tangents.
   p=travel<.4?bezier(points.from,{x:points.from.x,y:points.from.y-90},{x:points.center.x,y:points.center.y+75},points.center,travel/.4):bezier(points.center,{x:points.center.x,y:points.center.y-112.5},{x:points.to.x,y:Math.max(70,points.apex.y)},points.to,(travel-.4)/.6);
   scale=exchange ? .65+.4*Math.sin(travel*Math.PI) : .23+.84*Math.sin(travel*Math.PI*.78);rotation=exchange?0:-22+travel*44;opacity=Math.min(1,time/.05);
  }else if(blocked){
   const t=(time-.62)/.38;p=bezier(points.to,{x:points.recoil.x,y:points.to.y-155},{x:points.from.x,y:points.from.y-120},points.from,t);scale=mix(.72,.26,t);opacity=1-Math.max(0,(t-.5)*2);rotation=22-t*220;
  }else{p=points.to;scale=.72;opacity=Math.max(0,1-(time-.62)/.05);}
  return {offset:time,transform:`translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%) scale(${scale}) rotate(${rotation}deg)`,opacity};
 });
}
