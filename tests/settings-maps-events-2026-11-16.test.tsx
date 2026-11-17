import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync,readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import StoryPuzzle from '../app/components/StoryPuzzle';
import {REGION_TALL_MAP,regionTallMap,tallMapY,JOURNEY_NODES} from '../lib/rpg-journey';
import {INN_TOURNAMENTS} from '../lib/inn-tournament';

test('ST4~10 portrait maps use the taller paintings and every place stays below the title band',()=>{
 for(const region of [2,3,4])assert.ok(existsSync('public'+regionTallMap(region)),`region ${region}`);
 assert.equal(REGION_TALL_MAP.height,REGION_TALL_MAP.top+1600);
 assert.equal(tallMapY(0),12.1);assert.equal(tallMapY(100),100);
 for(const node of JOURNEY_NODES.filter(n=>n.region>1)){const y=tallMapY(node.portrait?.y??node.y);assert.ok(y>=20&&y<=90,`${node.id} ${y}`);}
 assert.match(readFileSync('app/rpg-journey.css','utf8'),/calc\(100cqh \* 1024 \/ 1820\)/);
});

test('scene events are played on the paintings: strips, knots, objects and discs sit on the picture',()=>{
 const html=(id:'quest-4'|'quest-5'|'quest-8'|'quest-9')=>renderToStaticMarkup(<StoryPuzzle id={id} inline done={()=>{}}/>);
 const record=html('quest-4');assert.match(record,/st4-record-scene-portrait-v1\.webp/);assert.equal((record.match(/story-record-slot/g)||[]).length,3);assert.equal((record.match(/data-piece="[123]"/g)||[]).length,3);
 const knots=html('quest-5');assert.match(knots,/st5-knots-scene-portrait-v1\.webp/);assert.equal((knots.match(/src="\/story-events\/st5-knot-loose-v1\.webp"/g)||[]).length,3,'one knot per post');assert.equal((knots.match(/width:38%;height:25.33%;--hold:900ms;--knot-face:43\.6\d*%/g)||[]).length,3,'knot cut to the post face');assert.equal((knots.match(/class="story-knot-band"/g)||[]).length,3,'pale post band shaded');assert.match(knots,/id="story-knot-tint"/);assert.match(knots,/0\/3 매듭/);
 const traces=html('quest-8');assert.equal((traces.match(/story-trace-spot/g)||[]).length,3);assert.match(traces,/편지함 살펴보기/);
 const altar=html('quest-9');assert.match(altar,/st9-altar-lit-portrait-v1\.webp/);assert.match(altar,/st9-disc-crown-v1\.webp/);assert.match(altar,/rotate:180deg/,'the crown starts upside down');
 for(const id of ['quest-4','quest-5','quest-8','quest-9'] as const)assert.match(html(id),/is-scene/);
 for(const f of ['st4-record-scene-wide-v1','st5-knot-tight-v1','st8-trace-letters-v1','st8-trace-stars-v1','st8-trace-box-v1','st9-disc-gate-v1','st9-altar-lit-wide-v1'])assert.ok(existsSync(`public/story-events/${f}.webp`),f);
});

test('settings window, pet portraits and the classic result use the new art',()=>{
 const settings=readFileSync('app/components/GameSettings.tsx','utf8');assert.match(settings,/settings-header-v1\.webp/);
 for(const icon of ['music','sound','screen','vibration','pace']){assert.ok(existsSync(`public/ui/settings-icon-${icon}-v1.webp`),icon);assert.match(settings,new RegExp(`name="${icon}"`));}
 for(const c of [...INN_TOURNAMENTS[2],...INN_TOURNAMENTS[3]])assert.doesNotMatch(c.avatar,/crop/,'pet portraits are the proper Codex profiles');
 const page=readFileSync('app/page.tsx','utf8');assert.match(page,/"daily-result":"dressed-result"/);assert.match(readFileSync('app/globals.css','utf8'),/\.modal\.result:is\(\.daily-result,\.dressed-result\)/);
});
