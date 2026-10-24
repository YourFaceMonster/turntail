import assert from 'node:assert/strict';
import {tileLayout} from '../lib/layout';
for(const [width,height] of [[620,243],[824,348],[914,388],[1180,750]])for(const players of [3,4]){
 const input={width,height,floorWidth:width*1.24/2.24-27,handWidth:width/2.24-27,handCount:10,cols:players===4?4:5,rows:3,players,landscape:true};
 const base=tileLayout(input),board=base.seatHeight+18+8+12+base.floorHeight*3+8,played=base.floorHeight+base.trickChrome;
 assert.ok(board+played+18<=height,'the entire left column fits');
 assert.ok(base.height*2+base.handChrome+12<=height,'full-height hand and controls fit independently');
 assert.ok(base.floorWidth*5+4*5<input.floorWidth*.7,'five submitted tiles fit horizontally under the floor');
 if(height>=348&&width>=824)assert.ok(base.height>=base.floorHeight,'hand uses its own full height');
 for(const handCount of [18,26,40,54]){const next=tileLayout({...input,handCount});assert.equal(next.floorHeight,base.floorHeight);assert.ok(next.height<=base.height);}
}
const improved=tileLayout({width:824,height:348,floorWidth:429,handWidth:340,handCount:10,cols:5,rows:3,players:3,landscape:true});assert.ok(improved.height>=70&&improved.floorHeight>=48,'phone landscape materially enlarges both regions from 0.6.4');
console.log('PASS: floor/played left column, independent full-height larger hand, five-tile row and fixed floor through hand growth.');
