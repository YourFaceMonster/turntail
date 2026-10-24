type Rect={left:number,top:number,width:number,height:number};
/** Use outer gutters on a wide screen; compact screens stay under their own seat. */
export function banterPlacement(card:Rect,panel:Rect,viewportWidth:number){
 const right=card.left+card.width,side=card.left+card.width/2<=viewportWidth/2?'left':'right';
 const gutter=side==='left'?card.left-16:viewportWidth-right-16;
 if(gutter>=120){const width=Math.min(230,gutter);return {side,placement:'outside',width,left:side==='left'?card.left-width-8:right+8,top:card.top+Math.max(2,card.height/2-16)} as const;}
 const width=Math.max(1,Math.min(230,card.width,viewportWidth-16)),left=side==='left'?Math.max(0,card.left):Math.max(0,Math.min(viewportWidth,right)-width);
 return {side,placement:'below',width,left,top:panel.top+panel.height+3} as const;
}
