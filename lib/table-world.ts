export type WorldBounds={left:number,top:number,width:number,height:number};
/** Intro and live UI share the same fixed circle and texture origin. */
export function tableCircle(bounds:WorldBounds,screenWidth:number,screenHeight:number,minimumDiameter=0){
 const cx=bounds.left+bounds.width/2,cy=bounds.top+bounds.height/2;
 // Even the smallest organic/polygonal edge must extend beyond all four corners.
 const cover=2*(Math.hypot(Math.max(cx,screenWidth-cx),Math.max(cy,screenHeight-cy))+24)/.9;
 const diameter=Math.max(Math.hypot(bounds.width,bounds.height)+100,cover,minimumDiameter);
 return {diameter,cx,cy};
}
/** Concealed hands lie in two spaced rows inside each character's table edge. */
export function opponentTableTarget(index:number,count:number,ordinal:number,handCount:number,circle:{cx:number,cy:number,diameter:number},tile:{width:number,height:number}){
 const seat=opponentSeats(count)[index],columns=Math.ceil(handCount/2),row=Math.floor(ordinal/columns),column=ordinal%columns;
 const height=Math.min(tile.height,circle.diameter*.05),width=tile.width*height/tile.height;
 return {x:circle.cx+seat.x*circle.diameter*.66+(column-(columns-1)/2)*(width+5),y:circle.cy+seat.y*circle.diameter*.66+(row-.5)*(height+5),width,height,angle:180};
}
export function opponentSeats(count:number){
 return count===1?[{x:0,y:-.47}]:count===2?[{x:-.36,y:-.34},{x:.36,y:-.34}]:[{x:-.43,y:-.18},{x:0,y:-.47},{x:.43,y:-.18}].slice(0,count);
}
