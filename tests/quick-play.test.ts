import assert from 'node:assert/strict';
import {act,assertTurnReady,room,player,start,view,type Tile} from '../lib/game';
import {QUICK_PLAY_MS,ANNOUNCED_PLAY_MS,announcedPlayDuration,playReviewDuration} from '../lib/play-notices';
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
for(const count of [1,2,3]){
 let g=room('QUICK'+count,player('나'),true,3);g.players.push(player('AI1',true),player('AI2',true));start(g,1000);g.turn=0;g.trick=[];g.lastBy=null;
 g.players.forEach((p,i)=>p.hand=[...Array.from({length:count},(_,s)=>tile(3+i,s)),tile(10+i,3)]);
 act(g,0,'play',g.players[0].hand.slice(0,count).map(t=>t.id),-1,5000);
 assert.equal(g.lastEvent?.showNotice,true);assert.equal(g.turnReadyAt,5000+announcedPlayDuration(count));assert.equal(playReviewDuration(view(g,g.players[0].token).lastEvent!),announcedPlayDuration(count));
 // A persisted game must keep the once-only introduction, including a rejoin.
 g=JSON.parse(JSON.stringify(g));act(g,1,'play',g.players[1].hand.slice(0,count).map(t=>t.id),-1,6600);
 assert.equal(g.lastEvent?.showNotice,false);assert.equal(g.turnReadyAt,6600+QUICK_PLAY_MS);assert.equal(playReviewDuration(view(g,g.players[0].token).lastEvent!),QUICK_PLAY_MS);
 assert.throws(()=>assertTurnReady(g,7249));assert.doesNotThrow(()=>assertTurnReady(g,7250));
 act(g,2,'play',g.players[2].hand.slice(0,count).map(t=>t.id),-1,7250);assert.equal(g.lastEvent?.showNotice,false);assert.equal(g.turnReadyAt,7900);
 start(g,10000);assert.deepEqual(g.announcedCombos,[]);
}
const g=room('FIVE',player('나'),true,2);g.players.push(player('AI',true));start(g,1000);g.turn=0;g.trick=[];g.lastBy=null;
g.players[0].hand=[3,4,5,6,7].map(n=>tile(n));g.players[0].hand.push(tile(14,1));g.players[1].hand=[8,9,10,11,12].map(n=>tile(n));g.players[1].hand.push(tile(15,1));
act(g,0,'play',g.players[0].hand.slice(0,5).map(t=>t.id),-1,5000);assert.equal(g.lastEvent?.showNotice,true);
act(g,1,'play',g.players[1].hand.slice(0,5).map(t=>t.id),-1,6600);assert.equal(g.lastEvent?.showNotice,true);assert.equal(g.lastEvent?.reviewMs,ANNOUNCED_PLAY_MS);
console.log('PASS: first-only single/pair/triple introductions, 650ms authoritative repeats, preserved state after save/rejoin, round reset, and repeated five-card announcements.');
