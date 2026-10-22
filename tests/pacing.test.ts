import assert from 'node:assert/strict';
import {act,assertTurnReady,room,player,start,isRedTwoSingle,PLAY_REVIEW_MS,DRAW_TRAVEL_MS,type Tile} from '../lib/game.ts';
const t=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const g=room('ABC123',player('나'),true);g.players.push(player('달빛'),player('해솔'));start(g);g.turn=0;g.players[0].hand=[t(3),t(2,3)];
const before=Date.now();act(g,0,'play',[t(3).id]);assert.equal(g.rally,1);assert.equal(g.lastEvent?.rally,1);assert.ok(g.turnReadyAt!>=before+PLAY_REVIEW_MS);assert.throws(()=>assertTurnReady(g,g.turnReadyAt!-1));assert.doesNotThrow(()=>assertTurnReady(g,g.turnReadyAt));
act(g,1,'draw',[],0);assert.equal(g.rally,1);assert.ok(g.turnReadyAt!>=Date.now()+DRAW_TRAVEL_MS-5);act(g,2,'draw',[],1);assert.equal(g.rally,0);assert.equal(g.turn,0);assert.equal(g.trick.length,0);
act(g,0,'play',[t(2,3).id]);assert.equal(g.phase,'ended');assert.equal(isRedTwoSingle(g.lastEvent!.tiles!),true);assert.equal(isRedTwoSingle([t(2,3),t(2)]),false);assert.equal(isRedTwoSingle([t(2,2)]),false);start(g);assert.equal(g.turnReadyAt,0);assert.equal(g.rally,0);
console.log('PASS: play read interval, server/local action guard boundary, draw travel lock, rally increment/reset, red-two single classification, round reset.');
