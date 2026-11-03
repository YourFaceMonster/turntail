import assert from 'node:assert/strict';
import {test} from 'node:test';
import {prologueSceneGroup,prologueSceneSources} from '../lib/rpg-prologue-art.ts';
import {FIRST_PROLOGUE,SECOND_PROLOGUE,type PrologueCut} from '../lib/rpg-prologue.ts';
import {RPG_CONNECTION_SCENES,RPG_STORY_REEL} from '../lib/rpg-connection-scenes.ts';

test('all consecutive lines over one connection painting share a camera key and full scene duration',()=>{
 for(const sequence of Object.values(RPG_CONNECTION_SCENES))for(const phase of [sequence.before,sequence.after]){
  const first=prologueSceneGroup(phase,0);
  assert.ok(first.end>0,'several captions share the painting');
  for(let i=first.start;i<=first.end;i++)assert.deepEqual(prologueSceneGroup(phase,i),first);
  assert.equal(first.duration,phase.slice(0,first.end+1).reduce((sum,cut)=>sum+cut.duration,0));
 }
});
test('real artwork changes transition, while a repeated painting after another scene starts a fresh group',()=>{
 const front=FIRST_PROLOGUE.findIndex(c=>c.id==='P06a'),back=front+1;
 assert.notEqual(prologueSceneGroup(FIRST_PROLOGUE,front).key,prologueSceneGroup(FIRST_PROLOGUE,back).key);
 const repeated=SECOND_PROLOGUE.findIndex(c=>c.id==='R02a');
 assert.equal(prologueSceneGroup(SECOND_PROLOGUE,repeated).key,prologueSceneGroup(SECOND_PROLOGUE,repeated+1).key);
 const sample:readonly PrologueCut[]=[FIRST_PROLOGUE[1],FIRST_PROLOGUE[2],FIRST_PROLOGUE[1]];
 assert.notEqual(prologueSceneGroup(sample,0).key,prologueSceneGroup(sample,2).key);
});
test('scene groups partition the full reel without altering the existing 216.75-second story timing',()=>{
 let duration=0,index=0;
 while(index<RPG_STORY_REEL.length){const group=prologueSceneGroup(RPG_STORY_REEL,index);assert.equal(group.start,index);duration+=group.duration;index=group.end+1;}
 assert.equal(index,37);assert.equal(duration,216750);
});
test('short connections preload only their own paintings in the requested orientation',()=>{
 assert.deepEqual(prologueSceneSources(RPG_CONNECTION_SCENES[3].before,true),['/prologue/twins-before-portrait-r61.png','/prologue/twins-reply-portrait-v1.png']);
 assert.deepEqual(prologueSceneSources(RPG_CONNECTION_SCENES[3].after,false),['/prologue/twins-after-r61.png','/prologue/twins-after-reply-wide-v1.png','/prologue/moon-castle-map-v3.png']);
 assert.deepEqual(prologueSceneSources([FIRST_PROLOGUE[0]],true),[]);
});
test('dialogue pose drawings change while the camera group stays mounted and both drawings preload',()=>{
 const cuts=RPG_CONNECTION_SCENES[2].before;
 assert.notEqual(cuts[1].art?.portrait,cuts[1].poseArt?.portrait);
 assert.equal(prologueSceneGroup(cuts,1).key,prologueSceneGroup(cuts,2).key);
 assert.ok(prologueSceneSources(cuts,true).includes(cuts[1].poseArt!.portrait));
 const rest=FIRST_PROLOGUE.findIndex(c=>c.id==='P04');
 assert.equal(prologueSceneGroup(FIRST_PROLOGUE,rest).key,prologueSceneGroup(FIRST_PROLOGUE,rest+1).key);
});
