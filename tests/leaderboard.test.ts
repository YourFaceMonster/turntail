import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
const sqlite=new DatabaseSync(':memory:');
for(const name of fs.readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())sqlite.exec(fs.readFileSync('drizzle/'+name,'utf8'));
class Statement{
 sql:string;args:any[];constructor(sql:string,args:any[]=[]){this.sql=sql;this.args=args;}
 bind(...args:any[]){return new Statement(this.sql,args);}
 async all(){return {results:sqlite.prepare(this.sql).all(...this.args)};}
 async first(){return sqlite.prepare(this.sql).get(...this.args)||null;}
 async run(){return {meta:{changes:Number(sqlite.prepare(this.sql).run(...this.args).changes)}};}
}
const db={prepare:(sql:string)=>new Statement(sql),batch:async(statements:Statement[])=>{sqlite.exec('BEGIN');try{const rows=[];for(const s of statements)rows.push(await s.run());sqlite.exec('COMMIT');return rows;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
let source=fs.readFileSync('app/api/game/route.ts','utf8').replace('import { env } from "cloudflare:workers";','const env=(globalThis as any).__boardTest;');
for(const name of ['game','social','challenge','history','leaderboard'])source=source.replaceAll('"../../../lib/'+name+'"',JSON.stringify(pathToFileURL(process.cwd()+'/lib/'+name+'.ts').href));
(globalThis as any).__boardTest={DB:db};
const {POST}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
const post=async(body:any,origin='https://turntale.test')=>{const r=await POST(new Request('https://turntale.test/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)}));return {status:r.status,data:await r.json() as any};};
const a=crypto.randomUUID(),b=crypto.randomUUID(),now=Date.now(),at=now-10000;
const score=(id:string,points:number,at:number,kind='ten',size=3)=>({id:`single:${kind==='ten'?'ten':'round'}:${id}`,mode:'single',size,kind,score:points,at});
const sync=(profileToken:string,name:string,scores:any[])=>post({action:'syncScores',profileToken,name,scores});
const board=(profileToken=a,mode='single',kind='ten',size=3,page=0)=>post({action:'leaderboard',profileToken,mode,kind,size,page});
assert.equal((await sync(a,'먼저', [score('a',80,at)])).status,200);
assert.equal((await sync(b,'나중', [score('b',80,at+1)])).status,200);
let r=await board();assert.deepEqual(r.data.rows.map((x:any)=>[x.name,x.rank]),[['먼저',1],['나중',2]]);assert.equal(r.data.mine.rank,1);assert.equal(r.data.total,2);
assert.equal((await sync(a,'새 닉네임',[score('a',80,at),score('lower',30,at+2)])).status,200);r=await board();assert.equal(r.data.total,2);assert.equal(r.data.rows[0].name,'새 닉네임');assert.equal(r.data.rows[0].score,80);
assert.equal((await sync(b,'나중',[score('better',95,at+3)])).status,200);r=await board();assert.equal(r.data.rows[0].name,'나중');assert.equal(r.data.mine.rank,2);
for(let i=0;i<23;i++)assert.equal((await sync(crypto.randomUUID(),'참가자'+i,[score('p'+i,i,at+i+10)])).status,200);
r=await board();assert.equal(r.data.total,25);assert.equal(r.data.rows.length,20);assert.equal(r.data.rows[0].rank,1);r=await board(a,'single','ten',3,1);assert.equal(r.data.rows.length,5);assert.equal(r.data.rows[0].rank,21);assert.equal(r.data.mine.rank,2);
assert.equal((await board(a,'multi')).data.total,0);assert.equal((await board(a,'single','single')).data.total,0);assert.equal((await board(a,'single','ten',2)).data.total,0);
assert.equal((await sync(a,'invalid',[score('bad',99999,at)])).status,400);
assert.equal((await sync(a,'invalid',[{...score('bad',50,at),mode:'multi'}])).status,400);
assert.equal((await sync(a,'invalid',[score('future',50,now+120000)])).status,400);
assert.equal((await sync('invalid','invalid',[score('bad',1,at)])).status,400);
assert.equal((await board(a,'single','ten',3,-1)).status,400);
assert.equal((await post({action:'leaderboard',mode:'single',kind:'ten',size:3},'https://other.test')).status,403);
assert.equal((await board()).data.total,25);
// Existing server-authoritative multiplayer records appear without requiring anyone to reconnect.
const result={id:'ROOM01:10',at,voided:false,players:[{id:'p1',delta:8},{id:'p2',delta:-8}],challenge:{id:'c',size:2,completed:10,complete:true,scores:[31,-31],roundIds:['ROOM01:10']}};
const ins=sqlite.prepare('INSERT INTO match_records (id,device,name,at,win,points,size,result) VALUES (?,?,?,?,?,?,?,?)');
ins.run(result.id+':p1','server-one','멀티1',at,1,8,2,JSON.stringify(result));ins.run(result.id+':p2','server-two','멀티2',at,0,-8,2,JSON.stringify(result));
ins.run('VOID:1:p1','server-void','무효',at+1,1,9,2,JSON.stringify({...result,id:'VOID:1',voided:true,challenge:{...result.challenge,roundIds:['VOID:1']}}));
r=await board(a,'multi','ten',2);assert.equal(r.status,200);assert.deepEqual(r.data.rows.map((x:any)=>x.score),[31,-31]);assert.equal(r.data.total,2);
r=await board(a,'multi','single',2);assert.deepEqual(r.data.rows.map((x:any)=>x.score),[8,-8]);
const publicText=JSON.stringify(r.data);assert.ok(!publicText.includes('server-one')&&!publicText.includes('entryId')&&!publicText.includes('device')&&!publicText.includes('profileToken'));
// A separate device sees the same shared list; my-rank stays scoped to its own token.
const stranger=await board(crypto.randomUUID());assert.equal(stranger.data.total,25);assert.equal(stranger.data.mine,null);assert.ok(stranger.data.rows.every((x:any)=>!x.isMe));
sqlite.close();
console.log('PASS: real SQLite migrations + API shared scores, two-device visibility, best-per-player, prior-achievement ties, negative multiplayer totals, historical multiplayer backfill, void exclusion, 25-player pagination, own rank, dedup, bounds, origin checks and private-token redaction.');
