/** Scroll only the map, never the surrounding dialog or the browser page. */
export function stageMapScrollTop(nodeTop:number,viewportHeight:number,contentHeight:number){
 return Math.max(0,Math.min(Math.max(0,contentHeight-viewportHeight),nodeTop-viewportHeight*.5));
}
