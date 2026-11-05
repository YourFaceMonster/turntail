import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync} from 'node:fs';
import {RPG_CONNECTION_SCENES,RPG_STORY_REEL} from '../lib/rpg-connection-scenes.ts';
import {DEMO_ENDING} from '../lib/rpg-demo-ending.ts';
import {FIRST_PROLOGUE,PrologueClock} from '../lib/rpg-prologue.ts';
import {prologueArt} from '../lib/rpg-prologue-art.ts';

test('continuous reel follows prologue then ST1–3 before/after once, and completes with the expanded script',()=>{
 assert.equal(RPG_STORY_REEL.length,FIRST_PROLOGUE.length+25+DEMO_ENDING.length);
 assert.equal(RPG_STORY_REEL.reduce((sum,cut)=>sum+cut.duration,0),FIRST_PROLOGUE.reduce((n,c)=>n+c.duration,0)+136250+DEMO_ENDING.reduce((n,c)=>n+c.duration,0));
 assert.equal(new Set(RPG_STORY_REEL.map(c=>c.id)).size,RPG_STORY_REEL.length);
 assert.deepEqual(RPG_STORY_REEL.filter(c=>/^ST\d_(PRE|POST)_1$/.test(c.id)).map(c=>c.id),['ST1_PRE_1','ST1_POST_1','ST2_PRE_1','ST2_POST_1','ST3_PRE_1','ST3_POST_1']);
 let finished=0;const clock=new PrologueClock(RPG_STORY_REEL,()=>finished++);
 for(let time=0;time<=RPG_STORY_REEL.reduce((n,c)=>n+c.duration,0)+20000;time+=100)clock.tick(time);
 assert.equal(finished,1);clock.complete();assert.equal(finished,1);
});

test('handoff keeps five NPC sequences and adds the approved ST3 epilogue using existing art',()=>{
 const scenes=Object.values(RPG_CONNECTION_SCENES).flatMap(stage=>[stage.before,stage.after]);
 assert.deepEqual(scenes.map(cuts=>cuts.length),[4,3,4,4,5,5+DEMO_ENDING.length]);
 assert.equal(scenes.flat().reduce((sum,cut)=>sum+cut.duration,0),136250+DEMO_ENDING.reduce((n,c)=>n+c.duration,0));
 for(const cut of scenes.flat()){
  const art=prologueArt(cut)!;
  assert.ok(existsSync(`public${art.landscape}`));
  assert.ok(existsSync(`public${art.portrait}`));
  assert.ok(!cut.speaker?.includes('임시'));
 }
 assert.ok(RPG_CONNECTION_SCENES[3].before.some(c=>c.speaker==='첫째'));
 assert.ok(RPG_CONNECTION_SCENES[3].before.some(c=>c.speaker==='둘째'));
});

test('each connection finishes once for automatic playback, rapid skip, and replay without changing its data',()=>{
 for(const stage of Object.values(RPG_CONNECTION_SCENES))for(const cuts of [stage.before,stage.after]){
  const snapshot=JSON.stringify(cuts);let transitions=0;
  const player=new PrologueClock(cuts,()=>transitions++);
  for(let now=0;now<40000;now+=100)player.tick(now);
  player.complete();player.complete();player.next();
  assert.equal(transitions,1);assert.equal(JSON.stringify(cuts),snapshot);
  let replayEnded=0;new PrologueClock(cuts,()=>replayEnded++).complete();
  assert.equal(replayEnded,1);assert.equal(transitions,1);
 }
});
