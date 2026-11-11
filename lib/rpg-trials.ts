/**
 * Challenge rules for a new RPG journey, opened after the true ending. Each one only makes the journey harder:
 * no stat, level or reward bonus is attached (content-unlock growth only). Chosen when a journey starts and fixed for it.
 */
export const RPG_TRIALS=[
 {id:'weak-heart',name:'약한 심장',text:'여정과 각 장(章)을 HP 70으로 시작해요.'},
 {id:'fierce-foes',name:'거센 상대',text:'모든 상대의 시작 HP가 20% 늘어나요.'},
 {id:'lone-relic',name:'홀로 든 유물',text:'유물을 1개만 장착할 수 있어요.'},
] as const;
export type RpgTrialId=typeof RPG_TRIALS[number]['id'];
type WithTrials={trials?:readonly string[]};
export function isRpgTrial(id:unknown):id is RpgTrialId{return RPG_TRIALS.some(trial=>trial.id===id);}
export function cleanTrials(ids:unknown):RpgTrialId[]{return Array.isArray(ids)?[...new Set(ids.filter(isRpgTrial))]:[];}
export function hasTrial(run:WithTrials|null|undefined,id:RpgTrialId){return !!run?.trials?.includes(id);}
/** Player HP at the start of the journey and of each chapter. */
export function trialStartHp(run:WithTrials){return hasTrial(run,'weak-heart')?70:100;}
/** Opponents' starting HP for a stage (the base pair comes from RPG_STAGE_HP). */
export function trialEnemyHp(run:WithTrials,base:readonly number[]){return hasTrial(run,'fierce-foes')?base.map(hp=>Math.ceil(hp*1.2)):[...base];}
/** How many relics may be equipped at once. */
export function rpgRelicSlots(run:WithTrials){return hasTrial(run,'lone-relic')?1:3;}
