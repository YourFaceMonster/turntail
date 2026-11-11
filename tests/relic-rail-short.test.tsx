import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {RPG_REWORK_RELICS,RPG_REWORK_RELIC_SHORT} from '../lib/rpg-rework';
import {RpgEquippedRelics} from '../app/components/RpgEquippedRelics';
import {createRpgJourneyGame} from '../lib/rpg-game';

test('every new-RPG relic has a short two-line rail summary that fits the narrow rail',()=>{
 for(const relic of RPG_REWORK_RELICS){
  const short=RPG_REWORK_RELIC_SHORT[relic.id];assert.ok(short,`${relic.id} has a rail summary`);
  assert.ok(short.label.length<=6&&short.bonus.length<=6,`${relic.id}: "${short.label}" / "${short.bonus}" stays short`);
 }
});
test('the rail shows the short summary, not the full effect text',()=>{
 const run=createRpgJourneyGame('레일','',0).rpgRun!;run.equipped=['cracked-heart','gamblers-gloves'];run.relics=[...run.equipped];
 const html=renderToStaticMarkup(<RpgEquippedRelics run={run}/>);
 assert.ok(html.includes('최대 HP')&&html.includes('+20')&&html.includes('5장 승리')&&html.includes('바닥 +1장'));
 assert.ok(!html.includes('챕터 첫 장착 시 현재 HP'),'long effect text stays in the tooltip only');
});
