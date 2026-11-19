import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {RPG_STAGE_HP,rpgMaxHp,rpgEnemyMaxHp} from '../lib/rpg-rework.ts';
import type {RpgRun} from '../lib/rpg.ts';

const read=(file:string)=>readFileSync(file,'utf8');

test('opponents heal only up to the HP they started the stage with',()=>{
 for(let stage=1;stage<=10;stage++){
  const run={stage,trials:[],equipped:[]} as unknown as RpgRun;
  assert.equal(rpgMaxHp(run,1),RPG_STAGE_HP[stage-1][0],`ST${stage} seat 1`);
  assert.equal(rpgMaxHp(run,2),RPG_STAGE_HP[stage-1][1],`ST${stage} seat 2`);
 }
 const fierce={stage:1,trials:['fierce-foes'],equipped:[]} as unknown as RpgRun;
 assert.deepEqual([rpgEnemyMaxHp(fierce,1),rpgEnemyMaxHp(fierce,2)],[30,36],'challenge rule raises the cap with the start HP');
 assert.equal(rpgMaxHp({stage:1,trials:[],equipped:[]} as unknown as RpgRun,0),100,'the player keeps 100');
});

test('home screen does not preload the table art; map shows 방랑자 for a nameless player; no focus ring after scenes',()=>{
 const entrance=read('app/components/GameEntrance.tsx');
 assert.ok(entrance.includes('if(!screen.width||!warm)return;'));
 assert.ok(read('app/page.tsx').includes('<GameEntrance warm={!!game||setupOpen!==null}'));
 assert.ok(read('app/components/RpgJourneyScene.tsx').includes("<b>{playerName&&playerName!=='나'?playerName:'방랑자'}</b>"));
 for(const f of ['QuestCutscene','RpgJourneyScene','RpgPrologue','HpBattleReview','DialogueTools'])
  assert.ok(read(`app/components/${f}.tsx`).includes('focusVisible:false'),f);
});

test('story paintings: only the opening ones block, failures and rotation never freeze the scene',()=>{
 const prologue=read('app/components/RpgPrologue.tsx');
 assert.ok(prologue.includes('export function loadStoryImage(src:string):Promise<boolean>'));
 assert.ok(prologue.includes('list.slice(0,2).map(loadStoryImage)')&&prologue.includes('warm(list.slice(2))'));
 assert.ok(prologue.includes("orientation.addEventListener('change',reorient)"));
 assert.ok(prologue.includes('void loadStoryImage(matchMedia'),'a failed painting still commits the next cut');
});

test('dialogue splits: ST4 crossing in two cuts, ST3 epilogue only between sentences, shorter Moro intro',async()=>{
 const {DEMO_ENDING}=await import('../lib/rpg-demo-ending.ts');
 for(const cut of DEMO_ENDING)assert.match(cut.line,/[.!?…]$/,cut.id);
 assert.ok(read('lib/rpg-chapter-scenes.ts').includes("N('안개를 지나자 지친 숨이 가라앉고 상처가 아물었다.')"));
 assert.ok(read('lib/rpg-inns.ts').includes('번 안에 모두 찾으시면 유물을 하나 드리지요. 처음 한 번만입니다.'));
});

test('network failures read as Korean; game messages pass through; suit is 비밀의 열쇠 everywhere on screen',async()=>{
 const {userMessage,NETWORK_ERROR_MESSAGE}=await import('../lib/user-message.ts');
 assert.equal(userMessage(new TypeError('Failed to fetch'),'x'),NETWORK_ERROR_MESSAGE);
 assert.equal(userMessage(new Error('Load failed'),'x'),NETWORK_ERROR_MESSAGE);
 assert.equal(userMessage(new Error('HP가 가득 찼어요.'),'x'),'HP가 가득 찼어요.');
 assert.equal(userMessage(new Error('Unexpected token'),'불러오지 못했어요.'),'불러오지 못했어요.');
 assert.ok(!/instanceof Error\?\w+\.message:/.test(read('app/components/HighScores.tsx')+read('app/components/DailyBoard.tsx')));
 assert.ok(read('app/page.tsx').includes('<i className="legend-star">비밀의 열쇠</i>'));
});