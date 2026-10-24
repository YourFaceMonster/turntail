/** Three times the previous physical thickness, shared by shuffle and resume. */
export function tileBodyDepth(height:number){return 3*Math.max(2.5,Math.min(7.5,height*.075));}
/** Keep the body until the final overhead view can hand off to flat controls. */
export function tileBodyHandoff(phase:string,progress:number){
 if(['opponent-out','settle','game-in','idle'].includes(phase))return 1;
 if(phase!=='rise')return 0;
 const p=Math.max(0,Math.min(1,(progress-.88)/.12));return p*p*(3-2*p);
}
