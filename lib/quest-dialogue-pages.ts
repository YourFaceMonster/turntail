export type DialoguePage={text:string,sourceIndex:number};
/** Keep authored paragraphs and sentence/word boundaries; never discard overflow text. */
export function questDialoguePages(lines:readonly string[],limit=36):DialoguePage[]{
 return lines.flatMap((line,sourceIndex)=>{
  const chunks:string[]=[];let current='';
  const rows=(text:string)=>text.split('\n').reduce((n,s)=>n+Math.ceil(s.length/20),0);
  const push=()=>{if(current.trim())chunks.push(current.trim());current='';};
  for(const sentence of line.split(/\n|(?<=[.!?])\s+/u).filter(Boolean)){
   if(sentence.length<=limit){if(current.length+sentence.length+1>limit||rows(current+(current?'\n':'')+sentence)>2)push();current+=(current?'\n':'')+sentence;continue;}
   push();for(const word of sentence.split(/\s+/u)){if(current.length+word.length+1>limit)push();current+=(current?' ':'')+word;}
  }
  push();return (chunks.length?chunks:['']).map(text=>({text,sourceIndex}));
 });
}
