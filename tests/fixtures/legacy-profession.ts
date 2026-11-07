/** Explicit pre-0.7 fixtures exercise the saved-round compatibility paths.
 * New-rule behavior and the real next-deal migration are covered in profession-round-070.test.tsx. */
import {createHpItemGame} from '../../lib/hp-item-mode';
import {createRpgGame,createRpgPhaseOneGame,startRpgRound} from '../../lib/rpg-game';
import {ensureProfessionActives,resetProfessionActiveEvents} from '../../lib/profession-actives';
import type {Game} from '../../lib/game';
export function legacyProfessionGame<T extends Game>(game:T):T{
 if(game.rpgRun?.combat){game.rpgRun.combat.roundRules=false;ensureProfessionActives(game);}return game;
}
export function createLegacyHpItemGame(...args:Parameters<typeof createHpItemGame>){return legacyProfessionGame(createHpItemGame(...args));}
export function createLegacyRpgGame(...args:Parameters<typeof createRpgGame>){return legacyProfessionGame(createRpgGame(...args));}
export function createLegacyRpgPhaseOneGame(...args:Parameters<typeof createRpgPhaseOneGame>){return legacyProfessionGame(createRpgPhaseOneGame(...args));}
export function startLegacyRpgRound(...args:Parameters<typeof startRpgRound>){if(args[0].rpgRun)args[0].rpgRun.pendingRework=false;startRpgRound(...args);legacyProfessionGame(args[0]);resetProfessionActiveEvents(args[0]);}
