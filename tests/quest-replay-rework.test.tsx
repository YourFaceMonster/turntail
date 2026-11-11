import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import QuestReplay from '../app/components/QuestReplay';

const lines=(id:string,rework:boolean)=>QuestReplay({id,close:()=>{},rework})!.props.lines as string[];

test('story replays use the new RPG wording (no coins, herbs or herb healing)',()=>{
 const mor=lines('quest-mor',true).join(' ');assert.ok(!/주화/.test(mor));assert.match(mor,/HP 5 회복과 유물 소문/);
 const traveler=lines('quest-traveler',true).join(' ');assert.ok(!/약초/.test(traveler));assert.match(traveler,/기운을 나눠/);
 const tower=lines('quest-tower',true).join(' ');assert.ok(!/약초/.test(tower));assert.match(tower,/바닥 패 1장을 몰래/);
 const replay=QuestReplay({id:'quest-traveler',close:()=>{},rework:true})!;assert.equal(replay.props.speakers.length,replay.props.lines.length);
});

test('legacy replays keep their original wording',()=>{
 assert.match(lines('quest-mor',false).join(' '),/주화 30/);
 assert.match(lines('quest-tower',false).join(' '),/10에서 15로/);
 assert.match(lines('quest-traveler',false).join(' '),/응급 약초/);
});

test('dialogue paragraphs balance their lines (no single short word left on a phone line)',()=>{
 assert.match(readFileSync('app/rpg-prologue.css','utf8'),/\.prologue-caption p\{text-wrap:balance\}/);
 assert.match(readFileSync('app/components/quest-cutscene.css','utf8'),/\.quest-dialogue-text p\{text-wrap:balance\}/);
});
