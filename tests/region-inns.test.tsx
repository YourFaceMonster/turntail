import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRpgJourneyGame,enterJourneyNode} from '../lib/rpg-game';
import {settle,type Game,type Tile} from '../lib/game';
import {chooseRpgStageReward} from '../lib/rpg-phase-one';
import {journeyNodeState,returnJourneyMap,validateJourneySave} from '../lib/rpg-journey';
import {INNS,innAction,offeringHeal,innPrize,HIGH_LOW_GOAL,MEMORY_GOAL} from '../lib/rpg-inns';
import {knownRecipes,rpgMaxHp} from '../lib/rpg-rework';
import JourneyInnView,{InnArrivalReplay} from '../app/components/JourneyInn';
import {existsSync} from 'node:fs';
import {innArt} from '../lib/rpg-inns';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
function finish(game:Game,counts:number[]){game.players.forEach((p,i)=>p.hand=Array.from({length:counts[i]},(_,j)=>tile(j%15+1,i)));game.phase='ended';game.winner=counts.indexOf(0);game.result=null;return settle(game);}
/** A journey standing on the flame-region map, ready for ST4. */
function regionTwo(){
 const game=createRpgJourneyGame('검증','',0);enterJourneyNode(game,'battle-1',0);
 for(let stage=1;stage<=3;stage++){if(stage>1)enterJourneyNode(game,`battle-${stage}` as never);game.rpgRun!.hp=[game.rpgRun!.hp[0],1,40];finish(game,[0,6,3]);game.rpgRun=chooseRpgStageReward(game.rpgRun!,'relic',undefined,false,game.rpgRun!.phaseOne!.clear!.relicOffers![0]);}
 return game;
}

test('each region inn opens only in its own region and keeps the save valid',()=>{
 const game=regionTwo(),run=game.rpgRun!;
 assert.equal(journeyNodeState(run,'inn-2'),'available');assert.equal(journeyNodeState(run,'inn-3'),'closed');
 enterJourneyNode(game,'inn-2' as never);assert.equal(game.rpgRun!.journey!.location,'inn');
 validateJourneySave(game);
 returnJourneyMap(game);assert.equal(game.rpgRun!.journey!.location,'map');
});

test('rumour, recipe, offering and house game each work once with the approved numbers',()=>{
 const game=regionTwo();enterJourneyNode(game,'inn-2' as never);let run=game.rpgRun!;
 run=innAction(run,{op:'rumor'});assert.ok(run.journey!.rumors.includes('inn-rumor-2'));assert.equal(run.journey!.inns![2]!.met,true);
 const before=knownRecipes(run).length;run=innAction(run,{op:'recipe'});assert.equal(knownRecipes(run).length,before+1);
 assert.equal(innAction(run,{op:'recipe'}),run,'the regular teaches once');
 // Offering: bag relics only, heal by grade, never above max HP.
 const free=(r:typeof run)=>['second-ring','final-knot','second-heart','recovery-lantern','split-mirror','twin-needle-compass'].filter(x=>!r.relics.includes(x));
 const id=free(run)[0];run={...run,relics:[...run.relics,id],equipped:run.equipped.filter(r=>r!==id),hp:[30,...run.hp.slice(1)]};
 assert.equal(offeringHeal('second-ring'),15);assert.equal(offeringHeal('cracked-heart'),25);assert.equal(offeringHeal('whole-heart'),40);
 run=innAction(run,{op:'offer',id});assert.equal(run.hp[0],30+offeringHeal(id));assert.ok(!run.relics.includes(id));
 const worn=run.equipped[0];if(worn)assert.throws(()=>innAction(run,{op:'offer',id:worn}),/장착한 유물/);
 const spare=free(run)[0];run={...run,hp:[rpgMaxHp(run),...run.hp.slice(1)],relics:[...run.relics,spare]};assert.throws(()=>innAction(run,{op:'offer',id:spare}),/가득/);
 // House game: below the goal pays nothing; reaching it pays one relic once.
 const prize=innPrize(run,2)!;run=innAction(run,{op:'game',score:HIGH_LOW_GOAL-1});assert.ok(!run.journey!.inns![2]!.gameWon);
 run=innAction(run,{op:'game',score:HIGH_LOW_GOAL});assert.equal(run.journey!.inns![2]!.gameRelic,prize);assert.ok(run.relics.includes(prize));
 const count=run.relics.length;run=innAction(run,{op:'game',score:9});assert.equal(run.relics.length,count,'later plays are practice');
 game.rpgRun=run;validateJourneySave(game);
});

test('memory inn pays within the flip goal and the inn screen shows the sibling owner',()=>{
 assert.equal(INNS[3].owner,'모로');assert.equal(INNS[2].owner,'모란');assert.equal(INNS[3].game,'memory');
 const game=regionTwo();enterJourneyNode(game,'inn-2' as never);
 const html=renderToStaticMarkup(<JourneyInnView run={game.rpgRun!} busy={false} error="" action={()=>{}}/>);
 assert.match(html,/안개 나루 주점/);
 const run={...game.rpgRun!,journey:{...game.rpgRun!.journey!,currentNode:'inn-3' as never}};
 assert.ok(!innAction(run,{op:'game',score:MEMORY_GOAL+1}).journey!.inns?.[3]?.gameWon);
 assert.ok(innAction(run,{op:'game',score:MEMORY_GOAL}).journey!.inns![3]!.gameWon);
});

test('Mor\'s quill teaches one more recipe at each inn, and the inn paintings and portraits exist',()=>{
 const game=regionTwo();enterJourneyNode(game,'inn-2' as never);let run=game.rpgRun!;run={...run,relics:[...new Set([...run.relics,'mor-quill'])]};
 const before=knownRecipes(run).length;run=innAction(run,{op:'recipe'});
 assert.equal(knownRecipes(run).length,Math.min(4,before+2));assert.equal(run.relicActivations?.at(-1)?.relicId,'mor-quill');
 for(const region of [2,3] as const){const art=innArt(region);assert.equal(art.portrait,`/story/inn-${region}-portrait-v1.webp`);assert.ok(existsSync(new URL(`../public${art.portrait}`,import.meta.url)));}
 for(const who of ['moran','dokan','moro','rine'])assert.ok(existsSync(new URL(`../public/story/inn-portrait-${who}-v1.webp`,import.meta.url)),who);
 const html=renderToStaticMarkup(<InnArrivalReplay run={run} node="inn-2" close={()=>{}}/>);assert.match(html,/안개 나루 주점 · 다시 보기|폭포 아래 나루터/);
});