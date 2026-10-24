import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {STAGE_THEMES} from '../lib/stage-theme';
import {STAGE_ROUTE_SEGMENTS,stageRoutePoints} from '../lib/stage-map';
import {entranceSeatLayout,greetingPlacement} from '../lib/entrance-company';
import {openingGreeting} from '../app/components/EntranceSeats';
import EntranceGreetings from '../app/components/EntranceGreetings';
import {TILE_ACTION_GAIN,tileSoundPlan} from '../lib/tile-audio';
import {effectOutput,setEffectVolume} from '../lib/audio-mixer';
assert.equal(STAGE_ROUTE_SEGMENTS.length,9);
STAGE_ROUTE_SEGMENTS.forEach((segment,i)=>{assert.deepEqual(segment[0],STAGE_THEMES[i].position);assert.deepEqual(segment.at(-1),STAGE_THEMES[i+1].position);assert.equal(stageRoutePoints(i).split(' ').length,segment.length);});
for(const theme of STAGE_THEMES)for(const p of theme.opponents)assert.equal(openingGreeting(`stage-portrait:${p.portrait}`,p.name),p.quote);
assert.deepEqual(STAGE_THEMES[4].position,[49,43]);assert.ok(existsSync('public/turntale-stage-map-0515.webp'));
for(const [width,height,overview] of [[390,844,.2],[844,390,.16],[1363,936,.38]])for(const count of [1,2,3])for(let i=0;i<count;i++){
 const seat=entranceSeatLayout(1900,width/2,height/2,i,count,true,0,{width,height,overview}),bubble=greetingPlacement(seat.head,{width,height,overview},i,count);
 assert.ok(bubble.left>=12&&bubble.left+bubble.width<=width-12+.001);assert.ok(bubble.top>=12&&bubble.top<height-80);assert.ok(bubble.tail>=0&&bubble.tail<=bubble.width);
}
const html=renderToStaticMarkup(<EntranceGreetings company={[{name:'청돌',avatar:'korean-monster:0',count:10,points:0},{name:'불찬',avatar:'korean-monster:1',count:10,points:0}]}/>);assert.equal((html.match(/class="intro-speech"/g)||[]).length,2);assert.ok(html.includes('--bubble-tail')&&!html.includes('아바타'));
assert.equal(TILE_ACTION_GAIN,5);assert.ok(tileSoundPlan('play',0).some(v=>v.frequency>=600&&v.gain>=.06),'phone-audible attack accompanies the low thump');
let limiters=0;const param=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(){}}),node=()=>({gain:param(),connect(){}}),ctx={currentTime:0,destination:{},createGain:node,createDynamicsCompressor:()=>{limiters++;return {threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),connect(){}};}} as unknown as AudioContext;
effectOutput(ctx);setEffectVolume(ctx,80);effectOutput(ctx);assert.equal(limiters,1,'one shared compressor contains boosted peaks');
const page=readFileSync('app/page.tsx','utf8'),atmosphere=readFileSync('lib/atmosphere-audio.ts','utf8');assert.ok(!page.includes('tensionSound')&&!atmosphere.includes('createBuffer'),'the automatic wind/noise bed has been removed');
const tracks=JSON.parse(readFileSync('public/audio/music-0515.json','utf8'));assert.equal(tracks.length,4);for(const t of tracks){assert.ok(t.bpm>=104&&t.parts.length>=5);assert.ok(existsSync(`public/audio/${t.scene}-0515.mp3`));}
console.log('PASS: nine ordered painted routes, new central rest stop, face-anchored bounded speech bubbles, fivefold tile gain with shared peak control, no automatic wind, and four arranged music cues.');
