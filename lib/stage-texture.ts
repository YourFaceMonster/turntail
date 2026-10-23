export const STAGE_TEXTURE_URL='/turntale-stage-materials-v2.webp';
/** Five columns by two rows; each stage owns one full material surface. */
export function materialTextureCell(stage:number,width:number,height:number){
 if(!Number.isInteger(stage)||stage<1||stage>10)throw Error('Unknown stage material');
 return {x:(stage-1)%5*width/5,y:Math.floor((stage-1)/5)*height/2,width:width/5,height:height/2};
}
