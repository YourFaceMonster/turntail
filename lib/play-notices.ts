/** These three introductions are shared by the whole table and reset at each deal. */
export const QUICK_PLAY_MS=650;
export const ANNOUNCED_PLAY_MS=1600;
export function shouldShowPlayNotice(seen:Set<number>,count:number){
 if(count<1||count>3)return true;
 if(seen.has(count))return false;
 seen.add(count);return true;
}
export function playReviewDuration(event?:{reviewMs?:number}){return event?.reviewMs??ANNOUNCED_PLAY_MS;}
