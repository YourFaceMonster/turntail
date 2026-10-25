import assert from 'node:assert/strict';
import {tileLayout} from '../lib/layout';
for(const [width,height] of [[620,243],[680,278],[824,318],[824,348],[914,388],[1180,650],[1536,667]])for(const players of [3,4]){
 const input={width,height,floorWidth:(width-22)*1.3/2.3-8,handWidth:(width-22)/2.3-14,handCount:10,cols:players===4?4:5,rows:3,players,landscape:true};
 const base=tileLayout(input),board=base.seatHeight+4+8+base.floorHeight*3+8,played=base.floorHeight+base.trickChrome;
 assert.ok(board+played+6+16<=height,'the complete floor and played column fits including borders and padding');
 assert.ok(base.height*2+base.handChrome+16<=height,'headings, speech rail, controls and selection-safe rack padding fit');
 assert.ok(base.floorWidth*5+4*6+base.playedLabelWidth+12<=input.floorWidth,'five full-sized plays fit beside their label');
 assert.ok(base.floorWidth*input.cols+(input.cols-1)*6<=input.floorWidth);
 for(const handCount of [18,26,40,54]){const next=tileLayout({...input,handCount});assert.equal(next.floorHeight,base.floorHeight);assert.ok(next.height<=base.height);}
}
const improved=tileLayout({width:824,height:348,floorWidth:445,handWidth:334,handCount:10,cols:5,rows:3,players:3,landscape:true});assert.ok(improved.height>=70&&improved.floorHeight>=64,'ordinary phone: floor/played height grows from 50 to at least 64px while the hand remains large');assert.ok(improved.floorHeight/improved.height>=.85,'floor and played tiles approach the visible hand size');
const short=tileLayout({width:620,height:243,floorWidth:330,handWidth:247,handCount:10,cols:5,rows:3,players:3,landscape:true});assert.ok(short.compactLandscape);assert.ok(short.floorHeight>=39,'short-screen hand controls cannot force the floor to shrink');
console.log('PASS: enlarged original-topology floor and equal-size horizontal plays; separate full-height hand; short-screen controls; labels, shadows, selection padding and dense hands all fit.');
