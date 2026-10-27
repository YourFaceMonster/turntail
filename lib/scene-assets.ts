import {stageEnvironmentImage} from './stage-art';
import {nativeTableMaterial} from './table-material';
import {STAGE_MODEL_ASSETS} from './stage-models';
/** Retain decoded images so rapid scene changes never discard the previous plate. */
const images=new Map<string,Promise<HTMLImageElement>>();
export function sceneImage(src:string){
 let pending=images.get(src);if(pending)return pending;
 pending=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=async()=>{try{await image.decode();}catch{}resolve(image);};image.onerror=()=>{images.delete(src);reject(new Error('장면 이미지를 불러오지 못했어요. 다시 선택해 주세요.'));};image.src=src;});images.set(src,pending);return pending;
}
export const stageSceneAssets=(stage:number)=>[...(nativeTableMaterial(stage)?[nativeTableMaterial(stage)!]:[]),stageEnvironmentImage(stage),...STAGE_MODEL_ASSETS,'/stage-table-materials-0518.webp','/turntale-stage-materials-v2.webp'];
export const prepareStageScene=(stage:number)=>Promise.all(stageSceneAssets(stage).map(sceneImage));
export async function warmStageScenes(first:number,cancelled:()=>boolean){
 const order=[first,...Array.from({length:10},(_,i)=>i+1).filter(n=>n!==first)];
 for(let i=0;i<order.length&&!cancelled();i+=2)await Promise.allSettled(order.slice(i,i+2).map(prepareStageScene));
}
