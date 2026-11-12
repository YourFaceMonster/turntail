import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {room,player,start,act,view,findMove,type Game} from '../lib/game';
import {optimisticPlay,confirmsOptimistic,isOptimisticEvent} from '../lib/optimistic-play';

function dailyLike():Game{
 const g=room('ABC123',player('나'),true,3);g.daily={date:'2026-11-12',ranked:false};
 for(const name of ['히보','불찬'])g.players.push(player(name,true));start(g,0);return g;
}
/** Hand the lead to seat 0 so the test does not depend on the daily deal. */
function myTurn(g:Game){g.turn=0;g.trick=[];g.lastBy=null;return g;}

test('a server practice play is shown at once and matches what the server then answers',()=>{
 const g=myTurn(dailyLike()),token=g.players[0].token,before=view(g,token);
 const move=findMove(g.players[0].hand,g.trick)!;assert.ok(move&&move.length<g.players[0].hand.length);
 const shown=optimisticPlay(before,move.map(t=>t.id),new Set(),1000)!;
 assert.ok(shown,'plain practice table gets an optimistic play');
 assert.ok(isOptimisticEvent(shown.lastEvent?.id));
 act(g,0,'play',move.map(t=>t.id),-1,1000);const server=view(g,token);
 for(const key of ['trick','lastBy','turn','rally','roundActions','played','phase'] as const)assert.deepEqual(shown[key],server[key],key);
 assert.deepEqual(shown.players.map(p=>p.count),server.players.map(p=>p.count));
 assert.deepEqual(shown.players[0].hand,server.players[0].hand);
 assert.equal(shown.lastEvent?.label,server.lastEvent?.label);
 assert.ok(confirmsOptimistic({who:0,ids:move.map(t=>t.id)},server.lastEvent));
 assert.ok(!confirmsOptimistic({who:0,ids:[move[0].id+999]},server.lastEvent));
});

test('the server decides anything the browser cannot check alone',()=>{
 const g=myTurn(dailyLike()),token=g.players[0].token,v=view(g,token),move=findMove(g.players[0].hand,g.trick)!.map(t=>t.id);
 assert.equal(optimisticPlay({...v,practice:false},move,new Set()),null,'friend rooms keep waiting for the server');
 assert.equal(optimisticPlay({...v,turn:1},move,new Set()),null,'not my turn');
 assert.equal(optimisticPlay(v,[-1],new Set()),null,'tile not in hand');
 const last={...v,players:v.players.map((p,i)=>i===0?{...p,hand:p.hand!.filter(t=>move.includes(t.id)),count:move.length}:p)};
 assert.equal(optimisticPlay(last,move,new Set()),null,'a play that ends the round waits for the server result');
 assert.equal(optimisticPlay({...v,rpgRun:{} as never},move,new Set()),null,'story tables keep their own rules');
 if(v.trick.length){const low=[...v.players[0].hand!].find(t=>!findMove([t],v.trick));if(low&&v.trick.length===1)assert.equal(optimisticPlay(v,[low.id],new Set()),null,'a play that does not beat the table');}
});

test('page wiring: rollback on refusal and no double flight when the answer arrives',()=>{
 const page=readFileSync('app/page.tsx','utf8');
 assert.ok(page.includes('if(!res.ok)rollbackOptimistic();accept(data);'));
 assert.ok(page.includes('}catch(e){rollbackOptimistic();'));
 assert.ok(page.includes('if(data.revision<=opt.base)return;'),'an older state poll cannot undo the shown play');
 assert.ok(page.includes('confirmsOptimistic(opt,data.game.lastEvent)'));
});
