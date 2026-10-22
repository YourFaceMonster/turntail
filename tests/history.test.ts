import assert from 'node:assert/strict';
import {aggregateLineups,accumulateLineup,type HistoryRecord} from '../lib/history.ts';
function row(id:string,names:string[],points:number[],winner:number,self=0):HistoryRecord{return {id,at:Number(id)||1,win:Number(winner===self),points:points[self],size:names.length,result:{id,at:Number(id)||1,round:1,transfers:[],players:names.map((name,i)=>({id:name+i,name,count:i,place:i+1,delta:points[i],total:points[i],winner:winner===i}))}};}
const records=[row('1',['나','돼지'],[3,-3],0),row('2',['돼지','나'],[2,-2],0,1),row('3',['나','돼지','토끼'],[7,-3,-4],0),row('4',['나','돼지','토끼'],[-4,7,-3],1)];
const groups=aggregateLineups(records);assert.equal(groups.length,2);const two=groups.find(g=>g.size===2)!;assert.equal(two.games,2);assert.equal(two.wins,1);assert.equal(two.points,1);assert.deepEqual(two.players.map(p=>[p.name,p.points,p.wins,p.losses]),[['나',1,1,1],['돼지',-1,1,1]]);const three=groups.find(g=>g.size===3)!;assert.equal(three.points,3);assert.deepEqual(three.players.map(p=>p.name),['돼지','나','토끼']);
const duplicates=aggregateLineups([row('1',['친구','친구'],[4,-4],0)]);assert.equal(duplicates[0].players.length,2);assert.deepEqual(duplicates[0].players.map(p=>p.occurrence),[1,2]);
assert.equal(aggregateLineups([row('1',['나','달빛'],[4,-4],0)]).length,1);assert.equal(records.length,4);
console.log('PASS: stable lineups across seat order, separate 2/3-player groups, per-player cumulative points/wins/losses, duplicate names, score ordering.');

let totals=aggregateLineups([]);for(let i=0;i<350;i++)totals=accumulateLineup(totals,row(String(i+1),['나','AI'],[2,-2],0));assert.equal(totals[0].games,350);assert.equal(totals[0].points,700);assert.equal(totals[0].players[1].points,-700);
