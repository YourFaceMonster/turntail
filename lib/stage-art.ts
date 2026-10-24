/** Oil-painted location plates follow the same world and palette as the journey map. */
export function stageEnvironmentImage(stage:number){return `/environments/stage-${Math.max(1,Math.min(10,stage))}-0520.webp`;}
