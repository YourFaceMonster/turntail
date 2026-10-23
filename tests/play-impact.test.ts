import assert from 'node:assert/strict';
import {playImpact,impactVibration} from '../lib/play-impact.ts';
const tile=(n:number,s=0)=>({n,s,id:n+s*15});
for(let suit=0;suit<4;suit++){
 for(const number of [1,3,7,15])assert.equal(playImpact([tile(number,suit)],'playing'),'single');
 assert.equal(playImpact([tile(2,suit)],'playing'),'power');
 assert.equal(playImpact([tile(2,suit)],'ended'),'finish');
}
for(const combination of [[tile(7),tile(7,1)],[tile(3),tile(4),tile(5),tile(6),tile(7)]]){
 assert.equal(playImpact(combination,'playing'),'power');assert.equal(playImpact(combination,'ended'),'finish');
}
assert.equal(playImpact([tile(3)],'ended'),'finish','winning ordinary tile still gets final feedback');
assert.equal(impactVibration('single'),6);assert.deepEqual(impactVibration('power'),[20,24,32]);assert.deepEqual(impactVibration('finish'),[45,35,80,45,120]);
console.log('PASS: ordinary singles, every suit of two, combinations and winning plays have distinct landing feedback with final-play precedence.');
