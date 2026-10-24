/** Floor/trick geometry is fixed by the viewport. Only the hand responds to its count. */
export function tileLayout({width,height,floorWidth,handWidth,handCount,cols,rows,players,landscape}:{width:number,height:number,floorWidth:number,handWidth:number,handCount:number,cols:number,rows:number,players:number,landscape:boolean}){
 const columns=Math.max(5,Math.ceil(handCount/2)),gap=handCount>30?2:handCount>18?4:6;
 const baseColumns=players===2?6:5,baseGap=6;
 const seatHeight=players===4?84:80,handChrome=144,trickChrome=32,surfaceInset=12;
 const boardChrome=seatHeight+18+8+18+(rows-1)*4;
 const portraitChrome=boardChrome+trickChrome+handChrome+12+surfaceInset;
 const deviceShort=Math.min(width+18,height+67),deviceLong=Math.max(width+18,height+67);
 const portraitTarget=Math.min(players===2?74:78,(deviceLong-67-portraitChrome)/(rows+3),(deviceShort-36-(baseColumns-1)*baseGap)/baseColumns/.76);
 const landscapeChrome=(players===2?56+8:4)+18+16+(rows-1)*4;
 const vertical=landscape?Math.min((height-surfaceInset-landscapeChrome)/rows,(height-surfaceInset-handChrome)/2,(height-surfaceInset-68)/3):(height-portraitChrome)/(rows+3);
 const floorLimit=(floorWidth-(cols-1)*6)/cols/.76;
 const handLimit=Math.min((handWidth-4-(columns-1)*gap)/columns/.76,handCount>18?(handWidth-4-8*6)/9/.76:Infinity,handCount>30?(handWidth-4-14*4)/15/.76:Infinity);
 const fiveLimit=landscape?Infinity:(width-24-surfaceInset-4*6)/5/.76;
 const floorHeight=Math.max(10,Math.floor(Math.min(portraitTarget,vertical,floorLimit,fiveLimit)));
 const tileHeight=Math.max(10,Math.floor(Math.min(floorHeight,handLimit)));
 return {height:tileHeight,width:tileHeight*.76,floorHeight,floorWidth:floorHeight*.76,columns,gap,baseColumns,seatHeight,handChrome,trickChrome,seatRail:players===2?0:82};
}
