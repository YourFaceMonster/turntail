import {bombCombo,bombOptions,bombRank,MARKET_COST,type BombAction,type BombView,type Tile} from './bomb-market';
/** Uses own cards + public information, never another player's hand. */
function structure(hand:Tile[]){
 const groups=new Map<number,Tile[]>();for(const t of hand)groups.set(t.n,[...(groups.get(t.n)||[]),t]);
 let value=0;for(const [n,g] of groups){value+=[0,0,3.5,9.5,18][g.length];if(n>=3&&n<15&&groups.has(n+1)){value+=1.8;if(g.length>=2&&groups.get(n+1)!.length>=2)value+=3;}}
 for(let s=0;s<4;s++)for(let n=3;n<=15;n++){let len=0;while(n+len<=15&&hand.some(t=>t.n===n+len&&t.s===s))len++;if(len>=3)value+=len*1.5;}
 return value;
}
export function chooseBombAction(v:BombView,now=Date.now()):BombAction|null{
 const me=v.players[v.seat];if(v.phase!=='playing'||me.out||me.place!==null)return null;
 if(v.reaction&&now>=v.reaction.deadline)return null;
 const offTurn=!v.reaction&&v.turn!==v.seat;
 const options=bombOptions(v.hand,v.trick,!!v.reaction||offTurn),danger=v.players.some((p,i)=>i!==v.seat&&p.place===null&&p.count<=3);
 const finish=options.find(o=>o.length===v.hand.length);if(finish)return {type:'play',ids:finish.map(t=>t.id)};
 const ranked=options.map(tiles=>{const c=bombCombo(tiles)!;return {tiles,value:tiles.length*5-c.high*.24-(c.bomb?(danger?3:23):0)+structure(v.hand.filter(t=>!tiles.some(x=>x.id===t.id)))*.25};}).sort((a,b)=>b.value-a.value);
 if(v.reaction||offTurn){const best=ranked[0];return best&&(danger||v.hand.length<=best.tiles.length+2)&&best.value>0?{type:'play',ids:best.tiles.map(t=>t.id)}:null;}
 const normal=ranked.find(o=>!bombCombo(o.tiles)!.bomb);
 if(normal)return {type:'play',ids:normal.tiles.map(t=>t.id)};
 const best=ranked[0];if(best&&(!v.trick.length||danger||v.hand.length<=best.tiles.length+3))return {type:'play',ids:best.tiles.map(t=>t.id)};
 if(v.trick.length&&me.score>=MARKET_COST&&v.market.some(Boolean)){
  const base=structure(v.hand),remaining=6-v.round;
  const buys=v.market.flatMap(t=>t?[{t,gain:structure([...v.hand,t])-base-2.7+(bombRank(t.n)-3)*.015}]:[]).sort((a,b)=>b.gain-a.gain||a.t.id-b.t.id);
  // Spending near the final scores / bankruptcy needs a stronger completed structure.
  const threshold=(me.score<9?5:2)+(remaining===1?2:0);
  if(buys[0].gain>threshold)return {type:'buy',id:buys[0].t.id};
 }
 if(!v.trick.length&&best)return {type:'play',ids:best.tiles.map(t=>t.id)};
 return {type:'pass'};
}
