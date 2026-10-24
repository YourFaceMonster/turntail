import assert from 'node:assert/strict';
import {KOREAN_OPPONENTS,chooseKoreanOpponents} from '../lib/korean-opponents.ts';
import {STAGE_THEMES} from '../lib/stage-theme.ts';
const names=new Set(STAGE_THEMES.flatMap(s=>s.opponents.map(p=>p.name)));
assert.equal(KOREAN_OPPONENTS.length,8);assert.equal(new Set(KOREAN_OPPONENTS.map(p=>p.name)).size,8);
assert.ok(KOREAN_OPPONENTS.every(p=>!names.has(p.name)));
for(const size of [1,2,3]){
 const first=chooseKoreanOpponents(size,[],()=>.1),next=chooseKoreanOpponents(size,first.map(p=>p.name),()=>.1);
 assert.equal(first.length,size);assert.equal(new Set(first.map(p=>p.avatar)).size,size);
 assert.ok(next.every(p=>!first.some(q=>q.name===p.name)),'the next new table avoids the previous lineup');
 assert.ok(next.every(p=>p.avatar.startsWith('korean-portrait:')));
}
console.log('PASS: eight distinct Korean names and portraits, no challenge-roster overlap, unique seats, and changing opponents across new games.');
