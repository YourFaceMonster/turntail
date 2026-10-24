import assert from 'node:assert/strict';
import {tableGestureDelta,tileSwipeReady,isTileDoubleTap} from '../lib/tile-gestures';
for(const [rotation,down,up] of [[0,{x:0,y:70},{x:0,y:-70}],[90,{x:-70,y:0},{x:70,y:0}],[-90,{x:70,y:0},{x:-70,y:0}]] as const){
 const start={x:160,y:300},end=(d:{x:number,y:number})=>({x:start.x+d.x,y:start.y+d.y});
 const d=tableGestureDelta(start,end(down),rotation),u=tableGestureDelta(start,end(up),rotation);
 assert.equal(Math.abs(d.x),0);assert.equal(d.y,70);assert.equal(Math.abs(u.x),0);assert.equal(u.y,-70);
 assert.equal(tileSwipeReady('floor',d,60,300),false);assert.ok(tileSwipeReady('hand',u,60,300));
 assert.equal(tileSwipeReady('floor',u,60,300),false);assert.equal(tileSwipeReady('hand',d,60,300),false);
}
for(const kind of ['floor','hand'] as const){const sign=kind==='floor'?1:-1;
 for(const [delta,ms] of [[{x:0,y:sign*10},200],[{x:0,y:sign*43},200],[{x:60,y:sign*70},200],[{x:0,y:sign*90},-1]] as const)assert.equal(tileSwipeReady(kind,delta,60,ms),false);
 assert.equal(tileSwipeReady(kind,{x:10,y:sign*80},95,12000),kind==='hand','floor sliding is removed, deliberate hand dragging remains');assert.equal(tileSwipeReady(kind,{x:0,y:sign*44},20,100),kind==='hand');
}
const tap={id:4,at:100,x:160,y:300};
assert.ok(isTileDoubleTap(tap,{...tap,at:430,x:175,y:310}));
for(const next of [{...tap,id:5,at:200},{...tap,at:431},{...tap,at:99},{...tap,at:200,x:189}])assert.equal(isTileDoubleTap(tap,next),false);
assert.equal(isTileDoubleTap(null,tap),false);
console.log('PASS: floor drag removal and selected-hand/up gestures across 0/+90/-90 rotations; minimum travel, vertical dominance, duration and same-tile double-tap boundaries.');
