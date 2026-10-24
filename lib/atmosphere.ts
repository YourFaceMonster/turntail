/** These inputs are public counts only; this module never accepts tile identities. */
export function endgameLevel(phase:string|undefined,counts:readonly number[],opening=false):0|1|2{
 if(phase!=='playing'||opening||counts.length<2||counts.some(n=>!Number.isInteger(n)||n<=0))return 0;
 const least=Math.min(...counts);return least===1?2:least<=3?1:0;
}
export type EntrancePhase='idle'|'menu-out'|'room-hold'|'approach'|'shuffle'|'prepare'|'rise'|'deal'|'focus'|'settle'|'game-in';
export const ENTRANCE_MS:Record<EntrancePhase,number>={idle:0,'menu-out':480,'room-hold':160,approach:600,shuffle:3000,prepare:0,rise:1600,deal:1500,focus:1300,settle:160,'game-in':650};
export function nextEntrance(phase:EntrancePhase,resume=false):EntrancePhase{
 return ({idle:'idle','menu-out':'room-hold','room-hold':resume?'approach':'prepare',prepare:'approach',approach:resume?'rise':'shuffle',shuffle:'rise',rise:resume?'focus':'deal',deal:'focus',focus:'settle',settle:'game-in','game-in':'idle'} as const)[phase];
}
/** The real board gets a full hidden paint before the curtain opens. */
export function concealLiveTiles(phase:EntrancePhase){return ['prepare','approach','shuffle','rise','deal','focus'].includes(phase);}
export function entranceCurtain(phase:EntrancePhase):'close'|'covered'|'open'|'clear'{
 if(phase==='menu-out')return 'close';
 if(['room-hold','prepare'].includes(phase))return 'covered';
 if(phase==='approach')return 'open';
 return 'clear';
}

/** Returning players get time to recognize their opponents and saved table. */
export function entranceDuration(phase:EntrancePhase,resume=false){return resume&&phase==='game-in'?850:ENTRANCE_MS[phase];}
