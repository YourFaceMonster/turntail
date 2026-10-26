import type {ExchangeRect} from './rpg-exchange-motion.ts';
import type {RpgItemEvent} from './rpg-items.ts';

export const RPG_ITEM_SCENE_MS=2800;
export const RPG_ITEM_IMPACT_MS=1904;
export const RPG_ITEM_GAP_MS=100;
/** One timeline owns the projectile, shield, HP feedback, and turn unlock. */
export function itemSceneTiming(event:Pick<RpgItemEvent,'kind'|'actor'|'target'>&Partial<Pick<RpgItemEvent,'itemId'>>,me=0){
 const other=event.actor!==me&&event.target!==me;
 const exchange=event.kind==='exchange'||event.kind==='failed'||event.kind==='blocked'&&(event.itemId==='swapped-fate'||event.itemId==='fates-scales');
 const duration=event.kind==='seal'?(event.actor===me?1500:0):exchange?1000:event.kind==='heal'?2400:['scout','reveal'].includes(event.kind)?2000:other?2500:RPG_ITEM_SCENE_MS;
 return {duration,impact:duration*.68,shield:duration*.56,gap:duration?RPG_ITEM_GAP_MS:0};
}
export function itemTurnReadyAt(event:RpgItemEvent,me=0){const timing=itemSceneTiming(event,me);return event.at+timing.duration+timing.gap;}
const bound=(value:number,min:number,max:number)=>Math.max(min,Math.min(Math.max(min,max),value));
/** Visual coordinates use public seat rectangles, never hands or prepared defenses. */
export function itemScenePoints(width:number,height:number,source:ExchangeRect,target:ExchangeRect,board:ExchangeRect){
 const point=(rect:ExchangeRect)=>({x:bound(rect.left+rect.width/2,24,width-24),y:bound(rect.top+rect.height/2,24,height-24)});
 const from=point(source),to=point(target),center={x:width/2,y:bound(height/2-40,100,height-100)};
 return {from,to,center,apex:{x:center.x,y:Math.max(48,Math.min(from.y,to.y,center.y)-70)},blockHit:{x:to.x,y:to.y},recoil:{x:to.x+(from.x<to.x?-100:100),y:Math.max(45,to.y-110)}};
}
type Point={x:number,y:number};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
function bezier(a:Point,b:Point,c:Point,d:Point,t:number){const v=1-t;return {x:v*v*v*a.x+3*v*v*t*b.x+3*v*t*t*c.x+t*t*t*d.x,y:v*v*v*a.y+3*v*v*t*b.y+3*v*t*t*c.y+t*t*t*d.y};}
/** Dense samples and linear interpolation avoid the stop at each CSS waypoint. */
export function itemProjectileFrames(points:ReturnType<typeof itemScenePoints>,blocked:boolean,exchange=false):Keyframe[]{
 const launch={x:points.from.x+(points.from.x<points.to.x?-18:18),y:points.from.y+12};
 return Array.from({length:101},(_,index)=>{
  const time=index/100,travel=Math.max(0,Math.min(1,(time-.10)/.58));let p:Point,scale:number,opacity=1,rotation=0;
  if(time<.10){const t=time/.10;p={x:mix(points.from.x,launch.x,t),y:mix(points.from.y,launch.y,t)};scale=mix(.28,.35,t);rotation=-38*t;opacity=Math.min(1,t*3);
  }else if(time<=.68){
   const dx=points.to.x-points.from.x,dy=points.to.y-points.from.y,distance=Math.hypot(dx,dy),arc=Math.min(260,Math.max(95,distance*.48)),down=points.from.y<points.center.y*.6&&points.to.y<points.center.y*.6;
   p={x:mix(launch.x,points.to.x,travel),y:mix(launch.y,points.to.y,travel)+(down?1:-1)*4*arc*travel*(1-travel)};
   scale=exchange?.8:.35+.6*Math.sin(travel*Math.PI*.84);rotation=exchange?0:-38+travel*110;
  }else if(blocked){
   const t=(time-.68)/.32;p=bezier(points.to,{x:points.recoil.x,y:points.to.y-130},{x:points.from.x,y:points.from.y-90},points.from,t);scale=mix(.64,.26,t);opacity=1-Math.max(0,(t-.5)*2);rotation=72-t*250;
  }else{p=points.to;scale=.64;opacity=Math.max(0,1-(time-.68)/.05);}
  return {offset:time,transform:`translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%) scale(${scale}) rotate(${rotation}deg)`,opacity};
 });
}
