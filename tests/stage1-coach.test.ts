import assert from 'node:assert/strict';
import {legalOptions,type Tile} from '../lib/game';
import {stage1Coach} from '../lib/stage1-coach';

const t=(n:number,s:number):Tile=>({id:(n-1)*4+s,n,s});
const coach=(hand:Tile[],trick:Tile[],myTurn=true)=>stage1Coach({myTurn,trick,options:legalOptions(hand,trick),handCount:hand.length,turnName:'루미'});

// Leading: any combination, the example is the weakest multi-tile play.
const lead=coach([t(3,0),t(3,1),t(9,2),t(9,3),t(12,0)],[]);
assert.equal(lead.tone,'lead');assert.match(lead.text,/페어 3·3/,'weakest pair as the example');

// Answering a pair: the example is a pair, and the weakest one that wins.
const answer=coach([t(6,0),t(6,1),t(11,0),t(11,2),t(4,3)],[t(5,0),t(5,1)]);
assert.equal(answer.tone,'answer');assert.match(answer.title,/페어를 이겨 보세요/);assert.match(answer.text,/페어 6·6/);assert.match(answer.text,/2장/);

// Nothing beats it: tells the player to draw.
const draw=coach([t(4,0),t(7,1)],[t(2,3)]);
assert.equal(draw.tone,'draw');assert.match(draw.text,/1장 가져오기/);

// Last tiles that can all go at once.
const last=coach([t(8,0),t(8,1)],[]);
assert.equal(last.tone,'last');

// Not my turn: describes the table only; the coach bubble stays hidden for this tone.
const wait=coach([t(8,0)],[t(5,0),t(5,1)],false);
assert.equal(wait.tone,'wait');assert.match(wait.title,/루미 차례/);

// 을/를 follows the combination name.
assert.match(coach([t(9,0),t(11,1),t(13,2)],[t(5,2)]).title,/싱글을 이겨 보세요/);
console.log('PASS: stage 1 coach — lead, answer, draw, last-move and waiting lines with weakest-legal examples.');
