import {combo,type Tile} from './game';
import {tr} from './i18n/index.ts';
import {josa} from './josa';

/** 2026-11-24 player feedback ("I don't get how to play"): during stage 1 of the story, one short line explains the
 *  situation on the table right now and what the player can do, with an example from their own hand.
 *  It only reads public information (the table, my own hand, hand counts); it never looks at hidden hands. */
export type CoachOption={label:string,tiles:Tile[],key:number[]};
export type CoachInput={myTurn:boolean,trick:Tile[],options:CoachOption[],handCount:number,turnName:string};
export type CoachLine={title:string,text:string,tone:'lead'|'answer'|'draw'|'wait'|'last'};

const shown=(tiles:Tile[])=>tiles.map(t=>t.n).join('·');
const weaker=(a:number[],b:number[])=>{for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;};
/** A gentle example: the weakest legal play, so a beginner keeps strong tiles for later. */
function example(options:CoachOption[],size?:number){
 const pool=size?options.filter(o=>o.tiles.length===size):options;
 return [...pool].sort((a,b)=>weaker(a.key,b.key))[0];
}

export function stage1Coach(input:CoachInput):CoachLine{
 const {myTurn,trick,options,handCount,turnName}=input;
 if(!myTurn){
  if(!trick.length)return {tone:'wait',title:tr('{0} 차례',{0:turnName}),text:tr('상대가 패를 내면, 내 차례에 같은 장수로 더 강한 패를 내야 해요.')};
  const label=combo(trick)?.label||'';
  return {tone:'wait',title:tr('{0} 차례',{0:turnName}),text:tr('지금 바닥 패는 {0} {1}({2}장)이에요. 내 차례가 오면 같은 {2}장으로 이겨야 해요.',{0:label,1:shown(trick),2:trick.length})};
 }
 if(handCount<=2&&options.some(o=>o.tiles.length===handCount))return {tone:'last',title:tr('마지막 한 수!'),text:tr('남은 {0}장을 한 번에 낼 수 있어요. 손패를 다 내면 이번 판 승리예요.',{0:handCount})};
 if(!trick.length){
  const pick=example(options.filter(o=>o.tiles.length>1))||example(options);
  return {tone:'lead',title:tr('내가 선이에요'),text:pick?tr('아무 조합이나 낼 수 있어요. 예: {0} {1}. 여러 장을 같이 내면 손패가 빨리 줄어요.',{0:pick.label,1:shown(pick.tiles)}):tr('아무 조합이나 낼 수 있어요. 약한 패부터 털어 보세요.')};
 }
 const label=combo(trick)?.label||'',size=trick.length;
 if(!options.length)return {tone:'draw',title:tr('이길 패가 없어요'),text:tr('{0} {1}보다 강한 {2}장 조합이 없어요. 「1장 가져오기」로 바닥 패를 한 장 가져오면 차례가 넘어가요.',{0:label,1:shown(trick),2:size})};
 const pick=example(options,size);
 return {tone:'answer',title:tr('{0} 이겨 보세요',{0:josa(label,'을/를')}),text:pick?tr('같은 {0}장으로 더 강한 패를 내요. 예: {1} {2}. 「자동 선택」을 누르면 골라 줘요.',{0:size,1:pick.label,2:shown(pick.tiles)}):tr('같은 {0}장으로 더 강한 패를 내요.',{0:size})};
}
