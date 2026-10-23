/** These inputs are public counts only; this module never accepts tile identities. */
export function endgameLevel(phase:string|undefined,counts:readonly number[],opening=false):0|1|2{
 if(phase!=='playing'||opening||counts.length<2||counts.some(n=>!Number.isInteger(n)||n<=0))return 0;
 const least=Math.min(...counts);return least===1?2:least<=3?1:0;
}
export type EntrancePhase='idle'|'menu-out'|'room-hold'|'approach'|'shuffle'|'prepare'|'deal'|'settle'|'game-in';
export const ENTRANCE_MS:Record<EntrancePhase,number>={idle:0,'menu-out':600,'room-hold':250,approach:1000,shuffle:1600,prepare:0,deal:1800,settle:380,'game-in':280};
export function nextEntrance(phase:EntrancePhase,resume=false):EntrancePhase{
 return ({idle:'idle','menu-out':'room-hold','room-hold':resume?'approach':'prepare',prepare:'approach',approach:resume?'settle':'shuffle',shuffle:'deal',deal:'settle',settle:'game-in','game-in':'idle'} as const)[phase];
}
