import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {act,room,player,start,view,chooseBotAction,type BotAction,type Tile} from '../lib/game';
import {chooseStrategicAction} from '../lib/bot';
import {HIBORINGJI,HIBORINGJI_LINES,hiboringjiAction,hiboringjiTemperament,hiboringjiLine} from '../lib/hiboringji';
import {chooseKoreanOpponents,restoreMonsterOpponents,monsterCharacter} from '../lib/korean-opponents';
import {eventBanter,idleBanter} from '../lib/character-banter';
import OpponentName from '../app/components/OpponentName';
import MonsterPortrait from '../app/components/MonsterPortrait';
import MonsterModel from '../app/components/MonsterModel';
import {openingGreeting} from '../app/components/EntranceSeats';
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const game=room('HIBORINGJI',player('나'),true,2);game.players.push({...player(HIBORINGJI.name,true),avatar:HIBORINGJI.avatar});start(game,0);
game.turn=1;game.players[1].hand=[tile(3),tile(3,1),tile(7),tile(9),tile(2,3)];game.players[0].hand=[tile(6),tile(11)];game.stacks=[];game.trick=[];game.playedTiles=[];
const input=view(game,game.players[1].token),best:BotAction={type:'play',tiles:[tile(3),tile(3,1)]};
assert.deepEqual(chooseBotAction(input),chooseStrategicAction(input),'calm identity gets the full strong strategy');
const stages=[0,23,24,47,48,71,72,100].map(n=>hiboringjiTemperament(n).stage);assert.deepEqual(stages,[0,0,1,1,2,2,3,3]);
const mistakes:number[]=[];
for(const actions of [0,24,48,72]){
 let count=0;
 for(let i=0;i<400;i++){
  const p={...input,code:'RIVAL-'+i,roundActions:actions},a=hiboringjiAction(p,best);
  if(JSON.stringify(a)!==JSON.stringify(best))count++;
  const cloned=structuredClone(game);cloned.code=p.code;cloned.roundActions=actions;
  assert.doesNotThrow(()=>act(cloned,1,a.type,a.type==='play'?a.tiles.map(t=>t.id):[],a.type==='draw'?a.index:-1,0,true));
  assert.deepEqual(hiboringjiAction(JSON.parse(JSON.stringify(p)),best),a,'save/restore cannot reroll a mistake');
  const tampered=structuredClone(p);tampered.players[0].hand=[tile(15,3)];
  assert.deepEqual(hiboringjiAction(tampered,best),a,'hidden opponent hand never changes temperament');
 }
 mistakes.push(count);
}
assert.equal(mistakes[0],0);assert.ok(mistakes[1]>30&&mistakes[2]>mistakes[1]&&mistakes[3]>mistakes[2],`more late-round mistakes: ${mistakes}`);
const ending={...input,roundActions:100,players:input.players.map((p,i)=>i===input.me?{...p,count:2,hand:[tile(3),tile(3,1)]}:p)};
assert.deepEqual(hiboringjiAction(ending,{type:'pass'}),best,'an immediate win is never thrown away');
const drawPosition={...input,code:'DRAW',roundActions:100,stacks:[{upper:true,lowerPresent:true,lower:null,available:true},{upper:true,lowerPresent:true,lower:null,available:true}]};
const hidden=structuredClone(drawPosition);hidden.stacks[1].lower=tile(3) as never;
assert.deepEqual(hiboringjiAction(hidden,{type:'draw',index:0}),hiboringjiAction(drawPosition,{type:'draw',index:0}),'concealed lower face cannot influence a careless draw');
for(const size of [1,2,3]){
 const lineup=chooseKoreanOpponents(size,['청돌','불찬','돌해'],()=>.3);assert.equal(lineup[0].name,HIBORINGJI.name);assert.equal(new Set(lineup.map(p=>p.avatar)).size,size);
 assert.deepEqual(restoreMonsterOpponents(lineup).map(p=>p.avatar),lineup.map(p=>p.avatar),'resume keeps the new identity');
}
const before=view(game,game.players[0].token);game.roundActions=73;
act(game,1,'play',[tile(7).id],-1,0,true);const after=view(game,game.players[0].token);
assert.equal(game.roundActions,74);assert.equal(JSON.parse(JSON.stringify(game)).roundActions,74);
assert.equal(eventBanter(before,after)[0]?.text,hiboringjiLine('confident',74,`${after.code}:${after.round}:${after.lastEvent!.id}:1`));
assert.equal(idleBanter(after,18000)?.who,1);
const old=structuredClone(game);delete old.roundActions;assert.ok(view(old,old.players[0].token).roundActions>=1,'old saves remain readable');
game.phase='ended';game.winner=0;start(game,0);assert.equal(game.roundActions,0,'anger resets for each new round');
for(const kind of Object.keys(HIBORINGJI_LINES) as (keyof typeof HIBORINGJI_LINES)[])for(const actions of [0,24,48,72])assert.ok(hiboringjiLine(kind,actions,'one').length>5);
assert.ok(openingGreeting(HIBORINGJI.avatar,HIBORINGJI.name).includes('성질'));
const portrait=monsterCharacter(3);assert.ok(existsSync('public'+portrait.src));
assert.ok(renderToStaticMarkup(<MonsterPortrait index={3}/>).includes(portrait.src));assert.ok(renderToStaticMarkup(<MonsterModel index={3}/>).includes('modelSrc' in portrait?portrait.modelSrc:portrait.src));
const name=renderToStaticMarkup(<OpponentName name={HIBORINGJI.name} bot/>);assert.ok(name.includes('opponent-name-full')&&!name.includes('<wbr')&&name.replace(/<[^>]*>/g,'').includes('히보')&&!name.includes('링지'));
assert.ok(!name.includes('…')&&!name.includes('...'));
assert.equal(HIBORINGJI.name,'히보');assert.equal(monsterCharacter(3).name,'히보');
assert.equal(restoreMonsterOpponents([{name:'히보링지',avatar:HIBORINGJI.avatar}])[0].name,'히보','old saves adopt the short name without changing identity');
const legacyName=renderToStaticMarkup(<OpponentName name="히보링지" bot/>);assert.ok(!legacyName.includes('링지')&&legacyName.includes('히보'));
const seen=new Set<string>();for(let i=0;i<100;i++){let seed=i+1;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};chooseKoreanOpponents(1,[],random).forEach(p=>seen.add(p.name));}assert.equal(seen.size,4,'random ordinary games can draw any of the four opponents');
console.log(`PASS: Hiboringji artwork, selection, saved identity, strong opening, four anger stages, legal mistakes ${mistakes.join('/')} per 400 seeds, public-only deterministic decisions, round reset, and contextual dialogue.`);
