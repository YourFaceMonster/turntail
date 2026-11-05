export type DialoguePage={text:string,sourceIndex:number};
export type DialogueLayout={width:number,measure:(text:string)=>number};
/** Keep the reader's place when font loading or rotation changes page capacity. */
export function dialoguePageAt(pages:readonly DialoguePage[],sourceIndex:number,offset:number){
 let consumed=0,last=0;
 for(let index=0;index<pages.length;index++){
  if(pages[index].sourceIndex!==sourceIndex)continue;
  last=index;consumed+=pages[index].text.replace(/\s/gu,'').length;
  if(offset<consumed)return index;
 }
 return last;
}
/** Measure capacity for two lines, but leave line wrapping to the browser. */
export function questDialoguePages(lines:readonly string[],limit=32,layout?:DialogueLayout):DialoguePage[]{
 const width=layout?.width||Math.max(1,limit/2),measure=layout?.measure||((text:string)=>text.length),capacity=width*2;
 const fits=(text:string)=>{
  if(text.length>limit)return false;
  let row='',rows=1;
  for(const word of text.split(/\s+/u)){
   const next=row?row+' '+word:word;
   if(row&&measure(next)>width){rows++;row=word;}else row=next;
   if(measure(row)>width)rows+=Math.max(0,Math.ceil(measure(row)/width)-1);
   if(rows>2)return false;
  }
  return true;
 };
 return lines.flatMap((line,sourceIndex)=>{
  const chunks:string[]=[];
  for(const sentence of line.split(/\n|(?<=[.!?])\s+/u).filter(Boolean)){
   const words=sentence.trim().split(/\s+/u),memo=new Map<number,{score:number,pages:string[]}>();
   const solve=(start:number):{score:number,pages:string[]}=>{
    if(start===words.length)return {score:0,pages:[]};
    const cached=memo.get(start);if(cached)return cached;
    let best={score:Infinity,pages:[] as string[]};
    for(let end=start+1;end<=words.length;end++){
     const text=words.slice(start,end).join(' ');
     if(!fits(text)){if(end===start+1){const rest=solve(end);best={score:1e9+rest.score,pages:[text,...rest.pages]};}break;}
     const rest=solve(end),clause=/[,，…]$|(?:지만|는데|고|며|면|서)$/.test(words[end-1]);
     const score=1e9+rest.score+(capacity-measure(text))**2+(end<words.length&&!clause?width**2*.7:0);
     if(score<best.score)best={score,pages:[text,...rest.pages]};
    }
    memo.set(start,best);return best;
   };
   chunks.push(...solve(0).pages);
  }
  const packed:string[]=[];
  for(const text of chunks){const previous=packed.at(-1),combined=previous?previous+' '+text:text;if(previous&&fits(combined))packed[packed.length-1]=combined;else packed.push(text);}
  return (packed.length?packed:['']).map(text=>({text,sourceIndex}));
 });
}
