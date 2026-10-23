import {room,player,sorted,lowestHandLead,startingHandSize,type Game,type Tile} from '../../lib/game.ts';
export const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
export function seededGame(seed:number,size:number):Game{
 const g=room('STRATEGY',player('AI 1',true),true,size);for(let i=1;i<size;i++)g.players.push(player('AI '+(i+1),true));
 const deck=Array.from({length:60},(_,id)=>tile(Math.floor(id/4)+1,id%4));
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
 g.players.forEach(p=>p.hand=sorted(deck.splice(0,startingHandSize(size))));
 const count=deck.length/2;g.stacks=Array.from({length:count},()=>[deck.shift()!,deck.shift()!]);
 g.cols=size===2?6:size===3?5:4;g.rows=Math.ceil(count/g.cols);g.opening=lowestHandLead(g.players);g.turn=g.opening.who;
 g.phase='playing';g.round=1;g.playedTiles=[];g.publicDraws={};return g;
}
export function positionGame(hands:Tile[][],trick:Tile[]=[],floor:Tile[]=[],known=false):Game{
 const g=room('TACTIC',player('AI',true),true,hands.length);for(let i=1;i<hands.length;i++)g.players.push(player('상대 '+i,true));
 g.players.forEach((p,i)=>p.hand=hands[i].slice());g.phase='playing';g.round=1;g.turn=0;g.lastBy=trick.length?hands.length-1:null;g.trick=trick;g.playedTiles=trick.slice();
 g.cols=Math.max(1,floor.length);g.rows=1;g.stacks=floor.map(t=>[t,null]);g.publicDraws=Object.fromEntries(g.players.map((p,i)=>[p.id,known&&i!==0?p.hand.slice():[]]));return g;
}
