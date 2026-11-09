import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import YachtDiceTable,{scatter,DIE_GAP,STAGE_RATIO} from '../app/components/YachtDiceTable';
import {SinglePlayerMenu} from '../app/components/SinglePlayer';
import {newYachtPractice,playYachtPractice} from '../lib/yacht-practice';
import {newYachtMatch,yachtShape,type YachtMatch} from '../lib/yacht-dice';

test('rolled dice never overlap, whatever the roll',()=>{
 for(let round=1;round<=12;round++)for(const turn of [0,1])for(const left of [0,1,2]){
  const spots=scatter(`${round}-${turn}-${left}`);assert.equal(spots.length,5);
  for(let a=0;a<5;a++)for(let b=a+1;b<5;b++){const d=Math.hypot(spots[a].x-spots[b].x,(spots[a].y-spots[b].y)*STAGE_RATIO);assert.ok(d>=DIE_GAP,`${round}-${turn}-${left}: dice ${a},${b} only ${d.toFixed(1)} apart`);}
 }
});
test('yachtShape names the strongest combo on the dice',()=>{
 assert.equal(yachtShape([4,4,4,4,4]),'yacht');assert.equal(yachtShape([2,3,4,5,6]),'large-straight');assert.equal(yachtShape([1,2,3,4,6]),'small-straight');
 assert.equal(yachtShape([2,2,5,5,5]),'full-house');assert.equal(yachtShape([3,3,3,3,6]),'four-kind');assert.equal(yachtShape([1,1,2,4,6]),'');
});
test('practice games stake nothing and end with a result',()=>{
 let state=newYachtPractice();const random=()=>3;
 state=playYachtPractice(state,{kind:'roll'},random);assert.equal(state.match.rollsLeft,2);
 state=playYachtPractice(state,{kind:'forfeit'});assert.equal(state.result,'forfeit');assert.equal(state.match.status,'ended');
 assert.throws(()=>playYachtPractice(state,{kind:'roll'}),/끝난 판/);
});
const base={hp:0,equipped:[],busy:false,play:()=>{},retry:()=>{},leave:()=>{}};
test('Haro combo log sits beside his seat and lists his made combos',()=>{
 const match:YachtMatch={...newYachtMatch(),sheets:[{},{'full-house':24,'small-straight':0}],round:3,last:{seat:1,category:'full-house',score:24}};
 const html=renderToStaticMarkup(<YachtDiceTable {...base} den={{losses:0,match}} match={match}/>);
 assert.ok(html.includes('하로의 족보')&&html.includes('방금 풀하우스 24점'));
 assert.match(html,/class="is-lower is-made is-last"[^>]*><span>풀하<\/span><b>24<\/b>/);
 assert.match(html,/class="is-lower is-zero "[^>]*><span>스몰<\/span><b>0<\/b>/);
 assert.equal((html.match(/<li class="is-(upper|lower)/g)||[]).length,12,'all 12 of Haro\'s boxes are listed');
});
test('practice table hides HP stake and relic, offers another game',()=>{
 const match:YachtMatch={...newYachtMatch(),status:'ended',sheets:[{choice:20},{choice:10}]};
 const html=renderToStaticMarkup(<YachtDiceTable {...base} practice den={{losses:0,match,result:'win'}} match={match}/>);
 assert.ok(html.includes('한 판 더')&&html.includes('메뉴로 돌아가기'));
 assert.ok(!html.includes('HP')&&!html.includes('하로의 상아 주사위')&&!html.includes('판돈 HP'));
 assert.ok(html.includes('판돈 없음'));
});
test('single-play menu shows Yacht Dice where item battle was',()=>{
 const noop=()=>{},html=renderToStaticMarkup(<SinglePlayerMenu normal={noop} yacht={noop} rpg={noop} close={noop}/>);
 assert.ok(html.includes('aria-label="요트다이스"')&&html.includes('YACHT DICE'));
 assert.ok(!html.includes('아이템전')&&!html.includes('HP ITEM MATCH'));
});
