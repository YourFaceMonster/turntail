/** Both layers obey the same four-side rule. Only the top occupied layer is reachable. */
export function accessibleStack(stacks:readonly (readonly unknown[])[],cols:number,rows:number,index:number){
 const stack=stacks[index];if(!Number.isInteger(index)||!stack||(!stack[0]&&!stack[1]))return false;
 const layer=stack[1]?1:0,row=Math.floor(index/cols),column=index%cols;
 return [[row-1,column],[row+1,column],[row,column-1],[row,column+1]].some(([y,x])=>y<0||y>=rows||x<0||x>=cols||!stacks[y*cols+x]?.[layer]);
}
