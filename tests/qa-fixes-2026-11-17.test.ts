import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createRpgJourneyGame} from '../lib/rpg-game.ts';
import {settleReworkRound,RPG_STAGE_HP} from '../lib/rpg-rework.ts';
import {FIRST_PROLOGUE} from '../lib/rpg-prologue.ts';
import {RPG_CONNECTION_SCENES} from '../lib/rpg-connection-scenes.ts';
import {journeyScenes} from '../lib/rpg-chapter-scenes.ts';

const src=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
/** The player ends the round holding 10 tiles, both opponents fewer: the player pays 10 to each. */
function fall(run:ReturnType<typeof createRpgJourneyGame>['rpgRun'] & {},id:string){
 run.hp=[15,25,30];
 return settleReworkRound(run,{id,round:1,at:0,players:[
  {id:'me',name:'나',count:10,place:3,delta:-20,total:0,winner:false},
  {id:'a',name:'로웬',count:0,place:1,delta:10,total:0,winner:true},
  {id:'b',name:'루미',count:4,place:2,delta:10,total:0,winner:false},
 ]});
}

test('QA 4: a fall spends one fate and retries the same stage at once; no fate left ends the journey',()=>{
 const game=createRpgJourneyGame('검증'),run=game.rpgRun!;
 assert.equal(run.fate,3,'new journeys start with three fates');assert.equal(run.journey!.reworkFate,true);
 run.status='playing';
 const once=fall(run,'r1');
 assert.equal(once.status,'playing');assert.equal(once.fate,2);
 assert.deepEqual(once.hp,[100,...RPG_STAGE_HP[0]],'player back to the start HP, opponents back to the stage HP');
 assert.equal(once.rework!.retried!.stage,1);assert.equal(once.rework!.retried!.hp[0],0,'the result screen still shows the fall');
 let last=once;for(const id of ['r2','r3'])last=fall(last,id);
 assert.equal(last.fate,0);assert.equal(last.status,'playing');
 const end=fall(last,'r4');assert.equal(end.status,'game-over');assert.equal(end.rework!.retried,undefined);
});

test('QA 4: the result screen offers the retry, the map shows the fate gems, the save slot shows /10',()=>{
 const result=src('app/components/RpgReworkResult.tsx');
 assert.match(result,/tr\('다시 도전'\)/);assert.match(result,/운명력 1개 사용/);
 assert.match(src('app/components/RpgJourneyScene.tsx'),/hidden=\{!!run\.rework&&!run\.journey\} className="journey-fate-gems"/);
 assert.match(src('lib/save-slots.ts'),/phaseOne&&!g\.rpgRun!\.rework\?3:10/);
});

test('QA 1: story lines — 2 is never called the weakest, the prologue speaker has a name, Rumi is introduced',()=>{
 assert.ok(!FIRST_PROLOGUE.some(cut=>cut.speaker==='상대'));
 assert.equal(FIRST_PROLOGUE.filter(cut=>cut.speaker==='주점의 사내').length,6,'P05, P06 ×2 pages, P09, P12 ×2 pages');
 assert.ok(FIRST_PROLOGUE.some(cut=>cut.line.includes('왜 2가 가장 센지')));
 const run=createRpgJourneyGame('검증').rpgRun!;
 for(let stage=1;stage<=10;stage++){const s=journeyScenes(stage,run,'always');for(const cut of [...s.before,...s.after])assert.ok(!/가장 약한 숫자/.test(cut.line),cut.line);}
 const rumi=RPG_CONNECTION_SCENES[1].before.find(cut=>cut.speaker==='루미');assert.ok(rumi);assert.match(rumi!.line,/셋이서/);
 assert.equal(RPG_CONNECTION_SCENES[1].before.at(-1)!.id,'ST1_PRE_4','the match still starts on Rowen\'s last line');
});

test('QA 2: story cutscenes run full screen (no journey HUD/dock) and story opponents carry no AI tag',()=>{
 assert.ok(!src('app/components/RpgJourneyScene.tsx').includes('chrome={<JourneyStoryChrome'));
 assert.ok(!src('app/components/RpgReworkResult.tsx').includes('JourneyStoryChrome'));
 assert.match(src('app/page.tsx'),/<OpponentName name=\{p\.name\} bot=\{p\.bot&&!game\.rpgRun\?\.journey\}/);
});

test('QA 3: main-menu windows share one frame, close button and title style',()=>{
 const css=src('app/menu-windows-2026-11-17.css');
 for(const name of ['highscore-modal','achievements-modal','rpg-codex','profile-modal'])assert.ok(css.includes(name),name);
 assert.match(css,/border-radius:50%!important/);
 assert.match(src('app/page.tsx'),/import '\.\/menu-windows-2026-11-17\.css';/);
});

test('story draft 2026-11-17: fog behind the gate, twins as shadows, fewer theme repeats, half the answer in the normal ending',async()=>{
 const scenes=journeyScenes,conn=RPG_CONNECTION_SCENES;
 const ctx=createRpgJourneyGame('대사안','',0).rpgRun!;ctx.journey!.story={runNumber:1,quests:{}};
 const text=(cuts:readonly {line:string;speaker?:string}[])=>cuts.map(c=>c.line).join(' ');
 assert.match(text(conn[3].after),/누굴 닮았는지/);
 assert.match(text(scenes(6,ctx).after),/흰 안개/);
 assert.match(text(scenes(7,ctx).after),/평범한 승부사/);
 assert.match(text(scenes(9,ctx).after),/이름을 삼키는 안개/);
 const ending=scenes(10,ctx).after;
 assert.match(text(ending),/철문의 쌍둥이도 마찬가지다/);
 assert.match(text(ending),/2를 가장 높이 둔다/);
 assert.match(text(ending),/다시 길을 떠난다면/);
 assert.ok(ending.some(c=>c.speaker==='형 왕')&&ending.some(c=>c.speaker==='아우 왕'));
 const theme=[5,6,7,8,9].flatMap(n=>[...scenes(n,ctx).before,...scenes(n,ctx).after]).filter(c=>/먼저 간 자와/.test(c.line));
 assert.equal(theme.length,0);
});
