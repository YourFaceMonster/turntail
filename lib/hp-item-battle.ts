import type {Tile} from './game.ts';
import type {ProfessionEffect} from './rpg-profession-combat.ts';
/** Battle event shape and presentation timings shared by the story combat (the item-battle mode itself was removed 2026-11-15). */
export type HpBattleEvent={instantSkill?:boolean,skillHealing?:number[],roundPending?:boolean,roundSettlement?:boolean,roundHealing?:number[],excludedSeats?:number[],id:string,round:number,actor:number,label:string,damage:number,maxHp?:number,ordinal?:number,winningTiles?:Tile[],playedCount?:number,roundFinal?:boolean,damageTaken?:number[],blockedDamage?:number[],pointsEarned?:number,professions?:ProfessionEffect[],relics?:{relicId:string,message:string}[],relicDamage?:number,relicHealing?:number,hpBefore:number[],hpAfter:number[],at:number};
export const HP_BATTLE_REVIEW_MS=2000;
export const FINAL_SETTLEMENT_DELAY_MS=1000;