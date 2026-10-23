export type WorldBounds={left:number,top:number,width:number,height:number};
/** Intro and live UI share the same fixed circle and texture origin. */
export function tableCircle(bounds:WorldBounds,screenWidth:number,screenHeight:number,minimumDiameter=0){
 const diameter=Math.max(Math.hypot(bounds.width,bounds.height)+100,Math.min(screenWidth,screenHeight)*1.35+32,minimumDiameter);
 return {diameter,cx:bounds.left+bounds.width/2,cy:bounds.top+bounds.height/2};
}
export function opponentSeats(count:number){
 return count===1?[{x:0,y:-.47}]:count===2?[{x:-.36,y:-.34},{x:.36,y:-.34}]:[{x:-.43,y:-.18},{x:0,y:-.47},{x:.43,y:-.18}].slice(0,count);
}
