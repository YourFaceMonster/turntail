/** A separate, unhurried fade; body flattening must not decide visibility. */
export function opponentTableOpacity(phase:string,progress:number){
 if(['settle','game-in','idle'].includes(phase))return 0;
 if(phase!=='opponent-out')return 1;
 const t=Math.max(0,Math.min(1,progress));return 1-t*t*(3-2*t);
}
