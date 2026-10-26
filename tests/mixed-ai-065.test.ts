import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
import {room,player,changeLobbyAI,start,advanceRoom,scheduleTurn,type Game} from '../lib/game';
const sqlite=new DatabaseSync(':memory:');sqlite.exec(`CREATE TABLE rooms(code TEXT PRIMARY KEY,revision INTEGER,state TEXT,updated INTEGER);CREATE TABLE match_records(id TEXT PRIMARY KEY,device TEXT,name TEXT,at INTEGER,win INTEGER,points INTEGER,size INTEGER,result TEXT);CREATE TABLE shared_scores(id TEXT PRIMARY KEY,device TEXT,name TEXT,mode TEXT,size INTEGER,kind TEXT,score INTEGER,at INTEGER,entry_id TEXT);CREATE TABLE record_retention(id TEXT PRIMARY KEY,cursor TEXT,complete INTEGER);INSERT INTO record_retention VALUES ('top10-v1','',1);`);
class Statement{constructor(public sql:string,public args:any[]=[]){ }bind(...args:any[]){return new Statement(this.sql,args);}async first(){return sqlite.prepare(this.sql).get(...this.args)||null;}async all(){return {results:sqlite.prepare(this.sql).all(...this.args)};}async run(){return {meta:{changes:Number(sqlite.prepare(this.sql).run(...this.args).changes)}};}}
const db={prepare:(sql:string)=>new Statement(sql),batch:async(ss:Statement[])=>{sqlite.exec('BEGIN');try{const results=ss.map(s=>({meta:{changes:Number(sqlite.prepare(s.sql).run(...s.args).changes)}}));sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
(globalThis as any).__mixedTestEnv={DB:db};
let source=readFileSync('app/api/game/route.ts','utf8').replace('import { env } from "cloudflare:workers";','const env=(globalThis as any).__mixedTestEnv;');
source=source.replace(/(['"])\.\.\/\.\.\/\.\.\/lib\/([^'"]+)\1/g,(_,q,name)=>JSON.stringify(pathToFileURL(process.cwd()+'/lib/'+name+'.ts').href));
const {POST}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
async function post(body:any){const response=await POST(new Request('https://turntale.test/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://turntale.test'},body:JSON.stringify(body)}));return {status:response.status,...await response.json() as any};}
assert.equal((await post({action:'create',size:2})).status,400,'new two-seat rooms are removed');
assert.equal((await post({action:'create',size:3,challenge:true})).status,410,'retired challenge creation is rejected');
let a=await post({action:'create',size:3,name:'방장',profileToken:crypto.randomUUID()});assert.equal(a.status,200);const code=a.game.code,host=a.token;
let b=await post({action:'join',code,name:'친구',profileToken:crypto.randomUUID()});assert.equal(b.status,200);const guest=b.token;
assert.equal((await post({action:'addAI',code,token:guest,revision:b.revision})).status,400);
a=await post({action:'addAI',code,token:host,revision:b.revision});assert.equal(a.status,200);assert.equal(a.game.players.length,3);assert.equal(a.game.players.filter((p:any)=>p.bot).length,1);
assert.equal((await post({action:'join',code,name:'초과'})).status,400);
a=await post({action:'removeAI',code,token:host,revision:a.revision});assert.equal(a.game.players.length,2);
a=await post({action:'addAI',code,token:host,revision:a.revision});a=await post({action:'start',code,token:host,revision:a.revision});assert.equal(a.status,200);
const row=sqlite.prepare('SELECT state,revision FROM rooms WHERE code=?').get(code) as any,g=JSON.parse(row.state) as Game;g.turn=2;g.turnReadyAt=0;g.turnStartedAt=0;g.trick=[];g.players[2].hand=g.players[2].hand.slice(0,1);sqlite.prepare('UPDATE rooms SET state=? WHERE code=?').run(JSON.stringify(g),code);
const responses=await Promise.all(Array.from({length:6},()=>post({action:'state',code,token:guest})));assert.ok(responses.every(r=>r.status===200));a=responses[0];assert.equal(a.game.phase,'ended');assert.equal(a.game.result.voided,false);assert.equal(a.game.challenge,null);assert.equal((sqlite.prepare('SELECT COUNT(*) AS n FROM match_records').get() as any).n,2,'one valid record per human, none for the voluntary bot');
const deltas=a.game.result.players.map((p:any)=>p.delta);assert.equal(deltas.reduce((x:number,y:number)=>x+y,0),0);assert.ok(deltas[2]>0,'bot victory gets a real settlement');
// Replaced humans still invalidate their game, even with a planned AI on the table.
const timed=room('TIMEOUT',player('방장'),false,3);timed.players.push(player('친구'));changeLobbyAI(timed,0,true);start(timed,0);timed.turn=0;timed.players[0].hand=timed.players[0].hand.slice(0,1);timed.trick=[];timed.turnReadyAt=0;scheduleTurn(timed,0);advanceRoom(timed,40000);assert.equal(timed.result!.voided,true);
assert.throws(()=>changeLobbyAI(timed,0,false));
const four=room('FOUR',player('방장'),false,4);assert.throws(()=>changeLobbyAI(four,0,true));
const legacy=room('AABBCC',player('이전 방'),false,3,{challenge:true});const legacyState=JSON.stringify(legacy);sqlite.prepare('INSERT INTO rooms VALUES (?,0,?,?)').run(legacy.code,legacyState,Date.now());
for(const action of ['state','join','start','newChallenge']){const retired=await post({action,code:legacy.code,token:legacy.players[0].token,name:'친구'});assert.equal(retired.status,410);assert.equal(retired.retiredMode,true);}
assert.equal((sqlite.prepare('SELECT state FROM rooms WHERE code=?').get(legacy.code) as any).state,legacyState,'rejected legacy resumes do not advance the game');
console.log('PASS: real route retires challenges without changing saved rooms; rejects two-seat creation; host-only add/remove; two humans plus one AI; capacity and lobby guards; concurrent bot finish; valid zero-sum settlement and two separate human records; timeout takeover stays void.');
