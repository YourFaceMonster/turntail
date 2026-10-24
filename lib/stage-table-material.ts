export const STAGE_TABLE_ATLAS='/stage-table-materials-0518.webp';
export function stageTableCell(stage:number,width:number,height:number){const n=Math.max(0,Math.min(9,stage-1));return {x:n%5*width/5,y:Math.floor(n/5)*height/2,width:width/5,height:height/2};}
