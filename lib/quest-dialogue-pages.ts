export type DialoguePage={text:string,sourceIndex:number};
/** Two lines of whole words, with balanced continuations rather than lone endings. */
export function questDialoguePages(lines:readonly string[],limit=32):DialoguePage[]{
 const width=Math.floor(limit/2);
 const wrap=(words:string[])=>{
  const rows:string[]=[];let row='';
  for(const word of words){if(row&&row.length+1+word.length>width){rows.push(row);row='';}row+=(row?' ':'')+word;}
  if(row)rows.push(row);return rows;
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
     const part=words.slice(start,end),rows=wrap(part),text=rows.join('\n');
     if(rows.length>2||text.length>limit){if(end===start+1){const rest=solve(end);best={score:10000+rest.score,pages:[text,...rest.pages]};}break;}
     const rest=solve(end),length=part.join(' ').length;
     const clause=/[,，…]$|(?:지만|는데|고|며|면|서)$/.test(words[end-1]);
     const score=10000+rest.score+(limit-length)**2+(end<words.length&&!clause?180:0);
     if(score<best.score)best={score,pages:[text,...rest.pages]};
    }
    memo.set(start,best);return best;
   };
   chunks.push(...solve(0).pages);
  }
  const packed:string[]=[];
  for(const text of chunks){
   const previous=packed.at(-1),combined=previous?previous+'\n'+text:text;
   if(previous&&combined.length<=limit&&combined.split('\n').length<=2)packed[packed.length-1]=combined;
   else packed.push(text);
  }
  return (packed.length?packed:['']).map(text=>({text,sourceIndex}));
 });
}
