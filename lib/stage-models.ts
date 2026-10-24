/** Atlas models and face crops share one painterly image; IDs preserve saved identities. */
export const STAGE_MODEL_ATLAS='/stage-company-0516.webp';
export const STAGE_MODEL_SIZE={width:1122,height:1402};
const ids=[0,1,3,4,6,7,9,10,12,13,15,16,18,19,21,22,24,25,27,28];
const rects=[
 [12,0,278,282],[307,0,250,282],[572,0,250,282],[839,0,280,282],
 [1,278,302,262],[309,278,254,262],[577,278,259,262],[842,278,278,262],
 [2,537,284,270],[300,537,265,270],[570,537,270,270],[842,537,278,270],
 [1,800,286,288],[296,800,272,288],[571,800,269,288],[842,800,278,288],
 [1,1087,286,315],[295,1087,270,315],[570,1087,270,315],[842,1087,278,315]
];
// Each square surrounds the actual face, balancing forehead and chin in the circle.
const faces=[
 [112,6,115],[366,23,120],[627,16,122],[900,17,123],
 [80,298,148],[382,291,123],[633,303,128],[919,292,137],
 [104,551,111],[376,545,111],[633,547,127],[925,553,113],
 [79,841,127],[367,819,121],[637,838,126],[927,826,118],
 [87,1111,135],[371,1106,123],[643,1136,132],[923,1115,131]
];
export function stageModel(index:number){let at=ids.indexOf(index);if(at<0)at=ids.indexOf(index-index%3);return {rect:rects[Math.max(0,at)],face:faces[Math.max(0,at)]};}
/** Cache only this figure's source pixels on its plane; motion never re-rasterises the full atlas. */
export function paintStageModel(ctx:CanvasRenderingContext2D,image:CanvasImageSource,index:number){
 const [x,y,w,h]=stageModel(index).rect;ctx.canvas.width=w;ctx.canvas.height=h;ctx.clearRect(0,0,w,h);ctx.drawImage(image,x,y,w,h,0,0,w,h);
}
