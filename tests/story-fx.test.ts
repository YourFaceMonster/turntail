import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {STORY_FX,storyFxMotion,storyFxSound} from '../lib/story-fx';
import {FIRST_PROLOGUE} from '../lib/rpg-prologue';

test('each story effect has a table sound or a painting motion; flash is an overlay only',()=>{
 assert.equal(storyFxSound('tile'),'play');assert.equal(storyFxSound('slam'),'slam');assert.equal(storyFxSound('shake'),null);assert.equal(storyFxSound(undefined),null);
 for(const fx of STORY_FX)if(fx!=='flash')assert.ok(storyFxMotion(fx)!.frames.length>=3,fx);
 assert.equal(storyFxMotion('flash'),null);
});

test('cutscene beats carry effects: duel close-ups knock a tile, bosses slam, the prologue wager lays its tile',()=>{
 const scenes=readFileSync('lib/rpg-chapter-scenes.ts','utf8');
 assert.match(scenes,/fx:beat\.fx\|\|'tile'/,'the duel close-up line knocks a tile by default');
 for(const line of ['테이블에 앉아라. 예법대로 겨룬다.','패를 내라. 불씨는','답은 패로 해라.'])assert.match(scenes,new RegExp(`${line}[^\\n]*?\\{fx:'slam'\\}`),line);
 assert.match(scenes,/바람이 다리를 흔들었다[^\n]*?fx:'shake'/);
 const laid=FIRST_PROLOGUE.find(cut=>cut.line==='사내는 낡은 패 한 장을 테이블에 올려놓았다.');assert.equal(laid?.fx,'tile');
 const ui=readFileSync('app/components/RpgPrologue.tsx','utf8');
 assert.match(ui,/querySelector<HTMLElement>\('\.story-painting-stack'\)/,'only the painting moves, never the caption');
 assert.match(ui,/prefers-reduced-motion: reduce/);
});

test('cutscene tiles repainted (2026-11-16): the scenes use the new versions and the files exist',async()=>{
 const {existsSync}=await import('node:fs');
 const {chapterArt}=await import('../lib/rpg-chapters');
 const want:Record<string,[number,number]>={'st4-before':[2,2],'st5-before':[2,2],'st6-before':[3,2],'st7-before':[2,2],'st8-before':[2,2],'st9-before':[2,2],'st9-after':[4,2],'st10-after':[2,2]};
 for(let s=4;s<=10;s++)want[`st${s}-duel`]=[2,2];
 for(const [key,[p,w]] of Object.entries(want)){const art=chapterArt(key);assert.equal(art.portrait,`/story/${key}-portrait-v${p}.webp`);assert.equal(art.landscape,`/story/${key}-wide-v${w}.webp`);for(const src of [art.portrait,art.landscape])assert.ok(existsSync('public'+src),src);}
 const wager=FIRST_PROLOGUE.find(cut=>cut.art?.portrait.includes('wager-playing'))!;assert.equal(wager.art!.portrait,'/prologue/wager-playing-portrait-v2.webp');assert.equal(wager.art!.landscape,'/prologue/wager-playing-wide-v2.webp');
});

test('ST1~3 story scenes carry the same effects: the challenge slams, the gate shakes, the iron gate two flashes',async()=>{
 const {RPG_CONNECTION_SCENES:S}=await import('../lib/rpg-connection-scenes');
 const fx=(stage:number,id:string)=>[...S[stage].before,...S[stage].after].find(cut=>cut.id===id)?.fx;
 assert.equal(fx(1,'ST1_PRE_3'),'slam');assert.equal(fx(1,'ST1_POST_3'),'shake');assert.equal(fx(3,'ST3_PRE_5'),'slam');
 const keepsake=S[3].after.find(cut=>cut.id==='ST3_POST_7')!;assert.equal(keepsake.keepsakeFace,'front');assert.equal(keepsake.fx,'flash');
});
