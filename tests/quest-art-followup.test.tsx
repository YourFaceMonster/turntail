import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync,readFileSync} from 'node:fs';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {createRpgJourneyGame} from '../lib/rpg-game';
import {JourneyLetterAlleyView,JourneyMapView,JourneyWayfarerStopView} from '../app/components/RpgJourneyScene';
import QuestReplay from '../app/components/QuestReplay';
import {QUEST_DIALOGUE} from '../lib/rpg-dialogue';
import {questDialoguePages} from '../lib/quest-dialogue-pages';
import {questArt} from '../lib/rpg-quest-art';
import {JOURNEY_NODES} from '../lib/rpg-journey';
import {RPG_CONNECTION_SCENES} from '../lib/rpg-connection-scenes';
const noop=()=>{};
test('thief introduction and replay show the spinning letter for every narrator page, then the supported-crate pose',()=>{
 const game=createRpgJourneyGame('도둑 확인'),props={run:game.rpgRun!,busy:false,error:'',action:noop,exit:noop};
 const live=JourneyLetterAlleyView(props),replay=QuestReplay({id:'quest-thief',close:noop})!;
 for(const element of [live,replay]){
  assert.deepEqual(element.props.lines,QUEST_DIALOGUE.thief);
  assert.deepEqual(element.props.paintings,['alley-thief-spin','alley-thief']);
  const pages=questDialoguePages(element.props.lines);
  assert.ok(pages.filter(p=>p.sourceIndex===0).length>1);
  for(const page of pages)assert.equal(element.props.paintings[Math.min(page.sourceIndex,1)],page.sourceIndex===0?'alley-thief-spin':'alley-thief');
 }
 assert.ok(render(live).includes('data-painting="alley-thief-spin"'));
 assert.ok(render(replay).includes('alley-thief-spin-wide-v2.webp'));
});
test('traveler before and after states use their revised responsive artwork without changing quest state',()=>{
 const game=createRpgJourneyGame('여행자 확인'),run=game.rpgRun!;
 for(const given of [false,true]){
  run.journey!.wayfarerHerbGiven=given;
  const before=JSON.stringify(run),html=render(h(JourneyWayfarerStopView,{run,busy:false,error:'',action:noop,exit:noop}));
  const key=given?'traveler-aided':'traveler-injured';
  assert.ok(html.includes(questArt(key).landscape));
  assert.ok(html.includes(questArt(key).portrait));
  assert.equal(JSON.stringify(run),before);
 }
});
test('market-alley pin and path move together and map/ending share the responsive village pair',()=>{
 assert.deepEqual(JOURNEY_NODES.find(n=>n.id==='letter-alley')&&[JOURNEY_NODES.find(n=>n.id==='letter-alley')!.x,JOURNEY_NODES.find(n=>n.id==='letter-alley')!.y],[82,49]);
 const css=readFileSync('app/rpg-journey.css','utf8');
 assert.ok(css.includes("[data-node='letter-alley']{left:82%;top:49%}"));
 assert.ok(css.includes("[data-node='letter-alley']{left:84%;top:58%}"));
 const game=createRpgJourneyGame('지도 확인');
 const html=render(h(JourneyMapView,{run:game.rpgRun!,busy:false,error:'',action:noop,exit:noop}));
 assert.ok(html.includes('M69 37L82 49')&&html.includes('M78 46L84 58'));
 const art=RPG_CONNECTION_SCENES[3].after.at(-1)!.art!;
 for(const orientation of ['wide','portrait']){
  const src=`/prologue/iron-gate-village-map-${orientation}-v3.webp`;
  assert.ok(css.includes(src)&&Object.values(art).includes(src));
  assert.ok(existsSync('public'+src));
 }
});
