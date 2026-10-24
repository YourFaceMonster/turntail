import assert from 'node:assert/strict';
import {newStageRun,settleStageRun,enterNextStage,stageConfig,STAGE_TARGETS} from '../lib/stage-challenge.ts';
import {createStageGame,startStageRound,abandonStageGame} from '../lib/stage-game.ts';
import {readStageArchive,saveStageGame,STAGE_STORAGE_KEY} from '../lib/stage-storage.ts';
import {act,settle,view,chooseBotAction,type Game,type Tile} from '../lib/game.ts';
import {scoreEntries} from '../lib/challenge.ts';
const result=(id:string,scores:number[])=>({id,at:1000,players:scores.slice(0,3).map((total,i)=>({name:['나','달빛','해솔','별하'][i],total}))});
let run=newStageRun('boundary',1);
assert.equal(settleStageRun(run,result('299',[299,100,100,100])).status,'playing');
assert.equal(settleStageRun(run,result('300',[300,100,100,100])).status,'stage-clear');
let next=settleStageRun(run,result('ai-zero',[250,0,200,200]));assert.equal(next.status,'stage-clear');assert.equal(next.clears[0].reason,'bankrupt');assert.equal(next.score,250);
assert.equal(settleStageRun(run,result('human-zero',[0,100,100,100])).status,'playing');
assert.equal(settleStageRun(run,result('both-broke',[-1,0,100,100])).status,'game-over');
next=settleStageRun(run,result('both',[300,0,100,100]));assert.equal(next.clears.length,1);assert.equal(next.clears[0].reason,'both');assert.deepEqual(settleStageRun(next,result('both',[300,0,100,100])),next);
next=settleStageRun(run,result('overflow',[5000,100,100,100]));assert.equal(next.stage,1);assert.equal(next.cleared,1);next=enterNextStage(next);assert.equal(next.stage,2);assert.equal(next.status,'playing');assert.equal(next.score,5000);assert.equal(next.stageRounds,0);
next=settleStageRun(next,result('after-overflow',[4999,100,100,100]));assert.equal(next.stage,2);assert.equal(next.cleared,2);assert.equal(next.peakScore,5000);
run={...newStageRun('drop'),stage:5,cleared:4,score:1100,peakScore:1100};next=settleStageRun(run,result('drop',[200,100,100,100]));assert.equal(next.stage,5);assert.equal(next.cleared,4);
run={...newStageRun('ten'),stage:10,cleared:9};next=settleStageRun(run,result('final',[3450,100,100,100]));assert.equal(next.status,'complete');assert.equal(next.cleared,10);assert.throws(()=>enterNextStage(next));assert.deepEqual(STAGE_TARGETS,[300,450,650,900,1200,1550,1950,2400,2900,3450]);for(let i=1;i<=10;i++)assert.equal(stageConfig(i).aiScore,200);

const tile=(id:number):Tile=>({id,n:Math.floor(id/4)+1,s:id%4});
function finish(g:Game,counts=[0,4,7]){let id=0;g.players.forEach((p,i)=>{p.hand=Array.from({length:counts[i]},()=>tile(id++));});g.phase='ended';g.winner=0;g.result=null;return settle(g);}
let game=createStageGame('나','',10);assert.equal(game.players.length,3);assert.equal(game.players.filter(p=>p.bot).length,2);assert.ok(game.players.every(p=>p.points===200));assert.equal(game.challenge,null);
assert.equal(new Set([...game.players.flatMap(p=>p.hand),...game.stacks.flat().filter(Boolean)].map(t=>t!.id)).size,60);
const classic=structuredClone(game);delete classic.stageRun;const ordinary=finish(classic),stage=finish(game);assert.deepEqual(stage.players.map(p=>p.delta),ordinary.players.map(p=>p.delta),'existing round scoring is unchanged');assert.equal(scoreEntries(stage,0,'single',3).length,0,'stage rounds never become ordinary single/ten high scores');
startStageRound(game,100);const originalRound=game.round;game.players[0].points=290;game.stageRun!.score=290;game.phase='playing';game.result=null;finish(game);assert.equal(game.stageRun!.status,'stage-clear');const humanPoints=game.players[0].points,oldAi=game.players.slice(1).map(p=>p.id);startStageRound(game,5000);assert.equal(game.stageRun!.stage,2);assert.equal(game.players[0].points,humanPoints);assert.ok(game.players.slice(1).every((p,i)=>p.points===200&&p.id!==oldAi[i]));assert.equal(game.round,originalRound+1);assert.equal(game.players.length,3);
finish(game);const balances=game.players.map(p=>p.points),ids=game.players.map(p=>p.id);assert.equal(game.stageRun!.status,'playing');startStageRound(game);assert.deepEqual(game.players.map(p=>p.points),balances,'within-stage balances carry into the next round');assert.deepEqual(game.players.map(p=>p.id),ids);
const memory=new Map<string,string>([['jangseong-practice-records','classic-records'],['jangseong-practice-game','classic-game'],['jangseong-session','classic-session']]);
const storage={getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>{memory.set(key,value);}};
saveStageGame(storage,game);const restored=readStageArchive(storage).active!;assert.deepEqual(restored,game,'all hands, floor order, turn, trick, scores and stage restore exactly');assert.equal(memory.get('jangseong-practice-game'),'classic-game');assert.equal(memory.get('jangseong-practice-records'),'classic-records');assert.equal(memory.get('jangseong-session'),'classic-session');
restored.turn=0;restored.trick=[];restored.lastBy=null;const picked=restored.players[0].hand[0];act(restored,0,'play',[picked.id],-1,9999);saveStageGame(storage,restored);assert.deepEqual(readStageArchive(storage).active,restored,'confirmed actions are stored before exit');saveStageGame(storage,restored);assert.equal(readStageArchive(storage).records.length,1,'refreshing and re-saving never duplicate a run');
const savedBefore=memory.get(STAGE_STORAGE_KEY);assert.throws(()=>saveStageGame({...storage,setItem(){throw Error('quota');}},restored),/저장하지 못해/);assert.equal(memory.get(STAGE_STORAGE_KEY),savedBefore);
abandonStageGame(restored,99999);saveStageGame(storage,restored);assert.equal(readStageArchive(storage).active,null);assert.equal(readStageArchive(storage).records[0].status,'abandoned');const fresh=createStageGame('다시');assert.equal(fresh.stageRun!.stage,1);assert.equal(fresh.players[0].points,200);assert.notEqual(fresh.stageRun!.id,restored.stageRun!.id);
assert.equal(view(fresh,fresh.players[0].token).stageRun!.stage,1);assert.throws(()=>readStageArchive({getItem:()=>'{bad',setItem(){}}),/기존 데이터는 보존/);
let played=createStageGame('한 판 점검'),turns=0;
while(played.phase==='playing'&&turns++<600){
 const a=chooseBotAction(view(played,played.players[played.turn].token));act(played,played.turn,a.type,a.type==='play'?a.tiles.map(t=>t.id):[],a.type==='draw'?a.index:-1,10000+turns*5000,true);
 const archive=saveStageGame(storage,played);if(archive.active)played=readStageArchive(storage).active!;
}
assert.equal(played.phase,'ended','a full stage-mode round can finish through real play');assert.equal(played.stageRun!.rounds,1);assert.equal(played.players.reduce((sum,p)=>sum+(p.points||0),0),600);assert.equal(scoreEntries(played.result!,0,'single',3).length,0);
console.log('PASS: 299/300, both bankruptcy boundaries, one-stage overflow, all 10 targets, unchanged scoring, new 3-seat AI lineups, carried balances, exact full-state/action recovery, atomic independent records, no duplicate settlement, failed-save guard and fresh restart after abandonment.');
