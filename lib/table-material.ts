/** One photographed/painterly grain tile per 640 CSS pixels, independent of table diameter. */
export const TABLE_GRAIN_PITCH=640;
export const TABLE_GRAIN_ASSETS={wood:'/materials/heirloom-walnut-0526.webp',stone:'/materials/sandstone-0524.webp'} as const;
export function nativeTableMaterial(stage:number){return stage===0?TABLE_GRAIN_ASSETS.wood:stage===1?TABLE_GRAIN_ASSETS.stone:Number.isInteger(stage)&&stage>=2&&stage<=10?`/materials/stage-${stage}-0525.webp`:null;}
export const radialTableMaterial=(stage:number)=>[5,7,10].includes(stage);
export function tableViewportOrigin(circle:{cx:number,cy:number,diameter:number},stage:number){
 const border=stage===0?3:0;
 return {x:circle.diameter/2-circle.cx-border,y:circle.diameter/2-circle.cy-border};
}
