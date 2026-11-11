/** Floor/trick geometry is fixed by the viewport. Only the hand responds to its count. */
export function tileLayout({width,height,floorWidth,handWidth,handCount,cols,rows,players,landscape,desktop=false,rpg=false,classicLandscape=false,stackedLandscape=false,foldedHeading=true}:{width:number,height:number,floorWidth:number,handWidth:number,handCount:number,cols:number,rows:number,players:number,landscape:boolean,desktop?:boolean,rpg?:boolean,classicLandscape?:boolean,stackedLandscape?:boolean,foldedHeading?:boolean}){
 const columns=Math.max(5,Math.ceil(handCount/2)),gap=handCount>30?2:handCount>18?4:6;
 const baseColumns=players===2?6:5,baseGap=6;
 const compactLandscape=landscape&&height<300;
 const seatHeight=rpg?(landscape?compactLandscape?54:62:74):landscape?36:players===4?84:80,handChrome=(rpg?10:0)+(landscape?(compactLandscape?152:186):144)-(rpg?(landscape?compactLandscape?32:36:8):0),trickChrome=landscape?8:32,surfaceInset=landscape?16:12;
 const boardChrome=seatHeight+18+8+18+(rows-1)*4;
 const portraitChrome=boardChrome+trickChrome+handChrome+12+surfaceInset;
 const deviceShort=Math.min(width+18,height+67),deviceLong=Math.max(width+18,height+67);
 const tileCeiling=desktop?104:players===2?74:78;
 const portraitTarget=Math.min(tileCeiling,(deviceLong-67-portraitChrome)/(rows+3),(deviceShort-36-(baseColumns-1)*baseGap)/baseColumns/.76);
 // The left column holds seats, floor and played tiles; the full-height right column
 // sizes its hand independently, so a floor row cannot limit the hand height.
 const landscapeChrome=seatHeight+4+8+(rows-1)*4+trickChrome+6;
 // Keep the existing seats and hand; fit only the classic floor to the rendered column: border 4 + padding 12 + gap 6; felt padding 8
 // + gap 4; played-row chrome; floor row gaps and its 2px inset/outline.
 // The submitted face is enlarged to 1.28x, so reserve that full height too.
 const classicChrome=4+12+6+8+4+seatHeight+trickChrome+2+(rows-1)*4+4;
 const landscapeVertical=classicLandscape?(height-classicChrome)/(rows+1.28):(height-surfaceInset-landscapeChrome)/(rows+1);
 // Stacked landscape: the played row sits above the hand (right column), so the floor gets the
 // whole left column height and the hand gives up one played row instead.
 const stackedVertical=classicLandscape?(height-(classicChrome-trickChrome))/rows:(height-surfaceInset-(landscapeChrome-trickChrome))/rows;
 const vertical=landscape?(stackedLandscape?stackedVertical:landscapeVertical):(height-portraitChrome)/(rows+(rpg?3.72:3));
 const floorLimit=(floorWidth-(cols-1)*6)/cols/.76;
 const handLimit=Math.min((handWidth-4-(columns-1)*gap)/columns/.76,handCount>18?(handWidth-4-8*6)/9/.76:Infinity,handCount>30?(handWidth-4-14*4)/15/.76:Infinity);
 const playedLabelWidth=84;
 const fiveLimit=landscape?(stackedLandscape?Infinity:(floorWidth-playedLabelWidth-12-4*6)/5/.76):(width-24-surfaceInset-4*6)/5/.76;
 // A large landscape desktop window (PC monitor) lets the floor grow into its tall left column instead of
 // stopping at the phone-sized cap and leaving the lower half empty. The hand keeps its own cap.
 const floorCap=landscape&&desktop?Math.max(tileCeiling,Math.min(150,height*.24)):portraitTarget;
 const floorHeight=Math.max(10,Math.floor(Math.min(floorCap,vertical,floorLimit,fiveLimit)));
 const playedHeight=stackedPlayedHeight(floorHeight,handWidth,playedLabelWidth);
 const stackedPlayedRow=stackedLandscape?playedHeight+trickChrome+2+6-(foldedHeading?STACKED_HAND_CHROME_SAVED:0):0;
 const portraitHandRoom=(height-portraitChrome-rows*floorHeight-floorHeight*1.28)/2;
 const tileHeight=Math.max(10,Math.floor(Math.min(landscape?tileCeiling:rpg?floorHeight*1.22:floorHeight,handLimit,landscape?(height-surfaceInset-handChrome-stackedPlayedRow)/2:rpg?portraitHandRoom:Infinity)));
 // Reserve the standard two-row rack even when an oversized hand needs smaller
 // tiles. Changing a player's hand must never re-center the floor above it.
 const baselineHandLimit=(handWidth-4-(baseColumns-1)*baseGap)/baseColumns/.76;
 const handSpaceHeight=Math.max(10,Math.floor(Math.min(landscape?tileCeiling:rpg?floorHeight*1.22:floorHeight,baselineHandLimit,landscape?(height-surfaceInset-handChrome-stackedPlayedRow)/2:rpg?portraitHandRoom:Infinity)));
 return {height:tileHeight,width:tileHeight*.76,handSpaceHeight,floorHeight,floorWidth:floorHeight*.76,columns,gap,baseColumns,seatHeight,handChrome,trickChrome,playedLabelWidth,compactLandscape,seatRail:landscape?0:players===2?0:82};
}

export type TableLayoutChoice='auto'|'portrait'|'landscape';
/**
 * "auto" follows how the device is held: a phone/tablet held sideways, or any short wide window,
 * gets the landscape table. Since 2026-11-11 a clearly wide desktop window (PC monitor) does too;
 * a near-square desktop window keeps the portrait table.
 */
export function resolveTableLayout(choice:TableLayoutChoice,viewport:{width:number,height:number},touch:boolean):'portrait'|'landscape'{
 if(choice!=='auto')return choice;
 if(viewport.width<=viewport.height)return 'portrait';
 return touch||viewport.height<=500||viewport.width>=viewport.height*1.2?'landscape':'portrait';
}

/** Stacked landscape folds the hand heading's sort tools onto the name line (landscape-stacked.css). */
const STACKED_HAND_CHROME_SAVED=24;
/** Played row width in the stacked landscape table: the hand column less its played label and gutter. */
export function stackedPlayedWidth(handWidth:number,playedLabelWidth=84){return Math.max(20,handWidth-playedLabelWidth-18);}
function stackedPlayedHeight(floorHeight:number,handWidth:number,playedLabelWidth:number){return playedTileLayout(floorHeight,stackedPlayedWidth(handWidth,playedLabelWidth),5).height;}

/** Center the actual submitted group and cap it by its own row, not the viewport. */
export function playedTileLayout(floorHeight:number,availableWidth:number,count:number,enhanced=true){
 const n=Math.max(1,Math.min(5,count)),gap=5;
 const height=Math.max(10,Math.min(enhanced?120:76,floorHeight*(enhanced?1.28:1.15),(availableWidth-(n-1)*gap)/n/.76));
 return {height,width:height*.76};
}
