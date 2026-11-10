
export type PrologueCut={keepsakeFace?:'front'|'back',storyboard?:string,id:string,scene:'dark'|'snow'|'inn'|'room'|'table'|'card'|'road'|'stone'|'gate',duration:number,line:string,speaker?:string,back?:boolean,audio:'wind'|'hearth'|'tile'|'quiet',art?:{landscape:string,portrait:string},poseArt?:{landscape:string,portrait:string},focus?:string,location?:string};
type Storyboard={id:string,scene:PrologueCut['scene'],audio:PrologueCut['audio'],back?:boolean,art?:PrologueCut['art'],parts:{line:string,speaker?:string,poseArt?:PrologueCut['art']}[]};
const speaking={landscape:'/prologue/wager-speaking-wide-symbols-v1.webp',portrait:'/prologue/wager-speaking-portrait-symbols-v1.webp'};
/** P01–P19 with moderate narration; only authored beats advance the prologue. */
export const PROLOGUE_STORYBOARD:readonly Storyboard[]=[
 {id:'P01',scene:'dark',audio:'wind',parts:[{line:'패 한 장으로 시작된 여행도 있었다.'}]},
 {id:'P02',scene:'snow',audio:'wind',parts:[{line:'북쪽 고갯길을 지나던 방랑자는 노르문 마을로 향하고 있었다.'}]},
 {id:'P03',scene:'inn',audio:'wind',parts:[{line:'눈은 거세졌고, 날은 저물었다.\n다행히 길가의 주점에는 아직 불이 켜져 있었다.'}]},
 {id:'P04',scene:'room',audio:'hearth',parts:[{line:'따뜻한 불빛이 방랑자를 맞았다.\n늦은 밤에도 주점에서는 패 승부가 한창이었다.'}]},
 {id:'P05',scene:'table',audio:'hearth',art:{landscape:'/prologue/tavern-interior-v2.webp',portrait:'/prologue/tavern-interior-portrait-v1.webp'},parts:[{speaker:'상대',line:'길손이시오? 패를 다룰 줄 안다면, 한 판 어떻소?'}]},
 {id:'P06',scene:'table',audio:'hearth',parts:[{line:'사내는 낡은 패 한 장을 테이블에 올려놓았다.'},{speaker:'상대',poseArt:speaking,line:'대단한 물건은 아니오. 하지만 오래된 패지.\n이걸 걸겠소.'}]},
 {id:'P07',scene:'table',audio:'hearth',parts:[{speaker:'방랑자',line:'낡은 패 한 장이라… 좋습니다. 어차피 긴 밤이니.'}]},
 {id:'P08',scene:'table',audio:'tile',art:{landscape:'/prologue/wager-playing-wide-v1.webp',portrait:'/prologue/wager-playing-portrait-v1.webp'},parts:[{line:'그렇게 두 사람의 작은 승부가 시작되었다.'}]},
 {id:'P09',scene:'table',audio:'tile',parts:[{speaker:'상대',poseArt:speaking,line:'제법이군. 약속대로, 이 패는 자네 것이오.'}]},
 {id:'P10',scene:'card',audio:'tile',parts:[{line:'앞면에는 붉은 숫자 2가 새겨져 있었다.\n승부를 아는 이에게는 익숙한, 가장 강한 패였다.'}]},
 {id:'P11',scene:'card',back:true,audio:'quiet',parts:[{line:'뒷면에는 두 왕관이 겹친 문양이 새겨져 있었다.'},{speaker:'방랑자',line:'이 표식은… 처음 보는군요.'}]},
 {id:'P12',scene:'card',back:true,audio:'hearth',parts:[{speaker:'상대',line:'나도 오래전에 누군가에게 받은 것이오.\n어디서 만들어졌는지는 모르오.'},{speaker:'방랑자',line:'누군가 일부러 새긴 것 같군요.'}]},
 {id:'P13',scene:'room',audio:'hearth',parts:[{line:'방랑자는 패를 챙겼다. 조금 특이한 기념품이 생긴 셈이었다.'}]},
 {id:'P14',scene:'road',audio:'wind',parts:[{line:'다음 날 아침, 눈은 그쳐 있었다.\n방랑자는 다시 노르문으로 향했다.'}]},
 {id:'P15',scene:'stone',audio:'quiet',art:{landscape:'/prologue/stone-arrival-wide-v1.webp',portrait:'/prologue/stone-arrival-portrait-v1.webp'},parts:[{line:'마을 근처의 오래된 돌기둥에서 낯익은 문양을 발견했다.'}]},
 {id:'P16',scene:'stone',audio:'quiet',art:{landscape:'/prologue/stone-arrival-wide-v1.webp',portrait:'/prologue/stone-arrival-portrait-v1.webp'},parts:[{speaker:'방랑자',line:'…잠깐. 어젯밤 그 패에 있던 표식이잖아?'}]},
 {id:'P17',scene:'stone',audio:'quiet',parts:[{line:'꺼낸 패의 표식은 돌기둥의 문양과 꼭 닮아 있었다.'},{speaker:'방랑자',line:'이런 우연도 있군…'}]},
 {id:'P18',scene:'gate',audio:'quiet',parts:[{line:'무슨 뜻인지는 알 수 없었다.\n그 표식이 마음에 걸린 채 마을로 향했다.'}]},
 {id:'P19',scene:'gate',audio:'quiet',parts:[{line:'노르문 마을'}]},
];
export function storyReadingDuration(line:string){return Math.max(3500,Math.min(9000,1800+line.replace(/\s/g,'').length*145));}
// Legacy cut IDs remain available to existing consumers; storyboard is a separate identity.
const legacyIds:Record<string,string>={P01:'P01',P02:'P02',P03:'P03',P04:'P04',P09:'P05',P11:'P06a',P12:'P06b',P14:'P07',P16:'P08',P19:'P09'};
export const FIRST_PROLOGUE:readonly PrologueCut[]=PROLOGUE_STORYBOARD.flatMap(board=>{
 let page=0;
 return board.parts.flatMap(part=>part.line.split('\n').filter(Boolean).map(text=>{
  page++;return {id:page===1&&legacyIds[board.id]?legacyIds[board.id]:`PROLOGUE_${board.id}_${page}`,storyboard:board.id,scene:board.scene,audio:board.audio,back:board.back,art:board.art,speaker:part.speaker,poseArt:part.poseArt,line:text,duration:storyReadingDuration(text)};
 }));
});
// Reserved for the real normal-ending flag and matching handoff art. The current
// stage-three trial completion is NOT a normal ending and must never select this.
export const SECOND_PROLOGUE:readonly PrologueCut[]=[
 {id:'R01',scene:'table',duration:6000,line:'오래된 물건이오.',speaker:'첫 번째 방랑자',audio:'hearth'},
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
