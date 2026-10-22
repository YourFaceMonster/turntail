/** A common upright tile size. The landscape centre lane frees the floor's height. */
export function tileLayout({width,height,floorWidth,handWidth,handCount,cols,rows,players,landscape}:{width:number,height:number,floorWidth:number,handWidth:number,handCount:number,cols:number,rows:number,players:number,landscape:boolean}){
 const columns=Math.max(5,Math.ceil(handCount/2)),gap=handCount>30?2:handCount>18?4:6;
 const seatHeight=players===4?108:96;
 const boardChrome=seatHeight+18+8+18+(rows-1)*4;
 const portraitChrome=boardChrome+30+159+12;
 const deviceShort=Math.min(width+18,height+67),deviceLong=Math.max(width+18,height+67);
 const portraitTarget=Math.min(players===2?64:68,(deviceLong-67-portraitChrome)/(rows+3),(deviceShort-36-(columns-1)*gap)/columns/.76);
 const landscapeChrome=(players===2?56+8:4)+18+16+(rows-1)*4;
 const vertical=landscape?Math.min((height-landscapeChrome)/rows,(height-159)/2,(height-68)/3):(height-portraitChrome)/(rows+3);
 const floorLimit=(floorWidth-(cols-1)*6)/cols/.76;
 const handLimit=(handWidth-4-(columns-1)*gap)/columns/.76;
 const fiveLimit=landscape?Infinity:(width-24-4*6)/5/.76;
 const tileHeight=Math.max(10,Math.floor(Math.min(portraitTarget,vertical,floorLimit,handLimit,fiveLimit)));
 return {height:tileHeight,width:tileHeight*.76,columns,gap,seatHeight,seatRail:players===2?0:82};
}
