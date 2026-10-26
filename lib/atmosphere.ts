/** These inputs are public counts only; this module never accepts tile identities. */
export function endgameLevel(phase:string|undefined,counts:readonly number[],opening=false):0|1|2{
 if(phase!=='playing'||opening||counts.length<2||counts.some(n=>!Number.isInteger(n)||n<=0))return 0;
 const least=Math.min(...counts);return least===1?2:least<=3?1:0;
}
export type EntrancePhase='idle'|'menu-out'|'room-hold'|'approach'|'shuffle'|'prepare'|'rise'|'deal'|'focus'|'opponent-out'|'settle'|'game-in';
/** Skip only after the real deal exists; preparation and the final fade remain guarded. */
export function canSkipEntrance(phase:EntrancePhase,resume=false){return !resume&&['approach','shuffle','rise','deal','focus','opponent-out','settle'].includes(phase);}
export const ENTRANCE_MS:Record<EntrancePhase,number>={idle:0,'menu-out':480,'room-hold':160,approach:450,shuffle:3600,prepare:0,rise:1300,deal:1400,focus:950,'opponent-out':850,settle:120,'game-in':650};
export function nextEntrance(phase:EntrancePhase,resume=false):EntrancePhase{
 if(resume)return phase==='idle'||phase==='game-in'?'idle':'game-in';
 return ({idle:'idle','menu-out':'room-hold','room-hold':'prepare',prepare:'approach',approach:'shuffle',shuffle:'deal',deal:'focus',focus:'rise',rise:'opponent-out','opponent-out':'settle',settle:'game-in','game-in':'idle'} as const)[phase];
}
/** The real board gets a full hidden paint before the curtain opens. */
export function concealLiveTiles(phase:EntrancePhase){return ['prepare','approach','shuffle','rise','deal','focus','opponent-out'].includes(phase);}
export function entranceCurtain(phase:EntrancePhase):'close'|'covered'|'open'|'clear'{
 if(phase==='menu-out')return 'close';
 if(['room-hold','prepare'].includes(phase))return 'covered';
 if(phase==='approach')return 'open';
 return 'clear';
}

/** Resume uses only a short fade over the actual saved board. */
export function entranceDuration(phase:EntrancePhase,resume=false){return resume&&phase==='game-in'?850:ENTRANCE_MS[phase];}
