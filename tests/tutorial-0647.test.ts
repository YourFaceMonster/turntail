import assert from 'node:assert/strict';
import {TUTORIAL_LESSONS as lessons,tutorialAnswer} from '../lib/tutorial';
import {combo,beats} from '../lib/game';

const answerNumbers:Record<string,number[]>={color:[7],number:[2],single:[6],pair:[7,7],triple:[7,7,7],five:[7,7,7,9,9],lead:[3],finish:[2]};
const before=JSON.stringify(lessons);
for(const lesson of lessons){
 assert.equal(tutorialAnswer(lesson,[]),false,lesson.kind+' rejects an empty answer');
 if(lesson.kind==='draw')continue;
 const expected=lesson.kind==='color'?lesson.hand.filter(tile=>tile.s===3):lesson.hand.filter(tile=>answerNumbers[lesson.kind].includes(tile.n));
 assert.equal(tutorialAnswer(lesson,expected.map(tile=>tile.id)),true,lesson.kind+' can be completed with its own hand');
 const wrong=lesson.hand.find(tile=>!expected.some(value=>value.id===tile.id));
 if(wrong)assert.equal(tutorialAnswer(lesson,[wrong.id]),false,lesson.kind+' rejects the decoy');
 if(lesson.kind==='pair'||lesson.kind==='triple'||lesson.kind==='five'){
  assert.equal(beats(expected,[...lesson.target]),true);
  assert.equal(tutorialAnswer(lesson,expected.slice(1).map(tile=>tile.id)),false,'incomplete '+lesson.kind);
 }
}
const finish=lessons.find(lesson=>lesson.kind==='finish')!;
assert.equal(tutorialAnswer(finish,[finish.hand[1].id]),false,'must play 2 before the last 3');
assert.equal(tutorialAnswer(finish,[finish.hand[1].id],1),true,'last 3 finishes the practice');
const five=lessons.find(lesson=>lesson.kind==='five')!;
assert.equal(combo(five.hand.slice(0,5))?.label,'풀하우스');
assert.equal(combo([...five.target])?.label,'스트레이트');
assert.equal(JSON.stringify(lessons),before,'answers do not mutate the lesson tiles');
console.log('PASS: all nine tutorial lessons have reachable legal answers; wrong and incomplete groups rejected; two-step finish preserves its order.');
