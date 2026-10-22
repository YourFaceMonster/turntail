import assert from 'node:assert/strict';
import {legalOptions,beats,player,room,start,type Tile} from '../lib/game.ts';
const t=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
let hand=[t(3),t(6),t(6,1),t(6,2),t(6,3),t(7),t(1),t(2)];
assert.deepEqual(legalOptions(hand,[t(6,1)]).map(o=>o.tiles[0].id),[t(6,3).id,t(7).id,t(1).id,t(2).id]);
assert.ok(legalOptions(hand,[t(6,1),t(6,3)]).every(o=>o.tiles.length===2));
function brute(hand:Tile[],trick:Tile[]){const ids=new Set<string>();for(const count of trick.length?[trick.length]:[1,2,3,5]){
 function search(at:number,ts:Tile[]){if(ts.length===count){if(beats(ts,trick))ids.add(ts.map(t=>t.id).sort((a,b)=>a-b).join(','));return;}for(let i=at;i<=hand.length-(count-ts.length);i++)search(i+1,[...ts,hand[i]]);}
 search(0,[]);}return [...ids].sort();}
for(let i=0;i<25;i++){const g=room('TEST',player('P'));g.players.push(player('Q'),player('R'));start(g);const h=g.players[0].hand;
 for(const trick of [[],[t(6,2)],[t(7),t(7,3)],[t(5),t(5,2),t(5,3)],[t(3),t(4,1),t(5,2),t(6,3),t(7)]])assert.deepEqual(legalOptions(h,trick).map(o=>o.id).sort(),brute(h,trick));}
const all:Tile[]=[];for(let n=1;n<=15;n++)for(let s=0;s<4;s++)all.push(t(n,s));
const now=performance.now(),large=legalOptions(all.slice(0,48),[]);assert.ok(large.length>1000);assert.ok(large.every(o=>beats(o.tiles,[])));
console.log(`PASS: singleton highlighting, same-number color wins, exact legal choices versus exhaustive search, all five-tile families, 48-tile hand (${large.length} choices, ${Math.round(performance.now()-now)}ms).`);
