import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JOURNEY_SCENE_LOCATIONS} from '../lib/rpg-journey';

// Bug 0.7.24~0.7.28: entering a region inn after a stage clear showed the old settlement instead of the inn,
// because the page's "journey scene open" list lacked 'inn'; "다음 스테이지" then failed with "지도에서 다음 승부를 선택해 주세요."
test('every hub the journey scene draws keeps the table result hidden, inns included', () => {
 for(const location of ['map','tavern','market-alley','wayfarer-stop','watchtower','story-quest','dice-den','inn'])assert.ok(JOURNEY_SCENE_LOCATIONS.includes(location),location);
 assert.equal(JOURNEY_SCENE_LOCATIONS.includes('battle'),false);
 assert.equal(JOURNEY_SCENE_LOCATIONS.includes('mini-game'),false);
 const page=readFileSync('app/page.tsx','utf8');
 assert.match(page,/const journeyOpen=!!game\?\.rpgRun\?\.journey&&JOURNEY_SCENE_LOCATIONS\.includes\(/);
 const scene=readFileSync('app/components/RpgJourneyScene.tsx','utf8');
 const hubs=scene.match(/\['market-alley','wayfarer-stop','watchtower','story-quest','dice-den','inn'\]/);
 assert.ok(hubs,'scene hub list');
});
