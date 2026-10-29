/** Saved per match. Old saves and the RPG journey retain their 100 HP rule. */
export const NEW_ITEM_MATCH_HP=180;
export function hpLimit(run?:{maxHp?:number}|null){const value=run?.maxHp;return Number.isInteger(value)&&Number(value)>=100&&Number(value)<=300?Number(value):100;}
