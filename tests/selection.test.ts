import assert from 'node:assert/strict';
import {legalOptions,type Tile} from '../lib/game.ts';
import {toggleTileSelection,selectableTileIds} from '../lib/selection.ts';
const t=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const hand=[t(4),t(4,1),t(4,3),t(7),t(7,2),t(8),t(9),t(10),t(11),t(12)];
let options=legalOptions(hand,[t(3)]),selection:number[]=[];
for(const tile of hand){selection=toggleTileSelection(selection,tile.id,options,1);assert.deepEqual(selection,[tile.id]);assert.equal(selection.length,1);}
assert.deepEqual(toggleTileSelection(selection,selection[0],options,1),[]);
options=legalOptions(hand,[t(3),t(3,1)]);selection=toggleTileSelection([],t(4).id,options,2);assert.ok(selectableTileIds(selection,options,2).has(t(4,1).id));assert.equal(selectableTileIds(selection,options,2).has(t(7).id),false);assert.deepEqual(toggleTileSelection(selection,t(7).id,options,2),selection);selection=toggleTileSelection(selection,t(4,1).id,options,2);assert.equal(selection.length,2);assert.deepEqual([...selectableTileIds(selection,options,2)].sort(),[t(4).id,t(4,1).id].sort());assert.deepEqual(toggleTileSelection(selection,t(4,3).id,options,2),selection);assert.equal(toggleTileSelection(selection,t(4,1).id,options,2).length,1);
options=legalOptions(hand,[]);selection=[];for(const n of [7,8,9,10,11])selection=toggleTileSelection(selection,t(n).id,options,0);assert.equal(selection.length,5);assert.deepEqual(toggleTileSelection(selection,t(12).id,options,0),selection);
const noMove=legalOptions([t(3)],[t(2,3)]);assert.deepEqual(toggleTileSelection([],t(3).id,noMove,1),[]);
console.log('PASS: single replacement, same-number pair restriction, no third tile, deselection, valid five-tile lead construction, no illegal completion.');
