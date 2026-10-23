import assert from 'node:assert/strict';
import {tileLayout} from '../lib/layout.ts';

// Different regions consume the same dimensions, including very full hands.
for(const [width,height,landscape] of [[342,573,false],[372,747,false],[372,777,false],[782,1050,false],[824,323,true],[914,363,true]] as const){
 for(const players of [2,3,4]){
  const cols=players===2?6:players===4?4:5,rows=3;
  for(const handCount of [10,12,18,26,40]){
   const floorWidth=landscape?width*.51:width-24,handWidth=landscape?width*.46:width-20;
   const r=tileLayout({width,height,floorWidth,handWidth,handCount,cols,rows,players,landscape});
   assert.ok(Math.abs(r.width/r.height-.76)<1e-8);
   assert.ok(r.columns>=Math.ceil(handCount/2));
   assert.ok(r.width*cols+(cols-1)*6<=floorWidth);
   assert.ok(r.width*r.columns+(r.columns-1)*r.gap+4<=handWidth);
   assert.ok(r.height>=10&&r.height<=(players===2?74:78));
   assert.ok(r.height*2+r.handChrome<=height,'hand and controls fit vertically');
   if(landscape){
    assert.ok(r.height*3+68<=height,'five submitted tiles fit in three rows');
   }else{
    assert.ok(r.width*5+4*6<=width-24,'five submitted tiles fit in one row');
    const board=r.seatHeight+18+8+18+rows*r.height+(rows-1)*4;
    assert.ok(board+r.height+r.trickChrome+r.height*2+r.handChrome+24<=height,'all three regions fit vertically');
   }
  }
 }
}

// An ordinary phone, a compact phone and a tablet all gain usable tile area.
for(const [width,height,oldHeight,minHeight] of [[372,777,68,73],[342,573,35,39],[782,1050,68,78]]){
 const r=tileLayout({width,height,floorWidth:width-24,handWidth:width-20,handCount:10,cols:4,rows:3,players:4,landscape:false});
 assert.ok(r.height>oldHeight&&r.height>=minHeight,`${width}×${height}: visibly larger tiles`);
}
console.log('PASS: larger uniform upright tiles, floor/hand/submitted bounds, full hands, portrait and landscape.');
