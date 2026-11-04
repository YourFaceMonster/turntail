import assert from 'node:assert/strict';
import {test} from 'node:test';
import {coverImagePoint,questLightAnchor} from '../lib/quest-light-position';
test('glow follows the actual cover crop and the current lantern/glass painting anchors',()=>{
 const wide=coverImagePoint(800,600,1600,900,.5,1,.5,.8);assert.equal(wide.left,400);assert.equal(wide.top,480);assert.ok(Math.abs(wide.width-1600*2/3)<1e-9);
 const portrait=questLightAnchor('watchtower-arrival-portrait-v4.png');assert.equal(portrait.x,.534);assert.equal(portrait.y,.653);
 const point=coverImagePoint(390,680,941,1672,.5,1,portrait.x,portrait.y);assert.ok(point.left>200&&point.left<220);assert.ok(point.top>420&&point.top<455);
 assert.equal(questLightAnchor('blue-glass-discovery-portrait-v3.png').x,.438);
});
