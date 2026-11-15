import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {PUZZLES,legalPlays,opponentReply,playPuzzle,pt,startPuzzle,winningFirstPlays} from '../lib/puzzles';
import {allPuzzlesCleared,readPuzzleRecords,recordPuzzleClear,savePuzzleRecords} from '../lib/puzzle-records';
import {isRedTwoSingle} from '../lib/game';
import TutorialGuide from '../app/components/TutorialGuide';

test('ten fixed puzzles: valid tiles, solvable, exactly one winning first play, and they need every move',()=>{
 assert.equal(PUZZLES.length,10);assert.equal(new Set(PUZZLES.map(p=>p.id)).size,10);
 for(const p of PUZZLES){
  const all=[...p.mine,...p.theirs,...p.table];
  assert.equal(new Set(all.map(t=>t.id)).size,all.length,`${p.id}: no tile appears twice`);
  assert.ok(all.every(t=>t.n>=1&&t.n<=15&&t.s>=0&&t.s<=3&&t.id===(t.n-1)*4+t.s),`${p.id}: real tiles`);
  assert.ok(!all.some(t=>isRedTwoSingle([t])),`${p.id}: the red-two special is not used`);
  assert.ok(p.title&&p.hint&&p.lesson,`${p.id}: has text`);
  assert.equal(winningFirstPlays(p).length,1,`${p.id}: exactly one winning first play`);
  assert.equal(winningFirstPlays({...p,moves:p.moves-1}).length,0,`${p.id}: cannot be solved faster`);
 }
});

test('the opponent always answers with its weakest beating play, otherwise passes',()=>{
 assert.deepEqual(opponentReply([pt(9,0),pt(13,0)],[pt(6,0)]),[pt(9,0)]);
 assert.equal(opponentReply([pt(9,0),pt(13,0)],[pt(6,0),pt(6,2)]),null,'no pair → pass');
 assert.deepEqual(opponentReply([pt(11,0),pt(11,1)],[pt(11,2)]),[pt(11,1)],'same number: only the stronger suit');
 assert.deepEqual(legalPlays([pt(5,0),pt(5,2)],[]).map(p=>p.length).sort(),[1,1,2]);
});

test('playing a puzzle: illegal plays are rejected, a wrong line loses, the answer wins',()=>{
 const p=PUZZLES[0];let s=startPuzzle(p);
 assert.throws(()=>playPuzzle(p,s,[pt(8,2)]),/손패/);
 const lost=playPuzzle(p,s,[pt(4,0)]);assert.equal(lost.status,'lost');assert.match(lost.note,/상대가 먼저/);
 s=playPuzzle(p,s,[pt(1,3)]);assert.equal(s.status,'playing');assert.equal(s.table.length,0,'opponent passed, I lead again');
 s=playPuzzle(p,s,[pt(4,0)]);assert.equal(s.status,'won');
 assert.throws(()=>playPuzzle(p,s,[pt(4,0)]),/끝났어요/);
 const answer=PUZZLES[2];assert.throws(()=>playPuzzle(answer,startPuzzle(answer),[pt(5,0)]),/이길 수 있는/);
});

test('records keep the fewest tries per puzzle and grant the title only after all ten',()=>{
 const store=new Map<string,string>(),storage={getItem:(k:string)=>store.get(k)??null,setItem:(k:string,v:string)=>{store.set(k,v);}};
 let rec=readPuzzleRecords(storage);assert.deepEqual(rec,{cleared:{}});
 rec=recordPuzzleClear(rec,'p1',3,1);rec=recordPuzzleClear(rec,'p1',5,2);assert.equal(rec.cleared.p1.tries,3);
 rec=recordPuzzleClear(rec,'p1',1,3);assert.deepEqual(rec.cleared.p1,{tries:1,at:1});
 savePuzzleRecords(storage,rec);assert.deepEqual(readPuzzleRecords(storage),rec);
 assert.equal(allPuzzlesCleared(rec,PUZZLES.map(p=>p.id)),false);
 for(const p of PUZZLES)rec=recordPuzzleClear(rec,p.id,1);assert.equal(allPuzzlesCleared(rec,PUZZLES.map(p=>p.id)),true);
 store.set('turntale-puzzles-v1','{broken');assert.deepEqual(readPuzzleRecords(storage),{cleared:{}});
});

test('the tutorial offers the puzzle chapter',()=>{
 const html=renderToStaticMarkup(<TutorialGuide close={()=>{}}/>);
 assert.match(html,/한 수 퍼즐/);
});
