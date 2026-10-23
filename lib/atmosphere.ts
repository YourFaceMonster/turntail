/** These inputs are public counts only; this module never accepts tile identities. */
export function endgameLevel(phase:string|undefined,counts:readonly number[],opening=false):0|1|2{
 if(phase!=='playing'||opening||counts.length<2||counts.some(n=>!Number.isInteger(n)||n<=0))return 0;
 const least=Math.min(...counts);return least===1?2:least<=3?1:0;
}
export type EntrancePhase='idle'|'menu-out'|'room-hold'|'approach'|'shuffle'|'prepare'|'deal'|'fade-out'|'settle'|'game-in';
export const ENTRANCE_MS:Record<EntrancePhase,number>={idle:0,'menu-out':480,'room-hold':160,approach:1100,shuffle:2000,prepare:0,deal:1800,'fade-out':360,settle:100,'game-in':480};
export function nextEntrance(phase:EntrancePhase,resume=false):EntrancePhase{
 return ({idle:'idle','menu-out':'room-hold','room-hold':resume?'approach':'prepare',prepare:'approach',approach:resume?'fade-out':'shuffle',shuffle:'deal',deal:'fade-out','fade-out':'settle',settle:'game-in','game-in':'idle'} as const)[phase];
}
/** The real board gets a full hidden paint before the curtain opens. */
export function concealLiveTiles(phase:EntrancePhase){return ['prepare','approach','shuffle','deal','fade-out'].includes(phase);}
export function entranceCurtain(phase:EntrancePhase):'close'|'covered'|'open'|'clear'{
 if(phase==='menu-out'||phase==='fade-out')return 'close';
 if(['room-hold','prepare','settle'].includes(phase))return 'covered';
 if(phase==='approach'||phase==='game-in')return 'open';
 return 'clear';
}
