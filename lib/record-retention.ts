import {scoreEntries} from './challenge';
import {PRUNE_MATCHES_SQL,PRUNE_SCORES_SQL} from './leaderboard';
type Database={prepare:(sql:string)=>any,batch:(statements:any[])=>Promise<any>};
/** Bounded, restartable backfill runs outside schema migrations. A cursor prevents rescanning. */
export async function maintainRecords(db:Database):Promise<boolean>{
 await db.prepare("INSERT OR IGNORE INTO record_retention (id,cursor,complete) VALUES ('top10-v1','',0)").run();
 let state=await db.prepare("SELECT cursor,complete FROM record_retention WHERE id='top10-v1'").first() as {cursor:string,complete:number};
 if(state.complete)return true;
 // At most 160 old player results per request, with a separate atomic checkpoint each 40.
 for(let batch=0;batch<4;batch++){
  const rows=(await db.prepare('SELECT id,device,name,size,result FROM match_records WHERE id>? ORDER BY id LIMIT 40').bind(state.cursor).all()).results as {id:string,device:string,name:string,size:number,result:string}[];
  const statements:any[]=[];
  for(const row of rows){
   let result;try{result=JSON.parse(row.result);}catch{continue;}
   if(!Array.isArray(result?.players)||!result.id)continue;
   const me=result.players.findIndex((p:any)=>row.id===`${result.id}:${p.id}`);if(me<0)continue;
   for(const entry of scoreEntries(result,me,'multi',row.size)){
    statements.push(db.prepare('INSERT OR IGNORE INTO shared_scores (id,device,name,mode,size,kind,score,at,entry_id) VALUES (?,?,?,?,?,?,?,?,?)').bind(`${row.device}:${entry.id}`,row.device,row.name,'multi',row.size,entry.kind,entry.score,entry.at,entry.id));
   }
  }
  const cursor=rows.at(-1)?.id||state.cursor,complete=rows.length<40;
  statements.push(db.prepare(PRUNE_SCORES_SQL));
  if(complete)statements.push(db.prepare(PRUNE_MATCHES_SQL));
  statements.push(db.prepare("UPDATE record_retention SET cursor=?,complete=? WHERE id='top10-v1' AND cursor=?").bind(cursor,Number(complete),state.cursor));
  await db.batch(statements);if(complete)return true;state={cursor,complete:0};
 }
 return false;
}
