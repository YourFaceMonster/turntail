import {analyzeItemBattleTurn} from '../lib/item-battle-plan';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRpgPhaseOneGame,startRpgRound} from '../lib/rpg-game';
import {createHpItemGame,saveHpItemGame,readHpItemArchive} from '../lib/hp-item-mode';
import {buyHpItemLoadout} from '../lib/hp-item-shop';
import {resolveHpItemBattle} from '../lib/hp-item-battle';
import {lastCombatBattle,resolveProfessionRpgBattle} from '../lib/rpg-profession-combat';
import {roundCombatState,settleProfessionRound} from '../lib/profession-round-combat';
import {hasImmediateSkills,roundSkill,ROUND_SKILLS} from '../lib/profession-round-rules';
import {act,view,botMove,type Game,type Tile} from '../lib/game';
import {triggerFloorTrap} from '../lib/item-battle-rules';
import {useRpgTacticalItem} from '../lib/rpg-items';
import {hpRoundTotals} from '../lib/hp-round-totals';
import HpBattleReview from '../app/components/HpBattleReview';
import {HpItemResult} from '../app/components/HpItemMatch';
import {RpgProfessionStatus,RoundCombatPending} from '../app/components/RpgProfessions';
import type {RpgProfessionId} from '../lib/rpg-professions';
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const combos:Record<string,Tile[]>={
 '싱글':[tile(7)],'페어':[tile(7),tile(7,1)],'트리플':[tile(7),tile(7,1),tile(7,2)],
 '스트레이트':[tile(3),tile(4,1),tile(5,2),tile(6,3),tile(7)],'플러시':[tile(3),tile(5),tile(7),tile(9),tile(11)],
 '풀하우스':[tile(7),tile(7,1),tile(7,2),tile(8),tile(8,1)],'포카드':[tile(7),tile(7,1),tile(7,2),tile(7,3),tile(8)],
 '스트레이트 플러시':[tile(3),tile(4),tile(5),tile(6),tile(7)],
};
function fresh(role:RpgProfessionId='mage',item=false){
 const g=item?createHpItemGame('검증','',Date.now(),2,'toto',role,100):createRpgPhaseOneGame('검증','',Date.now(),role);if(item)buyHpItemLoadout(g,[]);
 const r=g.rpgRun!;r.hp=[80,80,80];r.equipped=[];r.shield=0;r.coins=100;r.consumables=[];r.enemyConsumables={1:[],2:[]};r.combat!.professions=[role,'swordsman','mage'];g.turn=0;g.turnReadyAt=0;g.roundActions=3;g.completedBattles=1;g.trick=[];g.lastBy=null;g.players.forEach((p,s)=>p.hand=[tile(9,s),tile(10,s),tile(11,s),tile(12,s)]);if(item)g.hpItemMatch!.roundStartHp=[80,80,80];
 g.stacks=Array.from({length:15},(_,i)=>[tile(i+1,2),tile(i+1,3)]);if(g.floorCoins)g.floorCoins.randomTileId=null;return g;
}
function win(g:Game,label:string,actor=0){g.trick=combos[label];g.lastBy=actor;g.tablePlay={id:crypto.randomUUID(),who:actor,tiles:g.trick};return (g.hpItemMode?resolveHpItemBattle(g,100):resolveProfessionRpgBattle(g,100))!;}
function end(g:Game){roundCombatState(g).handFinished=true;g.phase='ended';g.winner=0;settleProfessionRound(g,200);}
for(const item of [false,true])for(const role of ['swordsman','mage','cleric','rogue'] as const)test(`${item?'item':'RPG'} ${role}: all pair+ skills apply immediately without a turn lock`,()=>{
 for(const label of Object.keys(ROUND_SKILLS)){
  const g=fresh(role,item),skill=roundSkill(role,label),event=win(g,label),total=event.damageTaken!.reduce((a,b)=>a+b,0);
  assert.equal(hasImmediateSkills(g),true);assert.equal(g.turnReadyAt,0);assert.equal(lastCombatBattle(g),undefined);assert.deepEqual(roundCombatState(g).damage,[0,0,0]);
  assert.equal(total,role==='swordsman'?skill.damage:role==='mage'?2*skill.damage:0);assert.equal(g.rpgRun!.hp[0],80+skill.heal);
  if(role==='rogue'){assert.equal(g.rpgRun!.tactics![0].peeks!.length,skill.reveal);assert.equal(g.rpgRun!.combat!.itemBattle!.traps.length,skill.trap?1:0);}
  const snap=JSON.stringify(g);(item?resolveHpItemBattle:resolveProfessionRpgBattle)(g,100);assert.equal(JSON.stringify(g),snap);
 }
});
test('basic singleton damage waits until hand empty and skills are never reapplied',()=>{
 for(const item of [false,true]){const g=fresh('mage',item);win(g,'페어');assert.deepEqual(g.rpgRun!.hp,[80,79,79]);win(g,'싱글');assert.deepEqual(g.rpgRun!.hp,[80,79,79]);g.trick=[];g.lastBy=null;g.players[0].hand=combos['트리플'];act(g,0,'play',g.players[0].hand.map(t=>t.id));assert.deepEqual(g.rpgRun!.hp,[80,76,76]);assert.equal(g.rpgRun!.combat!.pendingRound!.settled,true);const snap=JSON.stringify(g);settleProfessionRound(g);assert.equal(JSON.stringify(g),snap);assert.equal(lastCombatBattle(g),undefined);}
});
test('cleric healing is immediate, capped and does not reserve future card damage',()=>{
 const g=fresh('cleric');g.rpgRun!.hp[0]=99;win(g,'트리플');assert.equal(g.rpgRun!.hp[0],100);assert.equal(g.rpgRun!.combat!.effects[0].heal,1);win(g,'페어');assert.equal(g.rpgRun!.hp[0],100);win(g,'싱글',1);end(g);assert.equal(g.rpgRun!.hp[0],99);
});
test('RPG single enemy death is immediate and play continues with the surviving seats',()=>{
 const g=fresh('mage');g.rpgRun!.hp[1]=1;win(g,'페어');assert.equal(g.rpgRun!.hp[1],0);assert.deepEqual(g.rpgRun!.phaseOne!.eliminated,[1]);assert.equal(g.players[1].hand.length,0);assert.equal(g.phase,'playing');assert.equal(g.rpgRun!.status,'playing');g.turn=1;assert.throws(()=>act(g,1,'play',[]),/퇴장/);assert.equal(lastCombatBattle(g),undefined);
});
test('RPG clear and player death finish immediately and discard unfinished-card damage',()=>{
 const clear=fresh('mage');win(clear,'싱글');clear.rpgRun!.hp=[80,1,1];win(clear,'페어');assert.equal(clear.phase,'ended');assert.equal(clear.rpgRun!.status,'allocation');assert.deepEqual(clear.rpgRun!.hp,[80,0,0]);assert.ok(clear.result);
 const loss=fresh('cleric');win(loss,'싱글');loss.rpgRun!.hp[0]=1;win(loss,'페어',2);assert.equal(loss.phase,'ended');assert.equal(loss.rpgRun!.status,'game-over');assert.equal(loss.rpgRun!.hp[1],79,'unsettled basic damage was not also applied');
});
test('item skill kill immediately finishes the match with one existing result and correct totals',()=>{
 const g=fresh('mage',true);win(g,'싱글');g.rpgRun!.hp[1]=1;win(g,'페어');assert.equal(g.phase,'ended');assert.equal(g.rpgRun!.status,'complete');assert.equal(g.hpItemMatch!.moneySkipped,true);assert.equal(g.rpgRun!.hp[2],79);assert.deepEqual(g.hpItemMatch!.report!.settlementDamage,[0,1,1]);assert.equal(lastCombatBattle(g),undefined);
});
test('rogue pair scouts immediately and only the owner sees accumulated hidden faces',()=>{
 const g=fresh('rogue');win(g,'페어');win(g,'페어');const own=view(g,g.players[0].token),other=view(g,g.players[1].token);assert.equal(own.rpgRun!.tacticalPeeks!.length,2);assert.equal(other.rpgRun!.tacticalPeeks!.length,0);assert.equal(other.players[0].hand,undefined);assert.equal(own.rpgRun!.combat!.itemBattle!.traps.length,0);
});
test('trap pickup immediately damages/kills with no blocking trap animation',()=>{
 for(const item of [false,true]){const g=fresh('rogue',item);win(g,'트리플');const t=g.rpgRun!.combat!.itemBattle!.traps[0],face=g.stacks[t.index][1]||g.stacks[t.index][0]!;g.rpgRun!.hp[1]=2;triggerFloorTrap(g,1,t.index,face,100);assert.equal(g.rpgRun!.hp[1],0);if(!item)assert.equal(g.turnReadyAt,0);else assert.ok(g.turnReadyAt!<=Date.now()+1100,'only the existing final-result delay remains');assert.equal(g.rpgRun!.combat!.itemBattle!.lastTrap,undefined);assert.equal(g.rpgRun!.combat!.itemBattle!.trapEvents[0].damage,2);assert.equal(item?g.rpgRun!.status==='complete':g.rpgRun!.phaseOne!.eliminated.includes(1),true);}
});
test('own trap pickup is safe, leftover trap fallback is final-only and is not applied twice',()=>{
 const g=fresh('rogue');win(g,'트리플');let t=g.rpgRun!.combat!.itemBattle!.traps[0];triggerFloorTrap(g,0,t.index,g.stacks[t.index][1]||g.stacks[t.index][0]!,100);assert.equal(g.rpgRun!.hp[0],80);win(g,'트리플');const before=g.rpgRun!.hp.reduce((a,b)=>a+b,0);end(g);assert.equal(g.rpgRun!.hp.reduce((a,b)=>a+b,0),before-1);assert.equal(g.rpgRun!.combat!.itemBattle!.traps.length,0);settleProfessionRound(g);assert.equal(g.rpgRun!.hp.reduce((a,b)=>a+b,0),before-1);
});
test('items apply immediately and do not repeat at final card settlement',()=>{
 const g=fresh('cleric');g.rpgRun!.consumables=['emergency-herb','ember-bomb'];useRpgTacticalItem(g,'emergency-herb');assert.equal(g.rpgRun!.hp[0],90);g.roundActions=(g.roundActions||0)+1;useRpgTacticalItem(g,'ember-bomb',1);assert.equal(g.rpgRun!.hp[1],72);end(g);assert.deepEqual(g.rpgRun!.hp,[90,72,80]);
});
test('instant defense is consumed once and total report reconciles live changes plus final cards',()=>{
 const g=fresh('cleric',true);g.rpgRun!.equipped=['cracked-heart'];win(g,'페어',2);assert.equal(g.rpgRun!.hp[0],80);assert.equal(g.rpgRun!.crackedHeartUsed.length,1);win(g,'페어',2);assert.equal(g.rpgRun!.hp[0],79);win(g,'페어');assert.equal(g.rpgRun!.hp[0],81);g.trick=[];g.lastBy=null;g.players[0].hand=combos['싱글'];act(g,0,'play',g.players[0].hand.map(t=>t.id));const totals=hpRoundTotals(g.hpItemMatch!.report,0,80,g.rpgRun!.hp[0]);assert.deepEqual(totals,{damage:1,healing:2});assert.equal(g.rpgRun!.hp[0],81);
});
test('save/reload never replays already applied skills and preserves pending singleton damage',()=>{
 const g=fresh('mage',true);win(g,'페어');win(g,'싱글');const data=new Map<string,string>(),storage={getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>{data.set(k,v);}};saveHpItemGame(storage,g);const saved=readHpItemArchive(storage,2).active!;assert.deepEqual(saved.rpgRun!.hp,[80,79,79]);const snap=JSON.stringify(saved);resolveHpItemBattle(saved,100);assert.equal(JSON.stringify(saved),snap);end(saved);assert.deepEqual(saved.rpgRun!.hp,[80,78,78]);
});
test('0.7.0 mid-round saves preserve queued effects and switch only on next deal',()=>{
 const g=fresh('mage');delete g.rpgRun!.combat!.immediateSkills;win(g,'페어');assert.deepEqual(g.rpgRun!.hp,[80,80,80]);end(g);assert.deepEqual(g.rpgRun!.hp,[80,79,79]);startRpgRound(g);assert.equal(hasImmediateSkills(g),true);assert.equal(g.rpgRun!.combat!.pendingRound,undefined);
});
test('duplicate review is absent even for a saved 0.7.0 summary, existing result remains',()=>{
 const g=fresh('mage',true);g.players[0].hand=combos['페어'];act(g,0,'play',g.players[0].hand.map(t=>t.id));const v=view(g,g.players[0].token);assert.equal(lastCombatBattle(g),undefined);assert.equal(renderToStaticMarkup(<HpBattleReview game={v} onHit={()=>{}}/>),'');const html=renderToStaticMarkup(<HpItemResult game={v} busy={false} next={()=>{}} restart={()=>{}} exit={()=>{}}/>);assert.match(html,/이번 판 정산/);assert.doesNotMatch(html,/판 전체 정산/);delete g.rpgRun!.combat!.immediateSkills;assert.equal(lastCombatBattle(g),undefined);
});
test('live status explicitly separates immediate skills from pending card damage',()=>{
 const g=fresh('mage');win(g,'싱글',2);const v=view(g,g.players[0].token);assert.match(renderToStaticMarkup(<RoundCombatPending game={v}/>),/스킬 즉시 적용.*패 피해 1 정산 예정/);assert.match(renderToStaticMarkup(<RpgProfessionStatus game={v} seat={0} detail/>),/스킬 즉시/);
});
test('all professions complete legal bot-driven games with immediate skills and one final result',()=>{
 for(const item of [false,true])for(const role of ['swordsman','mage','cleric','rogue'] as const){
  const g=item?createHpItemGame('전체 진행','',Date.now(),2,'toto',role,100):createRpgPhaseOneGame('전체 진행','',Date.now(),role);if(item)buyHpItemLoadout(g,[]);g.rpgRun!.equipped=[];g.rpgRun!.consumables=[];g.rpgRun!.enemyConsumables={1:[],2:[]};g.players.forEach(p=>p.bot=true);let n=0;
  while(g.phase==='playing'&&n++<600){g.turnReadyAt=0;botMove(g,Date.now());assert.equal(lastCombatBattle(g),undefined);}
  assert.equal(g.phase,'ended',`${role} ${item} did not finish`);assert.ok(g.hpItemMatch?.report||g.result);assert.ok(g.rpgRun!.hp.every(hp=>hp>=0&&hp<=100));
 }
});

test('immediate-rule AI still uses only its own hand and known floor information',()=>{
 const g=fresh('rogue',true);g.turn=1;const own=view(g,g.players[1].token);const first=analyzeItemBattleTurn(own,{now:Date.now()});assert.notEqual(first.action.type,'profession');const injected=structuredClone(own);injected.players[0].hand=[tile(2),tile(2,1)];injected.stacks.forEach(stack=>{if(stack.upper)stack.lower=tile(2,3);});const second=analyzeItemBattleTurn(injected,{now:Date.now()});assert.deepEqual(second.action,first.action);
});
