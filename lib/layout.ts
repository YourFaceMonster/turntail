/** One upright size across hand, floor, submitted tiles and movement. */
export function tileLayout({width,height,floorWidth,handWidth,handCount,cols,rows,players,landscape}:{width:number,height:number,floorWidth:number,handWidth:number,handCount:number,cols:number,rows:number,players:number,landscape:boolean}){
 const columns=Math.max(5,Math.ceil(handCount/2)),gap=handCount>30?2:handCount>18?4:6;
 const seatHeight=players===4?68:54;
 const boardChrome=seatHeight+14+28+12+12+6+(rows-1)*4;
 const vertical=landscape?Math.min((height-boardChrome)/(rows+1),(height-159)/2):(height-boardChrome-159-6)/(rows+3);
 const floorLimit=(Math.min(width,floorWidth)-12-(cols-1)*6)/cols/.76;
 const handLimit=(handWidth-12-(columns-1)*gap)/columns/.76;
 const fiveLimit=(floorWidth-32)/5/.76;
 const tileHeight=Math.max(10,Math.floor(Math.min(72,vertical,floorLimit,handLimit,fiveLimit)));
 return {height:tileHeight,width:tileHeight*.76,columns,gap,seatHeight};
}
