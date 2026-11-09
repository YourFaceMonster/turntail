/**
 * Standalone Yacht Dice from the single-play menu: same rules and AI as Haro's side quest,
 * but nothing is staked or won (no HP, relic or journey state). Lives only in memory.
 */
import {newYachtMatch,rollYacht,toggleYachtHold,scoreYacht,yachtAiStep,yachtOutcome,cryptoDie,type DiceRandom,type YachtMatch} from './yacht-dice';
import type {DiceAction} from './rpg-journey';

export type YachtPracticeResult='win'|'lose'|'draw'|'forfeit';
export type YachtPracticeState={match:YachtMatch,result?:YachtPracticeResult};
export function newYachtPractice():YachtPracticeState{return {match:newYachtMatch()};}
export function playYachtPractice(state:YachtPracticeState,action:DiceAction,random:DiceRandom=cryptoDie):YachtPracticeState{
 const match=state.match;
 if(match.status!=='playing')throw Error('이미 끝난 판이에요. 한 판 더 시작해 주세요.');
 if(action.kind==='forfeit')return {match:{...match,status:'ended'},result:'forfeit'};
 const next=action.kind==='roll'?rollYacht(match,0,random):action.kind==='hold'?toggleYachtHold(match,0,action.index):action.kind==='score'?scoreYacht(match,0,action.category):action.kind==='ai'?yachtAiStep(match,random):undefined;
 if(!next)throw Error('알 수 없는 주사위 동작이에요.');
 return {match:next,result:yachtOutcome(next)};
}
