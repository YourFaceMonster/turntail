import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import EntranceGreetings from '../app/components/EntranceGreetings';
import EntranceSeats from '../app/components/EntranceSeats';
import {entranceRasterRatio} from '../lib/entrance-gpu';
const company=[{name:'왼쪽',avatar:'stage-portrait:0',points:200,count:10},{name:'오른쪽',avatar:'stage-portrait:1',points:200,count:10}];
const speech=renderToStaticMarkup(<EntranceGreetings stage={1} company={company}/>).split('data-speaker="오른쪽"')[1];assert.ok(speech.includes('data-bubble-side="left"')&&speech.includes('--bubble-tail:24px'));
const monsters=company.map((p,i)=>({...p,avatar:`korean-monster:${i}`})),figures=renderToStaticMarkup(<EntranceSeats company={monsters} diameter={1200} cx={640} cy={360}/>);assert.equal((figures.match(/class="classic-character-motion"/g)||[]).length,2);
for(const [w,h,dpr] of [[390,844,3],[844,390,3],[1920,1080,2],[3840,2160,2]]){const r=entranceRasterRatio(w,h,dpr);assert.ok(w*h*r*r<=8294400+.01);assert.ok(r>=1);}
assert.equal(entranceRasterRatio(390,844,3),3);assert.equal(entranceRasterRatio(1920,1080,2),2);
console.log('PASS: left-starting right speech tail, visible classic motion wrappers, and retina presentation buffers.');
