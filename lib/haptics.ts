/**
 * Component-level vibration without prop drilling. The page registers the player because it owns
 * the "haptic" preference; nothing vibrates until then or when the setting is off.
 */
export type HapticPattern=number|number[];
let player:((pattern:HapticPattern)=>void)|null=null;
export function setHapticPlayer(next:typeof player){player=next;}
export function haptic(pattern:HapticPattern){try{player?.(pattern);}catch{}}
/** Yacht Dice patterns (ms on/off). */
export const DICE_HAPTICS={
 rattle:()=>8+Math.round(Math.random()*10),
 pour:[24,30,14] as number[],
 land:[10,45,8,40,6] as number[],
 pick:12,
 score:[14,30,18] as number[],
 combo:[22,40,30,40,46] as number[],
 yacht:[40,50,40,50,60,50,110] as number[],
};
