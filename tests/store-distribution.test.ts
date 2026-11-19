import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdGate,resultAdOpportunity} from '../lib/distribution-ads';
import {allowedGameOrigin,gameCorsHeaders} from '../lib/store-cors';
const base={code:'LOCAL',phase:'ended',result:{id:'one'}};
test('store ads occur only after complete stage/failure/daily results',()=>{
 assert.equal(resultAdOpportunity({...base,rpgRun:{status:'playing'}}),null);
 assert.equal(resultAdOpportunity({...base,rpgRun:{status:'ready'}})?.kind,'stage-clear');
 assert.equal(resultAdOpportunity({...base,rpgRun:{status:'playing',rework:{retried:{}}}})?.kind,'challenge-failed');
 assert.equal(resultAdOpportunity({...base,rpgRun:{status:'game-over'}})?.kind,'challenge-failed');
 assert.equal(resultAdOpportunity({...base,daily:{}})?.kind,'daily-finished');
 assert.equal(resultAdOpportunity({...base,daily:{},rpgTest:true}),null);
 assert.equal(resultAdOpportunity({...base,rpgMini:{},rpgRun:{status:'ready'}}),null);
 assert.equal(resultAdOpportunity({...base}),null);
});
test('ad gate deduplicates result buttons and observes cooldown',async()=>{
 let at=0,calls=0;const gate=createAdGate(()=>at),provider={ready:async()=>true,show:async()=>{calls++;return {status:'completed'};},preload:()=>{}};
 await gate({key:'a',kind:'stage-clear'},provider);await gate({key:'a',kind:'stage-clear'},provider);
 at=1000;await gate({key:'b',kind:'challenge-failed'},provider);assert.equal(calls,1);
 at=180001;await gate({key:'c',kind:'daily-finished'},provider);assert.equal(calls,2);
});
test('missing inventory, unsupported SDK and failures do not hold up navigation',async()=>{
 const gate=createAdGate();await gate({key:'a',kind:'stage-clear'},null);
 await gate({key:'b',kind:'stage-clear'},{ready:async()=>false,show:async()=>{throw Error('must not show');},preload:()=>{}});
 await gate({key:'c',kind:'stage-clear'},{ready:async()=>{throw Error('offline');},show:async()=>({status:'failed'}),preload:()=>{}});
});
test('a stuck readiness lookup is skipped and a failed show is cooled down',async()=>{
 let calls=0;const gate=createAdGate(()=>0,180000,5);
 await gate({key:'a',kind:'stage-clear'},{ready:()=>new Promise(()=>{}),show:async()=>{calls++;return {status:'failed'};},preload:()=>{}});
 assert.equal(calls,0);
 const provider={ready:async()=>true,show:async()=>{calls++;return {status:'failed'};},preload:()=>{}};
 await gate({key:'b',kind:'stage-clear'},provider);await gate({key:'c',kind:'stage-clear'},provider);assert.equal(calls,1);
});
test('CORS accepts only the same origin or an exact configured origin',()=>{
 const req=(origin:string)=>new Request('https://game.example/api/game',{headers:{Origin:origin}});
 assert.equal(allowedGameOrigin(req('https://game.example'),''),'https://game.example');
 assert.equal(allowedGameOrigin(req('https://cdn.example'),'https://cdn.example'),'https://cdn.example');
 for(const origin of ['null','https://evil.example','https://cdn.example.evil'])assert.equal(allowedGameOrigin(req(origin),'https://cdn.example'),null);
 assert.equal(gameCorsHeaders(req('https://cdn.example'),'https://cdn.example').get('Access-Control-Allow-Origin'),'https://cdn.example');
 assert.equal(gameCorsHeaders(req('https://evil.example'),'https://cdn.example').has('Access-Control-Allow-Origin'),false);
});
