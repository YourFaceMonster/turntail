import {stageTheme} from './stage-theme.ts';

export type PrologueCut={id:string,scene:'dark'|'snow'|'inn'|'room'|'table'|'card'|'road'|'stone'|'gate',duration:number,line:string,speaker?:string,back?:boolean,audio:'wind'|'hearth'|'tile'|'quiet',art?:{landscape:string,portrait:string},focus?:string};
export const FIRST_PROLOGUE:readonly PrologueCut[]=[
 {id:'P01',scene:'dark',duration:4000,line:'모든 길에는, 시작이 있다.',audio:'wind'},
 {id:'P02',scene:'snow',duration:10000,line:'북쪽 고갯길을 지나던\n한 승부사가 있었다.',audio:'wind'},
 {id:'P03',scene:'inn',duration:8000,line:'하룻밤의 추위를 피할 곳이면 충분했다.',audio:'wind'},
 {id:'P04',scene:'room',duration:8000,line:'그곳에서도, 사람들은\n패를 놓고 승부를 벌였다.',audio:'hearth'},
 {id:'P05',scene:'table',duration:7000,line:'제법이군.\n약속대로 하나 가져가시오.',speaker:'상대',audio:'tile'},
 {id:'P06a',scene:'card',duration:6000,line:'이 문양은…?',speaker:'방랑자',audio:'tile'},
 {id:'P06b',scene:'card',duration:6000,line:'오래된 패라더군.\n마음에 들면 가져가시오.',speaker:'상대',back:true,audio:'hearth'},
 {id:'P07',scene:'road',duration:7000,line:'다음 날, 방랑자는\n다시 길 위에 올랐다.',audio:'wind'},
 {id:'P08',scene:'stone',duration:8000,line:'…어디선가 본 문양이다.',back:true,audio:'quiet'},
 {id:'P09',scene:'gate',duration:4000,line:`달의 영역 · STAGE 1\n${stageTheme(1).name}`,audio:'quiet'},
];
// Reserved for the real normal-ending flag and matching handoff art. The current
// stage-three trial completion is NOT a normal ending and must never select this.
export const SECOND_PROLOGUE:readonly PrologueCut[]=[
 {id:'R01',scene:'table',duration:6000,line:'오래된 물건이지.',speaker:'첫 번째 방랑자',audio:'hearth'},
 {id:'R02a',scene:'card',duration:5000,line:'문양이 독특하군요.',speaker:'새 방랑자',back:true,audio:'tile'},
 {id:'R02b',scene:'card',duration:5000,line:'마음에 들면 가져가시오.',speaker:'첫 번째 방랑자',back:true,audio:'hearth'},
 {id:'R03',scene:'road',duration:7000,line:'길을 떠난 사람은,\n이전과 다른 방랑자였다.',audio:'wind'},
 {id:'R04',scene:'stone',duration:7000,line:'이 문양을 어디서 봤더라…',back:true,audio:'quiet'},
 FIRST_PROLOGUE[FIRST_PROLOGUE.length-1],
];
export function prologueCuts(connection?:{normalEndingCleared:boolean,handoffSceneReady:boolean}){
 return connection?.normalEndingCleared&&connection.handoffSceneReady?SECOND_PROLOGUE:FIRST_PROLOGUE;
}

/** Visible time only; natural completion, rapid taps and skip share one latch. */
export class PrologueClock{
 index=0;elapsed=0;completed=false;paused=false;
 private last:number|null=null;
 constructor(readonly cuts:readonly PrologueCut[],private finish:()=>void){}
 tick(now:number){if(this.completed)return;if(this.last!==null&&!this.paused)this.elapsed+=Math.max(0,Math.min(250,now-this.last));this.last=now;if(!this.paused&&this.elapsed>=this.cuts[this.index].duration)this.next();}
 pause(value:boolean){this.paused=value;this.last=null;}
 next(){if(this.completed||this.paused)return;if(this.index===this.cuts.length-1){this.complete();return;}this.index++;this.elapsed=0;this.last=null;}
 complete(){if(this.completed)return;this.completed=true;this.finish();}
}
