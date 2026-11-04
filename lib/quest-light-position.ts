/** Coordinates belong to the exact painting; the glow shares its camera transform. */
export function questLightAnchor(src:string){
 const portrait=src.includes('portrait');
 if(src.includes('watchtower-arrival'))return {x:portrait?.534:.491,y:portrait?.653:.745,size:.032};
 if(src.includes('blue-glass-discovery'))return {x:portrait?.438:.414,y:portrait?.57:.531,size:.045};
 return {x:portrait?.418:.443,y:portrait?.67:.724,size:.032};
}
export function coverImagePoint(w:number,h:number,nw:number,nh:number,px:number,py:number,x:number,y:number){
 const scale=Math.max(w/nw,h/nh),rw=nw*scale,rh=nh*scale;
 return {left:(w-rw)*px+rw*x,top:(h-rh)*py+rh*y,width:rw};
}
