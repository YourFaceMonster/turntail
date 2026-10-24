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
