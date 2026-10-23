import type {HighScore} from './challenge';
export type LeaderboardEntry={rank:number,name:string,score:number,at:number,isMe:boolean};
export type Leaderboard={rows:LeaderboardEntry[],total:number,mine:LeaderboardEntry|null,page:number,pageSize:number};
export const PAGE_SIZE=20;
export function sharedScores(input:unknown,now=Date.now()):HighScore[]{
 if(!Array.isArray(input)||input.length>18)throw Error('동기화할 기록을 확인해 주세요.');
 return input.map((r:any)=>{
  const limit=r?.kind==='ten'?600:60,min=r?.kind==='ten'?-1800:-180;
  if(!r||r.mode!=='single'||![2,3,4].includes(r.size)||!['single','ten'].includes(r.kind)||typeof r.id!=='string'||r.id.length>180||!r.id.startsWith(r.kind==='ten'?'single:ten:':'single:round:')||!Number.isInteger(r.score)||r.score<min||r.score>limit||!Number.isSafeInteger(r.at)||r.at<1577836800000||r.at>now+60000)throw Error('올바르지 않은 도전 기록이에요.');
  return {id:r.id,mode:'single',size:r.size,kind:r.kind,score:r.score,at:r.at};
 });
}
// Multiplayer comes directly from authoritative settled matches, including old records.
// Offline single-player bests are device-reported and bounded on upload.
export const LEADERBOARD_CTE=`WITH candidates AS (
 SELECT device,name,score,at,entry_id AS entryId FROM shared_scores WHERE mode=? AND size=? AND kind=?
 UNION ALL
 SELECT r.device,r.name,
  CASE WHEN ?='ten' THEN CAST(json_extract(r.result,'$.challenge.scores[' || p.key || ']') AS INTEGER) ELSE r.points END AS score,
  r.at,r.id AS entryId
 FROM match_records r JOIN json_each(r.result,'$.players') p
 WHERE ?='multi' AND r.size=? AND r.id=json_extract(r.result,'$.id') || ':' || json_extract(p.value,'$.id')
  AND COALESCE(json_extract(r.result,'$.voided'),0)=0
  AND json_extract(r.result,'$.challenge') IS NOT NULL
  AND COALESCE(json_extract(r.result,'$.challenge.abandoned'),0)=0
  AND EXISTS (SELECT 1 FROM json_each(r.result,'$.challenge.roundIds') ids WHERE ids.value=json_extract(r.result,'$.id'))
  AND (?='single' OR (json_extract(r.result,'$.challenge.complete')=1 AND json_extract(r.result,'$.challenge.completed')=10))
), personal AS (
 SELECT *,ROW_NUMBER() OVER (PARTITION BY device ORDER BY score DESC,at ASC,entryId ASC) AS best FROM candidates
), ranked AS (
 SELECT device,name,score,at,ROW_NUMBER() OVER (ORDER BY score DESC,at ASC,entryId ASC,device ASC) AS rank FROM personal WHERE best=1
) `;
export function boardArgs(mode:string,size:number,kind:string){return [mode,size,kind,kind,mode,size,kind];}
