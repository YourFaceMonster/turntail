/** Number bounds follow the original engraving; the suit artwork never resizes. */
export const TILE_NUMBER_MEDALLION={x:45,y:46,radius:28,innerRadius:26};
export function tileNumberGeometry(n:number){return {x:TILE_NUMBER_MEDALLION.x,y:n>9?62:64,textAnchor:'middle' as const,fontFamily:'Trebuchet MS,Arial,sans-serif',fontWeight:900,fontSize:n>9?44:50,letterSpacing:0,...(n>9?{textLength:32,lengthAdjust:'spacingAndGlyphs' as const}:{})};}
