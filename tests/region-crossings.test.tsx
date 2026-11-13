import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {journeyScenes,journeyStoryReel,CROSSING_ART_SLOTS,crossingArt} from '../lib/rpg-chapter-scenes';
import JourneyDestinationHead from '../app/components/JourneyDestinationHead';
import type {RpgRun} from '../lib/rpg';

const fakeRun=(started:number[],runNumber=1)=>({journey:{startedStages:started,story:{runNumber,quests:{}}}}) as unknown as RpgRun;

test('region crossings play once, before the first stage of each new region',()=>{
 for(const stage of [4,7,10]){
  const first=journeyScenes(stage,fakeRun([1,2,3,4,5,6,7,8,9].filter(s=>s<stage))).before;
  assert.match(first[0].id,new RegExp(`^ST${stage}_CROSS_1$`));
  assert.ok(first.some(cut=>/유물/.test(cut.line)),'the region rule (HP restored, one relic kept) is told in the story');
  const retry=journeyScenes(stage,fakeRun([1,2,3,4,5,6,7,8,9,10].filter(s=>s<=stage))).before;
  assert.ok(!retry.some(cut=>cut.id.includes('_CROSS_')),'a retry of the same stage skips the crossing');
 }
 for(const stage of [5,6,8,9])assert.ok(!journeyScenes(stage,fakeRun([])).before.some(cut=>cut.id.includes('_CROSS_')));
 const reel=journeyStoryReel(fakeRun([1,2,3,4,5,6,7,8,9,10]),10);
 assert.equal(reel.filter(cut=>/_CROSS_1$/.test(cut.id)).length,3,'the full replay keeps all three crossings');
});

test('second journeys add a variant line and every crossing painting exists',()=>{
 assert.ok(journeyScenes(7,fakeRun([1,2,3,4,5,6],2)).before.length>journeyScenes(7,fakeRun([1,2,3,4,5,6],1)).before.length);
 for(const key of Object.keys(CROSSING_ART_SLOTS)){const art=crossingArt(key);assert.ok(existsSync(new URL(`../public${art.portrait}`,import.meta.url)),key);}
});

test('the next-battle dialog dresses region gates with the map, ribbon and road',()=>{
 const gate=renderToStaticMarkup(<JourneyDestinationHead stage={7} title="ST7 · 달빛 고목"/>);
 assert.match(gate,/data-gate="true"/);assert.match(gate,/새 영역 · 열쇠의 영역/);assert.match(gate,/region-3-map-portrait-v2\.webp/);
 assert.match(gate,/ST8<\/b><span>별빛 성소/);assert.match(gate,/루엔/);
 const plain=renderToStaticMarkup(<JourneyDestinationHead stage={8} title="ST8 · 별빛 성소"/>);
 assert.doesNotMatch(plain,/새 영역/);assert.match(plain,/st8-before-portrait/);
});
