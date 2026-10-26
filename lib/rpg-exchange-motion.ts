export type ExchangeRect={left:number,top:number,width:number,height:number};
export function exchangeStageLayout(width:number,height:number,hand:ExchangeRect,count:number){
 const cardHeight=Math.max(42,Math.min(86,(height-150)/3,(hand.top-80)/2.35)),cardWidth=cardHeight*.76,gap=10;
 const groupWidth=count*cardWidth+(count-1)*gap,left=(width-groupWidth)/2;
 const ownY=Math.min(height-cardHeight-58,Math.max(cardHeight+64,hand.top-cardHeight-54)),opponentY=Math.max(28,ownY-cardHeight-32);
 return {cardWidth,cardHeight,own:Array.from({length:count},(_,index)=>({x:left+index*(cardWidth+gap),y:ownY})),opponent:Array.from({length:count},(_,index)=>({x:left+index*(cardWidth+gap),y:opponentY})),controlsY:Math.min(height-46,ownY+cardHeight+8)};
}
