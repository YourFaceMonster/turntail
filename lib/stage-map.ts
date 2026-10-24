/** Scroll only the map, never the surrounding dialog or the browser page. */
export function stageMapScrollTop(nodeTop:number,viewportHeight:number,contentHeight:number){
 return Math.max(0,Math.min(Math.max(0,contentHeight-viewportHeight),nodeTop-viewportHeight*.5));
}
/** Painted walkway centre lines. Consecutive stages are the only logical links. */
export const STAGE_ROUTE_SEGMENTS:number[][][]=[
 [[49,82],[49,77],[47,73],[47,70]],
 [[47,70],[56,66],[65,61]],
 [[65,61],[63,57],[59,55],[48,52],[36,48],[27,50]],
 [[27,50],[29,45],[39,44],[49,43]],
 [[49,43],[56,43],[63,44],[72,43],[76,42],[80,40]],
 [[80,40],[75,37],[74,32],[74,28]],
 [[74,28],[64,25],[51,29],[40,30],[30,29]],
 [[30,29],[35,25],[38,21]],
 [[38,21],[36,17],[28,11]]
];
export function stageRoutePoints(index:number){return STAGE_ROUTE_SEGMENTS[index].map(([x,y])=>`${x},${y*1.5}`).join(' ');}

/** Authored territory outlines follow the illustrated landings; nodes remain the interactive targets. */
export const STAGE_REGION_BOUNDARIES:number[][][]=[
 [[31,77],[42,74],[61,75],[74,82],[71,92],[54,97],[34,91],[25,85]],
 [[31,65],[47,62],[60,66],[62,72],[58,75],[42,75],[28,72]],
 [[59,55],[72,54],[85,58],[88,65],[80,71],[65,69],[61,64]],
 [[10,48],[24,44],[37,48],[39,55],[31,63],[18,65],[7,58]],
 [[40,38],[51,37],[61,40],[60,45],[53,49],[43,48],[36,44]],
 [[70,35],[84,34],[95,38],[94,45],[86,49],[74,46],[65,41]],
 [[63,18],[76,16],[90,22],[93,30],[84,35],[69,34],[57,28]],
 [[13,25],[24,23],[37,25],[45,30],[42,36],[29,39],[16,36],[9,31]],
 [[27,16],[39,16],[50,19],[48,23],[39,25],[30,23]],
 [[9,2],[25,0],[45,3],[53,9],[49,14],[36,17],[20,16],[7,10]]
];
export function stageRegionPath(index:number){return STAGE_REGION_BOUNDARIES[index].map(([x,y],i)=>`${i?'L':'M'}${x},${y*1.5}`).join(' ')+'Z';}
