import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {DICE_DEN_DIALOGUE} from '../lib/rpg-dice-den.ts';

// 2026-11-20 English version: screen text is wrapped in tr('…'). Unwrap it so these source checks still read the Korean text.
const unwrapTr=(src:string)=>src.replace(/\{tr\('((?:[^'\\]|\\.)*)'\)\}/g,'$1').replace(/tr\('((?:[^'\\]|\\.)*)'\)/g,"'$1'");
const read=(file:string)=>unwrapTr(readFileSync(file,'utf8'));

test('duel: the lead lock line is said once (on the button), and my recent plays read "나"',()=>{
 const page=read('app/page.tsx');
 assert.ok(!page.includes('선 · 제출만 가능'));
 assert.ok(page.includes("'선 차례 · 패를 내요'")||page.includes('"선은 제출만 가능"'));
 assert.ok(page.includes("names={game.players.map((p,i)=>i===game.me?'나':p.name)}"));
});

test('setup windows share the decorated frame and take the nickname from the profile',()=>{
 const page=read('app/page.tsx');
 assert.ok(page.includes('<section className="modal setup-modal menu-surface menu-theme-classic"'));
 assert.ok(!page.includes('onChange={e=>setName(e.target.value)} placeholder="나"'));
 assert.equal((page.match(/className="setup-nickname"/g)||[]).length,2);
});

test('hidden duel under the journey map is inert; Esc closes the plain menu windows',()=>{
 const page=read('app/page.tsx');
 assert.match(page,/className="game-layout"[^>]*inert=\{journeyOpen/);
 assert.match(page,/key!=='Escape'[^\n]*\.profile-modal,\.highscore-modal,\.setup-modal/);
 assert.ok(page.includes("import './qa-sweep-2026-11-17.css';"));
});

test('journey dock names every item in Korean',()=>{
 const scene=read('app/components/RpgJourneyScene.tsx');
 assert.ok(scene.includes('<span>지도</span>')&&!scene.includes('<span>MAP</span>'));
 assert.ok(scene.includes('<span className="journey-dock-label">가방</span>'));
 assert.ok(scene.includes('data-label="장착 유물"'));
});

test('yacht dice: labelled box count, two-tap exit in practice, correct particles',()=>{
 const yacht=read('app/components/YachtDiceTable.tsx');
 assert.ok(yacht.includes('<small aria-hidden="true">남은 칸</small>'));
 assert.ok(yacht.includes("'정말 나가기?'"));
 assert.equal(DICE_DEN_DIALOGUE.forfeit[0],'그만두겠다고? 판돈 HP 10은 내 거야.');
 assert.ok(read('lib/rpg-journey.ts').includes("josa(String(DICE_DEN_STAKE),'을/를')"));
});

test('QA stylesheet keeps the key fixes',()=>{
 const css=read('app/qa-sweep-2026-11-17.css');
 for(const rule of ['.rpg-preview-tools{inset:50% auto auto 0','.yacht-cat.is-best::after{top:-9px','.hand-tile.playable::after','qa-lead-banner','.hand-heading>.hand-tools>.text-btn{min-width:44px','.title-screen .title-tools{','.unified-settings h2','.prologue-skip{','.tavern-fire{left:14.5%'])
  assert.ok(css.includes(rule),rule);
});
