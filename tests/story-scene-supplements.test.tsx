import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {FIRST_PROLOGUE} from '../lib/rpg-prologue.ts';
import {prologueArt,prologueSceneSources,storyPictureTransition} from '../lib/rpg-prologue-art.ts';
import {RPG_CONNECTION_SCENES} from '../lib/rpg-connection-scenes.ts';
import {morQuestPainting,questArt} from '../lib/rpg-quest-art.ts';
import QuestReplay from '../app/components/QuestReplay.tsx';

test('illustrations respect invitation, wager, gameplay, award, discovery and comparison order',()=>{
 const board=(id:string)=>FIRST_PROLOGUE.filter(c=>c.storyboard===id);
 const first=board('P05')[0],wager=board('P06')[0],play=board('P08')[0],award=board('P09')[0];
 assert.ok(prologueArt(first)!.landscape.includes('tavern-interior'));
 assert.ok(!first.poseArt,'no reward-offering pose on initial invitation');
 assert.ok(prologueArt(wager)!.landscape.includes('wager-rest'));
 assert.ok(prologueArt(play)!.landscape.includes('wager-playing'));
 assert.ok(prologueArt(award)!.landscape.includes('wager-speaking'));
 for(const cut of [...board('P15'),...board('P16')])assert.ok(prologueArt(cut)!.landscape.includes('stone-arrival'));
 for(const cut of board('P17'))assert.ok(prologueArt(cut)!.landscape.includes('stone-revelation'));
 assert.equal(storyPictureTransition(board('P16')[0],board('P17')[0]),'overlap');
 for(const portrait of [false,true]){
  const sources=prologueSceneSources(FIRST_PROLOGUE,portrait);
  for(const moment of [play,board('P15')[0],board('P17')[0]])assert.ok(sources.includes(prologueArt(moment)![portrait?'portrait':'landscape']));
 }
});
test('record illustration appears exactly while reading the incomplete torch lead',()=>{
 const cuts=RPG_CONNECTION_SCENES[3].after;
 for(const cut of cuts){const id=Number(/^ST3_POST_(\d+)/.exec(cut.id)?.[1]);assert.equal(cut.art!.landscape.includes('st3-record'),id===11||id===12);}
 for(const portrait of [false,true])assert.ok(prologueSceneSources(cuts,portrait).includes(`/prologue/st3-record-${portrait?'portrait':'wide'}-v1.png`));
});
test('Mor cannot hold the missing letter before the actual return, including failed and recovered states',()=>{
 for(const step of [undefined,'alley','recovered','failed'])assert.equal(morQuestPainting(step?{step}:undefined),'mor-request');
 assert.equal(morQuestPainting({step:'complete'}),'mor-letter');
 const replay=QuestReplay({id:'quest-mor',close:()=>{}})!;assert.deepEqual(replay.props.paintings,['mor-request']);
 assert.equal(questArt('mor-letter').landscape,'/quests/mor-letter-wide-v1.png','original returned-letter painting preserved');
 const source=readFileSync('app/components/RpgJourneyScene.tsx','utf8');assert.ok(source.includes('paintings={[morQuestPainting(j.letterQuest)]}'));
});
test('all twelve supplemental assets have valid responsive dimensions and all ST2 dialogue poses use corrected suits',()=>{
 const record=JSON.parse(readFileSync('docs/art-generation-scene-supplements-2026-11-05.json','utf8'));
 assert.equal(record.records.length,12);
 for(const {asset} of record.records){const png=readFileSync(asset);assert.equal(png.toString('ascii',1,4),'PNG');const w=png.readUInt32BE(16),h=png.readUInt32BE(20);assert.equal(h>w,asset.includes('portrait'));assert.ok(Math.max(w,h)>=1536);}
 for(const phase of ['before','after'] as const)for(const cut of RPG_CONNECTION_SCENES[2][phase])for(const src of Object.values(prologueArt(cut)!))assert.ok(src.includes('night-symbols-v5'));
});
