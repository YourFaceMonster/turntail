import assert from 'node:assert/strict';
import {tileLayout} from '../lib/layout';
for(const [width,height] of [[620,243],[824,323],[914,363],[1180,750]])for(const players of [2,3,4]){
 const input={width,height,floorWidth:width/2-27,handWidth:width/2-27,handCount:12,cols:players===2?6:players===4?4:5,rows:3,players,landscape:true};
 const base=tileLayout(input);
 const board=base.seatHeight+18+8+12+base.floorHeight*3+8;
 const played=base.floorHeight+base.trickChrome;
 assert.ok(board+played+18<=height,'seats + floor above the full-width played strip');
 assert.ok(base.height*2+base.handChrome+played+18<=height,'hand and controls above the played strip');
 assert.ok(base.floorWidth*5+4*8<width*.7,'five played tiles fit side by side');
 for(const handCount of [18,26,40,54]){const next=tileLayout({...input,handCount});assert.equal(next.floorHeight,base.floorHeight);assert.ok(next.height<=base.height);}
}
console.log('PASS: landscape upper/lower region bounds, horizontal five-tile plays, fixed floor and independently shrinking hands.');
