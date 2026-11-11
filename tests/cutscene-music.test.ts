import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {holdCutsceneSilence,cutsceneSilenceActive,subscribeCutsceneSilence} from '../lib/cutscene-music';

test('cutscenes hold background-music silence while mounted; releases are idempotent and nested holds count', () => {
 let calls=0;const stop=subscribeCutsceneSilence(()=>calls++);
 assert.equal(cutsceneSilenceActive(),false);
 const a=holdCutsceneSilence(),b=holdCutsceneSilence();
 assert.equal(cutsceneSilenceActive(),true);
 a();a();assert.equal(cutsceneSilenceActive(),true,'double release of one hold does not end another');
 b();assert.equal(cutsceneSilenceActive(),false);
 assert.equal(calls,4);stop();
 for(const file of ['app/components/RpgPrologue.tsx','app/components/QuestCutscene.tsx'])assert.match(readFileSync(file,'utf8'),/holdCutsceneSilence\(\)/,file);
 assert.match(readFileSync('app/components/RpgPrologue.tsx','utf8'),/prologueAmbience\(context,cut,false,/,'synthesized tavern motif is off during cutscenes');
 assert.match(readFileSync('app/page.tsx','utf8'),/cutsceneSilenceActive\(\)/);
});
