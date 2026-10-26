export type ExchangeRect={left:number,top:number,width:number,height:number};
export function exchangePickerPlacement(width:number,height:number,hand:ExchangeRect){
 const sideHand=width>height*1.2&&hand.left>width*.35;
 const x=sideHand?hand.left/2:width/2,y=sideHand?Math.max(85,Math.min(height/2-25,height-110)):Math.max(100,Math.min(height/2-65,hand.top-135));
 return {x,y,controlsY:Math.max(70,Math.min(height-80,sideHand?y+90:Math.min(hand.top-74,y+103)))};
}
export function exchangeStageLayout(width:number,height:number,hand:ExchangeRect,count:number){
 const landscape=width>height*1.2&&hand.left>width*.35,centerX=landscape?Math.min(hand.left/2,width*.3):width/2;
 const bottom=Math.min(height-54,landscape?height-54:hand.top-56),top=Math.min(110,Math.max(34,bottom*.22));
 const cardHeight=Math.max(30,Math.min(90,(bottom-top-70)/2)),cardWidth=cardHeight*.76,gap=10;
 const groupWidth=count*cardWidth+(count-1)*gap,left=centerX-groupWidth/2;
 const ownY=bottom-cardHeight,opponentY=ownY-cardHeight-30;
 return {cardWidth,cardHeight,centerX,emblemY:Math.max(24,opponentY-54),own:Array.from({length:count},(_,index)=>({x:left+index*(cardWidth+gap),y:ownY})),opponent:Array.from({length:count},(_,index)=>({x:left+index*(cardWidth+gap),y:opponentY})),controlsY:Math.min(height-46,ownY+cardHeight+8)};
}
