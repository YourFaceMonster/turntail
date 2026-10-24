/** The four-syllable name can wrap between two intact pairs, never to an ellipsis. */
export default function OpponentName({name,bot,replaced=false}:{name:string,bot?:boolean,replaced?:boolean}){
 const full=name==='히보링지';
 return <strong className={full?'opponent-name-full':undefined} title={name}>{full?<span className="opponent-name-text"><span>히보</span><wbr/><span>링지</span></span>:name} {(bot||replaced)&&<small>{replaced?'AI 대체':'AI'}</small>}</strong>;
}
