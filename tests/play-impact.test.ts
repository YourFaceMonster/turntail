import assert from 'node:assert/strict';
import {playImpact,impactVibration} from '../lib/play-impact.ts';
const tile=(n:number,s=0)=>({n,s,id:n+s*15});
for(let suit=0;suit<4;suit++){
 for(const number of [1,3,7,15])assert.equal(playImpact([tile(number,suit)],'playing'),'single');
 assert.equal(playImpact([tile(2,suit)],'playing'),'power');
 assert.equal(playImpact([tile(2,suit)],'ended'),'finish');
}
assert.equal(playImpact([tile(7),tile(7,1)],'playing'),'combo');
assert.equal(playImpact([tile(3),tile(4,1),tile(5),tile(6),tile(7)],'playing'),'power');
assert.equal(playImpact([tile(3),tile(4),tile(5),tile(6),tile(7)],'playing'),'finish');
assert.equal(playImpact([tile(3)],'ended'),'finish');
assert.equal(impactVibration('single'),6);
assert.deepEqual(impactVibration('combo'),[12,18,18]);
assert.deepEqual(impactVibration('power'),[24,22,40]);
assert.deepEqual(impactVibration('finish'),[38,28,68,32,90]);
console.log('PASS: four impact tiers, five-card ranks and round-win precedence.');
