import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRpgJourneyGame,enterJourneyNode} from '../lib/rpg-game';
import {settle,type Game,type Tile} from '../lib/game';
import {RELIC_GRADES,RELIC_RECIPES,RPG_REWORK_RELICS,forgeBlocker,forgeRelic,knownRecipes,learnRecipes,recipeRumor,reworkRewardOffers,reworkSynergies,rpgMaxHp} from '../lib/rpg-rework';
import {equipJourneyRelic,hearJourneyRumor} from '../lib/rpg-journey';
import {RelicForge} from '../app/components/RelicForge';
import type {RpgRun} from '../lib/rpg';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const fresh=()=>{const game=createRpgJourneyGame('합성 검증','',0);enterJourneyNode(game,'battle-1',0);return game;};
function finish(game:Game,counts:number[]){game.players.forEach((p,i)=>p.hand=Array.from({length:counts[i]},(_,j)=>tile(j%15+1,i)));game.phase='ended';game.winner=counts.indexOf(0);game.result=null;return settle(game);}
/** A ready journey on the map holding both hearts and knowing the heart recipe. */
function hearts(equip:string[]=['cracked-heart','second-heart']):RpgRun{
 let run=fresh().rpgRun!;run.status='ready';run.journey!.location='map';run.hp[0]=60;run.relics.push('cracked-heart','second-heart');
 run.journey!.rumors.push(recipeRumor('whole-heart'));
 for(const id of equip)run=equipJourneyRelic(run,id);
 return run;
}

test('grades: legendaries exist only through forging and never appear in reward offers',()=>{
 assert.deepEqual(RPG_REWORK_RELICS.filter(r=>r.grade==='legendary').map(r=>r.id).sort(),RELIC_RECIPES.map(r=>r.id).sort());
 assert.ok(RPG_REWORK_RELICS.every(r=>RELIC_GRADES[r.id]===r.grade));
 for(const stage of [1,2,3,4,5,6,7,8,9]){const run=fresh().rpgRun!;run.stage=stage;run.relics=[];assert.ok(!reworkRewardOffers(run).some(id=>RELIC_GRADES[id]==='legendary'));}
});

test('forging merges two known materials into one slot without repaying the heart bonus',()=>{
 const run=hearts();assert.equal(run.hp[0],90);assert.equal(rpgMaxHp(run),135,'two hearts + heart synergy');
 const forged=forgeRelic(run,'whole-heart');
 assert.ok(forged.relics.includes('whole-heart')&&!forged.relics.includes('cracked-heart')&&!forged.relics.includes('second-heart'));
 assert.deepEqual(forged.equipped,['gamblers-gloves','whole-heart'],'takes the first material slot and frees the other');
 assert.equal(rpgMaxHp(forged),135);assert.equal(forged.hp[0],95,'only the 5 missing from 35 − (20+10)');
 assert.ok(forged.discovered.includes('whole-heart'));assert.equal(forged.relicActivations?.at(-1)?.message,'합성 완료');
 // Re-equipping the forged heart in the same chapter grants nothing more.
 const off=equipJourneyRelic(forged,'whole-heart'),on=equipJourneyRelic(off,'whole-heart');assert.equal(on.hp[0],95);
});

test('a forged heart from unequipped materials pays its own first-equip bonus once',()=>{
 const run=hearts([]);assert.equal(run.hp[0],60);
 const forged=forgeRelic(run,'whole-heart');assert.ok(forged.equipped.includes('whole-heart'),'a free slot is filled');assert.equal(forged.hp[0],95);assert.equal(rpgMaxHp(forged),135);
});

test('forging needs a known recipe, both materials and a moment outside battle',()=>{
 const run=hearts();
 const unknown=structuredClone(run);unknown.journey!.rumors=[];assert.match(forgeBlocker(unknown,'whole-heart'),/모르는 조합법/);
 const missing=structuredClone(run);missing.relics=missing.relics.filter(id=>id!=='second-heart');missing.equipped=missing.equipped.filter(id=>id!=='second-heart');assert.match(forgeBlocker(missing,'whole-heart'),/재료가 부족해요 · 두 번째 심장/);
 const battle=structuredClone(run);battle.status='playing';battle.journey!.location='battle';assert.throws(()=>forgeRelic(battle,'whole-heart'),/승부 밖/);
 const html=renderToStaticMarkup(<RelicForge run={missing} busy={false} action={()=>{}}/>);assert.match(html,/조합법 1\/4/);assert.match(html,/disabled/);
});

test('lone-relic trial: forging keeps a single equip slot',()=>{
 let run=fresh().rpgRun!;run.trials=['lone-relic'];run.status='ready';run.journey!.location='map';run.equipped=['cracked-heart'];run.relics=['gamblers-gloves','cracked-heart','second-heart'];run.journey!.rumors.push(recipeRumor('whole-heart'));
 run=forgeRelic(run,'whole-heart');assert.deepEqual(run.equipped,['whole-heart']);
});

test('Pio teaches one recipe per journey, two with the quill; recipes held in hand come first',()=>{
 const base=fresh().rpgRun!;base.status='ready';base.journey!.location='tavern';base.relics=['final-knot'];base.equipped=['final-knot'];
 const once=hearJourneyRumor(base);assert.deepEqual(once.journey!.pioRecipes,['undying-lantern'],'the knot in the bag picks the lantern recipe over the catalogue order');
 assert.equal(knownRecipes(once).length,1);assert.equal(hearJourneyRumor(once).journey!.rumors.length,once.journey!.rumors.length,'no second lesson');
 const quill=structuredClone(base);quill.relics.push('mor-quill');assert.equal(knownRecipes(hearJourneyRumor(quill)).length,2);
 const all=structuredClone(base);for(const r of RELIC_RECIPES)all.journey!.rumors.push(recipeRumor(r.id));assert.deepEqual(learnRecipes(all,2).learned,[]);
});

test('each chapter boss leaves one recipe note on the result',()=>{
 const game=fresh(),run=game.rpgRun!;run.stage=3;run.hp=[80,1,40];finish(game,[0,5,3]);
 const after=game.rpgRun!;assert.equal(after.status,'allocation');assert.ok(after.rework!.lastRecipe);assert.ok(after.journey!.rumors.includes(recipeRumor(after.rework!.lastRecipe!)));
 const normal=fresh();normal.rpgRun!.hp=[80,1,40];finish(normal,[0,5,3]);assert.equal(normal.rpgRun!.rework!.lastRecipe,undefined);
});

test('synergies: two of a tag wake a bonus; owned-only relics never count',()=>{
 const run=fresh().rpgRun!;
 assert.deepEqual(reworkSynergies({...run,equipped:['recovery-lantern','final-knot']}),['mend']);
 assert.deepEqual(reworkSynergies({...run,equipped:['gamblers-gloves','stopped-hourglass','cracked-heart']}),['scout']);
 assert.deepEqual(reworkSynergies({...run,equipped:['whole-heart']}),[],'a forged relic counts once');
 const mend=fresh();mend.rpgRun!.hp=[60,1,40];mend.rpgRun!.equipped=['recovery-lantern','final-knot'];mend.rpgRun!.relics=[...mend.rpgRun!.equipped];finish(mend,[0,5,3]);
 assert.deepEqual(mend.rpgRun!.rework!.relicHeals?.map(h=>h.amount),[5,3],'lantern +5 then mend synergy +3');
});

test('a held material makes its partner more likely without breaking stable offers',()=>{
 let hits=0,base=0;
 for(let i=0;i<40;i++){
  const plain=fresh().rpgRun!;plain.id=`seed-${i}`;plain.stage=2;plain.relics=[];
  const held=structuredClone(plain);held.relics=['cracked-heart'];
  if(reworkRewardOffers(plain).includes('second-heart'))base++;
  const offers=reworkRewardOffers(held);if(offers.includes('second-heart'))hits++;
  assert.deepEqual(reworkRewardOffers(held),offers,'memoised per stage');
 }
 assert.ok(hits>base,`partner offered ${hits} vs ${base} times in 40 journeys`);
});
