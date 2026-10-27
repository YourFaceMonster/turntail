import assert from 'node:assert/strict';
import {act,view,type Game,type Tile} from '../lib/game.ts';
import {createHpItemGame,readHpItemArchive,saveHpItemGame} from '../lib/hp-item-mode.ts';
import {buyHpItemLoadout} from '../lib/hp-item-shop.ts';
import {resolveHpItemBattle} from '../lib/hp-item-battle.ts';
import {rpgItemAvailability,rpgItemsUnlocked,useRpgTacticalItem} from '../lib/rpg-items.ts';
import {useHpSkill} from '../lib/hp-item-skills.ts';
const t=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
function fresh(cart:string[]=[]){const g=createHpItemGame('나','',Date.now(),2);buyHpItemLoadout(g,cart);g.turn=0;g.turnReadyAt=0;g.rpgRun!.equipped=[];g.stacks=Array.from({length:15},()=>[null,null]);g.stacks[0]=[t(9,3),null];g.trick=[];g.lastBy=null;return g;}
function singleStart(g:Game){g.players[0].hand=[t(3),t(6),t(10)];g.players[1].hand=[t(4),t(11)];g.players[2].hand=[t(12),t(13)];act(g,0,'play',[t(3).id]);act(g,1,'play',[t(4).id]);}
function singleFinish(g:Game){act(g,2,'draw',[],0);act(g,0,'play',[t(6).id]);act(g,1,'pass');act(g,2,'pass');}
const single=fresh(['whisper-eye']);singleStart(single);const wallet=[...single.hpItemMatch!.points];singleFinish(single);
assert.equal(single.hpItemMatch!.lastBattle?.playedCount,2);assert.equal(single.hpItemMatch!.lastBattle?.damage,2);assert.deepEqual(single.rpgRun!.hp,[100,98,98]);assert.deepEqual(single.hpItemMatch!.points,wallet);assert.deepEqual(single.hpItemMatch!.battleTiles,[0,0,0]);
const hands=JSON.stringify(single.players.map(player=>player.hand));useRpgTacticalItem(single,'whisper-eye',1);assert.equal(single.rpgRun!.lastItem?.kind,'reveal');assert.equal(JSON.stringify(single.players.map(player=>player.hand)),hands,'eye needs only a target, never a selected hand tile');
act(single,0,'play',[t(10).id]);assert.equal(single.phase,'ended');assert.equal(single.hpItemMatch!.lastBattle?.damage,1,'a new fight starts its own count');assert.equal(single.hpItemMatch!.lastBattle?.roundFinal,true);

const pair=fresh();pair.players[0].hand=[t(3),t(3,1),t(6),t(6,1),t(10)];pair.players[1].hand=[t(4),t(4,1),t(11)];pair.players[2].hand=[t(12),t(13)];act(pair,0,'play',[t(3).id,t(3,1).id]);act(pair,1,'play',[t(4).id,t(4,1).id]);act(pair,2,'draw',[],0);act(pair,0,'play',[t(6).id,t(6,1).id]);act(pair,1,'pass');act(pair,2,'pass');assert.equal(pair.hpItemMatch!.lastBattle?.damage,4);assert.deepEqual(pair.rpgRun!.hp,[100,96,96]);

const five=fresh(),straight=(start:number,offset=0)=>Array.from({length:5},(_,i)=>t(start+i,(i+offset)%4));const low=straight(3),mid=straight(4,2),high=straight(9);five.players[0].hand=[...low,...high,t(14)];five.players[1].hand=[...mid,t(15)];five.players[2].hand=[t(14,1),t(15,2)];act(five,0,'play',low.map(tile=>tile.id));act(five,1,'play',mid.map(tile=>tile.id));act(five,2,'draw',[],0);act(five,0,'play',high.map(tile=>tile.id));act(five,1,'pass');act(five,2,'pass');assert.equal(five.hpItemMatch!.lastBattle?.damage,10);assert.deepEqual(five.rpgRun!.hp,[100,90,90]);

const skilled=fresh();skilled.completedBattles=1;skilled.roundActions=3;useHpSkill(skilled);skilled.players[0].hand=[t(3),t(6),t(10)];skilled.players[1].hand=[t(4),t(11)];skilled.players[2].hand=[t(12),t(13)];act(skilled,0,'play',[t(3).id]);skilled.turnReadyAt=0;useHpSkill(skilled,1);act(skilled,1,'play',[t(4).id]);singleFinish(skilled);assert.equal(skilled.hpItemMatch!.lastBattle?.damage,2);assert.deepEqual(skilled.rpgRun!.hp,[100,99,97],'attack and guard skills layer on the submitted-tile total');

const initial=fresh(['whisper-eye']);initial.players[0].hand=[t(3)];initial.players[1].hand=[t(4)];assert.equal(rpgItemsUnlocked(view(initial,initial.players[0].token)),false);assert.throws(()=>useRpgTacticalItem(initial,'whisper-eye',1),/첫 판/);initial.round=2;initial.hpItemMatch!.shopRound=2;assert.equal(rpgItemAvailability(view(initial,initial.players[0].token),'whisper-eye',true).usable,true);useRpgTacticalItem(initial,'whisper-eye',1);assert.equal(initial.rpgRun!.tacticalUsed,1,'round-two opening lead can use an item');

const lots=createHpItemGame('나','',Date.now(),2);lots.hpItemMatch!.points=[200,200,200];lots.rpgRun!.consumables=Array(9).fill('ward-seal');buyHpItemLoadout(lots,[...Array(12).fill('scout-lens'),...Array(8).fill('emergency-herb')]);assert.equal(lots.rpgRun!.consumables.length,29);assert.equal(lots.hpItemMatch!.points[0],124,'all affordable items can be bought beyond five held copies');

const partial=fresh();singleStart(partial);const memory=new Map<string,string>(),storage={getItem:(key:string)=>memory.get(key)||null,setItem:(key:string,value:string)=>{memory.set(key,value);}};saveHpItemGame(storage,partial);const restored=readHpItemArchive(storage,2).active!;assert.deepEqual(restored.hpItemMatch!.battleTiles,[1,1,0]);singleFinish(restored);assert.equal(restored.hpItemMatch!.lastBattle?.damage,2);
const old=fresh();delete old.hpItemMatch!.battleTiles;old.lastBy=0;old.trick=[t(6)];old.tablePlay={id:'old-mid-fight',who:0,tiles:old.trick};old.log=['나 · 싱글 1개 제출',`${old.players[1].name} · 싱글 1개 제출`,'나 · 싱글 1개 제출','나이 선을 잡았습니다.'];assert.equal(resolveHpItemBattle(old)!.damage,2,'an older mid-fight save recovers available public submissions');
console.log('PASS: single/pair cumulative damage, reset/final fight, skills, first-match-only lock, target-only eye, unlimited stock and mid-fight saves');
