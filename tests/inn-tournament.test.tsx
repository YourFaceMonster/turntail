import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRpgJourneyGame,enterJourneyNode} from '../lib/rpg-game';
import {settle,chooseBotAction,view,type Game,type Tile} from '../lib/game';
import {chooseRpgStageReward} from '../lib/rpg-phase-one';
import {activeJourneyMini,leaveJourneyMini,nextJourneyMiniRound,settleJourneyMini,startInnTournament,validateJourneySave} from '../lib/rpg-journey';
import {INN_TOURNAMENT,TOURNAMENT_TITLE,noteTournament,readTournamentRecord,tournamentGoalMet} from '../lib/inn-tournament';
import JourneyInnView from '../app/components/JourneyInn';
import InnTournamentResult from '../app/components/InnTournamentResult';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
function finish(game:Game,counts:number[]){game.players.forEach((p,i)=>p.hand=Array.from({length:counts[i]},(_,j)=>tile(j%15+1,i)));game.phase='ended';game.winner=counts.indexOf(0);game.result=null;return settle(game);}
function regionTwoInn(){
 const game=createRpgJourneyGame('검증','',0);enterJourneyNode(game,'battle-1',0);
 for(let stage=1;stage<=3;stage++){if(stage>1)enterJourneyNode(game,`battle-${stage}` as never);game.rpgRun!.hp=[game.rpgRun!.hp[0],1,40];finish(game,[0,6,3]);game.rpgRun=chooseRpgStageReward(game.rpgRun!,'relic',undefined,false,game.rpgRun!.phaseOne!.clear!.relicOffers![0]);}
 enterJourneyNode(game,'inn-2' as never);return game;
}
/** Ends the current tournament match with the given hand counts (seat 0 = me, 1 = challenger, 2 = guest). */
function playMatch(game:Game,counts:number[]){const mini=activeJourneyMini(game)!;finish(mini,counts);settleJourneyMini(game);return mini;}

test('the tournament opens only from a region inn between stages and never touches HP, relics or coins',()=>{
 const game=regionTwoInn(),before=structuredClone(game.rpgRun!);
 startInnTournament(game);const j=game.rpgRun!.journey!;
 assert.equal(j.location,'mini-game');assert.equal(j.miniKind,'tournament');validateJourneySave(game);
 const mini=activeJourneyMini(game)!;assert.equal(mini.players[1].name,'피오');assert.deepEqual(mini.rpgMini!.aiLevels,[0,INN_TOURNAMENT[0].level,3]);
 assert.equal(mini.rpgMini!.purpose,'tournament');
 playMatch(game,[0,6,7]);nextJourneyMiniRound(game);
 assert.equal(activeJourneyMini(game)!.players[1].name,'모란','the challenger seat changes each match');assert.equal(activeJourneyMini(game)!.rpgMini!.aiLevels![1],INN_TOURNAMENT[1].level);
 playMatch(game,[3,9,0]);nextJourneyMiniRound(game);
 assert.equal(activeJourneyMini(game)!.players[1].name,'모로');
 playMatch(game,[0,2,4]);
 const cup=game.rpgRun!.journey!.tournament!;
 assert.deepEqual(cup.wins,[1,3]);assert.deepEqual(cup.goals,[1,2,3]);assert.ok(cup.finished&&cup.champion);assert.equal(cup.played,1);
 assert.throws(()=>nextJourneyMiniRound(game),/결과를 먼저/);
 leaveJourneyMini(game);assert.equal(game.rpgRun!.journey!.location,'inn');validateJourneySave(game);
 const after=game.rpgRun!;assert.deepEqual(after.hp,before.hp);assert.deepEqual(after.relics,before.relics);assert.equal(after.coins,before.coins);assert.equal(after.stage,before.stage);
 const map=createRpgJourneyGame('검증','',0);assert.throws(()=>startInnTournament(map),/지역 주점/);
});

test('one match won is not enough; a replay starts fresh and counts tournaments played',()=>{
 const game=regionTwoInn();startInnTournament(game);
 playMatch(game,[0,6,7]);nextJourneyMiniRound(game);playMatch(game,[5,0,3]);nextJourneyMiniRound(game);playMatch(game,[4,0,2]);
 const cup=game.rpgRun!.journey!.tournament!;assert.deepEqual(cup.wins,[1]);assert.equal(cup.champion,false);
 leaveJourneyMini(game);startInnTournament(game);assert.deepEqual(game.rpgRun!.journey!.tournament,{wins:[],goals:[],played:1});
 assert.equal(activeJourneyMini(game)!.players[1].name,'피오');
});

test('special goals read only the public result',()=>{
 const r=(places:number[],counts:number[])=>({players:places.map((place,i)=>({id:String(i),name:'',count:counts[i],place,delta:0,total:0,winner:place===1}))});
 assert.equal(tournamentGoalMet(1,r([1,2,3],[0,6,9])),true);assert.equal(tournamentGoalMet(1,r([1,2,3],[0,5,9])),false);
 assert.equal(tournamentGoalMet(2,r([2,3,1],[2,8,0])),true);assert.equal(tournamentGoalMet(2,r([1,2,3],[0,1,2])),false);
 assert.equal(tournamentGoalMet(3,r([1,2,3],[0,1,2])),true);
});

test('AI strength follows the seat level and the bot still sees only its own view',()=>{
 const game=regionTwoInn();startInnTournament(game);const mini=activeJourneyMini(game)!;
 mini.turn=1;const action=chooseBotAction(view(mini,mini.players[1].token));assert.ok(['play','draw','pass'].includes(action.type));
 assert.equal(view(mini,mini.players[1].token).players[0].hand,undefined,'no private hand of the player');
});

test('device title record and screens',()=>{
 const store=new Map<string,string>(),storage={getItem:(k:string)=>store.get(k)??null,setItem:(k:string,v:string)=>{store.set(k,v);}};
 assert.deepEqual(readTournamentRecord(storage),{champion:0,bestGoals:0});
 noteTournament(storage,{wins:[1,2],goals:[1],champion:true,finished:true,played:1});noteTournament(storage,{wins:[],goals:[1,2],champion:false,finished:true,played:2});
 assert.deepEqual(readTournamentRecord(storage),{champion:1,bestGoals:2});
 const game=regionTwoInn();game.rpgRun!.journey!.inns={2:{met:true}};
 const menu=renderToStaticMarkup(<JourneyInnView run={game.rpgRun!} busy={false} error="" action={()=>{}}/>);assert.match(menu,/여관 토너먼트/);
 startInnTournament(game);playMatch(game,[0,6,7]);const mini=activeJourneyMini(game)!;
 const html=renderToStaticMarkup(<InnTournamentResult game={view(mini,mini.players[0].token)} cup={game.rpgRun!.journey!.tournament} busy={false} next={()=>{}} back={()=>{}}/>);
 assert.match(html,/INN CUP · 1\/3/);assert.match(html,/달성/);assert.match(html,/다음 상대 · <b>모란/);assert.ok(!html.includes(TOURNAMENT_TITLE+'로'),'no title before the final');
});

test('inn conversations use the speaker paintings; the painted ST7 ledger has four tappable rows',async()=>{
 const {existsSync,readFileSync}=await import('node:fs');
 for(const key of ['moran','dokan','moro','rine'])for(const kind of ['portrait','wide'])assert.ok(existsSync(`public/story/inn-talk-${key}-${kind}-v1.webp`),`${key} ${kind}`);
 assert.match(readFileSync('app/components/JourneyInn.tsx','utf8'),/speakerArt=\{\{\[def\.owner\]:innTalk\(def\.owner\),\[def\.regular\]:innTalk\(def\.regular\)\}\}/);
 assert.ok(existsSync('public/story-events/st7-ledger-v2.webp'));
 const {default:StoryPuzzle}=await import('../app/components/StoryPuzzle');
 const html=renderToStaticMarkup(<StoryPuzzle id="st7-ledger" done={()=>{}}/>);
 assert.equal((html.match(/story-ledger-row/g)||[]).length,4);assert.match(html,/3번째 기록 · 1등 빈칸 · 2등 왕관 표식/);
});
