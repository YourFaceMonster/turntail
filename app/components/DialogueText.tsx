/** Break at authored lines and sentence boundaries, never in the middle of a Korean word. */
export default function DialogueText({text}:{text:string}){
 return <>{text.split(/\n|(?<=[.!?])\s+/u).filter(Boolean).map((sentence,index)=><span className="dialogue-sentence" key={index}>{sentence}</span>)}</>;
}
