import assert from 'node:assert/strict';
import {savedTablePlan,measureSavedTable} from '../lib/saved-table.ts';
const own={id:0,n:1,s:0},exposed={id:1,n:2,s:1},hidden={id:2,n:3,s:2},played={id:3,n:4,s:3};
const game={me:0,players:[{hand:[own]},{hand:[hidden]}],stacks:[{upper:true,lowerPresent:true,lower:hidden},{upper:false,lowerPresent:true,lower:exposed},{upper:false,lowerPresent:false}],trick:[played]};
const before=JSON.stringify(game),plan=savedTablePlan(game);
assert.deepEqual(plan.map(r=>r.key),['upper-0','lower-1','own-0','trick-3']);
assert.equal(plan.filter(r=>r.back).length,1);
assert.ok(!plan.some(r=>r.tile?.id===hidden.id),'covered lower faces and AI hand identities never reach the scene');
for(const angle of [0,90,-90]){
 const measured=measureSavedTable(game,angle,()=>({left:20,top:30,width:48,height:64}));
 for(const r of measured){assert.equal(r.target.x,44);assert.equal(r.target.y,62);assert.equal(r.target.angle,angle);assert.equal(r.target.width,angle?64:48);}
}
assert.throws(()=>measureSavedTable(game,0,()=>null));
assert.equal(JSON.stringify(game),before,'returning to the table changes no saved tile or position');
console.log('PASS: resume preserves visible floor, own hand and played tiles, handles both rotations, waits for measured geometry and never reveals covered/AI faces.');
