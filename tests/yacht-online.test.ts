import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
import {YACHT_CATEGORIES,allowedCategories} from '../lib/yacht-dice';
const openBox=(room:YachtRoom,seat:number)=>allowedCategories(room.match!.sheets[seat],room.match!.dice)[0];
import {reactYachtRoom,yachtPlayKey,YACHT_REACTIONS} from '../lib/yacht-room';
import {advanceYachtRoom,createYachtRoom,joinYachtRoom,restartYachtRoom,rollYachtRoom,scoreYachtRoom,startYachtRoom,viewYachtRoom,yachtRecordRows,yachtRoomPlayer,YACHT_TURN_MS,type YachtRoom} from '../lib/yacht-room';

const fixed=(...faces:number[])=>{let i=0;return ()=>faces[i++%faces.length];};
function lobby(size:2|3){const host=yachtRoomPlayer('방장',undefined,'dev-a');const room=createYachtRoom('ABC123',host,size);for(let i=1;i<size;i++)joinYachtRoom(room,yachtRoomPlayer(`친구${i}`,undefined,`dev-${i}`));return room;}
/** Each seat rolls once and writes the first open box, so a whole match runs in 12 × size turns. */
function playOut(room:YachtRoom,now=1000){
 for(let guard=0;guard<200&&room.phase==='playing';guard++){const seat=room.match!.turn;rollYachtRoom(room,seat,undefined,fixed(seat+1));scoreYachtRoom(room,seat,openBox(room,seat),now);}
}

test('2-player and 3-player rooms: seats, turn order, 12 rounds and places', () => {
 for(const size of [2,3] as const){
  const room=lobby(size);
  assert.throws(()=>joinYachtRoom(room,yachtRoomPlayer('초과')),/정원/);
  assert.throws(()=>startYachtRoom(room,1,0),/방장/);
  startYachtRoom(room,0,0);assert.equal(room.phase,'playing');assert.equal(room.match!.sheets.length,size);
  assert.throws(()=>rollYachtRoom(room,1,undefined),/차례/);
  rollYachtRoom(room,0,undefined,fixed(6));assert.deepEqual(room.match!.dice,[6,6,6,6,6]);
  scoreYachtRoom(room,0,'yacht',10);assert.equal(room.match!.turn,1);assert.equal(room.match!.round,1);
  playOut(room);
  assert.equal(room.phase,'ended');
  // Seat i always rolled all (i+1)s: higher faces score more, so seat order decides the places.
  const places=room.result!.players.map(p=>p.place);assert.equal(places.length,size);
  assert.equal(room.result!.players.filter(p=>p.winner).length,1);
  assert.equal(yachtRecordRows(room).length,size,'every human with a device key gets a record');
  restartYachtRoom(room,0,20);assert.equal(room.phase,'playing');assert.equal(room.matchNo,2);assert.deepEqual(room.match!.sheets.map(s=>Object.keys(s).length),Array(size).fill(0));
 }
});

test('reactions are a fixed set, throttled per seat, fade out, and never change the play key', () => {
 const room=lobby(2);startYachtRoom(room,0,0);const key=yachtPlayKey(room);
 assert.equal(reactYachtRoom(room,1,0,1000),true);
 assert.equal(reactYachtRoom(room,1,2,1500),false,'same seat too soon');
 assert.equal(reactYachtRoom(room,0,5,1500),true,'another seat may react');
 assert.throws(()=>reactYachtRoom(room,0,99,3000),/반응/);assert.throws(()=>reactYachtRoom(room,0,'hi',3000),/반응/);
 assert.equal(yachtPlayKey(room),key,'reactions do not move the game');
 assert.equal(viewYachtRoom(room,room.players[0].token,2000).reactions.length,2);
 assert.equal(viewYachtRoom(room,room.players[0].token,9000).reactions.length,0,'old reactions are gone');
 assert.equal(YACHT_REACTIONS.length,6);
 rollYachtRoom(room,0,undefined,fixed(3));assert.notEqual(yachtPlayKey(room),key,'a roll moves the play key');
});

test('held dice stay, an all-held reroll is refused, and joker scoring is shared with single play', () => {
 const room=lobby(2);startYachtRoom(room,0,0);
 rollYachtRoom(room,0,undefined,fixed(1,2,3,4,5));
 rollYachtRoom(room,0,[true,true,false,false,false],fixed(6));assert.deepEqual(room.match!.dice,[1,2,6,6,6]);
 assert.throws(()=>rollYachtRoom(room,0,[true,true,true,true,true]),/하나 이상/);
 assert.throws(()=>scoreYachtRoom(room,0,'nope',0),/점수 칸/);
 scoreYachtRoom(room,0,'sixes',0);assert.equal(room.match!.sheets[0].sixes,18);
 assert.throws(()=>scoreYachtRoom(room,1,'ones',0),/먼저/);
});

test('60-second timer: AI plays the turn, 3 in a row hands the seat to the AI, and that seat is not recorded', () => {
 const room=lobby(3);startYachtRoom(room,0,0);
 assert.equal(advanceYachtRoom(room,YACHT_TURN_MS-1),false);
 let now=YACHT_TURN_MS+1;
 assert.equal(advanceYachtRoom(room,now,fixed(3)),true);assert.equal(room.players[0].timeouts,1);assert.equal(room.match!.turn,1);
 assert.match(room.notice!.text,/시간 초과 1\/3/);
 // Seats 1 and 2 play by hand; seat 0 keeps timing out.
 for(let k=0;k<2;k++){
  for(const seat of [1,2]){rollYachtRoom(room,seat,undefined,fixed(2));scoreYachtRoom(room,seat,openBox(room,seat),now);}
  now+=YACHT_TURN_MS+1;advanceYachtRoom(room,now,fixed(4));
 }
 assert.equal(room.players[0].replaced,true);assert.match(room.notice!.text,/AI가 자리를 이어받았어요/);
 assert.throws(()=>rollYachtRoom(room,0,undefined),/차례|AI/);
 // From now on seat 0 is played immediately whenever its turn comes, without waiting.
 for(let guard=0;guard<100&&room.phase==='playing';guard++){
  const seat:number=(room.match as {turn:number}).turn;if(seat===0){assert.equal(advanceYachtRoom(room,now,fixed(5)),true);continue;}
  rollYachtRoom(room,seat,undefined,fixed(2));scoreYachtRoom(room,seat,openBox(room,seat),now);advanceYachtRoom(room,now,fixed(5));
 }
 assert.equal(room.phase,'ended');assert.equal(room.result!.players[0].replaced,true);
 assert.deepEqual(yachtRecordRows(room).map(r=>r.device),['dev-1','dev-2']);
 // A manual score resets the timeout streak.
 const fresh=lobby(2);startYachtRoom(fresh,0,0);advanceYachtRoom(fresh,YACHT_TURN_MS+1,fixed(2));
 rollYachtRoom(fresh,1,undefined,fixed(1));scoreYachtRoom(fresh,1,openBox(fresh,1),YACHT_TURN_MS+2);
 rollYachtRoom(fresh,0,undefined,fixed(1));scoreYachtRoom(fresh,0,openBox(fresh,0),YACHT_TURN_MS+3);assert.equal(fresh.players[0].timeouts,0);
});

test('views never expose other players\' tokens or device keys', () => {
 const room=lobby(3);startYachtRoom(room,0,0);
 const text=JSON.stringify(viewYachtRoom(room,room.players[1].token,0));
 for(const p of room.players){assert.ok(!text.includes(p.token));assert.ok(!text.includes(p.profile!));}
 assert.equal(viewYachtRoom(room,room.players[1].token,0).me,1);
});

test('API: create/join/start/roll/score, stale screens, tile/yacht code mix-ups, records and history', async () => {
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(`CREATE TABLE rooms(code TEXT PRIMARY KEY,revision INTEGER,state TEXT,updated INTEGER);CREATE TABLE match_records(id TEXT PRIMARY KEY,device TEXT,name TEXT,at INTEGER,win INTEGER,points INTEGER,size INTEGER,result TEXT);CREATE TABLE shared_scores(id TEXT PRIMARY KEY,device TEXT,name TEXT,mode TEXT,size INTEGER,kind TEXT,score INTEGER,at INTEGER,entry_id TEXT);CREATE TABLE record_retention(id TEXT PRIMARY KEY NOT NULL,cursor TEXT NOT NULL DEFAULT '',complete INTEGER NOT NULL DEFAULT 1);INSERT INTO record_retention VALUES('top10-v1','',1);`);
 class Statement{constructor(public sql:string,public args:any[]=[]){}bind(...args:any[]){return new Statement(this.sql,args);}async first(){return sqlite.prepare(this.sql).get(...this.args)||null;}async all(){return {results:sqlite.prepare(this.sql).all(...this.args)};}async run(){return {meta:{changes:Number(sqlite.prepare(this.sql).run(...this.args).changes)}};}}
 const db={prepare:(sql:string)=>new Statement(sql),batch:async(ss:Statement[])=>{sqlite.exec('BEGIN');try{const results=ss.map(s=>({meta:{changes:Number(sqlite.prepare(s.sql).run(...s.args).changes)}}));sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 (globalThis as any).__yachtTestEnv={DB:db};
 let source=readFileSync('app/api/game/route.ts','utf8').replace('import { env } from "cloudflare:workers";','const env=(globalThis as any).__yachtTestEnv;');
 source=source.replace(/(['"])\.\.\/\.\.\/\.\.\/lib\/([^'"]+)\1/g,(_,q,name)=>JSON.stringify(pathToFileURL(process.cwd()+'/lib/'+name+'.ts').href));
 const {POST}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
 const post=async(body:any)=>{const response=await POST(new Request('https://turntale.test/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://turntale.test'},body:JSON.stringify(body)}));return {status:response.status,...await response.json() as any};};
 const devices=[crypto.randomUUID(),crypto.randomUUID(),crypto.randomUUID()];

 assert.equal((await post({action:'yachtCreate',size:4,profileToken:devices[0]})).status,400);
 let a=await post({action:'yachtCreate',size:3,name:'방장',profileToken:devices[0]});assert.equal(a.status,200);const code=a.room.code,host=a.token;
 assert.equal(a.room.phase,'lobby');assert.equal(a.room.size,3);
 const b=await post({action:'yachtJoin',code,name:'둘',profileToken:devices[1]}),c=await post({action:'yachtJoin',code,name:'셋',profileToken:devices[2]});
 assert.equal(b.status,200);assert.equal(c.room.players.length,3);
 assert.equal((await post({action:'yachtJoin',code,name:'넷'})).status,400,'room is full');
 assert.equal((await post({action:'join',code,name:'패 대전'})).yachtRoom,true,'tile join on a yacht code explains itself');
 let s=await post({action:'yachtState',code,token:b.token});
 assert.equal((await post({action:'yachtStart',code,token:b.token,revision:s.revision})).status,400,'only the host starts');
 a=await post({action:'yachtStart',code,token:host,revision:s.revision});assert.equal(a.status,200);assert.equal(a.room.phase,'playing');
 assert.equal((await post({action:'yachtRoll',code,token:host,revision:a.revision-1})).status,409,'a stale screen cannot roll');
 const rolled=await post({action:'yachtRoll',code,token:host,revision:a.revision});assert.equal(rolled.status,200);assert.equal(rolled.room.match.rollsLeft,2);
 const double=await post({action:'yachtRoll',code,token:host,revision:a.revision});assert.equal(double.status,409,'a double tap does not roll twice');
 a=await post({action:'yachtScore',code,token:host,revision:rolled.revision,category:'choice'});assert.equal(a.status,200);assert.equal(a.room.match.turn,1);
 // An opponent's reaction bumps the row revision, but a move sent with the current play key still goes through.
 const seen=await post({action:'yachtState',code,token:b.token});
 const cheer=await post({action:'yachtReact',code,token:c.token,emoji:1});assert.equal(cheer.status,200);assert.equal(cheer.room.reactions.length,1);
 assert.ok(cheer.revision>seen.revision);
 const afterCheer=await post({action:'yachtRoll',code,token:b.token,revision:seen.revision,playKey:seen.room.playKey});assert.equal(afterCheer.status,200,'reaction does not refuse a fresh roll');
 assert.equal((await post({action:'yachtRoll',code,token:b.token,revision:afterCheer.revision,playKey:seen.room.playKey})).status,409,'an old play key is still refused');
 a=await post({action:'yachtScore',code,token:b.token,revision:afterCheer.revision,playKey:afterCheer.room.playKey,category:'choice'});assert.equal(a.status,200);

 // Jump to the last turn of the match and finish it through the API.
 const row=sqlite.prepare('SELECT state FROM rooms WHERE code=?').get(code) as any,room=JSON.parse(row.state) as YachtRoom;
 room.match!.round=12;room.match!.turn=2;room.match!.rollsLeft=3;
 room.match!.sheets=room.match!.sheets.map(()=>Object.fromEntries(YACHT_CATEGORIES.filter(cat=>cat!=='yacht').map(cat=>[cat,5])));
 room.turnDeadline=Date.now()+YACHT_TURN_MS;sqlite.prepare('UPDATE rooms SET state=? WHERE code=?').run(JSON.stringify(room),code);
 s=await post({action:'yachtState',code,token:c.token});
 const last=await post({action:'yachtRoll',code,token:c.token,revision:s.revision});
 const done=await post({action:'yachtScore',code,token:c.token,revision:last.revision,category:'yacht'});
 assert.equal(done.status,200);assert.equal(done.room.phase,'ended');assert.equal(done.room.result.players.length,3);
 assert.equal((sqlite.prepare('SELECT COUNT(*) AS n FROM yacht_records').get() as any).n,3);
 assert.equal((sqlite.prepare('SELECT COUNT(*) AS n FROM match_records').get() as any).n,0,'tile records stay untouched');
 const again=await post({action:'yachtState',code,token:host});assert.equal(again.room.phase,'ended');
 assert.equal((sqlite.prepare('SELECT COUNT(*) AS n FROM yacht_records').get() as any).n,3,'records are written exactly once');
 const history=await post({action:'yachtHistory',profileToken:devices[2]});assert.equal(history.status,200);assert.equal(history.summary.games,1);assert.equal(history.records.length,1);
 assert.equal((await post({action:'yachtState',code,token:'nobody'})).status,403);
 const text=JSON.stringify(again);for(const d of devices)assert.ok(!text.includes(d));
});
