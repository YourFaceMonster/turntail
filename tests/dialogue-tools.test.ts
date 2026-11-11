import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {autoPageDelay,dialogueAutoChoice,setDialogueAuto,subscribeDialogueAuto} from '../lib/dialogue-prefs';
import {PrologueClock,type PrologueCut} from '../lib/rpg-prologue';

test('dialogue auto choice is shared and notifies listeners', () => {
 let calls=0;const stop=subscribeDialogueAuto(()=>calls++);
 setDialogueAuto(false);assert.equal(dialogueAutoChoice(),false);
 setDialogueAuto(true);assert.equal(dialogueAutoChoice(),true);
 assert.equal(calls,2);stop();
 assert.ok(autoPageDelay('짧은 말')<autoPageDelay('훨씬 더 길게 이어지는 한 쪽 분량의 대사입니다'));
 assert.ok(autoPageDelay('가'.repeat(400))<=9000);
});

test('a held story clock stops its timer but still advances on tap', () => {
 const cuts=[{id:'a',duration:1000},{id:'b',duration:1000},{id:'c',duration:1000}] as unknown as PrologueCut[];
 let done=false;const clock=new PrologueClock(cuts,()=>{done=true;});
 clock.hold(true);clock.tick(0);clock.tick(200);clock.tick(400);clock.tick(5000);
 assert.equal(clock.index,0,'held: time does not move the cut');
 clock.next();assert.equal(clock.index,1,'tap still advances');
 clock.hold(false);for(let t=0;t<=1250;t+=250)clock.tick(10000+t);
 assert.equal(clock.index,2,'released: timer runs again');
 assert.equal(done,false);
});

test('both cutscene screens offer auto-advance and the dialogue log', () => {
 for(const file of ['app/components/RpgPrologue.tsx','app/components/QuestCutscene.tsx']){
  const source=readFileSync(file,'utf8');
  assert.match(source,/<DialogueTools /,file);assert.match(source,/useDialogueAuto\(/,file);
 }
});
