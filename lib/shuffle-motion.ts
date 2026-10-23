export type ShufflePose={x:number,y:number,angle:number};
/** Visual randomness only. A launch seed keeps rerenders and resizes continuous. */
export function shuffleMotion(seed:number,index:number,width:number,height:number,tileWidth:number,tileHeight:number){
 let state=(seed^Math.imul(index+1,0x9e3779b9))>>>0;
 const random=()=>{state=(state+0x6d2b79f5)>>>0;let n=state;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;};
 // Reserve the rotated diagonal, including the visible body and its shadow.
 const margin=Math.hypot(tileWidth,tileHeight)/2+16;
 const rx=Math.max(0,Math.min(width*.35,width/2-margin));
 const ry=Math.max(0,Math.min(height*.25,height/2-margin));
 let heading=random()*Math.PI*2,angle=(random()-.5)*180;
 const direction=random()<.5?-1:1,delay=Math.floor(random()*150),poses:ShufflePose[]=[];
 for(let step=0;step<5;step++){
  if(step){heading+=direction*(.6+random()*.9);angle=Math.max(-165,Math.min(165,angle+(random()-.5)*100));}
  const radius=.28+random()*.68;
  poses.push({x:width/2+Math.cos(heading)*rx*radius,y:height/2+Math.sin(heading)*ry*radius,angle});
 }
 return {poses,delay};
}
