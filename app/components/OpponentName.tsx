import {tr} from '../../lib/i18n/index.ts';
/** Keep the short character name intact, including names in older saved tables. */
export default function OpponentName({name,bot,replaced=false}:{name:string,bot?:boolean,replaced?:boolean}){
 const full=name==='히보'||name==='히보링지',label=full?'히보':name;
 return <strong className={`opponent-name${full?' opponent-name-full':''}`} title={label}><span className="opponent-character-name">{label}</span>{/* 2026-11-25: computer opponents are table characters, so no "AI" tag; only a friend's seat the computer took over says so. */}{replaced&&<small className="opponent-ai-label">{tr('자동 진행')}</small>}</strong>;
}
