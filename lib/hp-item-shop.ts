import {hasRoundCombat,hasImmediateSkills} from './profession-round-rules';
import {hpLimit} from './hp-limit';
import type {Game} from './game.ts';
import type {HpBattleEvent} from './hp-item-battle.ts';

/**
 * HP shown for story seats. The item-battle mode (shop, wallets, queued item HP) was removed 2026-11-15;
 * only the story presentation rules remain.
 */
export function hpItemEffectiveHp(game:Pick<Game,'rpgRun'>,seat:number){
 const pending=game.rpgRun?.combat?.pendingRound,queued=hasRoundCombat(game)&&!hasImmediateSkills(game)&&!pending?.settled?(pending?.healing[seat]||0)-(pending?.damage[seat]||0):0;
 return Math.max(0,Math.min(hpLimit(game.rpgRun),(game.rpgRun?.hp[seat]||0)+queued));
}
export function hpItemDisplayHp(game:Pick<Game,'rpgRun'|'phase'>&{round?:number},seat:number,reveal=false,heldBattle:HpBattleEvent|null=null,heldItem:{id:string,target:number,before:number}|null=null){
 if(heldItem&&game.rpgRun?.lastItem?.id===heldItem.id&&heldItem.target===seat)return heldItem.before;
 // Story mode: the round's HP change shows only once the settlement screen opens; until then keep the round-start HP.
 const health=game.rpgRun?.rework&&game.phase==='ended'&&!reveal?game.rpgRun.roundHealth:undefined;
 if(health&&(game.round===undefined||health.round===game.round)&&Number.isFinite(health.before[seat]))return health.before[seat];
 // Presentation only: the authoritative HP remains immediate for all game decisions.
 if(heldBattle&&game.rpgRun?.combat?.lastBattle?.id===heldBattle.id)return heldBattle.hpBefore[seat];
 return game.rpgRun?.hp[seat]??0;
}
