import assert from 'node:assert/strict';
import test from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {act,room,player,start,view,RECENT_TRICK_PLAYS,type Tile} from '../lib/game';
import RpgRecentPlays from '../app/components/RpgRecentPlays';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});

function table(){
 const g=room('RECENT-PLAYS',player('나'),true,3);g.players.push(player('로웬',true),player('루미',true));start(g,0);
 g.stacks=g.stacks.map(()=>[null,null]);g.turn=0;g.turnReadyAt=0;g.trick=[];g.lastBy=null;g.trickPlays=[];
 g.players[0].hand=[tile(3),tile(6),tile(9),tile(12)];g.players[1].hand=[tile(4),tile(7),tile(10)];g.players[2].hand=[tile(5),tile(8),tile(11)];
 return g;
}

test('recent plays keep the newest three of the round across leads, passes excluded',()=>{
 const g=table(),me=()=>view(g,g.players[0].token);
 assert.equal(RECENT_TRICK_PLAYS,3);
 act(g,0,'play',[tile(3).id],-1,1);act(g,1,'play',[tile(4).id],-1,2);
 assert.deepEqual(me().trickPlays.map(p=>[p.who,p.tiles[0].n]),[[0,3],[1,4]]);
 act(g,2,'play',[tile(5).id],-1,3);act(g,0,'play',[tile(6).id],-1,4);
 assert.deepEqual(me().trickPlays.map(p=>[p.who,p.tiles[0].n]),[[1,4],[2,5],[0,6]],'only the newest three remain');
 act(g,1,'pass',[],-1,5);
 assert.deepEqual(me().trickPlays.map(p=>p.tiles[0].n),[4,5,6],'a pass is never recorded');
 act(g,2,'pass',[],-1,6);
 assert.equal(g.turn,0);assert.equal(g.trick.length,0);
 assert.deepEqual(me().trickPlays.map(p=>p.tiles[0].n),[4,5,6],'a lead change keeps the list');
 act(g,0,'play',[tile(9).id],-1,7);
 assert.deepEqual(me().trickPlays.map(p=>p.tiles[0].n),[5,6,9],'the newest three continue across leads');
 g.phase='ended';start(g,8);assert.deepEqual(view(g,g.players[0].token).trickPlays,[],'a new round starts empty');
});

test('recent plays column renders newest first with fixed empty slots',()=>{
 const html=renderToStaticMarkup(<RpgRecentPlays rows={3} names={['나','로웬','루미']} plays={[{id:'a',who:1,tiles:[tile(4)]},{id:'b',who:2,tiles:[tile(5,3),tile(5,1)]}]}/>);
 assert.equal((html.match(/<li/g)||[]).length,3,'three slots keep the grid still');
 assert.ok(html.indexOf('루미')<html.indexOf('로웬'),'newest first');
 assert.ok(html.includes('rpg-recent-latest')&&html.includes('●')&&html.includes('○'));
 assert.equal((html.match(/rpg-recent-empty/g)||[]).length,1);
 assert.ok(!html.includes('패스'));
 const empty=renderToStaticMarkup(<RpgRecentPlays rows={3} names={[]} plays={[]}/>);
 assert.equal((empty.match(/rpg-recent-empty/g)||[]).length,3,'a fresh lead shows empty slots, not a collapsed column');
 const page=readFileSync('app/page.tsx','utf8');
 assert.ok(page.includes('game.rpgRun&&!game.hpItemMode&&!landscapeTable&&<RpgRecentPlays'),'RPG portrait only');
 const css=readFileSync('app/rpg-phase-one.css','utf8');assert.ok(css.includes('.rpg-recent-tiles{flex:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr))'),'three tiles per row');
});
