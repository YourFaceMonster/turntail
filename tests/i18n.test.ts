import assert from 'node:assert/strict';
import {detectLang,setLangForTest,tr,trv,ENGLISH_READY} from '../lib/i18n/index.ts';
import {EN} from '../lib/i18n/en.ts';

// Language choice: ?lang wins, then (once English is ready) the saved choice, then the device language.
assert.equal(detectLang({query:'en',stored:null,device:'ko',ready:false}),'en');
assert.equal(detectLang({query:null,stored:'en',device:'en',ready:false}),'ko','English stays hidden until it is complete');
assert.equal(detectLang({query:null,stored:null,device:'en',ready:true}),'en');
assert.equal(detectLang({query:null,stored:'ko',device:'en',ready:true}),'ko');
assert.equal(detectLang({query:null,stored:null,device:'ko',ready:true}),'ko');
assert.equal(detectLang({query:null,stored:'en',device:'en',ready:true,page:false}),'ko','server and tests stay Korean');
assert.equal(ENGLISH_READY,false,'flip only when every localization step is done');

// Korean is the key; missing English falls back to Korean; {placeholders} are filled in both languages.
setLangForTest('ko');assert.equal(tr('언어'),'언어');assert.equal(tr('{n}번째 도전',{n:2}),'2번째 도전');
setLangForTest('en');assert.equal(tr('언어'),'Language');assert.equal(tr('아직 번역 안 된 문장'),'아직 번역 안 된 문장');
EN['{n}번째 도전']='Try {n}';assert.equal(tr('{n}번째 도전',{n:2}),'Try 2');delete EN['{n}번째 도전'];
// Data values that are Korean screen text (names, combo labels) are shown in English too, in vars and with trv().
assert.equal(tr('{0} 선',{0:'페어'}),'Pair leads');assert.equal(trv('페어'),'Pair');assert.equal(trv('사용자이름'),'사용자이름');assert.equal(trv(3),3);
setLangForTest('ko');

// Every English entry keeps the same {placeholders} as its Korean key.
for(const [ko,en] of Object.entries(EN)){const keys=(s:string)=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join();assert.equal(keys(en),keys(ko),`placeholders differ: ${ko}`);}
console.log('PASS: language detection, Korean fallback, placeholders, English table placeholder parity.');
