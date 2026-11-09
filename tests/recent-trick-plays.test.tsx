import assert from 'node:assert/strict';
import test from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {act,room,player,start,view,RECENT_TRICK_PLAYS,type Tile} from '../lib/game';
import RpgRecentPlays,{RECENT_PLAYS_INSET} from '../app/components/RpgRecentPlays';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});

function table(){
 const g=room('RECENT-PLAYS',player('나'),true,3);g.players.push(player('로웬',true),player('루미',true));start(g,0);
 g.stacks=g.stacks.map(()=>[null,null]);g.turn=0;g.turnReadyAt=0;g.trick=[];g.lastBy=null;g.trickPlays=[];
 g.players[0].hand=[tile(3),tile(6),tile(9),tile(12)];g.players[1].hand=[tile(4),tile(7),tile(10)];g.players[2].hand=[tile(5),tile(8),tile(11)];
 return g;
}

test('recent plays keep the newest four of the round across leads, passes excluded',()=>{
 const g=table(),me=()=>view(g,g.players[0].token);
 assert.equal(RECENT_TRICK_PLAYS,4,'three shown slots plus the play on the table');
 act(g,0,'play',[tile(3).id],-1,1);act(g,1,'play',[tile(4).id],-1,2);
 assert.deepEqual(me().trickPlays.map(p=>[p.who,p.tiles[0].n]),[[0,3],[1,4]]);
 act(g,2,'play',[tile(5).id],-1,3);act(g,0,'play',[tile(6).id],-1,4);act(g,1,'play',[tile(7).id],-1,5);
 assert.deepEqual(me().trickPlays.map(p=>[p.who,p.tiles[0].n]),[[1,4],[2,5],[0,6],[1,7]],'only the newest four remain');
 act(g,2,'pass',[],-1,6);
 assert.deepEqual(me().trickPlays.map(p=>p.tiles[0].n),[4,5,6,7],'a pass is never recorded');
 act(g,0,'pass',[],-1,7);
 assert.equal(g.turn,1);assert.equal(g.trick.length,0);
 assert.deepEqual(me().trickPlays.map(p=>p.tiles[0].n),[4,5,6,7],'a lead change keeps the list');
 act(g,1,'play',[tile(10).id],-1,8);
 assert.deepEqual(me().trickPlays.map(p=>p.tiles[0].n),[5,6,7,10],'the newest four continue across leads');
 g.phase='ended';start(g,8);assert.deepEqual(view(g,g.players[0].token).trickPlays,[],'a new round starts empty');
});

test('recent plays column renders newest first with fixed empty slots',()=>{
 const html=renderToStaticMarkup(<RpgRecentPlays names={['나','로웬','루미']} plays={[{id:'a',who:1,tiles:[tile(4)]},{id:'b',who:2,tiles:[tile(5,3),tile(5,1)]}]}/>);
 assert.equal((html.match(/<li/g)||[]).length,3,'three slots keep the grid still');
 assert.ok(html.indexOf('루미')<html.indexOf('로웬'),'newest first');
 assert.ok(html.includes('rpg-recent-latest')&&html.includes('●')&&html.includes('○'));
 assert.equal((html.match(/rpg-recent-empty/g)||[]).length,1);
 assert.ok(!html.includes('패스'));
 const four=[{id:'a',who:0,tiles:[tile(3)]},{id:'b',who:1,tiles:[tile(4)]},{id:'c',who:2,tiles:[tile(5)]},{id:'d',who:0,tiles:[tile(6),tile(6,2)]}];
 const hidden=renderToStaticMarkup(<RpgRecentPlays names={['나','로웬','루미']} plays={four} onTable={[tile(6),tile(6,2)]}/>);
 assert.ok(!hidden.includes('>6<'),'the play still on the table is left out');
 assert.equal((hidden.match(/rpg-recent-empty/g)||[]).length,0,'three earlier plays still fill the slots');
 assert.ok(hidden.indexOf('루미')<hidden.indexOf('로웬')&&hidden.includes('가장 최근 루미'),'newest off-table play leads');
 const cleared=renderToStaticMarkup(<RpgRecentPlays names={['나','로웬','루미']} plays={four} onTable={[]}/>);
 assert.ok(cleared.includes('>6<')&&!cleared.includes('>3<'),'once the table clears the last play returns to the list');
 const empty=renderToStaticMarkup(<RpgRecentPlays names={[]} plays={[]}/>);
 assert.equal((empty.match(/rpg-recent-empty/g)||[]).length,3,'a fresh lead shows empty slots, not a collapsed column');
 const page=readFileSync('app/page.tsx','utf8');
 assert.ok(page.includes('const showRecentPlays=!!game&&!bombEdition')&&page.includes('{showRecentPlays&&<RpgRecentPlays'),'every shared-engine mode in both orientations, never the Bomb Market');
 assert.ok(page.includes('floorWidth:Math.max(40,floorSize.width-(game?.rpgRun?(stackedLandscape?RPG_STACKED_SIDE_INSETS:112):recentInset))')&&page.includes('!game?.rpgRun&&!landscapeTable?RECENT_PLAYS_INSET:0'),'the classic portrait floor is sized for the column it gives up');
 assert.equal(RECENT_PLAYS_INSET,64);
 assert.ok(page.includes('<RpgRecentPlays plays={game.trickPlays||[]} onTable={game.trick||[]}'),'the table play is passed in to be left out');
 const css=readFileSync('app/rpg-phase-one.css','utf8');assert.ok(css.includes('.rpg-recent-tiles{flex:none;display:flex;flex-wrap:wrap;justify-content:center;gap:2px}')&&css.includes('width:calc((100% - 4px) / 3)'),'three tiles per row, centred (a single sits in the middle)');assert.ok(css.includes('.rpg-recent-plays{position:absolute;left:-4px;top:0;width:59px;height:100%;max-height:236px;'),'mirrors the relic rail');assert.ok(css.includes('.floor-relic-dock{width:59px!important;right:-4px!important}'),'relic rail mirrored and kept inside the felt');assert.ok(css.includes('main.turntale.table-v211.active-table .floor-stage>.rpg-recent-plays{')&&!css.includes(':not(.portrait-table) .rpg-recent-plays{display:none}'),'not limited to RPG portrait');assert.ok(css.includes('.floor-stage.recent-inset>.wall{left:60px!important;right:4px!important'),'classic portrait grid moves right of the column (60 + 4 = RECENT_PLAYS_INSET)');
});
