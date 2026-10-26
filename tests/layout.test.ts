import assert from 'node:assert/strict';
import {tileLayout,playedTileLayout} from '../lib/layout.ts';

// The floor stays fixed while the hand responds to its own count.
for(const [width,height,landscape] of [[342,573,false],[372,747,false],[372,777,false],[782,1050,false],[824,323,true],[914,363,true]] as const){
 for(const players of [2,3,4]){
  const cols=players===2?6:players===4?4:5,rows=3;
  for(const handCount of [10,12,18,26,40]){
   const floorWidth=landscape?width*.51:width-24,handWidth=landscape?width*.46:width-20;
   const r=tileLayout({width,height,floorWidth,handWidth,handCount,cols,rows,players,landscape});
   assert.ok(Math.abs(r.width/r.height-.76)<1e-8);
   assert.ok(r.columns>=Math.ceil(handCount/2));
   assert.ok(r.floorWidth*cols+(cols-1)*6<=floorWidth);
   assert.ok(r.width*r.columns+(r.columns-1)*r.gap+4<=handWidth);
   assert.ok(r.height>=10&&r.height<=(players===2?74:78));
   assert.ok(r.height*2+r.handChrome<=height,'hand and controls fit vertically');
   if(landscape){
    assert.ok(r.floorHeight*3+68<=height,'five submitted tiles fit in three rows');
   }else{
    assert.ok(r.floorWidth*5+4*6<=width-24,'five submitted tiles fit in one row');
    const board=r.seatHeight+18+8+18+rows*r.floorHeight+(rows-1)*4;
    assert.ok(board+r.floorHeight+r.trickChrome+r.floorHeight*2+r.handChrome+24<=height,'all three regions fit vertically');
   }
  }
 }
}

// An ordinary phone, a compact phone and a tablet all gain usable tile area.
for(const [width,height,oldHeight,minHeight] of [[372,777,68,73],[342,573,35,39],[782,1050,68,78]]){
 const r=tileLayout({width,height,floorWidth:width-24,handWidth:width-20,handCount:10,cols:4,rows:3,players:4,landscape:false});
 assert.ok(r.height>oldHeight&&r.height>=minHeight,`${width}×${height}: visibly larger tiles`);
}
for(const [width,height] of [[342,573],[372,747],[782,1050]]){
 const result=tileLayout({width,height,floorWidth:width-58,handWidth:width-20,handCount:10,cols:5,rows:3,players:3,landscape:false,rpg:true,desktop:width>600});
 assert.ok(result.width*result.columns+(result.columns-1)*result.gap+4<=width-20,'larger RPG hand tiles fit horizontally');
 const played=playedTileLayout(result.floorHeight,width-16,5);
 const board=result.seatHeight+18+8+18+3*result.floorHeight+8;
 assert.ok(board+played.height+result.trickChrome+2*result.height+result.handChrome+24<=height,'enlarged RPG board, submitted tiles and hand share the vertical budget');
 for(const count of [1,2,3,5]){const size=playedTileLayout(result.floorHeight,width-16,count);assert.ok(size.width*count+(count-1)*5<=width-16+.01,'the actual submitted group fits its own row');}
}
for(const [width,height] of [[824,323],[914,363]])for(const handCount of [10,20,40]){
 const result=tileLayout({width,height,floorWidth:width*.51,handWidth:width*.46,handCount,cols:5,rows:3,players:3,landscape:true,rpg:true});
 assert.ok(result.width*result.columns+(result.columns-1)*result.gap+4<=width*.46);
 assert.ok(result.height*2+result.handChrome<=height,'the recovered landscape speech row is available to the hand');
}
console.log('PASS: independent upright floor/hand tiles, floor/hand/submitted bounds, full hands, portrait and landscape.');
