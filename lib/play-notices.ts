/** These three introductions are shared by the whole table and reset at each deal. */
export const QUICK_PLAY_MS=650;
export const ANNOUNCED_PLAY_MS=3400;
export const SMALL_COMBO_REVIEW_MS=2000;
export function announcedPlayDuration(count:number){return count<=3?SMALL_COMBO_REVIEW_MS:ANNOUNCED_PLAY_MS;}
export function comboCaptionDuration(label:string){return ['싱글','페어','트리플'].includes(label)?1100:2250;}
export function shouldShowPlayNotice(seen:Set<number>,count:number){
 if(count<1||count>3)return true;
 if(seen.has(count))return false;
 seen.add(count);return true;
}
export function playReviewDuration(event?:{reviewMs?:number}){return event?.reviewMs??ANNOUNCED_PLAY_MS;}
