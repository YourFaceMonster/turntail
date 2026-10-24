/** Routine combinations introduce themselves once per round, across all players. */
export function shouldShowPlayNotice(seen:Set<number>,count:number){
 if(count!==1&&count!==2)return true;
 if(seen.has(count))return false;
 seen.add(count);return true;
}
