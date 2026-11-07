// Pre-rework journey save compatibility; current RPG rules: rpg-rework.test.tsx.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {createRpgJourneyGame} from './fixtures/legacy-rpg-journey';
import {RpgPreviewSession} from '../lib/rpg-preview';
import {view} from '../lib/game';
import {JourneyMapView,RpgMiniResult} from '../app/components/RpgJourneyScene';
import ResultStandings from '../app/components/ResultStandings';
const noop=()=>{};
const players=[
 {id:'a',name:'판 승자',count:0,place:1,delta:20,total:40,winner:true},
 {id:'b',name:'합산 선두',count:2,place:2,delta:10,total:100,winner:false},
 {id:'c',name:'공동 선두',count:3,place:3,delta:-30,total:100,winner:false},
];
test('single-rank standings use round order now, total order at the final, preserving tied final places',()=>{
 const portrait=(id:string)=>h('span',null,`portrait-${id}`);
 const round=render(h(ResultStandings,{players,singleRank:true,portrait}));
 const final=render(h(ResultStandings,{players,singleRank:true,portrait,final:true}));
 assert.ok(round.indexOf('판 승자')<round.indexOf('합산 선두'));
 assert.ok(final.indexOf('합산 선두')<final.indexOf('판 승자'));
 assert.equal((round.match(/등<\/small>/g)||[]).length,3);
 assert.equal((final.match(/공동 1등/g)||[]).length,2);
 assert.equal((final.match(/data-total-place="1" class="winner-row"/g)||[]).length,2);
 assert.ok(!final.includes('data-total-place="3" class="winner-row"'));
 assert.ok(!round.includes('누적 순위')&&!final.includes('cumulative-place'));
 assert.match(round,/1등<\/small><span class="result-name-portrait"><span>portrait-a<\/span><\/span><span>판 승자/);
});
test('real Serin round/final screens opt into one rank without a repeated final summary',()=>{
 const source=createRpgJourneyGame('결과 확인');const preview=new RpgPreviewSession(source,'screens');
 for(const target of ['mini-round','mini-final'] as const){
  const game=preview.screen(source,target);
  const child=game.rpgRun!.journey!.mini!.game;
  const html=render(h(RpgMiniResult,{game:view(child,child.players[0].token),busy:false,next:noop,back:noop,exit:noop}));
  assert.ok(html.includes('single-rank-standings'));
  assert.ok(!html.includes('cumulative-place')&&!html.includes('journey-final-summary'));
 }
});
test('fate always has three gem slots inside the HP block and depleted slots stay visible',()=>{
 const game=createRpgJourneyGame('보석 확인');
 for(let fate=0;fate<=3;fate++){
  game.rpgRun!.fate=fate;
  const html=render(h(JourneyMapView,{run:game.rpgRun!,busy:false,error:'',action:noop,exit:noop}));
  assert.equal((html.match(/src="\/ui\/fate-gem-v1.png"/g)||[]).length,3);
  assert.equal((html.match(/class="is-active"/g)||[]).length,fate);
  assert.equal((html.match(/class="is-spent"/g)||[]).length,3-fate);
  assert.ok(html.indexOf('journey-hp-block')<html.indexOf('journey-fate-gems'));
  assert.match(html,/class="journey-name-fate"><b>[^<]+<\/b><span class="journey-fate-gems"/);
  assert.ok(html.indexOf('journey-fate-gems')<html.indexOf('journey-hp-avatar'));
  assert.ok(html.includes('철문의 영역')&&!html.includes('달의 영역'));
 }
});
