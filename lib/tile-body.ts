/** A physical 132-unit tile is about ten units thick, not a 38%-height brick. */
export function tileBodyDepth(height:number){return Math.max(2.5,Math.min(7.5,height*.075));}
