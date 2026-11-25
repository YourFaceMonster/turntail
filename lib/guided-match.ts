import {room,player,uid,start,sorted,legalOptions,act,type Game,type Tile} from './game';
import {josa} from './josa';
import {tr} from './i18n/index.ts';

/** 2026-11-24 user request: a practice duel on the real table, explained one control at a time
 *  (like the TURNTALE Defense tutorial). The deal is fixed so every step always works, the opponent
 *  follows a simple script, and nothing is saved. */
const tile=(n:number,s:number):Tile=>({id:(n-1)*4+s,n,s});
// Suits: 0 철문, 1 열쇠, 2 성화, 3 왕관.
export const GUIDED_TILES={
 three:tile(3,0),sevenA:tile(7,1),sevenB:tile(7,2),nine:tile(9,3),thirteenA:tile(13,2),thirteenB:tile(13,1),
};
/** Floor index of the 13 the player is asked to take. */
export const GUIDED_DRAW_STACK=1;
export const GUIDED_CODE_PREFIX='GUIDE-';
export const isGuidedMatch=(g:{code?:string}|null|undefined)=>!!g?.code?.startsWith(GUIDED_CODE_PREFIX);

export function createGuidedMatch(name:string,avatar:string,opponent:{name:string,avatar:string},now=Date.now()):Game{
 const me=player(name||tr('나'));me.avatar=avatar;
 const g=room(GUIDED_CODE_PREFIX+uid().slice(0,6).toUpperCase(),me,true,2);
 const ai=player(opponent.name,true);ai.avatar=opponent.avatar;g.players.push(ai);
 start(g,now);
 const T=GUIDED_TILES;
 me.hand=sorted([T.three,T.sevenA,T.sevenB,T.nine,T.thirteenA]);
 ai.hand=sorted([tile(4,0),tile(10,0),tile(10,2),tile(5,1),tile(6,2)]);
 // One row of single visible tiles: every tile can be taken, and the player sees what they take.
 g.stacks=[[tile(8,1),null],[T.thirteenB,null],[tile(14,0),null],[tile(11,3),null]];g.cols=4;g.rows=1;
 g.opening={who:0,tile:T.three};g.turn=0;g.lastEvent={...g.lastEvent!,who:0};
 g.log=[tr('연습 판 · 첫 선 {0}',{0:me.name})];
 return g;
}

/** The opponent: lead its lowest single, answer with the weakest winning play, otherwise take a tile
 *  (never the 13 kept for the player). Only its own hand and the public table are read. */
export function guidedBotMove(g:Game,now=Date.now()){
 const seat=g.turn,p=g.players[seat];if(!p?.bot||g.phase!=='playing')return;
 if(!g.trick.length){const low=sorted(p.hand)[0];act(g,seat,'play',[low.id],-1,now,true);return;}
 const answer=legalOptions(p.hand,g.trick).filter(o=>o.tiles.length===g.trick.length).sort((a,b)=>compareKey(a.key,b.key))[0];
 if(answer){act(g,seat,'play',answer.tiles.map(t=>t.id),-1,now,true);return;}
 const index=g.stacks.findIndex((s,i)=>i!==GUIDED_DRAW_STACK&&!!(s[0]||s[1]));
 if(index>=0)act(g,seat,'draw',[],index,now,true);else act(g,seat,'pass',[],-1,now,true);
}
function compareKey(a:number[],b:number[]){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;}

/** What a step can look at: the player's view of the table plus local selection state. */
export type GuidedView={phase:string,turn:number,me:number,trick:Tile[],handIds:number[],opponent:string,lastEvent?:{type:string,who:number}|null};
export type GuidedContext={view:GuidedView,selected:number[],pick:number|null,myTurnReady:boolean};
export type GuidedStep={
 id:string,
 text:(ctx:GuidedContext)=>string,
 /** CSS selectors spotlighted (and tappable). */
 targets?:string[],
 /** Extra tappable selectors that are not spotlighted. */
 allow?:string[],
 button?:string,
 /** The step waits (hidden, nothing locked) until this holds. */
 waitFor?:(ctx:GuidedContext)=>boolean,
 /** The step ends by itself when this holds. */
 until?:(ctx:GuidedContext)=>boolean,
 final?:boolean,
};
const hand=(id:number)=>`[data-hand="${id}"]`;
const PLAY='.action-buttons .primary',DRAW_BUTTON='.action-buttons .secondary';
const has=(ctx:GuidedContext,...ids:number[])=>ids.every(id=>ctx.selected.includes(id));
const holds=(ctx:GuidedContext,...ids:number[])=>ids.every(id=>ctx.view.handIds.includes(id));
const trickIs=(ctx:GuidedContext,...ns:number[])=>ctx.view.trick.length===ns.length&&ctx.view.trick.every((t,i)=>t.n===ns[i]);

export function guidedSteps():GuidedStep[]{
 const T=GUIDED_TILES;
 return [
  {id:'hello',button:tr('시작'),text:c=>tr('연습 판이에요. {0} 1대1로 해 볼게요.<br><b>손패를 먼저 다 내면 이겨요.</b>',{0:josa(c.view.opponent,'과/와')})},
  {id:'hand',targets:['.hand-panel'],button:tr('다음'),waitFor:c=>c.myTurnReady,text:()=>tr('아래가 <b>내 손패</b> 5장이에요.<br>숫자가 클수록 강하고, <b>1과 2</b>가 가장 강해요.')},
  {id:'opponent',targets:['.opponents [data-seat="1"]'],button:tr('다음'),text:c=>tr('{0} 5장을 들고 있어요.<br>상대 손패는 보이지 않고, 남은 장수만 보여요.',{0:c.view.opponent+'도'})},
  {id:'pick-pair',targets:[hand(T.sevenA.id),hand(T.sevenB.id)],waitFor:c=>c.myTurnReady,until:c=>has(c,T.sevenA.id,T.sevenB.id),text:()=>tr('내가 <b>선</b>이에요. 선은 원하는 조합을 낼 수 있어요.<br>같은 숫자 두 장은 <b>페어</b>. <b>7 두 장</b>을 눌러 골라 보세요.')},
  {id:'play-pair',targets:[PLAY],allow:[hand(T.sevenA.id),hand(T.sevenB.id)],until:c=>!holds(c,T.sevenA.id),text:()=>tr('좋아요! <b>내기</b>를 눌러 바닥에 내요.')},
  {id:'answer',targets:['.trick-area'],button:tr('다음'),waitFor:c=>c.myTurnReady&&trickIs(c,10,10),text:c=>tr('{0} <b>페어 10·10</b>으로 받아쳤어요.<br>받아칠 때는 <b>같은 장수</b>로 <b>더 높은 패</b>를 내야 해요.',{0:josa(c.view.opponent,'이/가')})},
  {id:'pick-floor',targets:[`.wall [data-stack="${GUIDED_DRAW_STACK}"]`],until:c=>c.pick===GUIDED_DRAW_STACK||holds(c,T.thirteenB.id),text:()=>tr('내 손에는 10보다 높은 페어가 없어요.<br>이럴 땐 바닥에서 <b>1장을 가져와요</b>. <b>13</b>을 눌러 보세요.')},
  {id:'draw',targets:[DRAW_BUTTON],allow:[`.wall [data-stack="${GUIDED_DRAW_STACK}"]`],until:c=>holds(c,T.thirteenB.id),text:()=>tr('<b>1장 가져오기</b>를 눌러요.<br>가져오면 내 차례는 끝나요.')},
  {id:'single',targets:['.trick-area'],button:tr('다음'),waitFor:c=>c.myTurnReady&&trickIs(c,4),text:c=>tr('아무도 더 받아치지 않아서 {0} 다시 <b>선</b>을 잡고 <b>싱글 4</b>를 냈어요.<br>싱글은 <b>1장</b>으로, 4보다 높은 패를 내요.',{0:josa(c.view.opponent,'이/가')})},
  {id:'pick-nine',targets:[hand(T.nine.id)],until:c=>has(c,T.nine.id),text:()=>tr('<b>9</b>를 골라 보세요.<br>3은 4보다 낮아서 낼 수 없어요.')},
  {id:'play-nine',targets:[PLAY],allow:[hand(T.nine.id)],until:c=>!holds(c,T.nine.id),text:()=>tr('<b>내기</b>!')},
  {id:'lead-again',targets:['.hand-panel'],button:tr('다음'),waitFor:c=>c.myTurnReady&&!c.view.trick.length,text:c=>tr('{0} 9를 넘는 패가 없어서 1장을 가져갔어요.<br>아무도 못 받아치면 마지막에 낸 내가 다시 <b>선</b>이에요!',{0:josa(c.view.opponent,'은/는')})},
  {id:'pick-thirteens',targets:[hand(T.thirteenA.id),hand(T.thirteenB.id)],until:c=>has(c,T.thirteenA.id,T.thirteenB.id),text:()=>tr('아까 가져온 13과 원래 있던 13이 <b>페어</b>가 됐어요.<br><b>13 두 장</b>을 골라요.')},
  {id:'play-thirteens',targets:[PLAY],allow:[hand(T.thirteenA.id),hand(T.thirteenB.id)],until:c=>!holds(c,T.thirteenA.id),text:()=>tr('<b>내기</b>! 여러 장을 한 번에 내면 손패가 빨리 줄어요.')},
  {id:'last',targets:[hand(T.three.id)],waitFor:c=>c.myTurnReady&&!c.view.trick.length&&c.view.handIds.length===1,until:c=>has(c,T.three.id),text:()=>tr('다시 내 선이에요. <b>마지막 한 장</b>! <b>3</b>을 골라요.')},
  {id:'finish',targets:[PLAY],allow:[hand(T.three.id)],until:c=>c.view.phase==='ended',text:()=>tr('<b>내기</b>를 누르면 승리예요!')},
  {id:'done',final:true,waitFor:c=>c.view.phase==='ended',text:()=>tr('<b>이겼어요!</b><br>· 받아칠 때는 같은 장수로 더 높은 패<br>· 낼 패가 없으면 바닥에서 1장 가져오기<br>· 손패를 먼저 다 내면 승리<br>고르기 어려우면 「자동 선택」이 대신 골라 줘요.')},
 ];
}
