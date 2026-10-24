import type {HighScore} from './challenge';
export type LeaderboardEntry={rank:number,name:string,score:number,at:number,isMe:boolean};
export type Leaderboard={rows:LeaderboardEntry[],total:number,mine:LeaderboardEntry|null,page:number,pageSize:number};
export const PAGE_SIZE=10;
export function sharedScores(input:unknown,now=Date.now()):HighScore[]{
 if(!Array.isArray(input)||input.length>18)throw Error('동기화할 기록을 확인해 주세요.');
 return input.map((r:any)=>{
  const limit=r?.kind==='ten'?600:60,min=r?.kind==='ten'?-1800:-180;
  if(!r||r.mode!=='single'||![2,3,4].includes(r.size)||!['single','ten'].includes(r.kind)||typeof r.id!=='string'||r.id.length>180||!r.id.startsWith(r.kind==='ten'?'single:ten:':'single:round:')||!Number.isInteger(r.score)||r.score<min||r.score>limit||!Number.isSafeInteger(r.at)||r.at<1577836800000||r.at>now+60000)throw Error('올바르지 않은 경기 기록이에요.');
  return {id:r.id,mode:'single',size:r.size,kind:r.kind,score:r.score,at:r.at};
 });
}
// Persisted scores are already bounded to the best ten in each category.
export const LEADERBOARD_CTE=`WITH ranked AS (
 SELECT device,name,score,at,ROW_NUMBER() OVER(ORDER BY score DESC,at ASC,entry_id ASC,device ASC) AS rank
 FROM shared_scores WHERE mode=? AND size=? AND kind=?
) `;
export function boardArgs(mode:string,size:number,kind:string){return [mode,size,kind];}
export const PRUNE_SCORES_SQL='DELETE FROM shared_scores WHERE id NOT IN (WITH unique_events AS (SELECT id,mode,size,kind,score,at,entry_id,device,ROW_NUMBER() OVER(PARTITION BY device,mode,size,kind,entry_id ORDER BY score DESC,at ASC,id ASC) AS best FROM shared_scores),ranked AS (SELECT id,ROW_NUMBER() OVER(PARTITION BY mode,size,kind ORDER BY score DESC,at ASC,entry_id ASC,device ASC) AS place FROM unique_events WHERE best=1) SELECT id FROM ranked WHERE place<=10)';
export const PRUNE_MATCHES_SQL="DELETE FROM match_records WHERE id IN (SELECT id FROM (SELECT id,ROW_NUMBER() OVER(PARTITION BY device ORDER BY at DESC,id DESC) AS place FROM match_records) WHERE place>10)";
