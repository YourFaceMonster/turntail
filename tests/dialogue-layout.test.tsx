import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createElement as h} from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import ts from 'typescript';
import {questDialoguePages,dialoguePageAt} from '../lib/quest-dialogue-pages.ts';
import DialogueText,{measureDialogueText} from '../app/components/DialogueText.tsx';
import QuestCutscene from '../app/components/QuestCutscene.tsx';
import {FIRST_PROLOGUE,PROLOGUE_STORYBOARD} from '../lib/rpg-prologue.ts';
const normalized=(text:string)=>text.replace(/\s/gu,'');
test('a sentence that fits its column stays continuous, including adjacent short sentences',()=>{
 const text='되찾아 주겠나? 보상은 섭섭지 않게 하지.';
 const pages=questDialoguePages([text],Infinity,{width:50,measure:s=>s.length});
 assert.equal(pages.length,1);assert.equal(pages[0].text,text);assert.ok(!pages[0].text.includes('\n'));
 const html=render(h(DialogueText,{text}));assert.equal((html.match(/dialogue-sentence/g)||[]).length,1);assert.ok(!html.includes('<br'));
});
test('narrower columns advance overflow without discarding words or the source/reading position',()=>{
 const lines=['하나 둘 셋 넷 다섯 여섯 일곱 여덟 아홉 열 열하나 열둘','다음 그림의 대사.'];
 const narrow=questDialoguePages(lines,Infinity,{width:9,measure:s=>s.length}),wide=questDialoguePages(lines,Infinity,{width:60,measure:s=>s.length});
 assert.ok(narrow.length>wide.length);
 for(const [sourceIndex,line] of lines.entries())assert.equal(normalized(narrow.filter(p=>p.sourceIndex===sourceIndex).map(p=>p.text).join('')),normalized(line));
 const offset=normalized(narrow[0].text).length;
 assert.equal(dialoguePageAt(narrow,0,offset),1);assert.equal(dialoguePageAt(wide,0,offset),0);
 assert.equal(wide[dialoguePageAt(wide,1,0)].sourceIndex,1);
});
test('item icons consume real line capacity while ordinary text gets no extra reserve',()=>{
 assert.equal(measureDialogueText('평범한 문장',s=>s.length,20),'평범한 문장'.length);
 assert.equal(measureDialogueText('응급 약초',s=>s.length,20),'응급 약초'.length+20);
});
test('speaker is outside the advancing button, so shorter captions cannot recenter Mor',()=>{
 const html=render(h(QuestCutscene,{title:'모르',speaker:'모르',scene:'room',lines:['짧은 말.'],choices:[],close:()=>{},busy:false}));
 assert.match(html,/class="quest-dialogue-speaker">모르<\/small><button class="quest-dialogue-text"/);
});
test('both Serin and thief avatar handlers do nothing during the duel or its results',()=>{
 const source=ts.createSourceFile('page.tsx',readFileSync('app/page.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let handler='';const walk=(node:ts.Node)=>{if(ts.isFunctionDeclaration(node)&&node.name?.text==='openAvatar')handler=node.getText(source);ts.forEachChild(node,walk);};walk(source);assert.ok(handler);
 for(const purpose of ['tavern','letter'])for(const phase of ['playing','ended']){
  const calls:string[]=[],open=Function('current','armAudio','feel','setRpgStatusOpen','openProfile','return '+handler)({current:{rpgMini:{purpose},phase}},()=>calls.push('audio'),()=>calls.push('feel'),()=>calls.push('rpg'),()=>calls.push('profile'));
  open();assert.deepEqual(calls,[],purpose+' '+phase);
 }
 const calls:string[]=[],make=(game:unknown)=>Function('current','armAudio','feel','setRpgStatusOpen','openProfile','return '+handler)({current:game},()=>calls.push('audio'),()=>calls.push('feel'),()=>calls.push('rpg'),()=>calls.push('profile'));
 make(null)();assert.deepEqual(calls,['profile']);calls.length=0;make({rpgRun:{}})();assert.deepEqual(calls,['audio','feel','rpg']);
});
test('moderate prologue retains all nineteen events and lore without automatic hard line breaks',()=>{
 assert.equal(PROLOGUE_STORYBOARD.length,19);assert.equal(FIRST_PROLOGUE.length,30);
 assert.ok(FIRST_PROLOGUE.every(c=>!c.line.includes('\n')));
 const text=FIRST_PROLOGUE.map(c=>c.line).join(' ');
 for(const fragment of ['노르문','붉은 숫자 2','가장 강한 패','두 왕관','어디서 만들어졌는지는 모르오','돌기둥','마음에 걸린'])assert.ok(text.includes(fragment),fragment);
});
