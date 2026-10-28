/** Number bounds follow the original engraving; the suit artwork never resizes. */
export const TILE_NUMBER_MEDALLION={x:45,y:46,radius:28,innerRadius:26};
// Two digits use a smaller natural bold font, never horizontal glyph squeezing.
// Trebuchet Bold at 33px is about 38.6px wide and 24px high: it fits the original
// inner circle, including the regional outline, with its optical center at y46.
export function tileNumberGeometry(n:number){return {x:TILE_NUMBER_MEDALLION.x,y:n>9?58:64,textAnchor:'middle' as const,fontFamily:'Trebuchet MS,Arial,sans-serif',fontWeight:900,fontSize:n>9?33:50,letterSpacing:0};}
