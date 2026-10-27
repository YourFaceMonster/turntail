/** Atlas models and face crops share one painterly image; IDs preserve saved identities. */
export const STAGE_MODEL_ATLAS='/stage-company-0516.webp';
export const STAGE_MODEL_SIZE={width:1122,height:1402};
export const STAGE_MODEL_SUPPLEMENT='/stage-company-0627.webp';
export const STAGE_MODEL_SUPPLEMENT_SIZE={width:1774,height:887};
export const STAGE_MODEL_ASSETS=[STAGE_MODEL_ATLAS,STAGE_MODEL_SUPPLEMENT];
// The original last two light-cloaked figures are Orbi and Ella, not Astel and Orbi.
const ids=[0,1,3,4,6,7,9,10,12,13,15,16,18,19,22,23,24,25,27,28];
const supplementIds=[2,5,8,11,14,17,20,21,26,29];
// Source viewports follow the final transparent gutters; no figure is stretched.
const supplementRects=[
 [0,0,368,470],[368,0,372,470],[740,0,335,470],[1075,0,320,470],[1395,0,379,470],
 [0,470,340,417],[340,470,369,417],[709,470,371,417],[1080,470,320,417],[1400,470,374,417],
];
const supplementFaces=[
 [171,108,135],[516,115,143],[850,134,122],[1150,142,210],[1560,95,156],
 [139,532,128],[497,553,143],[861,528,158],[1207,532,148],[1568,490,154],
];
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
 [104,551,111],[376,545,111],[655,536,102],[925,553,113],
 [114,825,100],[367,819,121],[637,838,126],[927,826,118],
 [118,1098,105],[371,1106,123],[676,1098,118],[979,1098,110]
];
export function stageModel(index:number){
 const extra=supplementIds.indexOf(index);
 if(extra>=0){
  return {src:STAGE_MODEL_SUPPLEMENT,size:STAGE_MODEL_SUPPLEMENT_SIZE,rect:supplementRects[extra],face:supplementFaces[extra]};
 }
 const at=Math.max(0,ids.indexOf(index));
 return {src:STAGE_MODEL_ATLAS,size:STAGE_MODEL_SIZE,rect:rects[at],face:faces[at]};
}
export function stageCompanyAssets(avatars:(string|undefined)[]){return [...new Set(avatars.filter(avatar=>avatar?.startsWith('stage-portrait:')).map(avatar=>stageModel(Number(avatar!.split(':')[1])).src))];}
/** Cache only this figure's source pixels on its plane; motion never re-rasterises the full atlas. */
export function paintStageModel(ctx:CanvasRenderingContext2D,image:CanvasImageSource,index:number){
 const [x,y,w,h]=stageModel(index).rect;ctx.canvas.width=w;ctx.canvas.height=h;ctx.clearRect(0,0,w,h);ctx.drawImage(image,x,y,w,h,0,0,w,h);
}
