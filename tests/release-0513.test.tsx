import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import EntranceSeats,{openingGreeting} from '../app/components/EntranceSeats';
import EntranceGreetings from '../app/components/EntranceGreetings';
import {tileSoundPlan} from '../lib/tile-audio';
import {ENTRANCE_MS} from '../lib/atmosphere';
for(const count of [1,2,3]){
 const company=Array.from({length:count},(_,i)=>({name:`monster${i}`,avatar:`korean-monster:${i}`,count:10,points:0}));
 const html=renderToStaticMarkup(<><EntranceSeats company={company} diameter={1800} cx={500} cy={400}/><EntranceGreetings company={company}/></>);
 assert.equal((html.match(/class="intro-speech"/g)||[]).length,count);
 for(let i=0;i<count;i++){assert.ok(html.includes(openingGreeting(company[i].avatar,company[i].name)));assert.ok(html.includes(`--greeting-delay:${i*ENTRANCE_MS.shuffle/count}ms`));}
 assert.ok(!html.includes('monster-lift'),'no artificial elevation through the table');
}
const voices=tileSoundPlan('play',0);assert.ok(voices.some(v=>v.source==='tone'&&v.frequency<300&&v.gain>=.12),'audible low body on an ordinary tile hit');
const files=['menu','table','victory','reflection'].map(s=>`public/audio/${s}-0513.mp3`);assert.equal(new Set(files.map(p=>statSync(p).size)).size,4);for(const p of files)assert.ok(statSync(p).size>300000);
const page=readFileSync('app/page.tsx','utf8');assert.ok(page.includes('data-seat-dialogue={i}')&&page.includes('opponent-status-row'));
console.log('PASS: one greeting per opponent within shuffle, no vertical lift, stronger low hit, four real music tracks, inline dialogue hosts.');
