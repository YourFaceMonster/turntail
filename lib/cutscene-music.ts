/** Cutscenes play without background music (sound effects stay). Components register while mounted. */
let active=0;
const listeners=new Set<()=>void>();
const notify=()=>{for(const listener of listeners)listener();};

export function holdCutsceneSilence(){active++;notify();let released=false;return()=>{if(released)return;released=true;active=Math.max(0,active-1);notify();};}
export function cutsceneSilenceActive(){return active>0;}
export function subscribeCutsceneSilence(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
