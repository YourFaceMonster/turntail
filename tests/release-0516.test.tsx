import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {renderToStaticMarkup} from 'react-dom/server';
import {maintainRecords} from '../lib/record-retention';
import {mergeScoreHistory,topScores,type HighScore} from '../lib/challenge';
import {readStageArchive,saveStageGame,STAGE_STORAGE_KEY} from '../lib/stage-storage';
import {createStageGame} from '../lib/stage-game';
import {stageRecord} from '../lib/stage-challenge';
import {STAGE_THEMES} from '../lib/stage-theme';
import {stageModel,STAGE_MODEL_SIZE} from '../lib/stage-models';
import EntranceSeats from '../app/components/EntranceSeats';
import {StagePortrait} from '../app/components/StagePortrait';
import {StageVisuals} from '../app/components/StageVisuals';
import TileFace from '../app/components/TileFace';
import {runLocalBot} from '../lib/local-bot';
import {room,player,start,botMove,type Game} from '../lib/game';
const rows:HighScore[]=Array.from({length:42},(_,i)=>({id:`single:round:${i}`,mode:'single',size:3,kind:'single',score:i,at:100+i}));
const retained=mergeScoreHistory(rows,rows);assert.equal(retained.length,10);assert.deepEqual(retained.map(x=>x.score),[41,40,39,38,37,36,35,34,33,32]);assert.deepEqual(mergeScoreHistory(retained,[rows[0]]),retained);
assert.equal(topScores([...rows,{...rows[41],id:'tie',at:1}],'single',3,'single')[0].id,'tie');
const memory=new Map<string,string>(),storage={getItem:(k:string)=>memory.get(k)||null,setItem:(k:string,v:string)=>{memory.set(k,v);}};
const g=createStageGame('보존'),original=JSON.stringify(g),records=Array.from({length:18},(_,i)=>({...stageRecord(g.stageRun!,'보존'),id:'r'+i,updatedAt:i,startedAt:i}));
storage.setItem(STAGE_STORAGE_KEY,JSON.stringify({version:1,active:g,records}));assert.equal(readStageArchive(storage).records.length,10);assert.equal(JSON.parse(storage.getItem(STAGE_STORAGE_KEY)!).records.length,10);assert.equal(JSON.stringify(readStageArchive(storage).active),original);
const saved=saveStageGame(storage,g);assert.equal(saved.records.length,10);assert.ok(saved.records.some(r=>r.id===g.stageRun!.id));assert.equal(JSON.stringify(saved.active),original);
const seen=new Set<string>();for(const theme of STAGE_THEMES){const company=theme.opponents.slice(0,2).map(p=>({name:p.name,avatar:`stage-portrait:${p.portrait}`,count:10,points:200}));const html=renderToStaticMarkup(<EntranceSeats company={company} diameter={1900} cx={681} cy={468} stage={theme.stage}/>);assert.equal((html.match(/class="stage-painted-model"/g)||[]).length,2);assert.ok(!html.includes('figure-volume'));
 for(const p of theme.opponents.slice(0,2)){const m=stageModel(p.portrait);seen.add(m.rect.join());for(const rect of [m.rect,[m.face[0],m.face[1],m.face[2],m.face[2]]]){assert.ok(rect[0]>=0&&rect[1]>=0&&rect[0]+rect[2]<=STAGE_MODEL_SIZE.width&&rect[1]+rect[3]<=STAGE_MODEL_SIZE.height);}assert.ok(renderToStaticMarkup(<StagePortrait index={p.portrait}/>).includes('/stage-company-0516.webp'));}
 const tile=renderToStaticMarkup(<StageVisuals stage={theme.stage}><TileFace tile={{id:20,n:6,s:1}}/></StageVisuals>);assert.ok(tile.includes('data-stage-texture')&&tile.includes('data-tile-finish="cartoon"'));}
assert.equal(seen.size,20);
const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort().slice(0,3))sql.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const add=sql.prepare('INSERT INTO match_records VALUES (?,?,?,?,?,?,?,?)');for(let i=0;i<25;i++){const result={id:`OLD:${i}`,at:i,players:[{id:'p',delta:25-i}],voided:false};add.run(result.id+':p','device','이름',i,1,25-i,3,JSON.stringify(result));}
sql.exec(fs.readFileSync('drizzle/0003_ten_record_limit.sql','utf8'));
class SQLStatement{constructor(public text:string,public args:any[]=[]){ }bind(...args:any[]){return new SQLStatement(this.text,args);}async all(){return {results:sql.prepare(this.text).all(...this.args)};}async first(){return sql.prepare(this.text).get(...this.args)||null;}async run(){return {meta:{changes:Number(sql.prepare(this.text).run(...this.args).changes)}};}}
const retentionDb={prepare:(text:string)=>new SQLStatement(text),batch:async(statements:SQLStatement[])=>{sql.exec('BEGIN');try{const out=[];for(const statement of statements)out.push(await statement.run());sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};
assert.equal(await maintainRecords(retentionDb),true);assert.equal((sql.prepare('SELECT COUNT(*) n FROM match_records').get() as any).n,10);assert.equal((sql.prepare('SELECT COUNT(*) n FROM shared_scores').get() as any).n,10);assert.equal((sql.prepare('SELECT MAX(score) n FROM shared_scores').get() as any).n,25,'old high score survives recent-history pruning');sql.close();
// Worker replies are cloned; cancellation terminates work and never publishes a stale move.
const originalWorker=globalThis.Worker;let terminated=0;
class FakeWorker{onmessage:any;onerror:any;timer:any;postMessage(game:Game){this.timer=setTimeout(()=>{const copy=structuredClone(game);botMove(copy);this.onmessage({data:{game:copy}});},5);}terminate(){terminated++;clearTimeout(this.timer);}}
Object.defineProperty(globalThis,'Worker',{configurable:true,value:FakeWorker});
const botGame=room('BOT123',player('나'),true,3);botGame.players.push(player('AI1',true),player('AI2',true));start(botGame);botGame.turn=1;botGame.turnReadyAt=0;botGame.players[1].hand=[{id:8,n:3,s:0}];const before=JSON.stringify(botGame);
const moved=await runLocalBot(botGame,new AbortController().signal);assert.equal(moved.phase,'ended');assert.equal(JSON.stringify(botGame),before);const c=new AbortController(),promise=runLocalBot(botGame,c.signal);c.abort();await assert.rejects(promise,{name:'AbortError'});assert.ok(terminated>=2);
Object.defineProperty(globalThis,'Worker',{configurable:true,value:class{constructor(){throw Error('unsupported');}}});assert.equal((await runLocalBot(structuredClone(botGame),new AbortController().signal)).phase,'ended');Object.defineProperty(globalThis,'Worker',{configurable:true,value:originalWorker});
console.log('PASS: top-ten physical retention, stable ties, atomic active save, all 20 stage models/face crops, cartoon stage tiles, historical SQL retention, isolated AI worker replies, termination/cancellation and unsupported-worker fallback.');
