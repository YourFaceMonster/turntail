// Pre-rework journey save compatibility; current RPG rules: rpg-rework.test.tsx.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRpgJourneyGame} from './fixtures/legacy-rpg-journey';
import {equipJourneyRelic} from '../lib/rpg-journey';

test('equipment changes are permitted in every exploration location, including the pre-battle map, but never in duels',()=>{
 const game=createRpgJourneyGame('여행자'),run=game.rpgRun!;
 run.relics=['cracked-heart','recovery-lantern','wind-sigil','life-sigil'];
 for(const location of ['map','tavern','wayfarer-stop','market-alley','watchtower'] as const){
  const source={...run,journey:{...run.journey!,location}};
  const off=equipJourneyRelic(source,'cracked-heart');assert.deepEqual(off.equipped,[]);
  const on=equipJourneyRelic(off,'recovery-lantern');assert.deepEqual(on.equipped,['recovery-lantern']);assert.deepEqual(on.relics,run.relics);
  assert.throws(()=>equipJourneyRelic(source,'missing'));
 }
 for(const location of ['battle','mini-game'] as const)assert.throws(()=>equipJourneyRelic({...run,journey:{...run.journey!,location}},'cracked-heart'),/대결 중/);
 assert.deepEqual(equipJourneyRelic({...run,status:'allocation',journey:{...run.journey!,location:'battle'}},'cracked-heart').equipped,[],'a finished battle awaiting its clear reward is no longer an active duel');
 const full={...run,equipped:run.relics.slice(0,3)};assert.throws(()=>equipJourneyRelic(full,'life-sigil'));
 assert.deepEqual(equipJourneyRelic(full,'life-sigil','wind-sigil').equipped,['cracked-heart','recovery-lantern','life-sigil']);
 assert.deepEqual(run.equipped,['cracked-heart']);
});
