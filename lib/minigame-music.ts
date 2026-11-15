/** Journey mini-games (dice den, inn house games) switch the background music while mounted. */
let active=0;
const listeners=new Set<()=>void>();
const notify=()=>{for(const listener of listeners)listener();};

export function holdMinigameMusic(){active++;notify();let released=false;return()=>{if(released)return;released=true;active=Math.max(0,active-1);notify();};}
export function minigameMusicActive(){return active>0;}
export function subscribeMinigameMusic(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
