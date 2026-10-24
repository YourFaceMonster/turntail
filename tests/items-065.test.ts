import assert from 'node:assert/strict';
import {act,room,player,start,resetChallenge,view,type Game,type Tile} from '../lib/game';
import {useTableItem,scoutBotDraw,itemView,type ItemKind} from '../lib/items';
import {scoreEntries} from '../lib/challenge';
import {recordItemGame,readItemArchive} from '../lib/item-records';
import {readSaveSlots,saveSingleGame,SINGLE_GAME_KEY,ITEM_GAME_KEY} from '../lib/save-slots';
import {emptyAchievements,observeAchievements} from '../lib/achievements';
const data=new Map<string,string>(),storage={getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>{data.set(k,v);}};
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const g=room('ITEM-TEST',player('나'),true,3,{challenge:true,itemMode:true});g.players.push(player('AI1',true),player('AI2',true));
assert.throws(()=>room('BAD',player('나'),false,3,{challenge:true,itemMode:true}));
assert.throws(()=>room('BAD',player('나'),true,3,{itemMode:true}));
const ordinary=room('NORMAL',player('나'),true,3);ordinary.players.push(player('AI1',true),player('AI2',true));start(ordinary,0);saveSingleGame(storage,ordinary);
const untouched=data.get(SINGLE_GAME_KEY);let finalPoints=0;
for(let round=1;round<=10;round++){
 start(g,0);g.turn=0;g.turnReadyAt=0;g.trick=[tile(3)];g.lastBy=1;g.players[0].hand=[tile(2,3)];g.players[1].hand=[tile(6),tile(7)];g.players[2].hand=[tile(9),tile(10)];
 assert.ok(g.itemRun!.seats.every(s=>s.stock.lens>=0&&s.stock.lens<=3));
 const core=JSON.stringify({hands:g.players.map(p=>p.hand),points:g.players.map(p=>p.points),turn:g.turn,stacks:g.stacks,actions:g.roundActions});
 if(round<=9){
  const kind:ItemKind=round<=3?'lens':round<=6?'ledger':'guide';
  useTableItem(g,0,kind,0,{type:'play',tiles:[tile(2,3)]});
  assert.equal(JSON.stringify({hands:g.players.map(p=>p.hand),points:g.players.map(p=>p.points),turn:g.turn,stacks:g.stacks,actions:g.roundActions}),core,'items change only their own supply and information');
  assert.throws(()=>useTableItem(g,0,'ledger'),/한 판/);assert.throws(()=>useTableItem(g,1,'ledger'),/내 차례/);
  assert.equal(view(g,g.players[1].token).items!.intel,undefined,'other seats never receive a scout or a hint');
  if(kind==='lens')assert.deepEqual(view(g,g.players[0].token).items!.intel!.peek!.tile,g.stacks[0][1]);
 }
 saveSingleGame(storage,g);assert.ok(data.has(ITEM_GAME_KEY));assert.equal(data.get(SINGLE_GAME_KEY),untouched);
 const slots=readSaveSlots(storage).slots;assert.ok(slots.some(s=>s.mode==='single')&&slots.some(s=>s.mode==='item'));
 act(g,0,'play',[tile(2,3).id],-1,0);assert.equal(g.phase,'ended');assert.equal(g.challenge!.completed,round);finalPoints+=g.result!.players[0].delta;
 assert.equal(itemView(g,0)!.intel,undefined,'temporary information expires after the action');
 assert.deepEqual(scoreEntries(g.result!,0,'single',3),[],'item rounds cannot enter normal/global scores');
 assert.equal(observeAchievements(emptyAchievements(),view(g,g.players[0].token)).state.stats.rounds,0,'normal achievements remain separate');
 recordItemGame(storage,g);recordItemGame(storage,g);assert.equal(readItemArchive(storage).games,round,'result and reload cannot double-count');
 if(round<10)assert.equal(readItemArchive(storage).matches.length,0);
}
assert.ok(g.challenge!.complete);assert.equal(g.challenge!.scores[0],finalPoints);const archive=readItemArchive(storage);assert.equal(archive.matches.length,1);assert.equal(archive.matches[0].score,finalPoints);assert.equal(archive.games,10);assert.equal(archive.wins,10);assert.equal(data.get(SINGLE_GAME_KEY),untouched);assert.deepEqual(g.itemRun!.seats[0].stock,{lens:0,ledger:0,guide:0});
assert.throws(()=>start(g,0),/끝났/);resetChallenge(g);assert.ok(g.challenge!.itemMode);assert.deepEqual(g.itemRun!.seats[0].stock,{lens:3,ledger:3,guide:3});
// A bot is subject to the very same round and inventory cap.
g.turn=1;g.trick=[tile(3)];g.turnReadyAt=0;const index=scoutBotDraw(g,1,0);assert.ok(Number.isInteger(index));assert.equal(g.itemRun!.seats[1].stock.lens,2);scoutBotDraw(g,1,index);assert.equal(g.itemRun!.seats[1].stock.lens,2);
assert.throws(()=>useTableItem(ordinary,ordinary.turn,'ledger'),/아이템전/);
console.log('PASS: exact ten-round item match; unchanged tile/turn/score rules; legal single-face scouts; private expiring intel; equal AI caps; separate saves/results/highscores/achievements; restart and duplicate protection.');
