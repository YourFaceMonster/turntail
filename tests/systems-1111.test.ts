import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
import {dailyDate,dailySeed,shuffleDaily,seededRandom} from '../lib/daily';
import {dailyFinishStatement} from '../lib/daily-server';
import {player,room,start} from '../lib/game';
import {addRelicActivations} from '../lib/relic-tally';
import {DICE_SKINS,diceSkinOpen,earnedAchievementCount} from '../lib/dice-skins';

test('daily date follows Korean midnight and the shuffle is the same for everyone that day', () => {
 assert.equal(dailyDate(Date.parse('2026-11-11T14:59:00Z')),'2026-11-11');
 assert.equal(dailyDate(Date.parse('2026-11-11T15:00:00Z')),'2026-11-12','00:00 KST opens the next table');
 const a=shuffleDaily(Array.from({length:60},(_,i)=>i),'2026-11-11'),b=shuffleDaily(Array.from({length:60},(_,i)=>i),'2026-11-11');
 assert.deepEqual(a,b);assert.notDeepEqual(a,shuffleDaily(Array.from({length:60},(_,i)=>i),'2026-11-12'));
 assert.deepEqual([...a].sort((x,y)=>x-y),Array.from({length:60},(_,i)=>i),'still a permutation');
 const r=seededRandom(dailySeed('x'));for(let i=0;i<100;i++){const v=r();assert.ok(v>=0&&v<1);}
});

test('a daily game deals identical hands, and only one round can be played', () => {
 const make=()=>{const g=room('AAAAAA',player('나'),true,3);g.daily={date:'2026-11-11',ranked:true};g.players.push(player('달빛',true),player('해솔',true));start(g);return g;};
 const one=make(),two=make();
 assert.deepEqual(one.players.map(p=>p.hand.map(t=>t.id)),two.players.map(p=>p.hand.map(t=>t.id)));
 assert.deepEqual(one.stacks,two.stacks);
 one.phase='ended';assert.throws(()=>start(one),/한 판만/);
});

test('API: daily board, first table is ranked, later ones are practice, finished score shows once', async () => {
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(`CREATE TABLE rooms(code TEXT PRIMARY KEY,revision INTEGER,state TEXT,updated INTEGER);CREATE TABLE match_records(id TEXT PRIMARY KEY,device TEXT,name TEXT,at INTEGER,win INTEGER,points INTEGER,size INTEGER,result TEXT);CREATE TABLE shared_scores(id TEXT PRIMARY KEY,device TEXT,name TEXT,mode TEXT,size INTEGER,kind TEXT,score INTEGER,at INTEGER,entry_id TEXT);CREATE TABLE record_retention(id TEXT PRIMARY KEY NOT NULL,cursor TEXT NOT NULL DEFAULT '',complete INTEGER NOT NULL DEFAULT 1);INSERT INTO record_retention VALUES('top10-v1','',1);`);
 class Statement{constructor(public sql:string,public args:any[]=[]){}bind(...args:any[]){return new Statement(this.sql,args);}async first(){return sqlite.prepare(this.sql).get(...this.args)||null;}async all(){return {results:sqlite.prepare(this.sql).all(...this.args)};}async run(){return {meta:{changes:Number(sqlite.prepare(this.sql).run(...this.args).changes)}};}}
 const db={prepare:(sql:string)=>new Statement(sql),batch:async(ss:Statement[])=>{sqlite.exec('BEGIN');try{const results=ss.map(s=>({meta:{changes:Number(sqlite.prepare(s.sql).run(...s.args).changes)}}));sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 (globalThis as any).__dailyTestEnv={DB:db};
 let source=readFileSync('app/api/game/route.ts','utf8').replace('import { env } from "cloudflare:workers";','const env=(globalThis as any).__dailyTestEnv;');
 source=source.replace(/(['"])\.\.\/\.\.\/\.\.\/lib\/([^'"]+)\1/g,(_,q,name)=>JSON.stringify(pathToFileURL(process.cwd()+'/lib/'+name+'.ts').href));
 const {POST}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
 const post=async(body:any)=>{const response=await POST(new Request('https://turntale.test/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://turntale.test'},body:JSON.stringify(body)}));return {status:response.status,...await response.json() as any};};
 const [me,friend]=[crypto.randomUUID(),crypto.randomUUID()];

 let board=await post({action:'dailyBoard',profileToken:me});assert.equal(board.status,200);assert.equal(board.attempt,'none');assert.equal(board.rows.length,0);
 const first=await post({action:'create',daily:true,name:'나',profileToken:me});assert.equal(first.status,200);
 assert.equal(first.game.daily.ranked,true);assert.equal(first.game.practice,true);assert.equal(first.game.players.length,3);
 const again=await post({action:'create',daily:true,name:'나',profileToken:me});assert.equal(again.game.daily.ranked,false,'second table today is practice');
 const other=await post({action:'create',daily:true,name:'친구',profileToken:friend});assert.equal(other.game.daily.ranked,true);
 assert.deepEqual(other.game.players[0].hand.map((t:any)=>t.id),first.game.players[0].hand.map((t:any)=>t.id),'same deal for everyone');
 board=await post({action:'dailyBoard',profileToken:me});assert.equal(board.attempt,'started');assert.equal(board.rows.length,0,'unfinished tables never show');

 // Finish the ranked table (the route does this in the same batch as the room update).
 const {deviceKeyFor}={deviceKeyFor:async(secret:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret))),x=>x.toString(16).padStart(2,'0')).join('')};
 const key=await deviceKeyFor(me),rev=(sqlite.prepare('SELECT revision FROM rooms WHERE code=?').get(first.game.code) as any).revision;
 const s=dailyFinishStatement(db as any,key,dailyDate(),first.game.code,7,true,Date.now(),rev);
 assert.equal((await s.run()).meta.changes,1);assert.equal((await s.run()).meta.changes,0,'filled in once');
 assert.equal((await dailyFinishStatement(db as any,key,dailyDate(),again.game.code,99,true,Date.now(),1).run()).meta.changes,0,'a practice table cannot overwrite it');
 board=await post({action:'dailyBoard',profileToken:me});
 assert.equal(board.attempt,'done');assert.equal(board.rows.length,1);assert.equal(board.rows[0].score,7);assert.equal(board.rows[0].isMe,true);assert.equal(board.mine.rank,1);
 assert.ok(!JSON.stringify(board).includes(key),'device keys stay private');
 // A lost round records its minus score too, ranked below the plus score.
 const friendKey=await deviceKeyFor(friend),friendRev=(sqlite.prepare('SELECT revision FROM rooms WHERE code=?').get(other.game.code) as any).revision;
 assert.equal((await dailyFinishStatement(db as any,friendKey,dailyDate(),other.game.code,-5,false,Date.now(),friendRev).run()).meta.changes,1);
 board=await post({action:'dailyBoard',profileToken:friend});
 assert.equal(board.total,2);assert.deepEqual(board.rows.map((r:any)=>r.score),[7,-5]);assert.equal(board.mine.score,-5);assert.equal(board.mine.rank,2);assert.equal(board.mine.win,false);
});

test('relic activation counts: each activation once per run, cursors kept small', () => {
 let store={counts:{},runs:{}} as ReturnType<typeof addRelicActivations>;
 store=addRelicActivations(store,'run-1',[{seq:1,relicId:'a'},{seq:2,relicId:'b'}]);
 store=addRelicActivations(store,'run-1',[{seq:1,relicId:'a'},{seq:2,relicId:'b'},{seq:3,relicId:'a'}]);
 assert.deepEqual(store.counts,{a:2,b:1});
 for(let i=2;i<15;i++)store=addRelicActivations(store,`run-${i}`,[{seq:1,relicId:'a'}]);
 assert.equal(store.counts.a,15);assert.ok(Object.keys(store.runs).length<=8);
});

test('dice skins open by achievement count, the last one by completing everything', () => {
 const state=(ids:string[])=>({unlocked:Object.fromEntries(ids.map(id=>[id,1]))});
 assert.equal(earnedAchievementCount(state(['a','b','all-achievements'])),2);
 const open=(ids:string[])=>DICE_SKINS.filter(skin=>diceSkinOpen(skin,state(ids))).map(skin=>skin.id);
 assert.deepEqual(open([]),['ivory']);
 assert.deepEqual(open(['a','b','c']),['ivory','obsidian']);
 assert.deepEqual(open(Array.from({length:10},(_,i)=>`x${i}`)),['ivory','obsidian','jade','gilded']);
 assert.ok(open(['all-achievements']).includes('crimson'));
 assert.match(readFileSync('app/dice-skins.css','utf8'),/data-dice-skin="crimson"/);
});

test('challenge rules only make a new journey harder, and stay fixed for it', async () => {
 const {createRpgJourneyGame}=await import('../lib/rpg-game');
 const {RPG_STAGE_HP}=await import('../lib/rpg-rework');
 const {rpgRelicSlots,cleanTrials}=await import('../lib/rpg-trials');
 const plain=createRpgJourneyGame('나','',1000).rpgRun!;
 assert.equal(plain.trials,undefined);assert.equal(plain.hp[0],100);assert.equal(rpgRelicSlots(plain),3);
 const hard=createRpgJourneyGame('나','',1000,'swordsman',['weak-heart','fierce-foes','lone-relic']).rpgRun!;
 assert.deepEqual(hard.trials,['weak-heart','fierce-foes','lone-relic']);
 assert.equal(hard.hp[0],70);
 assert.deepEqual(hard.hp.slice(1),RPG_STAGE_HP[0].map(hp=>Math.ceil(hp*1.2)));
 assert.equal(rpgRelicSlots(hard),1);assert.ok(hard.equipped.length<=1);
 assert.deepEqual(cleanTrials(['weak-heart','weak-heart','bogus',3]),['weak-heart'],'unknown ids are dropped');
 assert.equal(hard.coins,plain.coins,'no reward is attached');
});