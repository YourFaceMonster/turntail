import type {RoundResult} from './game.ts';
export type HistoryRecord={id:string,at:number,win:number,points:number,size:number,result:RoundResult};
export type LineupPlayer={name:string,occurrence:number,games:number,wins:number,losses:number,points:number};
export type LineupHistory={key:string,names:string[],size:number,games:number,wins:number,points:number,lastAt:number,players:LineupPlayer[]};
export const lineupKey=(result:RoundResult)=>JSON.stringify(result.players.map(p=>p.name).sort());
export function aggregateLineups(records:HistoryRecord[]):LineupHistory[]{
 const groups=new Map<string,LineupHistory>();
 for(const r of records){const key=lineupKey(r.result);let g=groups.get(key);if(!g){g={key,names:JSON.parse(key),size:r.size,games:0,wins:0,points:0,lastAt:0,players:[]};groups.set(key,g);}g.games++;g.wins+=r.win;g.points+=r.points;g.lastAt=Math.max(g.lastAt,r.at);
 const occurrences=new Map<string,number>();for(const p of r.result.players){const occurrence=(occurrences.get(p.name)||0)+1;occurrences.set(p.name,occurrence);let row=g.players.find(x=>x.name===p.name&&x.occurrence===occurrence);if(!row){row={name:p.name,occurrence,games:0,wins:0,losses:0,points:0};g.players.push(row);}row.games++;row.wins+=Number(p.winner);row.losses+=Number(!p.winner);row.points+=p.delta;}
 }
 return [...groups.values()].map(g=>({...g,players:g.players.sort((a,b)=>b.points-a.points||b.wins-a.wins||a.name.localeCompare(b.name))})).sort((a,b)=>b.points-a.points||b.games-a.games||b.lastAt-a.lastAt);
}
// Aggregate every persisted friend round, independently of the recent-40-round list.
const keyed=`WITH keyed AS (SELECT m.*,(SELECT json_group_array(name) FROM (SELECT json_extract(j.value,'$.name') AS name FROM json_each(m.result,'$.players') j ORDER BY name COLLATE BINARY)) AS lineup FROM match_records m WHERE device=?)`;
export const LINEUP_SUMMARY_SQL=keyed+` SELECT lineup,size,COUNT(*) AS games,SUM(win) AS wins,SUM(points) AS points,MAX(at) AS lastAt FROM keyed GROUP BY lineup,size ORDER BY points DESC,games DESC,lastAt DESC`;
export const LINEUP_PLAYERS_SQL=keyed+`,expanded AS (SELECT k.lineup,k.size,json_extract(p.value,'$.name') AS name,json_extract(p.value,'$.delta') AS delta,json_extract(p.value,'$.winner') AS winner,ROW_NUMBER() OVER(PARTITION BY k.id,json_extract(p.value,'$.name') ORDER BY CAST(p.key AS INTEGER)) AS occurrence FROM keyed k,json_each(k.result,'$.players') p) SELECT lineup,size,name,occurrence,COUNT(*) AS games,SUM(winner) AS wins,COUNT(*)-SUM(winner) AS losses,SUM(delta) AS points FROM expanded GROUP BY lineup,size,name,occurrence ORDER BY points DESC,wins DESC,name`;
/** Fold one new local round into durable totals without retaining every round payload. */
export function accumulateLineup(existing:LineupHistory[],record:HistoryRecord):LineupHistory[]{
 const delta=aggregateLineups([record])[0],old=existing.find(g=>g.key===delta.key);
 if(!old)return [...existing,delta].sort((a,b)=>b.points-a.points||b.games-a.games);
 const players=old.players.map(p=>({...p}));
 for(const p of delta.players){const target=players.find(x=>x.name===p.name&&x.occurrence===p.occurrence);if(target){target.games+=p.games;target.wins+=p.wins;target.losses+=p.losses;target.points+=p.points;}else players.push({...p});}
 const next={...old,games:old.games+1,wins:old.wins+record.win,points:old.points+record.points,lastAt:Math.max(old.lastAt,record.at),players:players.sort((a,b)=>b.points-a.points||b.wins-a.wins||a.name.localeCompare(b.name))};
 return existing.map(g=>g.key===next.key?next:g).sort((a,b)=>b.points-a.points||b.games-a.games||b.lastAt-a.lastAt);
}
