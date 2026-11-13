import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRpgJourneyGame,enterJourneyNode,startRpgRound} from '../lib/rpg-game';
import {settle,type Game,type Tile} from '../lib/game';
import {RPG_REWORK_RELICS,PASSIVE_RELICS,activateRpgRelics,chooseReworkReward,reworkChapterRange,reworkRewardOffers} from '../lib/rpg-rework';
import {equipJourneyRelic,hearJourneyRumor} from '../lib/rpg-journey';
import RpgReworkResult from '../app/components/RpgReworkResult';
import {RpgEquippedRelics} from '../app/components/RpgEquippedRelics';
import {view} from '../lib/game';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const fresh=()=>{const game=createRpgJourneyGame('유물 검증','',0);enterJourneyNode(game,'battle-1',0);return game;};
function finish(game:Game,counts:number[],winner=counts.indexOf(0)){
 game.players.forEach((p,i)=>p.hand=Array.from({length:counts[i]},(_,j)=>tile(j%15+1,i)));
 game.phase='ended';game.winner=winner;game.result=null;return settle(game);
}
const procs=(game:Game,id:string)=>(game.rpgRun!.relicActivations||[]).filter(event=>event.relicId===id);

test('every relic has a one-line effect and a plain-language detail',()=>{
 for(const relic of RPG_REWORK_RELICS){assert.ok(relic.effect.length>4,relic.id);assert.ok(relic.detail.length>relic.effect.length,relic.id);}
 assert.deepEqual(RPG_REWORK_RELICS.filter(r=>r.passive).map(r=>r.id).sort(),[...PASSIVE_RELICS].sort());
 assert.ok(!RPG_REWORK_RELICS.some(r=>/선견지명 정찰|정찰 \+/.test(r.effect)),'short effects avoid unexplained jargon');
 assert.deepEqual(reworkChapterRange(2),[1,3]);assert.deepEqual(reworkChapterRange(5),[4,6]);assert.deepEqual(reworkChapterRange(9),[7,9]);assert.deepEqual(reworkChapterRange(10),[10,10]);
});

test('a won relic auto-equips only while the trial still has a free slot',()=>{
 const game=fresh();game.rpgRun!.hp=[70,1,1];finish(game,[0,3,3]);
 // Offers are random per journey and may all be owned-only relics, so fix one equippable offer.
 const active='second-ring',base=game.rpgRun!,run={...base,phaseOne:{...base.phaseOne!,clear:{...base.phaseOne!.clear!,relicOffers:[active]}}};
 const occupied={...run,equipped:['existing-relic'],relics:[...run.relics.filter(id=>id!==active),'existing-relic']};
 assert.deepEqual(chooseReworkReward({...occupied,trials:['lone-relic']},active).equipped,['existing-relic'],'홀로 든 유물: the single slot is already taken');
 assert.ok(chooseReworkReward(occupied,active).equipped.includes(active),'normal journeys keep three slots');
});

test('owned-only relics work from the bag and never take an equip slot',()=>{
 const game=fresh(),run=game.rpgRun!;run.hp=[70,1,1];finish(game,[0,3,3]);
 const offers=game.rpgRun!.phaseOne!.clear!.relicOffers!;const picked=chooseReworkReward({...game.rpgRun!,phaseOne:{...game.rpgRun!.phaseOne!,clear:{...game.rpgRun!.phaseOne!.clear!,relicOffers:[...offers,'split-mirror']}}},'split-mirror');
 assert.ok(picked.relics.includes('split-mirror'));assert.ok(!picked.equipped.includes('split-mirror'));
 picked.journey!.location='map';
 assert.throws(()=>equipJourneyRelic(picked,'split-mirror'),/갖고만 있어도/);
 const mirror=structuredClone(picked);mirror.stage=2;assert.equal(reworkRewardOffers(mirror).length,3,'owned mirror adds a candidate');
 const legacy=activateRpgRelics({...picked,equipped:['gamblers-gloves','mor-quill']});assert.deepEqual(legacy.equipped,['gamblers-gloves'],'older saves free the slot');
});

test('settlement relic heals are recorded for notices and the result line; full HP shows nothing',()=>{
 const ring=fresh();ring.rpgRun!.hp=[60,90,90];ring.rpgRun!.equipped=['second-ring'];finish(ring,[4,0,8]);
 assert.equal(ring.rpgRun!.hp[0],66);assert.deepEqual(ring.rpgRun!.rework!.relicHeals,[{relicId:'second-ring',amount:3}]);assert.equal(procs(ring,'second-ring').at(-1)?.message,'2등 · HP +3');
 const html=renderToStaticMarkup(<RpgReworkResult game={view(ring,ring.players[0].token)} busy={false} choose={()=>{}} next={()=>{}} newRun={()=>{}} exit={()=>{}}/>);
 assert.ok(html.includes('rpg-relic-heal-line')&&html.includes('두 번째 반지 HP +3'));
 const knot=fresh();knot.rpgRun!.hp=[12,90,90];knot.rpgRun!.equipped=['final-knot'];finish(knot,[5,0,5]);
 assert.equal(procs(knot,'final-knot').length,1);assert.equal(knot.rpgRun!.rework!.relicHeals?.[0].relicId,'final-knot');
 const capped=fresh();capped.rpgRun!.hp=[100,90,90];capped.rpgRun!.equipped=['second-ring'];finish(capped,[4,0,8]);
 assert.equal(procs(capped,'second-ring').length,0,'no notice when nothing was healed');assert.equal(capped.rpgRun!.rework!.relicHeals,undefined);
 startRpgRound(ring,0);assert.equal(ring.rpgRun!.rework!.relicHeals,undefined,'cleared at the next round');
});

test('lantern and mirror proc on clear; reward screen explains how long relics last',()=>{
 const game=fresh();game.rpgRun!.hp=[60,1,1];game.rpgRun!.equipped=['recovery-lantern'];game.rpgRun!.relics=['recovery-lantern','split-mirror'];finish(game,[0,3,3]);
 assert.equal(procs(game,'recovery-lantern').length,1);assert.equal(procs(game,'split-mirror').at(-1)?.message,'보상 후보 +1');
 const html=renderToStaticMarkup(<RpgReworkResult game={view(game,game.players[0].token)} busy={false} choose={()=>{}} next={()=>{}} newRun={()=>{}} exit={()=>{}}/>);
 assert.ok(html.includes('이번 챕터(ST1~3)')&&html.includes('갈라진 거울 효과로 후보 +1'));
});

test('hearts, quill and the tooltip all explain themselves',()=>{
 const game=fresh(),run=game.rpgRun!;run.relics=[...run.relics,'cracked-heart'];run.equipped=[...run.equipped,'cracked-heart'];run.hp[0]=80;
 const hearted=activateRpgRelics(run);assert.equal(hearted.hp[0],100);assert.equal(hearted.relicActivations?.at(-1)?.message,'최대 HP 120 · HP +20');
 assert.equal(activateRpgRelics(hearted).relicActivations?.length,hearted.relicActivations?.length,'once per chapter');
 const tavern=structuredClone(hearted);tavern.status='ready';tavern.journey!.location='tavern';tavern.relics.push('mor-quill');
 assert.equal(hearJourneyRumor(tavern).relicActivations?.at(-1)?.relicId,'mor-quill');
 const html=renderToStaticMarkup(<RpgEquippedRelics run={tavern}/>);assert.ok(!html.includes('모르의 깃펜'),'owned-only relics stay out of the equip tray');
});
