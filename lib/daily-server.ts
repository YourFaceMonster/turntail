/** /api/game handlers for 오늘의 판. The score comes from the server-run round, never from the browser. */
import {DAILY_INDEX_SQL,DAILY_PAGE,DAILY_PRUNE_SQL,DAILY_TABLE_SQL,dailyDate,dailyPruneBefore,isDailyDate} from './daily';

type Db={prepare:(sql:string)=>any,batch:(statements:any[])=>Promise<any[]>};
type Reply=(body:unknown,status?:number)=>Response;

export async function ensureDailyTable(db:Db){await db.prepare(DAILY_TABLE_SQL).run();await db.prepare(DAILY_INDEX_SQL).run();}

/**
 * Reserve today's ranked attempt for this device. Returns true when this new table is the ranked one.
 * 2026-11-11 user choice (A): if today's ranked table never finished (left, closed, connection lost), the next
 * table takes over the ranked slot. The old table's finish statement is guarded by its room code, so it can no
 * longer write a score. Once a ranked round finishes (done=1), later tables that day are practice.
 */
export async function claimDailyAttempt(db:Db,profile:string|null,name:string,code:string,now=Date.now()){
 if(!profile)return false;
 await ensureDailyTable(db);const date=dailyDate(now),id=`${profile}:${date}`;
 const r=await db.prepare('INSERT OR IGNORE INTO daily_scores (id,device,name,date,code,score,win,at,done) VALUES (?,?,?,?,?,0,0,?,0)').bind(id,profile,name,date,code,now).run();
 await db.prepare(DAILY_PRUNE_SQL).bind(dailyPruneBefore(now)).run();
 if(r.meta.changes)return true;
 const takeover=await db.prepare('UPDATE daily_scores SET code=?,name=?,at=? WHERE id=? AND done=0').bind(code,name,now,id).run();
 return !!takeover.meta.changes;
}

/**
 * Statement that fills in the ranked row when that table's round ends. Guarded by the room code, done=0, and
 * (like match_records) by the room row having reached the new revision in the same batch.
 */
export function dailyFinishStatement(db:Db,profile:string,date:string,code:string,score:number,win:boolean,at:number,revision:number){
 return db.prepare('UPDATE daily_scores SET score=?,win=?,at=?,done=1 WHERE id=? AND code=? AND done=0 AND EXISTS (SELECT 1 FROM rooms WHERE code=? AND revision=?)').bind(Math.round(score),Number(win),at,`${profile}:${date}`,code,code,revision);
}

/** Widest single-round score a 3-player table can reach: two hand-count differences over 60 tiles (-120..+60). */
export const DAILY_SCORE_LIMIT=120;
/**
 * 2026-11-12 user choice (C): 오늘의 판 now plays in the browser like 일반모드 (the server round trips made it slow
 * and sometimes failed). The browser claims the ranked slot (`dailyClaim`) and sends the final score here.
 * The user accepted that a modified browser could send a false score; only the attempt code, done=0 and a range
 * check guard the row.
 */
export async function dailyFinishRequest(db:Db,b:any,profile:string|null,reply:Reply,now=Date.now()){
 if(!profile)return reply({error:'기기 기록을 확인하지 못했어요.'},400);
 const code=String(b.code||''),score=Number(b.score),date=isDailyDate(b.date)?b.date:dailyDate(now);
 if(!/^[A-Z0-9]{12}$/.test(code)||!Number.isInteger(score)||Math.abs(score)>DAILY_SCORE_LIMIT)return reply({error:'오늘의 판 기록을 확인하지 못했어요.'},400);
 await ensureDailyTable(db);
 const r=await db.prepare('UPDATE daily_scores SET score=?,win=?,at=?,done=1 WHERE id=? AND code=? AND done=0').bind(score,Number(!!b.win),now,`${profile}:${date}`,code).run();
 return reply({recorded:!!r.meta.changes});
}

export async function dailyBoardRequest(db:Db,b:any,profile:string|null,reply:Reply){
 const date=isDailyDate(b.date)?b.date:dailyDate();
 await ensureDailyTable(db);
 const ranked="SELECT device,name,score,win,at,RANK() OVER (ORDER BY score DESC,at ASC) AS rank FROM daily_scores WHERE date=? AND done=1";
 const [rows,total,mine]=await Promise.all([
  db.prepare(`WITH r AS (${ranked}) SELECT name,score,win,rank,CASE WHEN device=? THEN 1 ELSE 0 END AS isMe FROM r ORDER BY rank,at LIMIT ?`).bind(date,profile||'',DAILY_PAGE).all(),
  db.prepare('SELECT COUNT(*) AS total FROM daily_scores WHERE date=? AND done=1').bind(date).first(),
  profile?db.prepare(`WITH r AS (${ranked}) SELECT name,score,win,rank FROM r WHERE device=?`).bind(date,profile).first():Promise.resolve(null),
 ]);
 const attempt=profile?await db.prepare('SELECT done FROM daily_scores WHERE id=?').bind(`${profile}:${date}`).first():null;
 return reply({date,today:dailyDate(),rows:rows.results.map((r:any)=>({...r,isMe:!!r.isMe,win:!!r.win})),total:total?.total||0,mine:mine?{...mine,win:!!mine.win}:null,attempt:attempt?(attempt.done?'done':'started'):'none'});
}
