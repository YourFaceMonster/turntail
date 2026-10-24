import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import Achievements from '../app/components/Achievements';
import {ACHIEVEMENTS,emptyAchievements,observeAchievements,readAchievements,ACHIEVEMENTS_KEY,type AchievementState} from '../lib/achievements';
import {room,player,start,view,act,type Tile} from '../lib/game';
import {HIBORINGJI} from '../lib/hiboringji';
const tile=(n:number,s=0):Tile=>({id:n*4+s,n,s});
function fixture(){const g=room(crypto.randomUUID(),player('나'),true,3);g.players.push(player('상대',true),player('상대2',true));start(g,0);g.turn=0;g.turnReadyAt=0;g.trick=[];g.players[0].hand=[tile(2,3)];return g;}
let g=fixture(),state=emptyAchievements();
state=observeAchievements(state,view(g,g.players[0].token)).state;
const serialized=JSON.stringify(state),memory={getItem:(key:string)=>key===ACHIEVEMENTS_KEY?serialized:null,setItem:()=>{}};
assert.deepEqual(readAchievements(memory),state,'pending round survives reload');
act(g,0,'play',[tile(2,3).id],-1,0);
let observed=observeAchievements(readAchievements(memory),view(g,g.players[0].token));state=observed.state;
assert.ok(observed.earned.some(a=>a.id==='first-win'));assert.equal(state.stats.noDrawWin,1);assert.equal(state.stats.redFinish,1);
assert.equal(observeAchievements(state,view(g,g.players[0].token)).state,state,'reopening an ended save never counts twice');
assert.equal(state.stats.rounds,1);assert.equal(state.stats.tiles,1);

g=fixture();g.players[0].hand=[tile(3),tile(4),tile(5),tile(6),tile(7)];
state=observeAchievements(state,view(g,g.players[0].token)).state;
act(g,0,'play',g.players[0].hand.map(t=>t.id),-1,0);
observed=observeAchievements(state,view(g,g.players[0].token));state=observed.state;
assert.equal(state.stats.patterns['스트레이트 플러시'],1);assert.ok(observed.earned.some(a=>a.id==='secret-line'));
// A result invalidated by later AI assistance must commit no rounds or move progress.
g=fixture();let pending=observeAchievements(state,view(g,g.players[0].token)).state;act(g,0,'play',[tile(2,3).id],-1,0);g.result!.voided=true;
const invalid=observeAchievements(pending,view(g,g.players[0].token));assert.deepEqual(invalid.state.stats,state.stats);assert.equal(invalid.earned.length,0);
assert.equal(observeAchievements(invalid.state,view(g,g.players[0].token)).state,invalid.state);
// Joining a finished table cannot invent a no-draw achievement.
g=fixture();act(g,0,'play',[tile(2,3).id],-1,0);const partial=observeAchievements(emptyAchievements(),view(g,g.players[0].token));assert.equal(partial.state.stats.noDrawWin,0);
// A seen draw defeats the no-draw condition, including across a storage reload.
g=fixture();pending=observeAchievements(emptyAchievements(),view(g,g.players[0].token)).state;
const drawView=view(g,g.players[0].token);drawView.lastEvent={id:'draw-once',who:0,type:'draw'};
pending=observeAchievements(pending,drawView).state;assert.equal(observeAchievements(pending,drawView).state,pending);
act(g,0,'play',[tile(2,3).id],-1,0);assert.equal(observeAchievements(pending,view(g,g.players[0].token)).state.stats.noDrawWin,0);

g=fixture();g.players[1].avatar=HIBORINGJI.avatar;g.roundActions=72;act(g,0,'play',[tile(2,3).id],-1,0);
assert.ok(observeAchievements(emptyAchievements(),view(g,g.players[0].token)).earned.some(a=>a.id==='secret-temper'));
// Consecutive wins, a loss, and later wins preserve the best streak.
let streak=emptyAchievements();for(let i=0;i<4;i++){g=fixture();act(g,0,'play',[tile(2,3).id],-1,0);if(i===3)g.result!.players[0].winner=false;streak=observeAchievements(streak,view(g,g.players[0].token)).state;}
assert.equal(streak.stats.streak,0);assert.equal(streak.stats.bestStreak,3);assert.ok(streak.unlocked.streak);
// Friend seats use me, not the host's seat zero.
g=fixture();act(g,0,'play',[tile(2,3).id],-1,0);const friend=observeAchievements(emptyAchievements(),view(g,g.players[1].token));assert.equal(friend.state.stats.wins,0);
// Stage milestones use the authoritative settled result, including all ten stages.
g=fixture();act(g,0,'play',[tile(2,3).id],-1,0);g.result!.stageRun={cleared:10} as any;
const stages=observeAchievements(emptyAchievements(),view(g,g.players[0].token));for(const id of ['stage-one','stage-five','stage-ten'])assert.ok(stages.state.unlocked[id]);

const locked=renderToStaticMarkup(<Achievements state={emptyAchievements()} close={()=>{}}/>);
for(const a of ACHIEVEMENTS.filter(a=>a.hidden)){assert.ok(!locked.includes(a.title));assert.ok(!locked.includes(a.description));}
assert.equal(ACHIEVEMENTS.length,20);assert.equal(ACHIEVEMENTS.filter(a=>a.hidden).length,4);
assert.deepEqual(readAchievements({getItem:()=>'{broken',setItem:()=>{}}),emptyAchievements());
console.log('PASS: result/event deduplication, save/reload, void rejection, partial-round protection, draws, streaks, friend seats, stage milestones, 20 achievements and hidden-condition secrecy.');
