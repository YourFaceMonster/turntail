let paused=false;
const listeners=new Set<()=>void>();
export const storePaused=()=>paused;
export function setStorePaused(next:boolean){if(paused===next)return;paused=next;for(const fn of listeners)fn();}
export function subscribeStorePause(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
