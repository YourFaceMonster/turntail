import type {BotPosition,BotAction} from './game';
import {analyzeItemBattleTurn} from './item-battle-plan';
/** Card-only callers use the same rank-aware assessment as the full turn planner. */
export function chooseItemBattleAction(position:BotPosition):BotAction{return analyzeItemBattleTurn(position,{auxiliary:false}).action as BotAction;}
