import SuitMotif from './SuitMotif';
/** Region materials and engraving stay local; identity is shared across all regions. */
export default function RegionalSuit({stage,s,outline}:{stage:number,s:number,outline?:{color:string,width:number}}){return <g data-regional-suit={`${stage}:${s}`} stroke={outline?.color} strokeWidth={outline?.width}><SuitMotif s={s}/></g>;}
