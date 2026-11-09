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
