import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRpgJourneyGame,createRpgPhaseOneGame,startRpgRound,enterJourneyNode} from '../lib/rpg-game';
import {act,settle,start,view,player,room,botMove,legalOptions,rpgTwinBotView,type Game,type Tile} from '../lib/game';
import {rpgHandSettlement,scoutCount,scoutRpgFloor,resolveRpgScout,activateRpgRelics,rpgMaxHp,reworkRewardOffers,advanceReworkStage,chooseReworkReward,RPG_STAGE_HP} from '../lib/rpg-rework';
import {chooseRpgStageReward} from '../lib/rpg-phase-one';
import {giveHerbToWayfarer,returnLetterToMor,discoverWayfarerRelic,equipJourneyRelic,hearJourneyRumor,settleJourneyMini} from '../lib/rpg-journey';
import {saveRpgGame,readRpgArchive,RPG_PHASE_ONE_STORAGE_KEY,RPG_REWORK_BACKUP_KEY} from '../lib/rpg-storage';
import {createHpItemGame} from '../lib/hp-item-mode';
import {hpLimit} from '../lib/hp-limit';
import {tileLayout} from '../lib/layout';
import {useRpgTacticalItem} from '../lib/rpg-items';
import RpgReworkResult from '../app/components/RpgReworkResult';
import {RpgHub} from '../app/components/RpgJourney';
import {JourneyWayfarerStopView} from '../app/components/RpgJourneyScene';
import {RpgPreviewSession} from '../lib/rpg-preview';
import {RpgEquippedRelics} from '../app/components/RpgEquippedRelics';
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const fresh=()=>{const game=createRpgJourneyGame('검증','',0);enterJourneyNode(game,'battle-1',0);return game;};
function finish(game:Game,counts:number[],winner=counts.indexOf(0)){
 game.players.forEach((p,i)=>p.hand=Array.from({length:counts[i]},(_,j)=>tile(j%15+1,i)));
 game.phase='ended';game.winner=winner;game.result=null;return settle(game);
}
const memory=()=>{const data=new Map<string,string>();return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};};
test('new RPG: 60 unique tiles, fixed 24 floor tiles, no combat or currency',()=>{
 for(let i=0;i<30;i++){
  const game=fresh(),tiles=[...game.players.flatMap(p=>p.hand),...game.stacks.flat().filter((t):t is Tile=>!!t)];
  assert.deepEqual(game.players.map(p=>p.hand.length),[12,12,12]);assert.equal(tiles.length,60);assert.equal(new Set(tiles.map(t=>t.id)).size,60);
  assert.equal(tiles.filter(t=>t.n===2).length,4);assert.equal(game.stacks.length,12);assert.equal(game.cols,4);assert.equal(game.rows,3);
  assert.deepEqual(game.rpgRun!.hp,[100,25,30]);assert.deepEqual(game.rpgRun!.relics,['gamblers-gloves']);assert.deepEqual(game.rpgRun!.discovered,['gamblers-gloves']);assert.equal(game.rpgRun!.combat,undefined);assert.equal(game.rpgRun!.coins,0);assert.deepEqual(game.rpgRun!.consumables,[]);
 }
});
test('three-seat HP formula and fair tied runners-up',()=>{
 assert.deepEqual(rpgHandSettlement([0,4,8],[0,1,2]).delta,[12,4,-16]);
 assert.deepEqual(rpgHandSettlement([5,0,5],[0,1,2]).delta,[-5,10,-5]);
 assert.deepEqual(rpgHandSettlement([0,0,7],[0,2]).delta,[7,0,-7]);
 for(let a=1;a<20;a++)for(let b=1;b<20;b++)assert.equal(rpgHandSettlement([0,a,b],[0,1,2]).delta.reduce((sum,x)=>sum+x,0),0);
});
test('settlement applies positive HP, clamps and is idempotent across save reload',()=>{
 const game=fresh();game.rpgRun!.hp=[60,50,50];const result=finish(game,[0,4,8]);
 assert.deepEqual(result.players.map(p=>p.delta),[12,4,-16]);assert.deepEqual(game.rpgRun!.hp,[72,54,34]);
 settle(game);assert.deepEqual(game.rpgRun!.hp,[72,54,34]);
 const storage=memory();saveRpgGame(storage,game);const saved=readRpgArchive(storage).active!;settle(saved);assert.deepEqual(saved.rpgRun!.hp,[72,54,34]);
 game.rpgRun!.hp=[99,99,50];startRpgRound(game,100);finish(game,[0,4,8]);assert.deepEqual(game.rpgRun!.hp,[100,100,34]);
});
test('AI elimination occurs at settlement and next round deals 18+18+24 with stable seats',()=>{
 const game=fresh();game.rpgRun!.hp=[80,10,30];finish(game,[0,8,4]);
 assert.deepEqual(game.rpgRun!.hp,[92,0,34]);startRpgRound(game,100);
 assert.deepEqual(game.players.map(p=>p.hand.length),[18,0,18]);assert.equal(game.stacks.flat().filter(Boolean).length,24);assert.equal(game.cols,4);
 assert.notEqual(game.turn,1);const ai=rpgTwinBotView(game,2);assert.equal(ai.players.length,2);assert.equal(ai.me,1);assert.equal(ai.capacity,2);
 const tiles=[...game.players.flatMap(p=>p.hand),...game.stacks.flat().filter(Boolean)];assert.equal(new Set(tiles.map(t=>t!.id)).size,60);
 game.players[0].hand=[tile(5),tile(9)];game.players[2].hand=[tile(6,1),tile(10,1)];game.turn=0;game.turnReadyAt=0;
 act(game,0,'play',[tile(5).id]);assert.equal(game.turn,2);
 const index=view(game,game.players[2].token).stacks.findIndex(s=>s.available);act(game,2,'draw',[],index);assert.equal(game.turn,0);assert.equal(game.trick.length,0);
 game.stacks=game.stacks.map(()=>[null,null]);act(game,0,'play',[tile(9).id]);assert.equal(game.phase,'ended');assert.equal(game.result!.players[1].place,0);assert.equal(game.result!.players[1].delta,0);
});
test('two-seat +7/-7, clear only after both AIs zero, player zero takes failure priority',()=>{
 const game=fresh();game.rpgRun!.hp=[70,0,10];start(game,0);finish(game,[0,0,7]);assert.deepEqual(game.rpgRun!.hp,[77,0,3]);
 startRpgRound(game,0);finish(game,[0,0,7]);assert.equal(game.rpgRun!.status,'allocation');assert.deepEqual(game.rpgRun!.hp,[84,0,0]);
 const failure=fresh();failure.rpgRun!.hp=[3,20,20];failure.rpgRun!.equipped=['final-knot'];finish(failure,[8,0,4]);
 assert.equal(failure.rpgRun!.hp[0],0);assert.equal(failure.rpgRun!.status,'game-over');assert.equal(failure.rpgRun!.fate,0);assert.equal(failure.rpgRun!.journey!.retryStage,undefined);
});
const patterns=[['pair',[tile(7),tile(7,1)],1],['triple',[tile(7),tile(7,1),tile(7,2)],2],['straight',[tile(3),tile(4,1),tile(5,2),tile(6,3),tile(7)],3],['four',[tile(7),tile(7,1),tile(7,2),tile(7,3),tile(8)],4],['straight flush',[tile(3),tile(4),tile(5),tile(6),tile(7)],5]] as const;
for(const [label,tiles,count] of patterns)test(`scout only on confirmed trick win: ${label}`,()=>{
 const game=fresh();game.turn=0;game.players[0].hand=[...tiles,tile(15,3)];game.players[1].hand=[tile(1,3)];game.players[2].hand=[tile(2,3)];
 act(game,0,'play',tiles.map(t=>t.id));assert.equal(Object.keys(game.rpgRun!.rework!.intel).length,0);const before=[...game.rpgRun!.hp];
 for(const seat of [1,2]){const index=view(game,game.players[seat].token).stacks.findIndex(s=>s.available);act(game,seat,'draw',[],index);}
 assert.deepEqual(game.rpgRun!.hp,before);assert.equal(game.rpgRun!.rework!.intel[0].length,count+(tiles.length===5?1:0));resolveRpgScout(game);assert.equal(game.rpgRun!.rework!.intel[0].length,count+(tiles.length===5?1:0));
 assert.equal(scoutCount([...tiles]),count);
});
test('overwritten hand does not scout; final hand skips scouting and grants next-round foresight',()=>{
 const game=fresh();game.turn=0;game.players[0].hand=[tile(3),tile(3,1),tile(9)];game.players[1].hand=[tile(7),tile(7,1),tile(10)];
 act(game,0,'play',[tile(3).id,tile(3,1).id]);act(game,1,'play',[tile(7).id,tile(7,1).id]);assert.equal(Object.keys(game.rpgRun!.rework!.intel).length,0);
 const final=fresh();final.rpgRun!.hp=[60,60,60];final.players[0].hand=[tile(3),tile(3,1)];final.turn=0;act(final,0,'play',final.players[0].hand.map(t=>t.id));assert.deepEqual(final.rpgRun!.rework!.intel,{});assert.equal(final.rpgRun!.rework!.nextForesight,0);
 startRpgRound(final,0);assert.equal(final.rpgRun!.rework!.intel[0].length,3);assert.equal(final.rpgRun!.rework!.nextForesight,undefined);
});
test('private upper/lower intel, no repeats, pickup expiry, per-round reset and hourglass',()=>{
 const game=fresh();scoutRpgFloor(game,0,100);assert.equal(game.rpgRun!.rework!.intel[0].length,24);scoutRpgFloor(game,0,5);assert.equal(game.rpgRun!.rework!.intel[0].length,24);
 const other=view(game,game.players[1].token);assert.deepEqual(other.rpgRun!.rework!.intel,{1:[]});assert.ok(other.stacks.every(s=>!s.scoutedLower));assert.deepEqual(other.rpgRun!.tacticalPeeks,[]);
 const seen=game.rpgRun!.rework!.intel[0][0];game.stacks[seen.index]=game.stacks[seen.index].map(t=>t?.id===seen.tile.id?null:t);view(game,game.players[0].token);assert.ok(!game.rpgRun!.rework!.intel[0].some(i=>i.tile.id===seen.tile.id));
 game.rpgRun!.hp=[70,90,90];finish(game,[0,3,6]);game.rpgRun!.equipped=['stopped-hourglass','watchkeepers-blue-glass'];startRpgRound(game,0);assert.equal(game.rpgRun!.rework!.intel[0].length,6);
 game.rpgRun!.hp=[70,90,90];finish(game,[3,0,6]);startRpgRound(game,0);assert.equal(game.rpgRun!.rework!.intel[0].length,1);assert.equal(game.rpgRun!.rework!.intel[1].length,3);
});
test('heart first activation, unequip/re-equip and delayed equip cannot farm HP',()=>{
 let run=fresh().rpgRun!;run.status='ready';run.journey!.location='tavern';run.hp[0]=60;run.relics.push('cracked-heart','second-heart');
 run=equipJourneyRelic(run,'cracked-heart');assert.equal(run.hp[0],80);assert.equal(rpgMaxHp(run),120);
 run=equipJourneyRelic(run,'second-heart');assert.equal(run.hp[0],90);assert.equal(rpgMaxHp(run),130);
 run=equipJourneyRelic(run,'cracked-heart');assert.equal(rpgMaxHp(run),110);assert.equal(run.hp[0],90);run=equipJourneyRelic(run,'cracked-heart');assert.equal(run.hp[0],90);
 run.hp[0]=125;run=equipJourneyRelic(run,'cracked-heart');assert.equal(run.hp[0],110);
 const high=fresh().rpgRun!;high.hp[0]=95;high.relics.push('cracked-heart');high.equipped.push('cracked-heart');assert.equal(activateRpgRelics(high).hp[0],115);
 assert.equal(hpLimit(createHpItemGame('item','',0,2,undefined,'swordsman').rpgRun),180);
});
test('final knot once per stage, ring only 3 seats, no resurrection',()=>{
 const game=fresh();game.rpgRun!.hp=[6,90,90];game.rpgRun!.equipped=['final-knot'];finish(game,[5,0,5]);assert.equal(game.rpgRun!.hp[0],6);
 startRpgRound(game,0);finish(game,[1,0,2]);assert.equal(game.rpgRun!.hp[0],7);assert.deepEqual(game.rpgRun!.rework!.knotStages,[1]);
 const ring=fresh();ring.rpgRun!.hp=[60,90,90];ring.rpgRun!.equipped=['second-ring'];finish(ring,[4,0,8]);assert.equal(ring.rpgRun!.hp[0],67);
 ring.rpgRun!.hp=[60,0,90];startRpgRound(ring,0);finish(ring,[7,0,0],2);assert.equal(ring.rpgRun!.hp[0],53);
});
test('rewards: 2/3 offers, mirror +1, stable compass preview, quest exclusion',()=>{
 for(const stage of [1,2,3,6,9]){
  const run=fresh().rpgRun!;run.stage=stage;const preview=reworkRewardOffers(structuredClone(run));assert.deepEqual(reworkRewardOffers(run),preview);assert.equal(preview.length,[3,6,9].includes(stage)?3:2);assert.ok(!preview.includes('watchkeepers-blue-glass'));
  const mirror=fresh().rpgRun!;mirror.stage=stage;mirror.equipped.push('split-mirror');assert.equal(reworkRewardOffers(mirror).length,preview.length+1);
 }
 const exhausted=fresh().rpgRun!;exhausted.relics=['gamblers-gloves','cracked-heart','second-heart','recovery-lantern','stopped-hourglass','final-knot','second-ring','mor-quill','twin-needle-compass','split-mirror'];assert.deepEqual(reworkRewardOffers(exhausted),[]);
 const final=fresh().rpgRun!;final.stage=10;assert.deepEqual(reworkRewardOffers(final),[]);
});
test('ST1→ST2→ST3 demo rewards and ending preserve stories, no repeated claims',()=>{
 const game=fresh();for(let stage=1;stage<=3;stage++){
  game.rpgRun!.hp=[70,1,1];finish(game,[0,3,3]);const run=game.rpgRun!,offers=run.phaseOne!.clear!.relicOffers!;assert.equal(offers.length,(stage===3?3:2)+(run.equipped.includes('split-mirror')?1:0));
  game.rpgRun=chooseRpgStageReward(run,'relic',undefined,false,offers[0]);assert.throws(()=>chooseRpgStageReward(game.rpgRun!,'relic',undefined,false,offers[0]));
  if(stage<3){assert.equal(game.rpgRun.status,'ready');enterJourneyNode(game,`battle-${stage+1}` as 'battle-2');assert.equal(game.rpgRun.stage,stage+1);assert.deepEqual(game.rpgRun.hp.slice(1),RPG_STAGE_HP[stage]);}
 }
 assert.equal(game.rpgRun!.status,'complete');assert.ok(game.rpgRun!.storyCards!.includes('iron-gate-two'));assert.equal(game.rpgRun!.stage,3);const storage=memory();saveRpgGame(storage,game);const archive=readRpgArchive(storage);assert.equal(archive.active,null);assert.equal(archive.lastCompleted!.rpgRun!.rework!.inherited,game.rpgRun!.rework!.inherited);assert.deepEqual(archive.lastCompleted!.rpgRun!.journey,JSON.parse(JSON.stringify(game.rpgRun!.journey)));
});
test('future chapter transition resets HP/equipment, inherits one, retains permanent data',()=>{
 const game=fresh();let run=game.rpgRun!;run.journey=undefined;run.stage=3;game.rpgRun=run;run.hp=[70,1,1];finish(game,[0,3,3]);
 run=chooseReworkReward(game.rpgRun!,game.rpgRun!.phaseOne!.clear!.relicOffers![0]);const inherited=run.rework!.inherited!;run.hp[0]=40;
 const permanent=[...run.discovered];run=advanceReworkStage(run);assert.equal(run.stage,4);assert.deepEqual(run.relics,[inherited]);assert.deepEqual(run.equipped,[inherited]);assert.equal(run.hp[0],rpgMaxHp(run));assert.ok(permanent.every(id=>run.discovered.includes(id)));assert.deepEqual(run.hp.slice(1),[40,45]);
});
test('travel help/letter/blue glass preserve flags without items or currency',()=>{
 let run=fresh().rpgRun!;run.status='ready';run.journey!.location='wayfarer-stop';run=giveHerbToWayfarer(run);assert.ok(run.journey!.wayfarerHerbGiven);assert.equal(run.coins,0);
 run.journey!.location='watchtower';run=discoverWayfarerRelic(run);assert.ok(run.relics.includes('watchkeepers-blue-glass'));assert.ok(run.discovered.includes('watchkeepers-blue-glass'));assert.ok(run.journey!.watchtowerRelicClaimed);
 run.journey!.location='tavern';run.journey!.letterQuest={step:'recovered'};run.hp[0]=60;run=returnLetterToMor(run);assert.equal(run.hp[0],65);assert.equal(run.coins,0);assert.equal(run.journey!.letterQuest!.step,'complete');assert.throws(()=>returnLetterToMor(run));
});
test('legacy backup is exact; live round stays legacy and next deal migrates once',()=>{
 const old=createRpgPhaseOneGame('old','',0),storage=memory();const archive={version:1,active:old,records:[],discovered:['wind-sigil'],unlocked:[]};const raw=JSON.stringify(archive);storage.setItem(RPG_PHASE_ONE_STORAGE_KEY,raw);
 const loaded=readRpgArchive(storage).active!;assert.equal(storage.getItem(RPG_REWORK_BACKUP_KEY),null);saveRpgGame(storage,loaded);assert.equal(storage.getItem(RPG_REWORK_BACKUP_KEY),raw);assert.equal(loaded.rpgRun!.rework,undefined);assert.ok(loaded.rpgRun!.combat);
 loaded.phase='ended';loaded.rpgRun!.rounds=1;startRpgRound(loaded,0);assert.ok(loaded.rpgRun!.rework);assert.equal(loaded.rpgRun!.combat,undefined);assert.deepEqual(loaded.players.map(p=>p.hand.length),[12,12,12]);
 saveRpgGame(storage,loaded);const resumed=readRpgArchive(storage).active!;const hp=[...resumed.rpgRun!.hp];saveRpgGame(storage,resumed);assert.deepEqual(readRpgArchive(storage).active!.rpgRun!.hp,hp);assert.equal(storage.getItem(RPG_REWORK_BACKUP_KEY),raw);
});
test('base distribution/settlement and independent item rules stay unchanged',()=>{
 const game=room('base',player('a'),true,3);game.players.push(player('b',true),player('c',true));start(game,0);assert.deepEqual(game.players.map(p=>p.hand.length),[10,10,10]);assert.equal(game.stacks.length,15);
 finish(game,[0,4,8]);assert.deepEqual(game.result!.players.map(p=>p.delta),[12,0,-12]);
 const item=createHpItemGame('item','',0,2,undefined,'swordsman');assert.equal(hpLimit(item.rpgRun),180);assert.ok(item.rpgRun!.combat);assert.equal(item.rpgRun!.rework,undefined);
});
test('18-card mobile layout changes only hand geometry and supports five-card choices',()=>{
 for(const [width,height,landscape] of [[390,650,false],[780,300,true]] as const){const spec={width,height,floorWidth:320,handWidth:350,handCount:12,cols:4,rows:3,players:3,landscape,rpg:true};const a=tileLayout(spec),b=tileLayout({...spec,handCount:18});assert.equal(a.floorHeight,b.floorHeight);assert.ok(b.width<=a.width);assert.equal(b.columns,9);}
 const hand=Array.from({length:18},(_,i)=>tile(i%15+1,Math.floor(i/15)));assert.ok(legalOptions(hand,[]).some(o=>o.tiles.length===5));
});
test('new result/hub/help UI has HP settlement and no currency, class selection, or item requirement',()=>{
 const game=fresh();game.rpgRun!.hp=[60,60,60];finish(game,[0,4,8]);const html=renderToStaticMarkup(<RpgReworkResult game={view(game,game.players[0].token)} busy={false} choose={()=>{}} next={()=>{}} newRun={()=>{}} exit={()=>{}}/>);
 assert.match(html,/패 정산 \+12 HP/);assert.doesNotMatch(html,/주화|스킬|아이템창/);
 const hub=renderToStaticMarkup(<RpgHub active={game} records={[]} start={()=>{}} resume={()=>{}} testActive={null} testStart={()=>{}} testResume={()=>{}} close={()=>{}} error=""/>);assert.doesNotMatch(hub,/전투 직업 선택|주화/);
 const run=game.rpgRun!;run.status='ready';run.journey!.location='wayfarer-stop';const help=renderToStaticMarkup(<JourneyWayfarerStopView run={run} busy={false} error="" action={()=>{}} exit={()=>{}}/>);assert.match(help,/traveler-injured/);assert.doesNotMatch(help,/건넬 응급 약초/);
});
test('new preview screens use the new engine, including 18-card duel, zero-HP failure and ST3 rewards',()=>{
 const game=createRpgJourneyGame('preview'),preview=new RpgPreviewSession(game,'screens');
 for(const target of ['map','tavern','battle-1','battle-2','battle-3','duel-2','reward-1','reward-2','reward-3','failed','mini-round','mini-final'] as const){
  const screen=preview.screen(game,target);assert.equal(screen.rpgRun!.coins,0);assert.ok(screen.rpgRun!.rework);
  if(target==='duel-2'){assert.deepEqual(screen.players.map(p=>p.hand.length),[18,0,18]);assert.equal(screen.stacks.length,12);}
  if(target==='failed')assert.equal(screen.rpgRun!.status,'game-over');
  if(target.startsWith('reward'))assert.equal(screen.rpgRun!.status,'allocation');
 }
});
test('new relic tray describes scouting and HP, preserving the legacy catalogue separately',()=>{
 const run=fresh().rpgRun!;run.equipped=['gamblers-gloves','cracked-heart'];
 const html=renderToStaticMarkup(<RpgEquippedRelics run={run}/>);assert.match(html,/정찰 \+1장/);assert.match(html,/최대 HP \+20/);assert.doesNotMatch(html,/포인트|피해 8 감소/);
});
test('migration from completed old stage keeps player HP and uses the next stage trial HP',()=>{
 const game=createRpgPhaseOneGame('old'),run=game.rpgRun!;run.pendingRework=true;run.status='ready';run.hp=[60,0,0];run.phaseOne!.clear={stage:1,hpBefore:60,baseHeal:0,relicHeal:0,synergyHeal:0,relicId:'recovery-lantern',chosen:'all'};game.phase='ended';
 startRpgRound(game,0);assert.equal(game.rpgRun!.stage,2);assert.deepEqual(game.rpgRun!.hp.slice(1),[35,40]);assert.equal(game.rpgRun!.hp[0],80);assert.equal(game.rpgRun!.maxHp,120);
});
test('backup failure preserves the original save and never writes a converted active game',()=>{
 const game=createRpgPhaseOneGame('old'),storage=memory();const raw=JSON.stringify({version:1,active:game,records:[],discovered:[],unlocked:[]});storage.setItem(RPG_PHASE_ONE_STORAGE_KEY,raw);
 const failing={getItem:storage.getItem,setItem(key:string,value:string){if(key===RPG_REWORK_BACKUP_KEY)throw Error('quota');storage.setItem(key,value);}};
 assert.throws(()=>saveRpgGame(failing,game),/백업에 실패/);assert.equal(storage.getItem(RPG_PHASE_ONE_STORAGE_KEY),raw);
});
test('new combat cannot consume even a manually restored retired item',()=>{
 const game=fresh();game.turn=0;game.rpgRun!.consumables=['ember-bomb'];const hp=[...game.rpgRun!.hp];assert.throws(()=>useRpgTacticalItem(game,'ember-bomb',1),/전투 아이템/);assert.deepEqual(game.rpgRun!.hp,hp);
});
