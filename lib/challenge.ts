export type Challenge={id:string,size:number,completed:number,scores:number[],roundIds:string[],complete:boolean,abandoned?:boolean,itemMode?:boolean};
export type HighScore={id:string,mode:'single'|'multi',size:number,kind:'single'|'ten',score:number,at:number};
export function newChallenge(id:string,size:number):Challenge{return {id,size,completed:0,scores:Array(size).fill(0),roundIds:[],complete:false};}
export function advanceChallenge(c:Challenge,result:{id:string,voided?:boolean,players:{delta:number}[]}):Challenge{
 if(c.complete||c.abandoned||result.voided||c.roundIds.includes(result.id))return c;
 if(result.players.length!==c.size)throw Error('도전 인원은 변경할 수 없어요.');
 const completed=c.completed+1;return {...c,completed,complete:completed===10,roundIds:[...c.roundIds,result.id],scores:c.scores.map((n,i)=>n+result.players[i].delta)};
}
export function topScores(rows:HighScore[],mode:HighScore['mode'],size:number,kind:HighScore['kind']):HighScore[]{
 const seen=new Set<string>();return rows.filter(r=>{if(r.mode!==mode||r.size!==size||r.kind!==kind||seen.has(r.id))return false;seen.add(r.id);return Number.isFinite(r.score)&&Number.isFinite(r.at);}).sort((a,b)=>b.score-a.score||a.at-b.at).slice(0,10);
}
export function mergeScores(old:HighScore[],added:HighScore[]):HighScore[]{const all=[...old,...added];return (['single','multi'] as const).flatMap(mode=>[2,3,4].flatMap(size=>(['single','ten'] as const).flatMap(kind=>topScores(all,mode,size,kind))));}
export function scoreEntries(result:{id:string,at:number,voided?:boolean,players:{delta:number}[],challenge?:Challenge|null,stageRun?:unknown},me:number,mode:HighScore['mode'],size:number):HighScore[]{
 const c=result.challenge;if(result.voided||result.stageRun||c?.itemMode||!result.players[me])return [];
 const rows:HighScore[]=[{id:`${mode}:round:${result.id}`,mode,size,kind:'single',score:result.players[me].delta,at:result.at}];
 if(c&&c.complete&&c.completed===10&&!c.abandoned&&c.roundIds.includes(result.id))rows.push({id:`${mode}:ten:${c.id}`,mode,size,kind:'ten',score:c.scores[me],at:result.at});return rows;
}

/** Only each category's best ten events survive in device storage and upload. */
export function mergeScoreHistory(old:HighScore[],added:HighScore[]):HighScore[]{return mergeScores(old,added);}
