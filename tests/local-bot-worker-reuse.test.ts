import assert from 'node:assert/strict';
import {test} from 'node:test';
import {runLocalBot} from '../lib/local-bot.ts';
import {botMove,type Game} from '../lib/game.ts';
import {createRpgJourneyGame} from '../lib/rpg-game.ts';
import {positionGame,tile} from './fixtures/strategy-positions.ts';

test('worker reuse preserves journeys and isolates concurrent, cancelled and timed-out turns',async()=>{
 const original=globalThis.Worker,originalTimer=globalThis.setTimeout;
 const workers:FakeWorker[]=[];let timeout:()=>void=()=>{};
 class FakeWorker{
  onmessage:((event:{data:{game?:Game,error?:string}})=>void)|null=null;
  onerror:((event:{preventDefault:()=>void})=>void)|null=null;
  payload!:Game;terminated=0;
  constructor(){workers.push(this);}
  postMessage(game:Game){this.payload=structuredClone(game);}
  reply(){this.onmessage?.({data:{game:structuredClone(this.payload)}});}
  terminate(){this.terminated++;}
 }
 Object.defineProperty(globalThis,'Worker',{configurable:true,value:FakeWorker});
 const signal=()=>new AbortController().signal;
 const fresh=()=>positionGame([[tile(10)],[tile(12),tile(13)]],[tile(9)],[tile(2,3)]);
 try{
  const journey=createRpgJourneyGame('보존');
  const j=journey.rpgRun!.journey!;
  j.mini={game:fresh(),roundIds:['tavern'],lastReward:12};
  j.letterMini={game:fresh(),roundIds:['letter'],lastReward:8};
  const before=JSON.stringify(journey),first=runLocalBot(journey,signal());
  assert.equal(workers[0].payload.rpgRun!.journey!.mini,undefined);
  assert.equal(workers[0].payload.rpgRun!.journey!.letterMini,undefined);
  workers[0].reply();const restored=await first;
  assert.equal(restored.rpgRun!.journey!.mini,j.mini);
  assert.equal(restored.rpgRun!.journey!.letterMini,j.letterMini);
  assert.equal(JSON.stringify(journey),before);
  const next=runLocalBot(fresh(),signal());assert.equal(workers.length,1);
  workers[0].reply();await next;assert.equal(workers[0].terminated,0);

  const cancelled=new AbortController(),a=runLocalBot(fresh(),cancelled.signal);
  const stale=workers[0].onmessage!;
  const b=runLocalBot(fresh(),signal());assert.equal(workers.length,2);
  cancelled.abort();await assert.rejects(a,{name:'AbortError'});
  assert.equal(workers[0].terminated,1);assert.equal(workers[1].terminated,0);
  stale({data:{game:fresh()}});workers[1].reply();await b;
  assert.equal(workers[1].terminated,1,'temporary concurrent worker is released');

  const pending=runLocalBot(fresh(),signal());assert.equal(workers.length,3);
  const preAborted=new AbortController();preAborted.abort();
  await assert.rejects(runLocalBot(fresh(),preAborted.signal),{name:'AbortError'});
  assert.equal(workers[2].terminated,0,'pre-aborted request leaves active work alone');
  workers[2].reply();await pending;

  globalThis.setTimeout=((callback:()=>void,delay:number)=>{
   assert.equal(delay,7000);timeout=callback;return originalTimer(()=>{},60000);
  }) as typeof setTimeout;
  const game=fresh(),expected=structuredClone(game);botMove(expected);
  const timed=runLocalBot(game,signal()),late=workers[2].onmessage!;
  timeout();const result=await timed;
  assert.equal(result.phase,expected.phase);assert.equal(result.winner,expected.winner);
  assert.equal(workers[2].terminated,1);
  const snapshot=JSON.stringify(result);late({data:{game:fresh()}});
  assert.equal(JSON.stringify(result),snapshot);
  globalThis.setTimeout=originalTimer;

  const recovered=runLocalBot(fresh(),signal());assert.equal(workers.length,4);
  const broken=workers[3];broken.onerror!({preventDefault(){}});
  assert.equal((await recovered).phase,'ended');assert.equal(broken.terminated,1);
  const error=runLocalBot(fresh(),signal());workers[4].onmessage!({data:{error:'failed'}});
  assert.equal((await error).phase,'ended');assert.equal(workers[4].terminated,1);
 }finally{
  globalThis.setTimeout=originalTimer;
  Object.defineProperty(globalThis,'Worker',{configurable:true,value:original});
 }
});
