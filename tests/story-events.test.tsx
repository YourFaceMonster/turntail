import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRpgJourneyGame} from '../lib/rpg-game';
import {answerStoryQuest,recordStoryEvent,validateJourneySave} from '../lib/rpg-journey';
import {journeyScenes} from '../lib/rpg-chapter-scenes';
import {STORY_EVENT_IDS,type StoryQuestState} from '../lib/rpg-chapters';
import StoryPuzzle from '../app/components/StoryPuzzle';
import type {RpgRun} from '../lib/rpg';
import type {PrologueCut} from '../lib/rpg-prologue';

const lines=(cuts:readonly PrologueCut[])=>cuts.map(cut=>cut.line).join('\n');
function at(node:string,stage:number):RpgRun{const run=createRpgJourneyGame('사건','',0).rpgRun!;run.status='ready';run.stage=stage;run.journey!.location='story-quest';run.journey!.currentNode=node as never;return run;}
function withStory(story:Partial<StoryQuestState>,runNumber=1){const run=createRpgJourneyGame('사건','',0).rpgRun!;run.journey!.story={runNumber,quests:{},...story};return run;}

test('a solved quest event is stored with the read choice; skipping the quest ignores it',()=>{
 const solved=answerStoryQuest(at('quest-4',3),'quest-4','read','solved');
 assert.deepEqual(solved.journey!.story!.events,{'quest-4':'solved'});
 const skipped=answerStoryQuest(at('quest-5',4),'quest-5','skip','solved');
 assert.equal(skipped.journey!.story!.events,undefined,'no event without reading');
 const quest6=answerStoryQuest(at('quest-6',5),'quest-6','read','solved');
 assert.equal(quest6.journey!.story!.events,undefined,'quest-6 has no hands-on event');
});

test('the ST7 ledger records once, only on the way to ST7, and never restarts the opening scene',()=>{
 const run=createRpgJourneyGame('사건','',0).rpgRun!;run.status='ready';run.stage=6;run.journey!.location='map';
 const opening=journeyScenes(7,run).before;
 const recorded=recordStoryEvent(run,'st7-ledger','solved');
 assert.equal(recorded.journey!.story!.events!['st7-ledger'],'solved');
 assert.equal(journeyScenes(7,recorded).before,opening,'same opening list identity');
 assert.match(lines(journeyScenes(7,recorded).after),/1등 칸이 비어 있던 거/);
 assert.equal(recordStoryEvent(recorded,'st7-ledger','skipped'),recorded,'first result stays');
 const early=createRpgJourneyGame('사건','',0).rpgRun!;early.status='ready';early.stage=3;
 assert.equal(recordStoryEvent(early,'st7-ledger','solved'),early,'not on the way to ST7');
 assert.throws(()=>recordStoryEvent(run,'quest-4','solved'));
});

test('saves reject unknown event ids or results',()=>{
 for(const events of [{'quest-6':'solved'},{'quest-4':'won'}]){const game=createRpgJourneyGame('사건','',0);game.rpgRun!.journey!.story={runNumber:1,quests:{},events:events as never};assert.throws(()=>validateJourneySave(game));}
 const ok=createRpgJourneyGame('사건','',0);ok.rpgRun!.journey!.story={runNumber:1,quests:{},events:{'quest-9':'skipped'}};validateJourneySave(ok);
});

test('stage lines follow the approved changes: reasons to play, echoes and no early ending',()=>{
 const fresh=withStory({});
 assert.match(lines(journeyScenes(5,fresh).before),/누가 먼저 건너고 누가 남을지, 패로 정하자/);
 assert.match(lines(journeyScenes(6,fresh).before),/먼저 간 자와, 남은 자/);
 assert.match(lines(journeyScenes(8,fresh).before),/나를 이긴 사람에게만/);
 assert.match(lines(journeyScenes(8,fresh).after),/약속은 약속이지/);
 assert.doesNotMatch(lines(journeyScenes(9,fresh).after),/첫 번째 왕은|두 번째 왕은/,'the kings are revealed at ST10');
 assert.match(lines(journeyScenes(10,fresh).before),/답은 패로 해라/);
 assert.equal(journeyScenes(10,fresh).before.filter(cut=>cut.keepsakeFace==='front').length,4,'all four keepsakes up close');
 const helped=withStory({quests:{'quest-5':'read'}}),passed=withStory({quests:{'quest-5':'skip'}});
 assert.match(lines(journeyScenes(5,helped).after),/나는 남아서 지킬게/);
 assert.match(lines(journeyScenes(5,passed).after),/혼자 남아 버티는 건/);
 const solved=withStory({quests:{'quest-4':'read','quest-8':'read'},events:{'quest-4':'solved','quest-8':'solved'}});
 assert.match(lines(journeyScenes(4,solved).after),/나누어 맡았다/);
 assert.match(lines(journeyScenes(8,solved).after),/그 사람도 이 문양을 따라왔구나/);
});

test('flame and key discoveries pause, then play a card sound and flip sound',()=>{
 for(const stage of [6,9]){
  const cuts=journeyScenes(stage,withStory({})).after,front=cuts.findIndex(cut=>cut.keepsakeFace==='front');
  assert.equal(cuts[front].cue,'storyCard');assert.equal(cuts[front+1].cue,'pass');
  assert.ok(!cuts[front-1].keepsakeFace&&/고요해졌다|조용해졌다/.test(cuts[front-1].line),'a quiet beat before the closeup');
  assert.equal(cuts[front-2].camera,'push');
 }
});

test('both endings pay off earlier clues and the true ending says why 2 is highest',()=>{
 const first=lines(journeyScenes(10,withStory({quests:{'quest-4':'read','quest-6':'read'}})).after);
 assert.match(first,/그림자일 뿐이다/);assert.match(first,/그 뒤의 글을 이제야/);assert.match(first,/회랑의 장부가 떠올랐다/);
 const second=lines(journeyScenes(10,withStory({quests:{'quest-5':'read'},events:{'st7-ledger':'solved'}},2)).after);
 assert.match(second,/가장 약해 보이는 숫자 2를, 가장 높은 자리에 두었다/);assert.match(second,/비어 있던 1등 칸/);assert.match(second,/다리의 이야기도 같은 뜻/);
});

test('every story puzzle renders with a skip button',()=>{
 for(const id of STORY_EVENT_IDS){const html=renderToStaticMarkup(<StoryPuzzle id={id} inline done={()=>{}}/>);assert.match(html,/건너뛰기/,id);assert.match(html,new RegExp(`data-puzzle="${id}"`));}
 // Codex art: the ST4 strips and the ST7 ledger page sit behind the app-written words.
 assert.equal((renderToStaticMarkup(<StoryPuzzle id="quest-4" inline done={()=>{}}/>).match(/data-piece="[123]"/g)||[]).length,3);
 assert.match(renderToStaticMarkup(<StoryPuzzle id="st7-ledger" inline done={()=>{}}/>),/story-ledger-page/);
});
