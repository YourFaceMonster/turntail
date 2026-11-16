import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {journeyScenes} from '../lib/rpg-chapter-scenes';
import {chapterArt,stageArtToPreload} from '../lib/rpg-chapters';

test('the last pre-match line of ST4~10 cuts to that stage close-up; every file exists',()=>{
 const run={journey:{startedStages:[4,5,6,7,8,9,10],story:{runNumber:1,quests:{}}},stage:4,status:'ready'} as never;
 for(const stage of [4,5,6,7,8,9,10]){
  const art=chapterArt(`st${stage}-duel`);assert.equal(art.portrait,`/story/st${stage}-duel-portrait-v2.webp`);assert.equal(art.landscape,`/story/st${stage}-duel-wide-v2.webp`);
  for(const path of [art.portrait,art.landscape,art.portrait.replace('.webp','.png'),art.landscape.replace('.webp','.png')])assert.ok(existsSync(`public${path}`),path);
  const before=journeyScenes(stage,run).before;
  assert.deepEqual(before.at(-1)!.art,art,`ST${stage} last line`);assert.ok(before.slice(0,-1).every(cut=>cut.art?.portrait!==art.portrait),`ST${stage} earlier lines keep the scene`);
  assert.ok(stageArtToPreload(stage).includes(art.portrait));
 }
});
