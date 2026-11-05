import assert from 'node:assert/strict';
import {test} from 'node:test';
import {questDialoguePages} from '../lib/quest-dialogue-pages';
import {PIO_DIALOGUE,QUEST_DIALOGUE,SERIN_INVITATION} from '../lib/rpg-dialogue';
const normalize=(s:string)=>s.replace(/\s+/gu,'');
test('pagination preserves every character and speaker/painting source across long dialogue',()=>{
 for(const lines of [PIO_DIALOGUE,...Object.values(QUEST_DIALOGUE),[SERIN_INVITATION],['한 문장입니다. '.repeat(40)]]){
  const pages=questDialoguePages(lines);
  for(const [i,line] of lines.entries())assert.equal(normalize(pages.filter(p=>p.sourceIndex===i).map(p=>p.text).join('')),normalize(line));
  for(const p of pages){assert.ok(p.text.length<=32);assert.ok(p.text.split('\n').reduce((n,line)=>n+Math.ceil(line.length/16),0)<=2);}
 }
 const short=questDialoguePages([SERIN_INVITATION]);assert.ok(short.length>=2);assert.equal(normalize(short.map(p=>p.text).join('')),normalize(SERIN_INVITATION));
});
test('long sentences split at words and keep subsequent source identities',()=>{
 const words=Array.from({length:30},(_,i)=>`기억${i}`),lines=[words.join(' ')+'입니다.','마지막 선택.'];
 const pages=questDialoguePages(lines);assert.ok(pages.length>2);assert.equal(pages.at(-1)?.sourceIndex,1);
 for(const p of pages.slice(0,-1))for(const word of p.text.split(/\s+/))assert.ok(lines[0].split(' ').includes(word));
});

// Regression: a long sentence used to leave only its ending on the next page.
test('long narration never strands the ending on a page by itself',()=>{
 const sentence='그날 밤, 방랑자에게는 그저 수많은 승부 중 하나였을 뿐이었습니다.';
 const pages=questDialoguePages([sentence]);
 assert.equal(normalize(pages.map(p=>p.text).join('')),normalize(sentence));
 assert.ok(pages.length>1);
 for(const page of pages){assert.ok(page.text.trim().split(/\s+/).length>=3);assert.ok(page.text.split('\n').length<=2);}
});
