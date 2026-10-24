import assert from 'node:assert/strict';
import {tileLayout} from '../lib/layout';
for(const [width,height,landscape] of [[342,573,false],[372,777,false],[782,1050,false],[824,323,true],[914,363,true]] as const)for(const players of [2,3,4]){
 const common={width,height,floorWidth:landscape?width*.51:width-24,cols:players===2?6:players===4?4:5,rows:3,players,landscape},handWidth=landscape?width*.46:width-20;
 const baseline=tileLayout({...common,handWidth,handCount:players===2?12:10});let last=Infinity;
 for(let handCount=0;handCount<=54;handCount++){
  const next=tileLayout({...common,handWidth,handCount});assert.equal(next.floorHeight,baseline.floorHeight);assert.equal(next.floorWidth,baseline.floorWidth);assert.equal(next.baseColumns,baseline.baseColumns);
  assert.ok(next.height<=last);last=next.height;assert.ok(next.height<=next.floorHeight);assert.ok(next.width*next.columns+(next.columns-1)*next.gap+4<=handWidth);
 }
 const narrowHand=tileLayout({...common,handWidth:handWidth*.7,handCount:40});assert.equal(narrowHand.floorHeight,baseline.floorHeight,'a narrowing hand column cannot shrink the floor');
}
console.log('PASS: floor and played tile dimensions stay identical through 12→18→26→40→54 hand tiles in portrait/landscape and 2/3/4-player games; only the hand shrinks.');
