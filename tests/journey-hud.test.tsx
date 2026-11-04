import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {existsSync} from 'node:fs';
import {createRpgJourneyGame} from '../lib/rpg-game';
import {JourneyMapView,JourneyWatchtowerView} from '../app/components/RpgJourneyScene';
import QuestCutscene from '../app/components/QuestCutscene';
import DialogueText from '../app/components/DialogueText';
import {SwordsmanSlash} from '../app/components/ProfessionActives';
import {SERIN_INVITATION} from '../lib/rpg-dialogue';
import {questArt} from '../lib/rpg-quest-art';
import {FIRST_PROLOGUE} from '../lib/rpg-prologue';
import {prologueArt} from '../lib/rpg-prologue-art';
const noop=()=>{};
test('map exposes save/settings, one HP meter, map/bag/relic controls with HP avatar and without history',()=>{
 const g=createRpgJourneyGame('아바타중복금지','',0,'cleric');
 const html=render(h(JourneyMapView,{run:g.rpgRun!,busy:false,error:'',action:noop,exit:noop,save:()=>'',settings:noop,playerName:'아바타중복금지',playerAvatar:h('span',null,'중복아바타')}));
 assert.ok(html.includes('>저장</button>'));assert.ok(html.includes('aria-label="게임 설정"'));assert.ok(html.includes('MAP · 지도와 이야기'));assert.ok(html.includes('여행 가방 · 소지품과 장착'));assert.ok(html.includes('내 장착 유물'));assert.equal((html.match(/role="meter"/g)||[]).length,1);assert.equal((html.match(/빈 유물 자리/g)||[]).length,2);assert.ok(!html.includes('아바타중복금지'));assert.equal((html.match(/중복아바타/g)||[]).length,1);assert.ok(!html.includes('전적'));
});
test('Serin has two authored lines and current-scene dialogue never paints over the tavern',()=>{
 const lines=SERIN_INVITATION.split('\n');assert.deepEqual(lines,['한 판 할래?','세 판이면 네 실력 정도는 알 수 있겠지.']);
 const text=render(h(DialogueText,{text:SERIN_INVITATION}));assert.equal((text.match(/class="dialogue-sentence"/g)||[]).length,2);
 const html=render(h(QuestCutscene,{title:'세린',speaker:'세린',scene:'room',background:'current',busy:false,close:noop,lines:[SERIN_INVITATION],choices:[{label:'대화 마치기',choose:noop}]}));assert.ok(html.includes('is-tavern-conversation'));assert.ok(!html.includes('prologue-picture'));assert.ok(html.includes('대화 마치기'));
});
test('discovery keeps the painting clear and defers detailed relic content to its popup',()=>{
 const g=createRpgJourneyGame('발견','',0,'cleric'),run=g.rpgRun!;run.status='ready';run.journey!.location='watchtower';run.journey!.watchtowerRelicFound=true;
 const html=render(h(JourneyWatchtowerView,{run,busy:false,error:'',action:noop,exit:noop}));assert.ok(html.includes('푸른 유리 · 유물 확인'));assert.ok(!html.includes('class="quest-relic-reward"'));assert.ok(!html.includes('quest-reward-popup'));assert.ok(!html.includes('장착 중 응급 약초의 회복량이'));
});
test('new art is connected to the actual title, tower and strike consumers in both orientations',()=>{
 const village=prologueArt(FIRST_PROLOGUE.at(-1)!)!,tower=questArt('watchtower-arrival');
 for(const src of [...Object.values(village),...Object.values(tower)])assert.ok(existsSync('public'+src));assert.match(village.landscape,/moon-village-distant/);assert.match(tower.landscape,/wide-v4/);assert.match(tower.portrait,/portrait-v4/);
 const sword=render(h(SwordsmanSlash,{impact:true}));assert.ok(sword.includes('swordsman-sword-cutout-v1.png'));assert.ok(!sword.includes('class="blade-face"'));assert.ok(sword.includes('steel-impact-flare'));
});
