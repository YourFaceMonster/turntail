/** One numeric plaque for hand, floor, trick, flight and all regional materials. */
export const TILE_NUMBER_MEDALLION={x:50,y:54,radius:38,innerRadius:35.5};
export function tileNumberGeometry(n:number){return {x:TILE_NUMBER_MEDALLION.x,y:n>9?75:79,textAnchor:'middle' as const,fontFamily:'Trebuchet MS,Arial,sans-serif',fontWeight:900,fontSize:n>9?58:70,letterSpacing:n>9?-1:0,...(n>9?{textLength:48,lengthAdjust:'spacingAndGlyphs' as const}:{})};}
