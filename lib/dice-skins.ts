/**
 * Yacht Dice skins, opened by the number of achievements earned. Looks only: no rule, score or stat changes
 * (TURNTALE keeps growth to content unlocks). Stored per device like the achievements themselves.
 */
import {COMPLETION_ACHIEVEMENT,type AchievementState} from './achievements';
export const DICE_SKIN_KEY='turntale-dice-skin';
export const DICE_SKINS=[
 {id:'ivory',name:'상아 주사위',need:0,note:'처음부터'},
 {id:'obsidian',name:'흑요석 주사위',need:3,note:'업적 3개'},
 {id:'jade',name:'비취 주사위',need:6,note:'업적 6개'},
 {id:'gilded',name:'금박 주사위',need:10,note:'업적 10개'},
 {id:'crimson',name:'세계수 주사위',need:'all',note:'모든 업적 달성'},
] as const;
export type DiceSkinId=typeof DICE_SKINS[number]['id'];
export function earnedAchievementCount(state:Pick<AchievementState,'unlocked'>){return Object.keys(state.unlocked).filter(id=>id!==COMPLETION_ACHIEVEMENT&&state.unlocked[id]).length;}
export function diceSkinOpen(skin:typeof DICE_SKINS[number],state:Pick<AchievementState,'unlocked'>){
 return skin.need==='all'?!!state.unlocked[COMPLETION_ACHIEVEMENT]:earnedAchievementCount(state)>=skin.need;
}
export function isDiceSkin(id:unknown):id is DiceSkinId{return DICE_SKINS.some(skin=>skin.id===id);}
/** The saved choice, falling back to ivory if it is unknown or (after a reset) no longer open. */
export function readDiceSkin(state:Pick<AchievementState,'unlocked'>):DiceSkinId{
 let id:unknown='ivory';try{id=localStorage.getItem(DICE_SKIN_KEY);}catch{}
 const skin=DICE_SKINS.find(item=>item.id===id);return skin&&diceSkinOpen(skin,state)?skin.id:'ivory';
}
/** Dice everywhere (practice board, online room, menu card) read this attribute from <html>. */
export function applyDiceSkin(id:DiceSkinId){if(typeof document!=='undefined')document.documentElement.dataset.diceSkin=id;}
export function saveDiceSkin(id:DiceSkinId){try{localStorage.setItem(DICE_SKIN_KEY,id);}catch{}applyDiceSkin(id);}
