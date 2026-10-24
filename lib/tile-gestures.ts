export type TileGestureKind='floor'|'hand';
export type GesturePoint={x:number,y:number};
/** Convert screen motion to the player's rotated table axes. */
export function tableGestureDelta(start:GesturePoint,end:GesturePoint,rotation:number):GesturePoint{
 const x=end.x-start.x,y=end.y-start.y;
 return rotation===90?{x:y,y:-x}:rotation===-90?{x:-y,y:x}:{x,y};
}
export function tileSwipeReady(kind:TileGestureKind,delta:GesturePoint,height:number,elapsed:number){
 const threshold=Math.max(44,Math.min(78,height*.85)),forward=kind==='floor'?delta.y:-delta.y;
 return Number.isFinite(elapsed)&&elapsed>=0&&forward>=threshold&&forward>=Math.abs(delta.x)*1.4;
}
export type TileTap={id:number,at:number,x:number,y:number};
export function isTileDoubleTap(previous:TileTap|null,next:TileTap){
 return !!previous&&previous.id===next.id&&next.at>=previous.at&&next.at-previous.at<=330&&Math.hypot(next.x-previous.x,next.y-previous.y)<=28;
}
