import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {holdMinigameMusic,minigameMusicActive,subscribeMinigameMusic} from '../lib/minigame-music';

test('journey mini-games hold their music while mounted; releases are idempotent and nested holds count', () => {
 let calls=0;const stop=subscribeMinigameMusic(()=>calls++);
 assert.equal(minigameMusicActive(),false);
 const a=holdMinigameMusic(),b=holdMinigameMusic();
 assert.equal(minigameMusicActive(),true);
 a();a();assert.equal(minigameMusicActive(),true);
 b();assert.equal(minigameMusicActive(),false);
 assert.equal(calls,4);stop();
 assert.equal((readFileSync('app/components/InnGames.tsx','utf8').match(/holdMinigameMusic\(\)/g)||[]).length,2,'both inn games');
 assert.match(readFileSync('app/components/RpgJourneyScene.tsx','utf8'),/<MinigameMusic\/><YachtDiceTable/,'dice den match');
});

test('result, mini-game and ST2 duel tracks are wired and tag-free', () => {
 const page=readFileSync('app/page.tsx','utf8');
 assert.match(page,/musicScene==='minigame'\?'\/audio\/minigame-suno-0729\.mp3'/);
 assert.match(page,/musicScene==='result'\?'\/audio\/shuffling-shadows-suno-0729\.mp3'/);
 assert.match(page,/game\.rpgRun\.stage===2\?'duel-d'/);
 assert.match(page,/musicScene==='duel-d'\?'\/audio\/duel-d-suno-0729\.mp3'/);
 for(const file of ['public/audio/shuffling-shadows-suno-0729.mp3','public/audio/duel-d-suno-0729.mp3','public/audio/minigame-suno-0729.mp3']){
  assert.ok(existsSync(file),file);const bytes=readFileSync(file);
  assert.equal(bytes[0],0xff,`${file} starts at an MPEG frame (no ID3 tag)`);
  assert.equal(bytes.includes(Buffer.from('suno.com')),false,`${file} carries no Suno tag`);
 }
});
