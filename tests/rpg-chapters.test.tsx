import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRpgJourneyGame,enterJourneyNode} from '../lib/rpg-game';
import {settle,type Game,type Tile} from '../lib/game';
import {rpgMaxHp,RPG_STAGE_HP} from '../lib/rpg-rework';
import {chooseRpgStageReward} from '../lib/rpg-phase-one';
import {answerStoryQuest,journeyNodeState,returnJourneyMap,setJourneyRunNumber,validateJourneySave,JOURNEY_NODES} from '../lib/rpg-journey';
import {journeyRegion,STORY_QUESTS,CHAPTER_ART_SLOTS,RPG_GUARDIAN_ART,RPG_GUARDIANS,chapterArt} from '../lib/rpg-chapters';
import {STORY_CARD_ART} from '../lib/rpg-story-card-art';
import {relicImage} from '../lib/item-battle-relics';
import {journeyScenes} from '../lib/rpg-chapter-scenes';
import {saveRpgGame,readRpgArchive,nextJourneyRunNumber} from '../lib/rpg-storage';
import {pendingStageStory} from '../lib/rpg-story-cards';
import {RpgPreviewSession,RPG_PREVIEW_SCREENS} from '../lib/rpg-preview';
import {JourneyMapView} from '../app/components/RpgJourneyScene';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const memory=()=>{const data=new Map<string,string>();return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};};
function finish(game:Game,counts:number[]){
 game.players.forEach((p,i)=>p.hand=Array.from({length:counts[i]},(_,j)=>tile(j%15+1,i)));
 game.phase='ended';game.winner=counts.indexOf(0);game.result=null;return settle(game);
}
const lines=(cuts:readonly {line:string}[])=>cuts.map(cut=>cut.line).join('\n');
/** Clears every stage with the player first and one AI falling to 0 (the current any-zero rule). */
function playJourney(runNumber=1,choices:Record<string,'read'|'skip'>={}){
 const game=createRpgJourneyGame('검증','',0);setJourneyRunNumber(game.rpgRun!,runNumber);enterJourneyNode(game,'battle-1',0);
 const seen:{stage:number,opponents:string[],hp:number,region:number}[]=[];
 for(let stage=1;stage<=10;stage++){
  if(stage>1){
   assert.equal(journeyRegion(game.rpgRun!),stage<=3?1:stage<=6?2:stage<=9?3:4);
   const quest=STORY_QUESTS.find(q=>q.stage===stage);
   if(quest&&choices[quest.id]){assert.equal(journeyNodeState(game.rpgRun!,quest.id),'available');enterJourneyNode(game,quest.id);assert.equal(game.rpgRun!.journey!.location,'story-quest');game.rpgRun=answerStoryQuest(game.rpgRun!,quest.id,choices[quest.id]);assert.throws(()=>answerStoryQuest(game.rpgRun!,quest.id,'read'));returnJourneyMap(game);assert.equal(journeyNodeState(game.rpgRun!,quest.id),'completed');}
   assert.equal(journeyNodeState(game.rpgRun!,`battle-${stage}` as never),'available');
   enterJourneyNode(game,`battle-${stage}` as never,stage*1000);
  }
  const run=game.rpgRun!;assert.equal(run.stage,stage);assert.deepEqual(run.hp.slice(1),RPG_STAGE_HP[stage-1]);
  seen.push({stage,opponents:game.players.slice(1).map(p=>p.name),hp:run.hp[0],region:journeyRegion(run)});
  run.hp=[run.hp[0],1,40];finish(game,[0,6,3]);
  assert.equal(game.rpgRun!.status,stage===10?'complete':'allocation',`ST${stage} clears as soon as one AI reaches 0`);
  if(stage===10){assert.ok(pendingStageStory(game.rpgRun!),'the ending plays on the final result');break;}
  const offers=game.rpgRun!.phaseOne!.clear!.relicOffers||[];
  game.rpgRun=chooseRpgStageReward(game.rpgRun!,'relic',undefined,false,offers[0]);
  assert.equal(game.rpgRun.status,'ready');
 }
 return {game,seen};
}

test('the journey runs ST1→ST10 with region maps, chapter HP resets, stage casts and story cards',()=>{
 const {game,seen}=playJourney();
 assert.deepEqual(seen.map(s=>s.opponents),[['로웬','루미'],['포코','밀라'],['첫째','둘째'],['수리','네아'],['타래','하온'],['카르덴','세라'],['루엔','시온'],['엘라','아스텔'],['재온','오닉'],['첫 번째 수호자','두 번째 수호자']]);
 // Chapter start resets to 100; an inherited heart relic may add its first-equip bonus (+10/+20).
 for(const stage of [4,7,10])assert.ok([100,110,120].includes(seen[stage-1].hp),`chapter start ST${stage} restores HP (got ${seen[stage-1].hp})`);
 assert.deepEqual(seen.map(s=>s.region),[1,1,1,2,2,2,3,3,3,4]);
 assert.deepEqual(game.rpgRun!.storyCards,['crown-two','iron-gate-two','sacred-flame-two','secret-key-two']);
 assert.equal(game.rpgRun!.stage,10);
 const storage=memory();saveRpgGame(storage,game);const archive=readRpgArchive(storage);
 assert.equal(archive.active,null);assert.deepEqual(archive.storyProgress,{normalEnding:true});assert.equal(nextJourneyRunNumber(archive),2);
 assert.ok(archive.lastCompleted);
});
test('second journey reaches the true ending and records it',()=>{
 const {game}=playJourney(2);const storage=memory();saveRpgGame(storage,game);
 assert.deepEqual(readRpgArchive(storage).storyProgress,{normalEnding:true,trueEnding:true});
});
test('optional quests record a choice only, close when skipped, and change scene lines',()=>{
 const {game}=playJourney(1,{'quest-4':'read','quest-5':'read','quest-6':'skip','quest-8':'read'});
 const run=game.rpgRun!,story=run.journey!.story!;
 assert.deepEqual(story.quests,{'quest-4':'read','quest-5':'read','quest-6':'skip','quest-8':'read'});
 assert.equal(run.hp.length,3);
 assert.match(lines(journeyScenes(4,run).after),/둘이… 한 문을/);
 assert.doesNotMatch(lines(journeyScenes(6,run).after),/장부의 그 문장/);
 const ending=lines(journeyScenes(10,run).after);
 assert.match(ending,/다리의 매듭이 떠올랐다/);assert.match(ending,/편지의 여행자도/);assert.match(ending,/마음에 들면 가져가시오\./);assert.doesNotMatch(ending,/두 왕이 있었어/);
 assert.equal(journeyNodeState(run,'quest-9'),'closed','skipped quests never block the ending');
 // A visited quest's NPC follows up instead of repeating the quest's opening line before the battle.
 const before=(stage:number)=>lines(journeyScenes(stage,run).before);
 assert.doesNotMatch(before(4),/물길에서 건진 낡은 기록이 있어/);assert.match(before(4),/아까 그 기록 말이야/);
 assert.doesNotMatch(before(5),/날마다 고치는데도/);assert.match(before(5),/같이 엮은 매듭/);
 assert.doesNotMatch(before(6),/이름 필드: 손상/);assert.match(before(6),/재방문/);
 assert.doesNotMatch(before(8),/사람의 이름은 잊혀도/);assert.match(before(8),/그 편지를 읽었구나/);
 const fresh=createRpgJourneyGame('검증','',0).rpgRun!;
 assert.match(lines(journeyScenes(4,fresh).before),/물길에서 건진 낡은 기록이 있어/);assert.match(lines(journeyScenes(9,fresh).before),/첫 번째가 문을 닫았다는/);
 // ST7 no longer contradicts its narration; the ending hand-off speaks like the prologue.
 assert.match(lines(journeyScenes(7,fresh).before),/자리만 남아 있거든\. 이름도 없이\./);
 assert.match(ending,/오래된 물건이오\./);assert.doesNotMatch(ending,/첫 번째 방랑자/);
});
test('second-journey variants, ST7 second place and the true ending script',()=>{
 const game=createRpgJourneyGame('검증','',0),run=game.rpgRun!;setJourneyRunNumber(run,2);
 assert.match(lines(journeyScenes(1,run).after),/전에 본 적이 있는 것 같은데/);
 assert.match(lines(journeyScenes(3,run).after),/이번에는… 그 패를 건네받은 사람이 다른가/);
 assert.match(lines(journeyScenes(10,run).after),/아주 오래전에, 두 왕이 있었어\./);
 const first=createRpgJourneyGame('검증','',0).rpgRun!;
 assert.doesNotMatch(lines(journeyScenes(1,first).after),/전에 본 적이/);
 for(let stage=1;stage<=10;stage++){const s=journeyScenes(stage,first);assert.ok(s.before.length>0&&s.after.length>0,`ST${stage} has both scenes`);assert.ok(s.after.every(cut=>cut.art||stage<=3));}
 // ST7: a round finished in second place unlocks one line.
 const seven=createRpgJourneyGame('검증','',0);enterJourneyNode(seven,'battle-1',0);seven.rpgRun!.stage=7;seven.rpgRun!.hp=[80,60,60];finish(seven,[3,0,6]);
 assert.equal(seven.rpgRun!.journey!.story!.secondPlaceSeen,true);assert.equal(seven.rpgRun!.status,'playing');
 assert.match(lines(journeyScenes(7,seven.rpgRun!).after),/두 번째 자리에 앉아 봤군/);
});
test('every TEST screen shortcut opens, including ST4~10, quests, region maps and both endings',()=>{
 const game=createRpgJourneyGame('preview'),preview=new RpgPreviewSession(game,'screens');
 assert.ok(RPG_PREVIEW_SCREENS.length>=35);
 for(const {id} of RPG_PREVIEW_SCREENS){
  const screen=preview.screen(game,id),run=screen.rpgRun!,j=run.journey!;
  if(id.startsWith('battle-')){assert.equal(run.stage,Number(id.slice(7)));assert.equal(j.location,'battle');assert.equal(screen.phase,'playing');}
  if(id.startsWith('reward-')){assert.equal(run.stage,Number(id.slice(7)));assert.equal(run.status,'allocation');}
  if(id.startsWith('quest-')){assert.equal(j.location,'story-quest');assert.equal(j.currentNode,id);}
  if(id.startsWith('map-')){assert.equal(j.location,'map');assert.equal(journeyRegion(run),Number(id.slice(4)));}
  if(id.startsWith('ending-')){assert.equal(run.stage,10);assert.equal(run.status,'complete');assert.ok(pendingStageStory(run));assert.match(lines(journeyScenes(10,run).after),id==='ending-2'?/두 왕이 있었어/:/마음에 들면 가져가시오/);}
  if(id==='prologue-2')assert.equal(j.story!.runNumber,2);
 }
});
test('scene lists keep their identity across renders so the cutscene player never restarts',()=>{
 const game=createRpgJourneyGame('검증','',0),run=game.rpgRun!;
 for(let stage=1;stage<=10;stage++){assert.equal(journeyScenes(stage,run),journeyScenes(stage,structuredClone(run)),`ST${stage} cached`);assert.equal(journeyScenes(stage,run).before,journeyScenes(stage,run).before);}
 const changed=structuredClone(run);setJourneyRunNumber(changed,2);assert.notEqual(journeyScenes(1,changed),journeyScenes(1,run),'a different run variant gets its own list');
});
test('saves reject corrupt story data and the map only shows the current region',()=>{
 const {game}=playJourney();const bad=structuredClone(game) as Game;bad.rpgRun!.journey!.story={runNumber:1,quests:{'quest-4':'maybe' as never}};
 assert.throws(()=>validateJourneySave(bad));
 const mid=createRpgJourneyGame('검증','',0);enterJourneyNode(mid,'battle-1',0);
 for(let stage=1;stage<=3;stage++){if(stage>1)enterJourneyNode(mid,`battle-${stage}` as never);mid.rpgRun!.hp=[mid.rpgRun!.hp[0],1,40];finish(mid,[0,6,3]);mid.rpgRun=chooseRpgStageReward(mid.rpgRun!,'relic',undefined,false,mid.rpgRun!.phaseOne!.clear!.relicOffers![0]);}
 assert.equal(journeyNodeState(mid.rpgRun!,'tavern'),'closed');
 const html=renderToStaticMarkup(<JourneyMapView run={mid.rpgRun!} busy={false} error="" action={()=>{}} exit={()=>{}}/>);
 assert.match(html,/ST4 · 물안개 폭포/);assert.match(html,/물에 젖은 기록/);assert.doesNotMatch(html,/눈길의 주점/);assert.match(html,/성화의 영역/);assert.match(html,/data-region="2"/);
 assert.ok(JOURNEY_NODES.filter(n=>n.region>1).every(n=>n.x>0&&n.x<100&&n.y>0&&n.y<100));
 for(const [key,slot] of Object.entries(CHAPTER_ART_SLOTS)){
  const art=chapterArt(key);
  // 2026-11-11 user choice: until wide paintings exist, wide screens show the new portrait painting framed.
  assert.equal(art.landscape,art.portrait,'wide screens use the portrait painting (framed) until the wide painting arrives');
  const special=['st6-flame-two','st6-flame-two-back','st9-key-two','st9-key-two-back','true-ending-record','true-ending-village','ending-handoff'].includes(key);
  assert.equal(art.portrait,`/story/${key}-portrait-${special?'special-v1':`v${/^region-[234]-map$/.test(key)?2:1}`}.webp`);
  assert.ok(existsSync(new URL(`../public${art.portrait}`,import.meta.url)),key);
 }
 assert.match(html,/--map-portrait-x:78%;--map-portrait-y:83%/,'the dice den follows the boathouse in the portrait map');
 assert.match(html,/class="map-route-portrait" d="M67 59L55 62L40 61L28 55L16 48L8 44L17 41L30 43L48 42L64 41L82 37L80 30L77 25L71 21L64 18L60 14"/);
 for(const id of ['sacred-flame-two','secret-key-two'] as const){
  for(const side of ['front','back'] as const){
   assert.equal(STORY_CARD_ART[id][side],`/story-cards/${id}-${side}-special-v1.webp`);
   assert.ok(existsSync(new URL(`../public${STORY_CARD_ART[id][side]}`,import.meta.url)));
  }
 }
 assert.ok(existsSync(new URL(`../public${RPG_GUARDIAN_ART}`,import.meta.url)));
 assert.ok(RPG_GUARDIANS.every(guardian=>guardian.avatar==='stage-portrait:15'),'saved combat identity remains compatible');
 assert.ok(existsSync(new URL(`../public${relicImage('haro-ivory-die')}`,import.meta.url)));
 assert.ok(rpgMaxHp(mid.rpgRun!)>=100);
});

test('the map warms the next stage paintings: before, its quest, after; nothing outside ST4~10', async () => {
 const {stageArtToPreload}=await import('../lib/rpg-chapters');
 assert.deepEqual(stageArtToPreload(3),[]);assert.deepEqual(stageArtToPreload(11),[]);
 const five=stageArtToPreload(5);
 assert.deepEqual(five,['/story/st5-before-portrait-v1.webp','/story/quest-5-portrait-v1.webp','/story/st5-after-portrait-v1.webp']);
 assert.equal(stageArtToPreload(7).length,2,'ST7 has no side quest');
 for(const stage of [4,5,6,7,8,9,10])for(const src of stageArtToPreload(stage))assert.ok(existsSync('public'+src),src);
});
