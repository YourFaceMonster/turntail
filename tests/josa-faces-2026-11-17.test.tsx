import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {josa,hasFinal} from '../lib/josa.ts';
import JourneyDestinationHead from '../app/components/JourneyDestinationHead.tsx';

test('particles follow the final sound of names and numbers',()=>{
 assert.equal(josa('수달','과/와'),'수달과');assert.equal(josa('포코','과/와'),'포코와');
 assert.equal(josa('잠보','이/가'),'잠보가');assert.equal(josa('도칸','이/가'),'도칸이');
 assert.equal(josa('초이스','은/는'),'초이스는');assert.equal(josa('요트','은/는'),'요트는');
 assert.equal(josa('2','은/는'),'2는');assert.equal(josa('6','은/는'),'6은');assert.equal(josa('10','은/는'),'10은');assert.equal(josa('5','을/를'),'5를');
 assert.equal(hasFinal(''),false);
});

test('ST1~3 destination headers show faces, not name initials',()=>{
 for(const stage of [1,2,3]){
  const html=render(h(JourneyDestinationHead,{stage,title:'검사'}));
  assert.ok(!/<span class="destination-face"><span>/.test(html),`ST${stage} has a letter circle`);
  assert.equal((html.match(/class="destination-face"/g)||[]).length,2);
 }
 assert.match(render(h(JourneyDestinationHead,{stage:3,title:'검사'})),/twin-portrait/);
 assert.match(render(h(JourneyDestinationHead,{stage:2,title:'검사'})),/rpg-cast-portrait/);
});

test('tournament standings keep the 58px bracket face out of the rank column',()=>{
 const css=readFileSync('app/components/journey-inn.css','utf8');
 assert.ok(!/(^|\n)\.inn-cup-face \.portrait,\.inn-cup-face \.avatar\{display:block;width:58px/.test(css));
 assert.match(css,/\.inn-cup-places li\{grid-template-columns:44px auto 1fr auto/);
 for(const file of ['app/components/InnTournamentResult.tsx','app/components/RpgExchangeEffects.tsx','app/components/RpgExchangeHistory.tsx','lib/game.ts','app/components/YachtDiceTable.tsx'])
  assert.ok(!/name\}(와|과|이) |\}와의|LABELS\[category\]\}은/.test(readFileSync(file,'utf8')),file);
});

test('twin portrait rule outranks the shared stage-portrait sprite rule',()=>{
 const css=readFileSync('app/globals.css','utf8');
 assert.match(css,/\.stage-portrait\.portrait\.twin-portrait\{[^}]*rpg-twins-v2\.webp/);
});
