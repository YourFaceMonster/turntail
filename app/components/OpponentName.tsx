/** Keep the short character name intact, including names in older saved tables. */
export default function OpponentName({name,bot,replaced=false}:{name:string,bot?:boolean,replaced?:boolean}){
 const full=name==='히보'||name==='히보링지',label=full?'히보':name;
 return <strong className={full?'opponent-name-full':undefined} title={label}>{label} {(bot||replaced)&&<small>{replaced?'AI 대체':'AI'}</small>}</strong>;
}
