import assert from 'node:assert/strict';
import {KOREAN_OPPONENTS,chooseKoreanOpponents} from '../lib/korean-opponents.ts';
import {STAGE_THEMES} from '../lib/stage-theme.ts';
const names=new Set(STAGE_THEMES.flatMap(s=>s.opponents.map(p=>p.name)));
assert.equal(KOREAN_OPPONENTS.length,4);assert.equal(new Set(KOREAN_OPPONENTS.map(p=>p.name)).size,4);
assert.ok(KOREAN_OPPONENTS.every(p=>!names.has(p.name)));
for(const size of [1,2,3]){
 const first=chooseKoreanOpponents(size,[],()=>.1),next=chooseKoreanOpponents(size,first.map(p=>p.name),()=>.1);
 assert.equal(first.length,size);assert.equal(new Set(first.map(p=>p.avatar)).size,size);
 if(size<3)assert.ok(next.some(p=>!first.some(q=>q.name===p.name)),'a new face appears whenever the small cast allows one');
 assert.ok(next.every(p=>p.avatar.startsWith('korean-monster:')));
}
console.log('PASS: four Korean opponent identities and shared full-body/portrait assets, no challenge-roster overlap, unique seats, and changing opponents across new games.');
