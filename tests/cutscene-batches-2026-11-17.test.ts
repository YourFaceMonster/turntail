import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync} from 'node:fs';
import {createRpgJourneyGame} from '../lib/rpg-game.ts';
import {journeyScenes} from '../lib/rpg-chapter-scenes.ts';
import {TALK_CAST,talkArt,stageArtToPreload} from '../lib/rpg-chapters.ts';

const run=()=>createRpgJourneyGame('검증').rpgRun!;
const onDisk=(path:string)=>existsSync(new URL('../public'+path,import.meta.url));

test('Codex batches 2·3: shuffle in the middle of the opening, result on the first line after the match',()=>{
 for(let stage=4;stage<=10;stage++){
  const {before,after}=journeyScenes(stage,run(),'never');
  assert.match(before[0].art!.portrait,/-before-|st10-before/,`ST${stage} opens on the place painting`);
  assert.match(before.at(-1)!.art!.portrait,new RegExp(`st${stage}-duel`),`ST${stage} still ends on the duel close-up`);
  assert.equal(before.filter(cut=>cut.art!.portrait.includes(`st${stage}-shuffle-portrait-v1.webp`)).length,1,`ST${stage} shuffle once`);
  assert.match(after[0].art!.portrait,new RegExp(`st${stage}-result-portrait-v1\\.webp`),`ST${stage} result first`);
  assert.match(after[0].art!.landscape,new RegExp(`st${stage}-result-wide-v1\\.webp`));
 }
});

test('ST6/ST9 keepsake reveal order is unchanged',()=>{
 for(const [stage,card] of [[6,'sacred-flame-two'],[9,'secret-key-two']] as const){
  const faces=journeyScenes(stage,run(),'never').after.filter(cut=>cut.keepsakeCard===card).map(cut=>cut.keepsakeFace);
  assert.deepEqual(faces,['front','back']);
 }
});

test('Codex batch 4: spoken lines show the speaker alone with the chosen mood (calm fallback)',()=>{
 const scenes=journeyScenes(5,run(),'never');
 const tarae=scenes.before.find(cut=>cut.speaker==='타래')!;assert.match(tarae.art!.portrait,/talk-tarae-serious-portrait-v1\.webp/);
 const ruen=journeyScenes(7,run(),'never').after.find(cut=>cut.line.startsWith('그 답을 안다면'))!;assert.match(ruen.art!.portrait,/talk-ruen-smile-portrait-v1\.webp/);
 assert.equal(talkArt('엘라','serious'),'talk-ella-calm','no serious painting for Ella → calm');
 assert.equal(talkArt('방랑자'),undefined,'the wanderer keeps the scene painting');
 const wanderer=journeyScenes(4,run(),'never').after.find(cut=>cut.speaker==='방랑자')!;assert.match(wanderer.art!.portrait,/st4-after/);
});

test('every new painting the scenes and preloads point to exists as WebP (and PNG original)',()=>{
 const paths=new Set<string>();
 for(let stage=4;stage<=10;stage++){
  const {before,after}=journeyScenes(stage,run(),'never');
  for(const cut of [...before,...after])if(cut.art){paths.add(cut.art.portrait);paths.add(cut.art.landscape);}
  for(const wide of [false,true])for(const path of stageArtToPreload(stage,wide))paths.add(path);
 }
 for(const cast of Object.values(TALK_CAST))for(const mood of cast.moods)for(const form of ['portrait','wide'])paths.add(`/story/talk-${cast.key}-${mood}-${form}-v1.webp`);
 for(const path of paths){assert.ok(onDisk(path),path);if(/(shuffle|result|talk-)/.test(path))assert.ok(onDisk(path.replace(/\.webp$/,'.png')),path+' png');}
 assert.equal([...paths].filter(path=>path.includes('/talk-')).length,74,'37 moods × portrait/wide');
});
