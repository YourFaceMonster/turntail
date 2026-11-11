/** /api/game handlers for online Yacht Dice rooms. Same `rooms` row + revision compare-and-swap as the tile game. */
import {advanceYachtRoom,createYachtRoom,isYachtRoom,joinYachtRoom,reactYachtRoom,yachtPlayKey,restartYachtRoom,rollYachtRoom,scoreYachtRoom,startYachtRoom,viewYachtRoom,yachtRecordRows,yachtRoomPlayer,YACHT_RECORDS_INDEX_SQL,YACHT_RECORDS_TABLE_SQL,type YachtRoom} from './yacht-room';

/** Same loose D1 shape as record-retention.ts, so tests can pass a small fake. */
export type YachtDb={prepare:(sql:string)=>any,batch:(statements:any[])=>Promise<any[]>};
type Reply=(body:unknown,status?:number)=>Response;
export const YACHT_ACTIONS=['yachtJoin','yachtState','yachtStart','yachtRoll','yachtScore','yachtRestart','yachtReact'] as const;

async function ensureRecords(db:YachtDb){await db.prepare(YACHT_RECORDS_TABLE_SQL).run();await db.prepare(YACHT_RECORDS_INDEX_SQL).run();}

export async function createYachtRoomRequest(db:YachtDb,b:any,profile:string|null,avatar:string|undefined,reply:Reply){
 const host=yachtRoomPlayer(String(b.name||'방장'),avatar,profile||undefined);
 for(let k=0;k<5;k++){
  const code=crypto.randomUUID().replaceAll('-','').slice(0,6).toUpperCase(),room=createYachtRoom(code,host,b.size);
  const r=await db.prepare('INSERT OR IGNORE INTO rooms (code,revision,state,updated) VALUES (?,0,?,?)').bind(code,JSON.stringify(room),Date.now()).run();
  if(r.meta.changes)return reply({token:host.token,room:viewYachtRoom(room,host.token),revision:0});
 }
 throw Error('방을 다시 만들어 주세요.');
}

export async function yachtHistoryRequest(db:YachtDb,profile:string|null,reply:Reply){
 if(!profile)return reply({error:'기기 기록을 확인하지 못했어요.'},400);
 await ensureRecords(db);
 const summary=await db.prepare('SELECT COUNT(*) AS games,COALESCE(SUM(win),0) AS wins,COALESCE(MAX(score),0) AS best FROM yacht_records WHERE device=?').bind(profile).first();
 const records=await db.prepare('SELECT id,at,size,place,score,win FROM yacht_records WHERE device=? ORDER BY at DESC LIMIT 10').bind(profile).all();
 return reply({summary,records:records.results});
}

/** Runs one yacht action on an existing room row. `state` is the parsed row; the caller retries on a lost race. */
export async function yachtRoomRequest(db:YachtDb,code:string,row:{state:string,revision:number},b:any,profile:string|null,avatar:string|undefined,reply:Reply):Promise<Response|null>{
 const room=JSON.parse(row.state) as YachtRoom;if(!isYachtRoom(room))return reply({error:'일반 대전 방이에요. 멀티플레이에서 일반 대전을 골라 참가해 주세요.'},409);
 const now=Date.now(),wasEnded=room.phase==='ended';let token=String(b.token||''),changed=false;
 if(b.action==='yachtJoin'){
  if(!room.players.some(p=>p.token===token)){const p=yachtRoomPlayer(String(b.name||'플레이어'),avatar,profile||undefined);joinYachtRoom(room,p);token=p.token;changed=true;}
 }else{
  const me=room.players.findIndex(p=>p.token===token);if(me<0)return reply({error:'입장 정보가 없어요.'},403);
  changed=advanceYachtRoom(room,now);
  if(b.action==='yachtState'){}
  else if(b.action==='yachtReact'){if(reactYachtRoom(room,me,b.emoji,now))changed=true;}
  else if(changed)return save(true);
  // A stale screen (or a double tap racing itself) must not roll or score twice. Newer clients send the
  // play key, so an opponent's reaction (which bumps the row revision) never refuses a fresh move.
  else if(typeof b.playKey==='string'?b.playKey!==yachtPlayKey(room):b.revision!==row.revision)return reply({error:'화면을 최신 상태로 맞췄어요. 다시 선택해 주세요.',token,room:viewYachtRoom(room,token,now),revision:row.revision},409);
  else if(b.action==='yachtStart')startYachtRoom(room,me,now);
  else if(b.action==='yachtRoll')rollYachtRoom(room,me,b.held);
  else if(b.action==='yachtScore')scoreYachtRoom(room,me,b.category,now);
  else if(b.action==='yachtRestart')restartYachtRoom(room,me,now);
  else throw Error('알 수 없는 요청이에요.');
  if(b.action!=='yachtState'&&b.action!=='yachtReact')changed=true;
 }
 return save(false);
 async function save(skipped:boolean):Promise<Response|null>{
  if(!changed)return reply({token,room:viewYachtRoom(room,token,now),revision:row.revision});
  const statements=[db.prepare('UPDATE rooms SET state=?,revision=revision+1,updated=? WHERE code=? AND revision=?').bind(JSON.stringify(room),now,code,row.revision)];
  const rows=!wasEnded&&room.phase==='ended'?yachtRecordRows(room):[];
  if(rows.length)await ensureRecords(db);
  for(const r of rows)statements.push(db.prepare("INSERT OR IGNORE INTO yacht_records (id,device,name,at,size,place,score,win,result) SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM rooms WHERE code=? AND revision=?)").bind(r.id,r.device,r.name,r.at,r.size,r.place,r.score,r.win,r.result,code,row.revision+1));
  const updates=await db.batch(statements);
  if(!updates[0].meta.changes)return null;
  const body={token,room:viewYachtRoom(room,token,now),revision:row.revision+1};
  return skipped?reply({...body,error:'시간 초과로 차례가 넘어갔어요.'},409):reply(body);
 }
}
