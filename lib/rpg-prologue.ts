import {questDialoguePages} from './quest-dialogue-pages.ts';

export type PrologueCut={keepsakeFace?:'front'|'back',storyboard?:string,id:string,scene:'dark'|'snow'|'inn'|'room'|'table'|'card'|'road'|'stone'|'gate',duration:number,line:string,speaker?:string,back?:boolean,audio:'wind'|'hearth'|'tile'|'quiet',art?:{landscape:string,portrait:string},poseArt?:{landscape:string,portrait:string},focus?:string,location?:string};
type Storyboard={id:string,scene:PrologueCut['scene'],audio:PrologueCut['audio'],back?:boolean,parts:{line:string,speaker?:string,poseArt?:PrologueCut['art']}[]};
const speaking={landscape:'/prologue/wager-speaking-wide-symbols-v1.png',portrait:'/prologue/wager-speaking-portrait-symbols-v1.png'};
/** Approved P01–P19 storyboard; authored paragraphs/speakers survive pagination. */
export const PROLOGUE_STORYBOARD:readonly Storyboard[]=[
 {id:'P01',scene:'dark',audio:'wind',parts:[{line:'패 한 장으로 시작된 여행도 있었다.'}]},
 {id:'P02',scene:'snow',audio:'wind',parts:[{line:'북쪽 고갯길을 지나던 한 방랑자가 있었다.\n그가 향하던 곳은 노르문이라는 작은 마을이었다.'}]},
 {id:'P03',scene:'inn',audio:'wind',parts:[{line:'예상보다 눈이 거세게 내렸고, 날은 어느새 저물어 갔다.\n마을까지 가기에는 무리였다.\n다행히 길가에는 아직 불이 켜진 주점 하나가 남아 있었다.'}]},
 {id:'P04',scene:'room',audio:'hearth',parts:[{line:'따뜻한 불빛과 사람들의 이야기 소리가 방랑자를 맞았다.\n늦은 시간에도 몇몇 손님은 패를 놓고 승부를 벌이고 있었다.\n방랑자는 한쪽에 자리를 잡았다.'}]},
 {id:'P05',scene:'table',audio:'hearth',parts:[{speaker:'상대',poseArt:speaking,line:'길손이시오?\n패를 좀 다룰 줄 안다면, 나와 한 판 어떻소?'}]},
 {id:'P06',scene:'table',audio:'hearth',parts:[{line:'사내는 주머니에서 낡은 패 한 장을 꺼내 테이블에 올려놓았다.'},{speaker:'상대',poseArt:speaking,line:'대단한 물건은 아니오. 하지만 오래된 패지.\n이걸 걸겠소.'}]},
 {id:'P07',scene:'table',audio:'hearth',parts:[{speaker:'방랑자',line:'낡은 패 한 장이라…\n좋습니다. 어차피 긴 밤이니.'}]},
 {id:'P08',scene:'table',audio:'tile',parts:[{line:'그렇게 두 사람의 작은 승부가 시작되었다.\n그날 밤, 방랑자에게는 그저 수많은 승부 중 하나였을 뿐이었다.'}]},
 {id:'P09',scene:'table',audio:'tile',parts:[{speaker:'상대',poseArt:speaking,line:'제법이군.\n약속대로, 이 패는 자네 것이오.'}]},
 {id:'P10',scene:'card',audio:'tile',parts:[{line:'손에 쥔 패는 오래되고 낡아 있었다.\n앞면에는 붉은 숫자 2가 새겨져 있었다.\n승부를 아는 사람이라면 누구나 익숙한, 가장 강한 패였다.'}]},
 {id:'P11',scene:'card',back:true,audio:'quiet',parts:[{line:'하지만 뒷면은 달랐다.\n낡은 표면 위로 두 개의 왕관이 겹쳐진 듯한 문양이 새겨져 있었다.'},{speaker:'방랑자',line:'이 표식은… 처음 보는군요.'}]},
 {id:'P12',scene:'card',back:true,audio:'hearth',parts:[{speaker:'상대',line:'나도 오래전에 누군가에게 받은 것이오.\n어디서 만들어졌는지는 모르오.'},{speaker:'방랑자',line:'그렇군요. 특이한 패네요.'}]},
 {id:'P13',scene:'room',audio:'hearth',parts:[{line:'방랑자는 패를 주머니에 넣었다.\n조금 특이한 기념품이 생긴 셈이었다.\n그날 밤은 그렇게 지나갔다.'}]},
 {id:'P14',scene:'road',audio:'wind',parts:[{line:'다음 날 아침, 눈은 그쳐 있었다.\n방랑자는 다시 길을 나섰다.\n목적지는 여전히 노르문 마을이었다.'}]},
 {id:'P15',scene:'stone',audio:'quiet',parts:[{line:'마을이 가까워질 무렵, 길가에 세워진 오래된 돌기둥 하나가 눈에 들어왔다.\n세월에 닳아 글자는 거의 지워져 있었다.\n그런데 그 위에 새겨진 문양만큼은 어딘가 낯익었다.'}]},
 {id:'P16',scene:'stone',audio:'quiet',parts:[{speaker:'방랑자',line:'…잠깐.\n이거, 어젯밤 그 패에 있던 표식이잖아?'}]},
 {id:'P17',scene:'stone',audio:'quiet',parts:[{line:'방랑자는 주머니에서 낡은 패를 꺼냈다.\n돌기둥의 문양과 패 뒷면의 표식은 놀라울 만큼 닮아 있었다.'},{speaker:'방랑자',line:'이런 우연도 있군…'}]},
 {id:'P18',scene:'gate',audio:'quiet',parts:[{line:'무슨 의미인지는 알 수 없었다.\n방랑자는 다시 패를 챙기고 마을로 향했다.\n그저 오래된 표식 하나가 조금 마음에 걸렸을 뿐이었다.'}]},
 {id:'P19',scene:'gate',audio:'quiet',parts:[{line:'노르문 마을'}]},
];
export function storyReadingDuration(line:string){return Math.max(3500,Math.min(9000,1800+line.replace(/\s/g,'').length*145));}
// Legacy cut IDs remain available to existing consumers; storyboard is a separate identity.
const legacyIds:Record<string,string>={P01:'P01',P02:'P02',P03:'P03',P04:'P04',P09:'P05',P11:'P06a',P12:'P06b',P14:'P07',P16:'P08',P19:'P09'};
export const FIRST_PROLOGUE:readonly PrologueCut[]=PROLOGUE_STORYBOARD.flatMap(board=>{
 let page=0;
 return board.parts.flatMap(part=>questDialoguePages([part.line]).map(({text})=>{
  page++;return {id:page===1&&legacyIds[board.id]?legacyIds[board.id]:`PROLOGUE_${board.id}_${page}`,storyboard:board.id,scene:board.scene,audio:board.audio,back:board.back,speaker:part.speaker,poseArt:part.poseArt,line:text,duration:storyReadingDuration(text)};
 }));
});
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
