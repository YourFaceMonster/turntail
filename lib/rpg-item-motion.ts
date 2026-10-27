import type {ExchangeRect} from './rpg-exchange-motion.ts';
import type {RpgItemEvent} from './rpg-items.ts';

export const RPG_ITEM_SCENE_MS=2800;
export const RPG_ITEM_IMPACT_MS=1904;
export const RPG_ITEM_GAP_MS=100;
/** One timeline owns the projectile, shield, HP feedback, and turn unlock. */
export function itemSceneTiming(event:Pick<RpgItemEvent,'kind'|'actor'|'target'>&Partial<Pick<RpgItemEvent,'itemId'>>,me=0){
 const other=event.actor!==me&&event.target!==me;
 const exchange=event.kind==='exchange'||event.kind==='failed'||event.kind==='blocked'&&(event.itemId==='swapped-fate'||event.itemId==='fates-scales');
 const blockedExchange=exchange&&event.kind==='blocked';
 const duration=blockedExchange?1600:event.kind==='seal'?(event.actor===me?1500:0):exchange?1000:event.kind==='heal'?2400:['scout','reveal'].includes(event.kind)?2000:other?2500:RPG_ITEM_SCENE_MS;
 // The shield takes 80ms to form and reaches full strength exactly at contact.
 const impact=blockedExchange?680:duration*.68;
 return {duration,impact,shield:Math.max(0,impact-80),gap:duration?RPG_ITEM_GAP_MS:0};
}
/** Flip the dart at the largest point of its throw, independently of its path. */
export function dartFacingFrames():Keyframe[]{
 const peak=.10+.58/(2*.84);
 return [{offset:0,transform:'scaleX(1)'},{offset:peak-.035,transform:'scaleX(1)'},{offset:peak+.035,transform:'scaleX(-1)'},{offset:1,transform:'scaleX(-1)'}];
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
export function itemProjectileFrames(points:ReturnType<typeof itemScenePoints>,blocked:boolean,exchange=false,options:{dart?:boolean,contact?:number}={}):Keyframe[]{
 const contact=options.contact??.68,windup=exchange?contact*(.10/.68):.10;
 const launch={x:points.from.x+(points.from.x<points.to.x?-18:18),y:points.from.y+12};
 const distance=Math.hypot(points.to.x-points.from.x,points.to.y-points.from.y),down=points.from.y<points.center.y*.6&&points.to.y<points.center.y*.6;
 const desiredArc=Math.min(260,Math.max(95,distance*.48));
 // Keep the complete silhouette on-screen when a high AI seat throws downward.
 // Bound the parabola rather than clamping each point, which would flatten its apex.
 const ceiling=Math.min(64,launch.y,points.to.y);
 const fits=(arc:number)=>Array.from({length:101},(_,i)=>i/100).every(t=>mix(launch.y,points.to.y,t)-4*arc*t*(1-t)>=ceiling);
 let arc=desiredArc;
 if(!down&&!fits(arc)){let low=0,high=arc;for(let i=0;i<18;i++){const mid=(low+high)/2;if(fits(mid))low=mid;else high=mid;}arc=low;}
 const sample=(time:number)=>{
  const travel=Math.max(0,Math.min(1,(time-windup)/(contact-windup)));let p:Point,scale:number,opacity=1,rotation=0;
  if(time<windup){const t=time/windup;p={x:mix(points.from.x,launch.x,t),y:mix(points.from.y,launch.y,t)};scale=mix(.28,.35,t);rotation=-38*t;opacity=Math.min(1,t*3);
  }else if(time<=contact){
   p={x:mix(launch.x,points.to.x,travel),y:mix(launch.y,points.to.y,travel)+(down?1:-1)*4*arc*travel*(1-travel)};
   scale=exchange?.8:.35+.6*Math.sin(travel*Math.PI*.84);rotation=exchange?0:-38+travel*110;
  }else if(blocked){
   const t=(time-contact)/(1-contact);p=bezier(points.to,{x:points.recoil.x,y:points.to.y-130},{x:points.from.x,y:points.from.y-90},points.from,t);scale=mix(.64,.26,t);opacity=1-Math.max(0,(t-.5)*2);rotation=72-t*250;
  }else{p=points.to;scale=.64;opacity=Math.max(0,1-(time-contact)/.05);}
  return {p,scale,opacity,rotation};
 };
 const offsets=[...new Set([...Array.from({length:101},(_,index)=>index/100),contact])].sort((a,b)=>a-b);
 let lastAngle=-45;
 return offsets.map(time=>{
  const current=sample(time);let rotation=current.rotation;
  if(options.dart){
   // Read the actual trajectory tangent, then compensate for the art's diagonal tip
   // and its apex flip. The needle keeps pointing along its motion, including recoil.
   const t=Math.min(time,blocked?1:contact-.001),a=sample(Math.max(0,t-.001)).p,b=sample(Math.min(1,t+.001)).p;
   if(Math.hypot(b.x-a.x,b.y-a.y)>.001){
    let angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
    while(angle-lastAngle>180)angle-=360;while(angle-lastAngle< -180)angle+=360;lastAngle=angle;
   }
   const peak=.10+.58/(2*.84),flip=Math.max(0,Math.min(1,(time-(peak-.035))/.07)),artAngle=Math.atan2(-1,1-2*flip)*180/Math.PI;
   rotation=lastAngle-artAngle;
  }
  return {offset:time,transform:`translate3d(${current.p.x}px,${current.p.y}px,0) translate(-50%,-50%) scale(${current.scale}) rotate(${rotation}deg)`,opacity:current.opacity};
 });
}
