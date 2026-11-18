import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync,readFileSync} from 'node:fs';

const read=(file:string)=>readFileSync(file,'utf8');

test('cutscene art loader is keyed on cut ids, not the array the parent rebuilds each render',()=>{
 const prologue=read('app/components/RpgPrologue.tsx');
 assert.ok(prologue.includes("const cutsKey=cuts.map(c=>c.id).join('|');"));
 assert.ok(prologue.includes('},[cutsKey]);')&&!prologue.includes('},[cuts]);'));
});

test('site has a real tab icon, share image and current description',()=>{
 const layout=read('app/layout.tsx');
 assert.ok(!layout.includes('공중섬'));
 for(const file of ['favicon.ico','icon-512.png','apple-touch-icon.png','og-turntale-v1.jpg'])assert.ok(existsSync(`public/${file}`),file);
 assert.match(layout,/openGraph:\{[^\n]*og-turntale-v1\.jpg/);
 assert.match(layout,/icons:\{icon:\[\{url:"\/favicon\.ico"/);
});

test('yacht dice tables play the minigame track',()=>{
 const page=read('app/page.tsx');
 assert.ok(page.includes("const musicScene=(minigameMusic&&game?.rpgRun?.journey)||yachtOpen||yachtOnline||game?.rpgRun?.journey?.location==='dice-den'?'minigame':"));
 assert.ok(!page.includes("'story-quest','dice-den','inn'"));
});

test('unused old BGM files are out of public',()=>{
 for(const name of ['menu-0513','menu-0515','night-table','reflection-0513','reflection-0515','table-0513','table-0515','victory-0513','victory-0515'])
  assert.ok(!existsSync(`public/audio/${name}.mp3`),name);
});

test('stage-end settlement says 쓰러짐, edge map labels and modal scrollbars are styled',()=>{
 assert.ok(read('app/components/RpgReworkResult.tsx').includes("retried||failed||complete||run.status==='allocation'?'쓰러짐'"));
 assert.ok(read('app/components/RpgJourneyScene.tsx').includes("data-edge={(node.portrait?.x??node.x)<=20?'left'"));
 const css=read('app/qa-sweep-2026-11-17.css');
 assert.ok(css.includes('.rpg-map-node[data-edge="left"]>strong'));
 assert.ok(css.includes('scrollbar-color:#a8844a #17120e'));
});

test('new Suno tracks: true ending, stage-clear fanfare and three region maps',()=>{
 for(const f of ['true-ending-suno-0736','fanfare-suno-0736','map-2-suno-0736','map-3-suno-0736','map-4-suno-0736']){
  const bytes=readFileSync(`public/audio/${f}.mp3`);
  assert.notEqual(bytes.toString('latin1',0,3),'ID3',`${f} still carries an ID3 tag`);
  assert.equal(bytes[0],0xff,f);
 }
 assert.ok(read('app/components/RpgReworkResult.tsx').includes("?'/audio/true-ending-suno-0736.mp3':'/audio/ending-suno-0726.mp3'"));
 assert.ok(read('lib/sound-assets.ts').includes("fanfare:{src:'/audio/fanfare-suno-0736.mp3'"));
 const page=read('app/page.tsx');
 assert.ok(page.includes("journeyRegion(game.rpgRun)===2?'map-2':journeyRegion(game.rpgRun)===3?'map-3':journeyRegion(game.rpgRun)===4?'map-4':'map'"));
 for(const scene of ['map-2','map-3','map-4'])assert.ok(page.includes(`musicScene==='${scene}'?'/audio/${scene}-suno-0736.mp3'`),scene);
 assert.ok(page.includes("run.status!=='allocation'||run.stage>=10")&&page.includes('performance.now()<fanfareUntil.current'));
});