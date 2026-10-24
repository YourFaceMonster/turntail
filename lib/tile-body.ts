/** Three times the previous physical thickness, shared by shuffle and resume. */
export function tileBodyDepth(height:number){return 3*Math.max(2.5,Math.min(7.5,height*.075));}
/** Keep the full body through seating, shuffling, rising and most of final focus. */
export function tileBodyHandoff(phase:string,progress:number){
 if(['settle','game-in','idle'].includes(phase))return 1;
 if(phase!=='focus')return 0;
 const p=Math.max(0,Math.min(1,(progress-.88)/.12));return p*p*(3-2*p);
}
