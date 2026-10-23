import type {RoundResult} from './game';
export type ResultPlayer=RoundResult['players'][number];
/** Competition ranking: equal totals share a place; the next place skips ties. */
export function resultStandings(players:readonly ResultPlayer[]){
 return [...players].sort((a,b)=>b.total-a.total||a.place-b.place).map(p=>({
  ...p,totalPlace:1+players.filter(q=>q.total>p.total).length,
  totalTied:players.filter(q=>q.total===p.total).length>1,
  roundTied:players.filter(q=>q.place===p.place).length>1
 }));
}
