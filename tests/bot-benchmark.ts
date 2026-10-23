import assert from 'node:assert/strict';
import {view,act,chooseBotAction} from '../lib/game.ts';
import {chooseLegacyAction} from './fixtures/bot-v036.ts';
import {seededGame} from './fixtures/strategy-positions.ts';
const seeds=Number(process.env.BOT_BENCH_SEEDS||8),sizes=(process.env.BOT_BENCH_SIZES||'2,3,4').split(',').map(Number),results=[];
for(const size of sizes){let wins=0,games=0,points=0,actions=0,slowest=0,totalMs=0;const times:number[]=[];
 for(let seed=1;seed<=seeds;seed++)for(let seat=0;seat<size;seat++){
  const g=seededGame(seed*7919+37,size);let turns=0;
  while(g.phase==='playing'&&turns++<600){const p=view(g,g.players[g.turn].token),begin=performance.now(),a=g.turn===seat?chooseBotAction(p):chooseLegacyAction(p),ms=performance.now()-begin;
   if(g.turn===seat){actions++;totalMs+=ms;slowest=Math.max(slowest,ms);times.push(ms);}
   act(g,g.turn,a.type,a.type==='play'?a.tiles.map(t=>t.id):[],a.type==='draw'?a.index:-1,turns*10000,true);
  }
  assert.equal(g.phase,'ended','round must finish with legal actions');wins+=Number(g.winner===seat);points+=g.result!.players[seat].delta;games++;
 }
 times.sort((a,b)=>a-b);const row={size,seeds,games,wins,winRate:Math.round(wins/games*1000)/10,equalStrengthRate:Math.round(1000/size)/10,meanPoints:Math.round(points/games*100)/100,actions,meanMs:Math.round(totalMs/actions),p95Ms:Math.round(times[Math.floor(times.length*.95)]),maxMs:Math.round(slowest)};results.push(row);console.log(JSON.stringify(row));
}
console.log(JSON.stringify({results}));
