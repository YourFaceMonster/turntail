import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import EntranceWorld,{tableWorldGeometry} from '../app/components/EntranceWorld';
import {observerCamera,observerCameraFrames,SEATED_TILT,seatedScale} from '../lib/entrance-camera';
import {projectEntrancePoint} from '../lib/entrance-gpu';
for(const diameter of [500,900,1600]){
 const world=tableWorldGeometry(diameter,300,450),html=renderToStaticMarkup(<EntranceWorld diameter={diameter} cx={300} cy={450}/>);
 assert.equal(world.legs.length,4);assert.equal((html.match(/class="entry-table-leg"/g)||[]).length,4);
 assert.equal((html.match(/class="leg-foot"/g)||[]).length,4);
 assert.ok(!html.includes('<img')&&!html.includes('stage-map')&&!html.includes('entry-world-landmark'));
 assert.ok(world.height>=200&&world.height<=300&&world.span<=2200);
 for(const p of world.legs)assert.ok(Math.hypot(p.x-300,p.y-450)<diameter/2,'every leg attaches inside the round tabletop');
 for(const overview of [.2,.4,.65]){
  const first=observerCamera(0,overview),beside=observerCamera(.2,overview),last=observerCamera(1,overview);
  assert.equal(first.tilt,SEATED_TILT);assert.ok(beside.tilt<first.tilt,'the observer rises directly from the seated angle');
  assert.equal(beside.scale,first.scale);assert.deepEqual(last,{tilt:0,scale:seatedScale(overview)});
  const camera={width:600,height:900,...first},top=projectEntrancePoint(360,490,0,camera),foot=projectEntrancePoint(360,490,-world.height,camera);
  assert.ok(Math.hypot(top.x-foot.x,top.y-foot.y)>25,'tabletop and floor contact visibly separate in the establishing view');
  for(const duration of [2400,3600]){const frames=observerCameraFrames(overview,duration);assert.equal(frames.length,Math.ceil(duration/1000*120)+1);assert.equal(frames[0].offset,0);assert.equal(frames.at(-1)!.offset,1);}
 }
}
console.log('PASS: four fixed legs attach under the circular tabletop, feet share the floor height, clean bounded room geometry, eye-level approach before leaning, and 120Hz compositor camera samples.');
