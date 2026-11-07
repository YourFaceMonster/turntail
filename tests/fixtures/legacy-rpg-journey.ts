/** Pre-rework save fixtures. Current gameplay is exercised by rpg-rework.test.tsx. */
import {createRpgPhaseOneGame as createPhase,startRpgRound as startRound,enterJourneyNode as enterNode} from '../../lib/rpg-game';
import {initRpgJourney} from '../../lib/rpg-journey';
import {RPG_SHOP_ITEMS} from '../../lib/rpg-items';
export * from '../../lib/rpg-game';
export function createRpgJourneyGame(...args:Parameters<typeof createPhase>){
 const game=createPhase(...args);initRpgJourney(game);
 game.rpgRun!.consumables=RPG_SHOP_ITEMS.flatMap(id=>[id,id]);game.rpgRun!.coins+=50;return game;
}
/** Deliberately stays in old rules; actual next-deal migration has its own tests. */
export function startRpgRound(...args:Parameters<typeof startRound>){args[0].rpgRun!.pendingRework=false;startRound(...args);}

export function enterJourneyNode(...args:Parameters<typeof enterNode>){args[0].rpgRun!.pendingRework=false;enterNode(...args);}
