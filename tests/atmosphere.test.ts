import assert from 'node:assert/strict';
import {endgameLevel,nextEntrance,ENTRANCE_MS,entranceDuration,concealLiveTiles,entranceCurtain,type EntrancePhase} from '../lib/atmosphere.ts';
import {room,player,start,view,DEAL_REVIEW_MS,assertTurnReady} from '../lib/game.ts';
for(const counts of [[12,12],[10,10,10],[9,9,9,9]])assert.equal(endgameLevel('playing',counts),0);
assert.equal(endgameLevel('playing',[7,3,6]),1);
assert.equal(endgameLevel('playing',[2,6]),1);
assert.equal(endgameLevel('playing',[5,1,8,2]),2);
assert.equal(endgameLevel('playing',[4,6]),0,'taking a tile can release tension');
assert.equal(endgameLevel('ended',[0,1,2]),0,'settlement returns to normal light');
assert.equal(endgameLevel('lobby',[1,1]),0);
assert.equal(endgameLevel('playing',[1,2],true),0,'intro and opening hand review stay calm');
for(const invalid of [[],[1],[0,1],[NaN,1],[-1,2],[1.5,2]])assert.equal(endgameLevel('playing',invalid),0);
function sequence(resume:boolean){let phase:EntrancePhase='menu-out';const seen:EntrancePhase[]=[];for(let i=0;i<10&&phase!=='idle';i++){seen.push(phase);phase=nextEntrance(phase,resume);}assert.equal(phase,'idle');return seen;}
const fresh=sequence(false),resume=sequence(true);
assert.ok(fresh.indexOf('approach')<fresh.indexOf('shuffle'));
assert.ok(fresh.indexOf('prepare')<fresh.indexOf('approach'));
assert.ok(fresh.indexOf('prepare')<fresh.indexOf('deal'));
assert.equal(fresh[fresh.indexOf('deal')+1],'settle','dealt backs stay visible during the board handoff');
assert.equal(resume.includes('prepare'),false);assert.equal(resume.includes('deal'),false);
assert.equal(resume.includes('shuffle'),false,'a saved hand is not visually redealt');
for(const phases of [fresh,resume]){
 const swap=phases.indexOf('settle');
 assert.equal(phases[swap-1],phases===fresh?'deal':'approach');
 assert.equal(entranceCurtain(phases[swap]),'clear');
 assert.equal(phases[swap+1],'game-in');assert.equal(entranceCurtain('game-in'),'clear');
 assert.ok(ENTRANCE_MS.settle>=100,'live board gets a stationary paint interval');
}
assert.equal(concealLiveTiles('deal'),true);
assert.equal(concealLiveTiles('settle'),false,'real tile paint is ready under stationary copies');
assert.equal(concealLiveTiles('game-in'),false);
assert.equal(entranceCurtain('prepare'),'covered','measurement and precomputation cannot flash an unfinished table');
assert.equal(fresh.at(-1),'game-in');assert.equal(resume.at(-1),'game-in');
assert.ok(fresh.reduce((sum,p)=>sum+ENTRANCE_MS[p],0)<10000,'the slower opening stays under ten seconds excluding preparation');
const g=room('INTRO',player('나'),true,2);g.players.push(player('달빛',true));const now=100000;start(g,now+ENTRANCE_MS['game-in']);
assert.equal(g.turnReadyAt,now+ENTRANCE_MS['game-in']+DEAL_REVIEW_MS);
assert.throws(()=>assertTurnReady(g,now+ENTRANCE_MS['game-in']+DEAL_REVIEW_MS-1));
assert.doesNotThrow(()=>assertTurnReady(g,now+ENTRANCE_MS['game-in']+DEAL_REVIEW_MS));
// Changing hidden opponent tile identities leaves the public-count lighting identical.
g.players[1].hand=g.players[1].hand.slice(0,1);const a=view(g,g.players[0].token);
g.players[1].hand[0]={id:59,n:15,s:3};const b=view(g,g.players[0].token);
assert.equal(endgameLevel(a.phase,a.players.map(p=>p.count)),endgameLevel(b.phase,b.players.map(p=>p.count)));
console.log('PASS: public-only tension thresholds/recovery, no hidden-hand inference, safe empty states, new/resume seamless entrance ordering, stationary handoff interval, duration budget, full opening review lock.');

assert.ok(entranceDuration("approach",true)>=entranceDuration("approach")*1.4,"resume leaves time to recognize the saved opponents");
assert.ok(entranceDuration("game-in",true)>entranceDuration("game-in"),"saved table has a gradual handoff");
