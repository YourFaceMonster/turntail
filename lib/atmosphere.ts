/** These inputs are public counts only; this module never accepts tile identities. */
export function endgameLevel(phase:string|undefined,counts:readonly number[],opening=false):0|1|2{
 if(phase!=='playing'||opening||counts.length<2||counts.some(n=>!Number.isInteger(n)||n<=0))return 0;
 const least=Math.min(...counts);return least===1?2:least<=3?1:0;
}
export type EntrancePhase='idle'|'menu-out'|'room-hold'|'approach'|'shuffle'|'settle'|'game-in';
export const ENTRANCE_MS:Record<EntrancePhase,number>={idle:0,'menu-out':600,'room-hold':250,approach:800,shuffle:1050,settle:250,'game-in':650};
export function nextEntrance(phase:EntrancePhase,resume=false):EntrancePhase{
 return ({idle:'idle','menu-out':'room-hold','room-hold':'approach',approach:resume?'settle':'shuffle',shuffle:'settle',settle:'game-in','game-in':'idle'} as const)[phase];
}
