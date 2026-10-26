import assert from 'node:assert/strict';
import {createRpgTestGame,createRpgGame} from '../lib/rpg-game.ts';
import {act,botMove,view,start,legalOptions,type Game} from '../lib/game.ts';
import {useRpgTacticalItem,chooseRpgBotItem,rpgItemAvailability,rpgItemNoticeText} from '../lib/rpg-items.ts';
import {readRpgTestGame,saveRpgTestGame} from '../lib/rpg-test-storage.ts';
const fresh=()=>{const g=createRpgTestGame('아이템 검증');g.turn=0;g.trick=[];g.roundActions=g.players.length;g.rpgRun!.equipped=[];g.turnReadyAt=0;return g;};
const take=(g:Game,seat:number,id:string)=>seat===0?g.rpgRun!.consumables=[id]:g.rpgRun!.enemyConsumables![seat]=[id];

const herb=fresh();take(herb,0,'emergency-herb');
const full=JSON.stringify(herb);assert.throws(()=>useRpgTacticalItem(herb,'emergency-herb'));assert.equal(JSON.stringify(herb),full,'full HP does not consume a herb');
herb.rpgRun!.hp[0]=96;useRpgTacticalItem(herb,'emergency-herb');assert.equal(herb.rpgRun!.hp[0],100);assert.equal(herb.rpgRun!.consumables.length,0);assert.equal(herb.turn,0,'items do not replace the card action');
const noSecond=JSON.stringify(herb);assert.throws(()=>useRpgTacticalItem(herb,'ward-seal',-1,[herb.players[0].hand[0].id]));assert.equal(JSON.stringify(herb),noSecond);

const seal=fresh();useRpgTacticalItem(seal,'ward-seal');
assert.equal(seal.rpgRun!.itemGuards?.[0],true);assert.equal(view(seal,seal.players[0].token).rpgRun!.itemGuards?.[0],true);
const enemyView=view(seal,seal.players[1].token);assert.equal(enemyView.rpgRun!.itemGuards?.[0],undefined,'the armed guard is private');assert.equal(enemyView.rpgRun!.lastItem,undefined,'arming a shield is never announced to an opponent');assert.equal(enemyView.rpgRun!.enemyConsumables?.[0],undefined,'inventory changes cannot disclose the secret shield');assert.ok(!seal.log.some(line=>line.includes('방패')||line.includes('봉인')),'arming a guard leaves no public log');
seal.turn=1;take(seal,1,'swapped-fate');const hands=JSON.stringify(seal.players.map(player=>player.hand));
useRpgTacticalItem(seal,'swapped-fate',0,[seal.players[1].hand[0].id],1);assert.equal(JSON.stringify(seal.players.map(player=>player.hand)),hands,'a shield blocks the entire exchange');assert.equal(seal.rpgRun!.itemGuards?.[0],false);assert.equal(seal.rpgRun!.lastItem?.kind,'blocked');assert.equal(seal.rpgRun!.lastExchange,undefined);assert.equal(seal.rpgRun!.enemyConsumables![1].length,0,'the blocked attack still consumes its item');
seal.turn=2;take(seal,2,'ember-bomb');useRpgTacticalItem(seal,'ember-bomb',0,[],2);assert.equal(seal.rpgRun!.hp[0],92,'the guard is spent after blocking one hostile item');
const guardDamage=fresh();useRpgTacticalItem(guardDamage,'ward-seal');guardDamage.turn=1;take(guardDamage,1,'ember-bomb');useRpgTacticalItem(guardDamage,'ember-bomb',0,[],1);assert.equal(guardDamage.rpgRun!.hp[0],100);assert.equal(guardDamage.rpgRun!.lastItem?.kind,'blocked');
guardDamage.turn=2;take(guardDamage,2,'swapped-fate');const received=guardDamage.players[2].hand[0].id;useRpgTacticalItem(guardDamage,'swapped-fate',0,[received],2);assert.ok(guardDamage.players[0].hand.some(tile=>tile.id===received),'an attack consumes the shield, so a later exchange succeeds');
const reset=fresh();useRpgTacticalItem(reset,'ward-seal');reset.phase='ended';start(reset);assert.equal(reset.rpgRun!.itemGuards?.[0],true,'the prepared shield lasts until the first hostile item, across card rounds');
for(const seat of [0,1,2])for(const actions of [0,1,2]){const opening=fresh();opening.turn=seat;opening.roundActions=actions;const before=JSON.stringify(opening);assert.equal(rpgItemAvailability(view(opening,opening.players[seat].token),'ember-bomb',true).usable,false);assert.throws(()=>useRpgTacticalItem(opening,'ember-bomb',(seat+1)%3,[],seat));assert.equal(JSON.stringify(opening),before,'opening restrictions consume nothing');}
const openingBot=fresh();openingBot.turn=1;openingBot.roundActions=0;take(openingBot,1,'ember-bomb');botMove(openingBot);assert.deepEqual(openingBot.rpgRun!.enemyConsumables![1],['ember-bomb'],'AI also waits for a full opening cycle');

const bomb=fresh();take(bomb,0,'ember-bomb');const original=bomb.rpgRun!.hp[1];useRpgTacticalItem(bomb,'ember-bomb',1);
assert.equal(bomb.rpgRun!.hp[1],original-8,'bombs hit immediately before a card action');assert.equal(bomb.turn,0);assert.equal(bomb.phase,'playing');assert.equal(bomb.rpgRun!.consumables.length,0);
const struck=JSON.stringify(bomb);assert.throws(()=>act(bomb,0,'play',[-123]));assert.equal(JSON.stringify(bomb),struck,'an invalid card play cannot repeat or undo item damage');
act(bomb,0,'play',[bomb.players[0].hand[0].id]);assert.equal(bomb.rpgRun!.hp[1],original-8,'submitting a card does not hit a second time');
const drawBomb=fresh();take(drawBomb,0,'ember-bomb');drawBomb.trick=[{id:999,n:2,s:3}];assert.equal(rpgItemAvailability(view(drawBomb,drawBomb.players[0].token),'ember-bomb',true).usable,true,'bombs do not require a playable hand');useRpgTacticalItem(drawBomb,'ember-bomb',1);act(drawBomb,0,'draw',[],0);assert.notEqual(drawBomb.turn,0,'normal drawing remains legal after an immediate bomb');
const invalid=fresh();take(invalid,0,'ember-bomb');const invalidBefore=JSON.stringify(invalid);assert.throws(()=>useRpgTacticalItem(invalid,'ember-bomb',0));assert.equal(JSON.stringify(invalid),invalidBefore,'invalid targets consume nothing');
const capped=fresh();take(capped,0,'ember-bomb');capped.rpgRun!.hp[1]=4;useRpgTacticalItem(capped,'ember-bomb',1);assert.equal(capped.rpgRun!.hp[1],1);assert.equal(capped.phase,'playing','item damage does not interrupt the card round');
const blocked=fresh();blocked.turn=1;take(blocked,1,'ember-bomb');blocked.rpgRun!.equipped=['cracked-heart'];useRpgTacticalItem(blocked,'ember-bomb',0,[],1);assert.equal(blocked.rpgRun!.hp[0],100);assert.deepEqual(blocked.rpgRun!.crackedHeartUsed,[blocked.rpgRun!.stage]);assert.equal(blocked.rpgRun!.lastItem?.amount,0);assert.equal(blocked.rpgRun!.tactics?.[1].used,1,'relic mitigation preserves the attacking actor’s quota');
const lastCard=fresh();take(lastCard,0,'ember-bomb');lastCard.players[0].hand=lastCard.players[0].hand.slice(0,1);useRpgTacticalItem(lastCard,'ember-bomb',1);act(lastCard,0,'play',[lastCard.players[0].hand[0].id]);assert.equal(lastCard.phase,'ended');assert.ok(lastCard.rpgRun!.hp[1]<=92,'immediate damage participates in the later card settlement');

const scout=fresh();useRpgTacticalItem(scout,'scout-lens',0);assert.ok(view(scout,scout.players[0].token).rpgRun!.tacticalPeek);assert.equal(view(scout,scout.players[1].token).rpgRun!.tacticalPeek,undefined,'AI cannot read another actor’s lens information');
for(const id of ['emergency-herb','ward-seal','ember-bomb','swapped-fate','scout-lens'] as const){
 const g=fresh();g.turn=1;take(g,1,id);
 if(id==='emergency-herb')g.rpgRun!.hp[1]=80;
 if(id==='swapped-fate'||id==='scout-lens')g.trick=[{id:999,n:2,s:3}];
 const position=view(g,g.players[1].token);assert.equal(position.players[0].hand,undefined);
 const choice=chooseRpgBotItem(position);assert.equal(choice?.id,id,`AI has a meaningful use for ${id}`);
 botMove(g);assert.equal(g.rpgRun!.enemyConsumables![1].length,0,`AI executes ${id} and completes a legal main action`);assert.notEqual(g.turn,1);
}
const quota=fresh();take(quota,1,'emergency-herb');quota.rpgRun!.enemyConsumables![1]=['emergency-herb','emergency-herb','emergency-herb','emergency-herb'];quota.rpgRun!.hp[1]=40;
for(let use=0;use<3;use++){quota.turn=1;useRpgTacticalItem(quota,'emergency-herb',-1,[],1);quota.roundActions!++;}
quota.turn=1;assert.equal(rpgItemAvailability(view(quota,quota.players[1].token),'emergency-herb',true).usable,false);assert.throws(()=>useRpgTacticalItem(quota,'emergency-herb',-1,[],1));assert.equal(quota.rpgRun!.enemyConsumables![1].length,1);
quota.turn=0;take(quota,0,'ward-seal');useRpgTacticalItem(quota,'ward-seal');assert.equal(quota.rpgRun!.tacticalUsed,1,'the human allowance is independent of AI use');

const privateA=fresh();privateA.turn=1;take(privateA,1,'swapped-fate');privateA.trick=[{id:999,n:2,s:3}];const privateB=structuredClone(privateA);privateB.players[0].hand=privateB.players[0].hand.map(t=>({...t,n:15,s:0}));
assert.deepEqual(chooseRpgBotItem(view(privateA,privateA.players[1].token)),chooseRpgBotItem(view(privateB,privateB.players[1].token)),'hidden enemy faces cannot alter the AI item decision');
const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
const saved=fresh();useRpgTacticalItem(saved,'ward-seal');saveRpgTestGame(storage,saved);const loaded=readRpgTestGame(storage)!;assert.deepEqual(loaded.rpgRun,JSON.parse(JSON.stringify(saved.rpgRun)),'new inventory and protection survive save/restore');
const legacy=createRpgGame('이전 저장');delete legacy.rpgRun!.tactics;delete legacy.rpgRun!.enemyConsumables;legacy.turn=1;legacy.trick=[];botMove(legacy);assert.ok(legacy.rpgRun!.enemyConsumables?.[1],'old saves safely initialize an enemy kit without changing human inventory');
const oldPrepared=fresh();take(oldPrepared,0,'ember-bomb');oldPrepared.rpgRun!.consumables=[];oldPrepared.rpgRun!.tactics={0:{round:oldPrepared.round,used:1,turn:0,ember:{target:1,turn:0}}};oldPrepared.rpgRun!.tacticalUsed=1;saveRpgTestGame(storage,oldPrepared);const recovered=readRpgTestGame(storage)!;assert.deepEqual(recovered.rpgRun!.consumables,['ember-bomb']);assert.equal(recovered.rpgRun!.tactics![0].used,0);assert.equal(recovered.rpgRun!.tactics![0].ember,undefined,'old prepared bombs are refunded without silently damaging anyone on resume');assert.deepEqual(readRpgTestGame(storage)!.rpgRun!.consumables,['ember-bomb'],'reading an old save repeatedly never accumulates refunds');
const people=[{name:'나'},{name:'로웬'},{name:'루미'}];
const notice={id:'item-notice',actor:1,target:0,itemId:'ember-bomb' as const,kind:'damage' as const,amount:8,at:1};
assert.deepEqual(rpgItemNoticeText(notice,people),{title:'작열탄 사용',route:'로웬 → 나',detail:'HP −8'});
assert.equal(rpgItemNoticeText({...notice,itemId:'swapped-fate',kind:'exchange'},people).route,'로웬 → 나');
assert.equal(rpgItemNoticeText({...notice,itemId:'scout-lens',kind:'scout',target:2},people).route,'로웬 → 바닥 2층 패','a stack index must not be mistaken for a character target');
assert.equal(rpgItemNoticeText({...notice,itemId:'ward-seal',kind:'seal',target:-1},people).route,'로웬 → 자신');
const hiddenGuard=fresh();hiddenGuard.turn=1;take(hiddenGuard,1,'ember-bomb');const withoutGuard=structuredClone(hiddenGuard);hiddenGuard.rpgRun!.itemGuards={0:true};assert.deepEqual(chooseRpgBotItem(view(hiddenGuard,hiddenGuard.players[1].token)),chooseRpgBotItem(view(withoutGuard,withoutGuard.players[1].token)),'AI decisions cannot see enemy guard readiness');
const oldSeal=fresh();oldSeal.rpgRun!.tactics={0:{round:oldSeal.round,used:1,turn:3,sealed:[oldSeal.players[0].hand[0].id]}};saveRpgTestGame(storage,oldSeal);const newSeal=readRpgTestGame(storage)!;assert.equal(newSeal.rpgRun!.itemGuards?.[0],true,'old tile protection is upgraded to the new one-use shield');assert.equal(newSeal.rpgRun!.tactics![0].sealed,undefined);
const doubleGuard=fresh();useRpgTacticalItem(doubleGuard,'ward-seal');doubleGuard.turn=1;take(doubleGuard,1,'fates-scales');const doubleBefore=JSON.stringify(doubleGuard.players.map(player=>player.hand));useRpgTacticalItem(doubleGuard,'fates-scales',0,doubleGuard.players[1].hand.slice(0,2).map(tile=>tile.id),1);assert.equal(JSON.stringify(doubleGuard.players.map(player=>player.hand)),doubleBefore,'the shield cancels a two-card exchange as one hostile item');
const invalidGuard=fresh();useRpgTacticalItem(invalidGuard,'ward-seal');invalidGuard.turn=1;take(invalidGuard,1,'swapped-fate');assert.throws(()=>useRpgTacticalItem(invalidGuard,'swapped-fate',0,[-999],1));assert.equal(invalidGuard.rpgRun!.itemGuards?.[0],true,'an invalid attack cannot consume the defender’s shield');
console.log('PASS: five tactical items, HP timing, protection, per-actor limits, private bot choices and saved state');
