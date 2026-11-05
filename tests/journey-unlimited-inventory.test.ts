import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRpgJourneyGame} from '../lib/rpg-game';
import {buyRpgItem,currentRpgShop} from '../lib/rpg';
import {chooseRpgStageReward} from '../lib/rpg-phase-one';
import {equipJourneyRelic,discoverWayfarerRelic,validateJourneySave} from '../lib/rpg-journey';
import {saveRpgGame,readRpgArchive} from '../lib/rpg-storage';
import {BLUE_GLASS_ID} from '../lib/blue-glass';
const fresh=()=>{const g=createRpgJourneyGame('보유 한도 검증');g.rpgRun!.status='ready';g.rpgRun!.coins=20000;g.rpgRun!.shops=[{area:1,stock:[]}];g.rpgRun!.consumables=[];return g;};
test('repeat consumables and many unique relics preserve costs, uniqueness and three equipment slots',()=>{
 const g=fresh();let run=g.rpgRun!;
 for(let i=0;i<120;i++)run=buyRpgItem(run,'emergency-herb');
 assert.equal(run.consumables.length,120);assert.equal(run.coins,16400);assert.equal(currentRpgShop(run)?.stock.find(x=>x.id==='emergency-herb')?.quantity,1);
 const ids=currentRpgShop(run)!.stock.filter(x=>x.kind==='relic'&&x.quantity&&!run.relics.includes(x.id)).map(x=>x.id);
 for(const id of ids.slice(0,8))run=buyRpgItem(run,id);
 assert.ok(run.relics.length>6);assert.equal(new Set(run.relics).size,run.relics.length);assert.throws(()=>buyRpgItem(run,ids[0]));
 run.journey!.location='tavern';run.equipped=run.relics.slice(0,3);
 assert.throws(()=>equipJourneyRelic(run,run.relics[3]));const off=equipJourneyRelic(run,run.equipped[0]);assert.equal(off.equipped.length,2);assert.deepEqual(off.relics,run.relics);
 const swapped=equipJourneyRelic(run,run.relics[3],run.equipped[0]);assert.equal(swapped.equipped.length,3);assert.deepEqual(swapped.relics,run.relics);
 g.rpgRun=swapped;const memory=new Map<string,string>(),store={getItem:(k:string)=>memory.get(k)||null,setItem:(k:string,v:string)=>{memory.set(k,v);}};saveRpgGame(store,g);assert.deepEqual(readRpgArchive(store).active!.rpgRun!.consumables,run.consumables);assert.deepEqual(readRpgArchive(store).active!.rpgRun!.relics,run.relics);
 const bad=structuredClone(g);bad.rpgRun!.equipped=bad.rpgRun!.relics.slice(0,4);assert.throws(()=>validateJourneySave(bad));
});
test('stage and watchtower rewards add to large inventories without discarding older relics',()=>{
 const g=fresh(),run=g.rpgRun!;run.relics=['cracked-heart','final-knot','second-heart','second-ring','stopped-hourglass','two-sided-coin','gamblers-gloves'];run.equipped=run.relics.slice(0,3);
 run.status='allocation';run.phaseOne!.clear={stage:1,hpBefore:100,baseHeal:0,relicHeal:0,synergyHeal:0,relicId:'mor-quill'};
 const reward=chooseRpgStageReward(run,'relic','cracked-heart');assert.equal(reward.relics.length,8);assert.ok(reward.relics.includes('cracked-heart'));assert.equal(reward.equipped.length,3);
 reward.status='ready';reward.journey!.location='watchtower';reward.journey!.wayfarerHerbGiven=true;
 const found=discoverWayfarerRelic(reward);assert.equal(found.relics.length,9);assert.ok(found.relics.includes(BLUE_GLASS_ID));assert.ok(found.journey!.watchtowerRelicClaimed);assert.equal(found.equipped.length,3);assert.ok(run.relics.every(id=>found.relics.includes(id)));
});
