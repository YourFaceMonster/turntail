import {legalOptions,rank,suitRank,type BotPosition,type BotAction} from './game';

export const HIBORINGJI={name:'히보',avatar:'korean-monster:3',title:'실력은 고수 · 성질은 시한폭탄'} as const;
export const isHiboringji=(p:{avatar?:string})=>p.avatar===HIBORINGJI.avatar;
export function hiboringjiTemperament(actions=0){
 const turns=Math.max(0,Number.isFinite(actions)?actions:0);
 return turns<24?{stage:0,label:'실실 웃는 고수',errorRate:0,level:undefined}:
  turns<48?{stage:1,label:'슬슬 열받음',errorRate:.18,level:5}:
  turns<72?{stage:2,label:'뚜껑 열림',errorRate:.4,level:3}:
  {stage:3,label:'이성 퇴근',errorRate:.62,level:3};
}
type Kind='confident'|'beaten'|'power'|'draw'|'idle'|'finish';
/** All lines describe this fictional table persona, never the reference person. */
export const HIBORINGJI_LINES:Record<Kind,readonly (readonly string[])[]>={
 confident:[['히히. 계산 끝났어. 받아라.','웃고 있다고 만만하냐?'],['아 씨, 이제 좀 내 차례네.','계산은 했어. 대충… 했다고.'],['씨발, 그냥 이걸로 밀어!','야, 내 패가 법이다. 히히!'],['몰라 씨발! 일단 내고 봐!','내 뇌 퇴근했다. 패가 알아서 해!']],
 beaten:[['오? 제법인데. 아직 웃고 있다.','히히. 그 수까지 계산했지. 아마.'],['아 씨발, 그걸 또 받아?','웃음 취소. 방금 건 취소야.'],['씨발! 내 계산 누가 훔쳐갔냐!','야 이 미친 패야! 말 좀 들어!'],['내가 졌냐? 내 손가락이 졌지!','으하하 씨발! 나 지금 안 웃겨!']],
 power:[['히히. 센 건 아껴야 제맛이지.','이 패는 좀 아플걸? 받아.'],['아끼다 똥 되겠다. 처먹어!','씨, 지금 안 쓰면 언제 써!'],['씨발, 빨리 끝내! 센 거 다 나가!','계산? 됐고! 이거 받아!'],['히히히! 남은 거 전부 폭탄이다!','내일의 나야, 뒷일 부탁한다!']],
 draw:[['한 장만 더. 판은 다 읽었어.','히히. 이건 투자야, 투자.'],['또 가져와? 아 씨, 손 무겁네.','내 패만 왜 자꾸 번식하냐?'],['씨발, 카드냐 토끼냐! 또 늘어!','누가 내 손에 패 공장 차렸냐!'],['패 그만 줘! 나 이사 가냐?!','씨발, 이제 내 손이 창고네!']],
 idle:[['히히. 고민해. 난 다 계산했어.','천천히 해. 아직은 웃고 있어.'],['야, 패에 논문 쓰냐? 빨리 좀!','아 씨, 웃는 얼굴 유지 힘들다.'],['씨발, 다음 수 내년에 나오냐!','빨리 내! 내 인내심 한 장 남았다!'],['나 지금 뇌에서 주전자 끓는다!','히히… 씨발… 히히… 빨리 내!']],
 finish:[['히히. 웃는 놈이 결국 이기지.','봤냐? 이 얼굴이 고수 얼굴이다.'],['아 씨, 이겼네. 계산대로야!','끝! 이제 내 혈압 좀 내려가자.'],['씨발, 이겼다! 의자 살았다!','봤냐?! 나 아직 계산할 줄 알아!'],['으하하! 뇌 없이도 이겼다!','씨발, 끝났다! 손가락 잘했어!']]
};
export function hiboringjiLine(kind:Kind,actions=0,key=''){
 const mood=hiboringjiTemperament(actions),lines=HIBORINGJI_LINES[kind][mood.stage];
 let hash=2166136261;for(const c of key)hash=Math.imul(hash^c.charCodeAt(0),16777619);
 return lines[(hash>>>0)%lines.length];
}
/** Deterministic impatience based only on public progress and this seat's hand.
 * A mistake wastes strength/breaks groups; it never makes an illegal move. */
export function hiboringjiAction(p:BotPosition,best:BotAction):BotAction{
 const mood=hiboringjiTemperament(p.roundActions),hand=p.players[p.me].hand||[];
 if(!mood.errorRate)return best;
 const options=legalOptions(hand,p.trick),finish=options.find(o=>o.tiles.length===hand.length);
 if(finish)return {type:'play',tiles:finish.tiles};
 let hash=2166136261;const seed=JSON.stringify([p.code,p.round,p.roundActions,p.me,hand.map(t=>t.id).sort((a,b)=>a-b),p.trick.map(t=>t.id)]);
 for(const c of seed)hash=Math.imul(hash^c.charCodeAt(0),16777619);
 if((hash>>>0)/4294967296>=mood.errorRate)return best;
 const bestIds=best.type==='play'?best.tiles.map(t=>t.id).sort((a,b)=>a-b).join(','):'';
 const impulsive=options.filter(o=>o.id!==bestIds).map(o=>{
  const ids=new Set(o.tiles.map(t=>t.id)),broken=o.tiles.filter(t=>hand.some(x=>!ids.has(x.id)&&x.n===t.n)).length;
  return {o,score:o.tiles.reduce((n,t)=>n+(rank(t)*4+suitRank(t.s)),0)/o.tiles.length*3+broken*24-o.tiles.length*12};
 }).sort((a,b)=>b.score-a.score||a.o.id.localeCompare(b.o.id));
 if(impulsive.length)return {type:'play',tiles:impulsive[0].o.tiles};
 // With no alternative play, grab a legal exposed tile that does not help a group.
 if(best.type==='draw'){
  const careless=p.stacks.map((s,index)=>({s:{...s,lower:s.upper?null:s.lower},index})).filter(({s,index})=>s.available&&index!==best.index)
   .sort((a,b)=>Number(!!a.s.lower&&hand.some(t=>t.n===a.s.lower!.n))-Number(!!b.s.lower&&hand.some(t=>t.n===b.s.lower!.n))||a.index-b.index)[0];
  if(careless)return {type:'draw',index:careless.index};
 }
 return best;
}
