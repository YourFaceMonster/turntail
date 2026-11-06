import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRpgPhaseOneGame,startRpgRound} from '../lib/rpg-game';
import {createHpItemGame,saveHpItemGame,readHpItemArchive} from '../lib/hp-item-mode';
import {buyHpItemLoadout,finishHpItemRoundReport} from '../lib/hp-item-shop';
import {saveRpgGame,readRpgArchive} from '../lib/rpg-storage';
import {act,settle,view,botMove,type Game,type Tile} from '../lib/game';
import {resolveProfessionRpgBattle} from '../lib/rpg-profession-combat';
import {resolveHpItemBattle} from '../lib/hp-item-battle';
import {roundCombatState,queueRoundDamage,queueRoundHealing,settleProfessionRound} from '../lib/profession-round-combat';
import {ROUND_SKILLS,roundSkill,hasRoundCombat} from '../lib/profession-round-rules';
import {professionActiveAvailability,useProfessionActive} from '../lib/profession-actives';
import {triggerFloorTrap,triggerScoutedPickup} from '../lib/item-battle-rules';
import {useRpgTacticalItem,rpgItemAvailability} from '../lib/rpg-items';
import {hpRoundTotals} from '../lib/hp-round-totals';
import {analyzeItemBattleTurn} from '../lib/item-battle-plan';
import {RpgProfessionPicker,RoundCombatPending,RpgProfessionStatus} from '../app/components/RpgProfessions';
import {ProfessionActiveControl} from '../app/components/ProfessionActives';
import {DuelResultBody} from '../app/components/HpBattleReview';
import type {RpgProfessionId} from '../lib/rpg-professions';
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const hands:Record<string,Tile[]>={
 '싱글':[tile(7)],'페어':[tile(7),tile(7,1)],'트리플':[tile(7),tile(7,1),tile(7,2)],
 '스트레이트':[tile(3),tile(4,1),tile(5,2),tile(6,3),tile(7)],
 '플러시':[tile(3),tile(5),tile(7),tile(9),tile(11)],
 '풀하우스':[tile(7),tile(7,1),tile(7,2),tile(8),tile(8,1)],
 '포카드':[tile(7),tile(7,1),tile(7,2),tile(7,3),tile(8)],
 '스트레이트 플러시':[tile(3),tile(4),tile(5),tile(6),tile(7)],
};
const roles:RpgProfessionId[]=['swordsman','mage','cleric','rogue'];
function fresh(role:RpgProfessionId='swordsman',item=false){
 const g=item?createHpItemGame('검증','',Date.now(),2,'toto',role,100):createRpgPhaseOneGame('검증','',Date.now(),role);
 if(item)buyHpItemLoadout(g,[]);
 const run=g.rpgRun!;run.equipped=[];run.shield=0;run.hp=[100,100,100];run.coins=100;run.consumables=[];run.enemyConsumables={1:[],2:[]};run.combat!.professions=[role,'swordsman','mage'];
 g.turn=0;g.turnReadyAt=0;g.roundActions=3;g.completedBattles=1;g.lastBy=null;g.trick=[];g.tablePlay=null;
 g.players.forEach((p,seat)=>p.hand=[tile(9,seat),tile(10,seat),tile(11,seat),tile(12,seat)]);
 g.stacks=Array.from({length:15},(_,i)=>[tile(i+1,2),tile(i+1,3)]);if(g.floorCoins){g.floorCoins.randomTileId=null;}
 return g;
}
function win(g:Game,label:string,actor=0){g.lastBy=actor;g.trick=hands[label];g.tablePlay={id:crypto.randomUUID(),who:actor,tiles:g.trick};return (g.hpItemMode?resolveHpItemBattle(g,100):resolveProfessionRpgBattle(g,100))!;}
function finish(g:Game,winner=0){g.phase='ended';g.winner=winner;settleProfessionRound(g,200);}
for(const item of [false,true])for(const role of roles)test(`${item?'item':'RPG'} ${role}: all eight combos accumulate, repeat and never lock turns`,()=>{
 for(const [label,tiles] of Object.entries(hands)){
  const g=fresh(role,item),before=[...g.rpgRun!.hp],event=win(g,label),s=roundCombatState(g),skill=roundSkill(role,label);
  assert.equal(event.label,label);assert.equal(event.roundPending,true);assert.deepEqual(g.rpgRun!.hp,before);assert.equal(g.turnReadyAt,0);assert.equal(g.rpgRun!.combat!.lastBattle,undefined);
  assert.equal(s.healing[0],skill.heal);
  const expected=label==='싱글'?2:role==='mage'?skill.damage*2:role==='swordsman'?skill.damage:0;
  assert.equal(s.damage.reduce((a,b)=>a+b,0),expected);
  if(role==='swordsman'&&label!=='싱글')assert.equal(s.damage.filter(n=>n>0).length,1);
  if(role==='rogue'&&label!=='싱글'){assert.equal(g.rpgRun!.tactics![0].peeks!.length,skill.reveal);assert.equal(g.rpgRun!.combat!.itemBattle!.traps.length,skill.trap?1:0);}
  const snapshot=JSON.stringify(g);(item?resolveHpItemBattle:resolveProfessionRpgBattle)(g,100);assert.equal(JSON.stringify(g),snapshot,'duplicate trick is inert');
  win(g,label);assert.equal(g.rpgRun!.combat!.battles.length,2,'all skills repeat without per-round cap');assert.deepEqual(g.rpgRun!.hp,before);
 }
});
test('approved small values are exact and no old character bonus is stacked',()=>{
 assert.deepEqual(Object.values(ROUND_SKILLS),[[2,1,2,1,0],[3,2,3,1,2],[4,2,4,1,3],[4,2,4,1,3],[5,3,5,1,4],[6,3,6,2,5],[8,4,8,2,7]]);
 for(const role of roles){const g=fresh(role);win(g,'싱글');assert.deepEqual(roundCombatState(g).damage,[0,1,1]);assert.equal(g.rpgRun!.combat!.effects.length,0);}
});
test('one player emptying their hand settles all prior and last-combo effects once',()=>{
 for(const item of [false,true]){const g=fresh('mage',item);win(g,'페어');g.trick=[];g.lastBy=null;g.players[0].hand=hands['트리플'];act(g,0,'play',g.players[0].hand.map(t=>t.id));assert.equal(g.phase,'ended');assert.equal(g.winner,0);assert.deepEqual(g.rpgRun!.hp,[100,97,97]);assert.equal(g.rpgRun!.combat!.lastBattle!.roundSettlement,true);assert.equal(g.rpgRun!.combat!.battles.length,2);const snapshot=JSON.stringify(g);settle(g);assert.equal(JSON.stringify(g),snapshot);}
});
test('normal play cycle clears trick without HP change or battle popup',()=>{
 const g=fresh('mage');g.stacks=g.stacks.map(()=>[null,null]);g.players[0].hand=[...hands['페어'],tile(8)];act(g,0,'play',hands['페어'].map(t=>t.id),-1,0);const ready=g.turnReadyAt;act(g,1,'pass',[],-1,ready);act(g,2,'pass',[],-1,ready);assert.equal(g.trick.length,0);assert.deepEqual(g.rpgRun!.hp,[100,100,100]);assert.equal(g.rpgRun!.combat!.lastBattle,undefined);assert.equal(g.turnReadyAt,0);assert.equal(roundCombatState(g).damage[1],1);
});
test('damage and healing apply together, including full-HP cleric and lethal incoming damage',()=>{
 const g=fresh('cleric');g.rpgRun!.hp=[5,100,100];queueRoundDamage(g,0,7);win(g,'트리플');assert.equal(g.rpgRun!.hp[0],5);finish(g);assert.equal(g.rpgRun!.hp[0],1);
 const full=fresh('cleric');win(full,'트리플');queueRoundDamage(full,0,8);finish(full);assert.equal(full.rpgRun!.hp[0],95);
 const cap=fresh('cleric');win(cap,'포카드');finish(cap);assert.equal(cap.rpgRun!.hp[0],100);assert.equal(cap.rpgRun!.combat!.lastBattle!.roundHealing![0],0);
});
test('random single attacks keep targets fixed when saved and final order cannot cancel attacks',()=>{
 const g=fresh('swordsman');win(g,'트리플');const before=[...roundCombatState(g).damage];queueRoundDamage(g,0,200);finish(g);assert.equal(g.rpgRun!.hp[0],0);assert.equal(200-g.rpgRun!.combat!.lastBattle!.damageTaken![0],100);assert.deepEqual(g.rpgRun!.hp.slice(1),before.slice(1).map(n=>100-n));
});
test('rogue always scouts new upper tiles for pair+, accumulates knowledge, and reveals nothing to opponents',()=>{
 const g=fresh('rogue');win(g,'페어');win(g,'트리플');win(g,'포카드');const own=view(g,g.players[0].token),other=view(g,g.players[1].token);assert.equal(own.rpgRun!.tacticalPeeks!.length,4);assert.equal(new Set(own.rpgRun!.tacticalPeeks!.map(p=>p.tile.id)).size,4);assert.equal(other.rpgRun!.tacticalPeeks!.length,0);assert.equal(other.players[0].hand,undefined);assert.equal(other.rpgRun!.combat!.itemBattle!.traps.length,0);assert.equal(own.rpgRun!.combat!.itemBattle!.traps.length,2);assert.ok(own.rpgRun!.combat!.itemBattle!.traps.every(t=>t.tileId===-1));
 g.stacks=g.stacks.map(()=>[null,null]);assert.doesNotThrow(()=>win(g,'페어'));
});
test('triggered trap queues its own strength once and imposes no animation lock',()=>{
 const g=fresh('rogue');win(g,'포카드');const trap=g.rpgRun!.combat!.itemBattle!.traps[0],t=g.stacks[trap.index][1]||g.stacks[trap.index][0]!;triggerFloorTrap(g,1,trap.index,t,100);assert.deepEqual(g.rpgRun!.hp,[100,100,100]);assert.equal(roundCombatState(g).trapDamage[1],5);assert.equal(g.turnReadyAt,0);assert.equal(g.rpgRun!.combat!.itemBattle!.lastTrap,undefined);triggerFloorTrap(g,1,trap.index,t,100);assert.equal(roundCombatState(g).trapDamage[1],5);finish(g);assert.equal(g.rpgRun!.hp[1],95);
});
test('own pickup disarms safely, scouting pickup has no old ambush, leftover traps do one damage each',()=>{
 const g=fresh('rogue');win(g,'트리플');const trap=g.rpgRun!.combat!.itemBattle!.traps[0],t=g.stacks[trap.index][1]!;triggerFloorTrap(g,0,trap.index,t,0);assert.equal(roundCombatState(g).damage.reduce((a,b)=>a+b,0),0);assert.equal(triggerScoutedPickup(g,0,trap.index,t,0),null);win(g,'트리플');win(g,'포카드');finish(g);assert.equal(roundCombatState(g).trapDamage.reduce((a,b)=>a+b,0),2);assert.equal(g.rpgRun!.combat!.itemBattle!.traps.length,0);
});
test('last-combo trap and empty-floor trap fallback both contribute one point',()=>{
 for(const empty of [false,true]){const g=fresh('rogue');if(empty)g.stacks=g.stacks.map(()=>[null,null]);g.players[0].hand=hands['트리플'];act(g,0,'play',g.players[0].hand.map(t=>t.id));assert.equal(roundCombatState(g).trapDamage.reduce((a,b)=>a+b,0),1);assert.equal(g.rpgRun!.combat!.itemBattle!.traps.length,0);}
});
test('manual gauge skills are disabled on both backend and UI',()=>{
 const g=fresh('swordsman',true);assert.equal(professionActiveAvailability(g,0,true,0).usable,false);assert.throws(()=>useProfessionActive(g,0,1,0));const html=renderToStaticMarkup(<ProfessionActiveControl game={view(g,g.players[0].token)} enabled targeting={false} choose={()=>{}}/>);assert.equal(html,'');
});
test('consumable damage/healing join settlement, and projected lethal targets stay targetable',()=>{
 const g=fresh('cleric');g.rpgRun!.hp=[90,3,100];g.rpgRun!.consumables=['ember-bomb','emergency-herb'];useRpgTacticalItem(g,'ember-bomb',1);assert.deepEqual(g.rpgRun!.hp,[90,3,100]);assert.equal(g.rpgRun!.lastItem!.hpBefore,undefined);g.roundActions=(g.roundActions||0)+1;useRpgTacticalItem(g,'emergency-herb');assert.equal(g.rpgRun!.hp[0],90);finish(g);assert.deepEqual(g.rpgRun!.hp,[100,0,100]);assert.equal(g.rpgRun!.roundHealth!.healing[0],10);
});
test('defense is consumed at final settlement only; gross totals match final HP',()=>{
 const g=fresh('cleric',true);g.rpgRun!.hp=[80,100,100];g.hpItemMatch!.roundStartHp=[80,100,100];g.rpgRun!.equipped=['cracked-heart'];g.rpgRun!.shield=2;queueRoundDamage(g,0,15,'trap');queueRoundHealing(g,0,3);assert.equal(g.rpgRun!.crackedHeartUsed.length,0);finish(g);finishHpItemRoundReport(g);assert.equal(g.rpgRun!.hp[0],78);assert.equal(g.rpgRun!.shield,0);assert.equal(g.rpgRun!.crackedHeartUsed.length,1);assert.deepEqual(hpRoundTotals(g.hpItemMatch!.report,0,80,78),{damage:5,healing:3});
});
test('save/reload preserves pending attacks, private scouting and unresolved traps',()=>{
 for(const item of [false,true]){const g=fresh('rogue',item);win(g,'트리플');queueRoundDamage(g,0,4);const values=new Map<string,string>(),storage={getItem:(k:string)=>values.get(k)||null,setItem:(k:string,v:string)=>{values.set(k,v);}};if(item)saveHpItemGame(storage,g);else saveRpgGame(storage,g);const saved=(item?readHpItemArchive(storage,2):readRpgArchive(storage)).active!;assert.deepEqual(saved.rpgRun!.combat,JSON.parse(JSON.stringify(g.rpgRun!.combat)));finish(saved);assert.equal(saved.rpgRun!.hp[0],96);assert.equal(roundCombatState(saved).trapDamage.reduce((a,b)=>a+b,0),1);}
});
test('old saved round stays old until next deal; reset does not reapply old attacks',()=>{
 const g=fresh('mage');delete g.rpgRun!.combat!.roundRules;const event=win(g,'페어');assert.equal(event.roundPending,undefined);assert.equal(g.rpgRun!.hp[1],98);g.phase='ended';g.winner=0;startRpgRound(g);assert.equal(hasRoundCombat(g),true);assert.equal(g.rpgRun!.combat!.pendingRound,undefined);assert.equal(g.rpgRun!.combat!.lastBattle,undefined);assert.equal(g.rpgRun!.combat!.battles.length,0);
});
test('new descriptions, pending panel and one aggregate final review render without gauge text',()=>{
 const g=fresh('rogue');win(g,'트리플');let v=view(g,g.players[0].token);const picker=renderToStaticMarkup(<RpgProfessionPicker selected="rogue" choose={()=>{}} itemBattle/>);assert.match(picker,/페어.*바닥 1장 확인/);assert.doesNotMatch(picker,/게이지|칸 소비|추가 피해/);assert.match(renderToStaticMarkup(<RoundCombatPending game={v}/>),/판 종료 정산/);assert.doesNotMatch(renderToStaticMarkup(<RpgProfessionStatus game={v} seat={0} detail/>),/액티브|게이지/);finish(g);v=view(g,g.players[0].token);const html=renderToStaticMarkup(<DuelResultBody event={g.rpgRun!.combat!.lastBattle!} players={v.players}/>);assert.match(html,/판 전체 정산/);assert.doesNotMatch(html,/번째 결투/);
});
test('AI no longer selects manual skills and ignores injected foreign hands or hidden floor faces',()=>{
 const g=fresh('rogue',true);win(g,'페어');const own=view(g,g.players[1].token);own.turn=own.me;own.turnReadyAt=0;const a=analyzeItemBattleTurn(own,{now:Date.now()});assert.notEqual(a.action.type,'profession');const injected=structuredClone(own);injected.players[0].hand=[tile(2),tile(2,1)];injected.stacks.forEach(s=>{if(s.upper)s.lower=tile(2,3);});const b=analyzeItemBattleTurn(injected,{now:Date.now()});assert.deepEqual(b.action,a.action);
});

test('full legal deals for every profession finish with one settlement and unchanged HP between moves',()=>{
 for(const item of [false,true])for(const role of roles){
  const g=item?createHpItemGame('전체 진행','',Date.now(),2,'toto',role,100):createRpgPhaseOneGame('전체 진행','',Date.now(),role);
  if(item)buyHpItemLoadout(g,[]);g.rpgRun!.equipped=[];g.rpgRun!.consumables=[];g.rpgRun!.enemyConsumables={1:[],2:[]};g.players.forEach(p=>p.bot=true);const before=[...g.rpgRun!.hp];let steps=0;
  while(g.phase==='playing'&&steps++<600){g.turnReadyAt=0;botMove(g,Date.now());if(g.phase==='playing'){assert.deepEqual(g.rpgRun!.hp,before);assert.equal(g.rpgRun!.combat!.lastBattle,undefined);}}
  assert.equal(g.phase,'ended',`${item?'item':'RPG'} ${role} failed to finish in 600 moves`);assert.ok(g.result);assert.equal(g.rpgRun!.combat!.lastBattle!.roundSettlement,true);assert.equal(g.rpgRun!.combat!.pendingRound!.settled,true);assert.ok(g.rpgRun!.combat!.battles.length>0);assert.ok(g.players.some(p=>p.hand.length===0));
 }
});
