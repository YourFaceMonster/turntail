import type {RpgProfessionId} from './rpg-professions';
export const ITEM_BATTLE_STAGE_COUNT=10;
/** Presentation only: never change RPG progression, opponents or AI difficulty. */
export function itemBattleVisualStage(seed:string){let hash=2166136261;for(const ch of seed){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0)%ITEM_BATTLE_STAGE_COUNT+1;}
export function validItemBattleStage(value:unknown):value is number{return Number.isInteger(value)&&Number(value)>=1&&Number(value)<=ITEM_BATTLE_STAGE_COUNT;}
export function newItemBattleVisualStage(){const random=new Uint32Array(1);crypto.getRandomValues(random);return random[0]%ITEM_BATTLE_STAGE_COUNT+1;}
export const PROFESSION_SKILL_IMAGES:Record<RpgProfessionId,string>={swordsman:'/item-battle-v1/skills/swordsman-strike-v1.png',mage:'/item-battle-v1/skills/mage-fireball-v1.png',cleric:'/item-battle-v1/skills/cleric-heal-v1.png',rogue:'/item-battle-v1/trap-v1.webp'};
/** Existing spent gauge defines presentation tiers, not character levels. */
export function mageSpellPresentation(spent:number){return spent>=5?{kind:'wall' as const,name:'파이어월'}:spent>=3?{kind:'wave' as const,name:'화염 파동'}:{kind:'ball' as const,name:'파이어볼'};}
