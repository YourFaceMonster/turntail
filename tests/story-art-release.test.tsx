import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {RPG_CONNECTION_SCENES} from '../lib/rpg-connection-scenes.ts';
import {prologueSceneGroup,prologueSceneSources,storyPictureTransition} from '../lib/rpg-prologue-art.ts';
import {STORY_CARD_ART} from '../lib/rpg-story-card-art.ts';
import {ProloguePicture} from '../app/components/RpgPrologue.tsx';
import {imageSize} from './helpers/image-size';
import {createRpgJourneyGame} from '../lib/rpg-game.ts';
import {journeyScenes} from '../lib/rpg-chapter-scenes.ts';
test('gate closeups preload both faces and keep the flip in its own camera group',()=>{
 const cuts=RPG_CONNECTION_SCENES[3].after;
 const front=cuts.findIndex(c=>c.id==='ST3_POST_7'),back=cuts.findIndex(c=>c.id==='ST3_POST_8');
 assert.equal(cuts[front].keepsakeFace,'front');assert.equal(cuts[back].keepsakeFace,'back');
 assert.notEqual(prologueSceneGroup(cuts,front).key,prologueSceneGroup(cuts,back).key);
 assert.equal(storyPictureTransition(cuts[front],cuts[back]),'overlap');
 for(const portrait of [false,true])for(const face of Object.values(STORY_CARD_ART['iron-gate-two']))assert.ok(prologueSceneSources(cuts,portrait).includes(face));
 const html=renderToStaticMarkup(<ProloguePicture cut={cuts[back]}/>);assert.ok(html.includes('data-keepsake-face="back"')&&html.includes(STORY_CARD_ART['iron-gate-two'].back));
});
test('new handoff and comparison paintings exist in the correct aspect ratios, with transparent keepsakes',()=>{
 const cuts=RPG_CONNECTION_SCENES[3].after;
 for(const id of ['ST3_POST_6','ST3_POST_9']){
  const cut=cuts.find(c=>c.id===id)!;assert.ok(cut.art!.landscape.includes('st3-keepsake-'));
  for(const orientation of ['landscape','portrait'] as const){const {format,width,height}=imageSize(readFileSync('public'+cut.art![orientation]));assert.equal(format,'webp');assert.equal(width>height,orientation==='landscape');}
 }
 for(const path of Object.values(STORY_CARD_ART['iron-gate-two'])){const img=readFileSync('public'+path);assert.ok(img.toString('ascii',12,16)==='VP8X'&&(img[20]&0x10)!==0,'RGBA keepsake cutout (WebP alpha flag)');}
 assert.ok(!cuts.slice(0,5).some(c=>c.keepsakeFace||c.art?.landscape.includes('st3-keepsake')));
});

test('flame and key discoveries switch to a back painting when the narration turns the keepsake over',()=>{
 const run=createRpgJourneyGame('그림 확인','',0).rpgRun!;
 for(const [stage,line,stem] of [[6,'패를 뒤집자','st6-flame-two'],[9,'뒷면에는','st9-key-two']] as const){
  const cuts=journeyScenes(stage,run).after,index=cuts.findIndex(c=>c.line.startsWith(line));
  assert.ok(index>0);
  assert.equal(cuts[index-1].art!.portrait,`/story/${stem}-portrait-special-v2.webp`);
  assert.equal(cuts[index].art!.portrait,`/story/${stem}-back-portrait-special-v2.webp`);
  assert.notEqual(prologueSceneGroup(cuts,index-1).key,prologueSceneGroup(cuts,index).key);
  assert.equal(storyPictureTransition(cuts[index-1],cuts[index]),'overlap');
  // 2026-11-14: wide screens get the wide repaint (1672×941), tall screens the portrait one.
  assert.equal(cuts[index].art!.landscape,`/story/${stem}-back-wide-special-v1.webp`);
  for(const orientation of ['landscape','portrait'] as const){
   const size=imageSize(readFileSync('public'+cuts[index].art![orientation]));assert.ok(orientation==='portrait'?size.height>size.width:size.width>size.height);
  }
 }
});

test('flame and key keepsakes get a closeup of both faces after the wide altar shot',()=>{
 const run=createRpgJourneyGame('그림 확인','',0).rpgRun!;
 for(const [stage,card,stem] of [[6,'sacred-flame-two','st6-flame-two'],[9,'secret-key-two','st9-key-two']] as const){
  const cuts=journeyScenes(stage,run).after,front=cuts.findIndex(c=>c.keepsakeFace==='front'),back=cuts.findIndex(c=>c.keepsakeFace==='back');
  assert.ok(front>0&&back===front+1);
  assert.ok(!cuts[front-1].keepsakeFace&&cuts[front-1].art!.portrait.includes(stem),'the wide painting comes first');
  assert.equal(cuts[front].keepsakeCard,card);assert.equal(cuts[back].keepsakeCard,card);
  assert.ok(cuts[back].art!.portrait.includes(`${stem}-back`));
  for(const face of Object.values(STORY_CARD_ART[card]))assert.ok(prologueSceneSources(cuts,true).includes(face));
  const html=renderToStaticMarkup(<ProloguePicture cut={cuts[front]}/>);assert.ok(html.includes(STORY_CARD_ART[card].front)&&html.includes('data-matte'),'opaque fronts are trimmed to the card');
  assert.ok(!renderToStaticMarkup(<ProloguePicture cut={cuts[back]}/>).includes('data-matte'),'backs are already cut out');
 }
});
