/**
 * Yacht Dice (요트다이스) for the ST4~6 side quest. Pure rules: no HP, relic or journey logic here.
 * Two seats: 0 = player, 1 = AI. The AI sees only the shared table (dice and both score sheets).
 */
export const YACHT_CATEGORIES=['ones','twos','threes','fours','fives','sixes','choice','four-kind','full-house','small-straight','large-straight','yacht'] as const;
export type YachtCategory=typeof YACHT_CATEGORIES[number];
export type YachtSheet=Partial<Record<YachtCategory,number>>;
/** yachtBonuses: extra yachts scored after a 50 in the yacht box (joker rule, +100 each). */
export type YachtMatch={version:1,dice:number[],held:boolean[],rollsLeft:number,turn:0|1,round:number,sheets:[YachtSheet,YachtSheet],status:'playing'|'ended',yachtBonuses?:[number,number],last?:{seat:0|1,category:YachtCategory,score:number,bonus?:number,joker?:boolean}};
export const YACHT_JOKER_BONUS=100;
export const YACHT_LABELS:Record<YachtCategory,string>={ones:'1',twos:'2',threes:'3',fours:'4',fives:'5',sixes:'6',choice:'초이스','four-kind':'포카인드','full-house':'풀하우스','small-straight':'스몰 스트레이트','large-straight':'라지 스트레이트',yacht:'요트'};
export const YACHT_HINTS:Record<YachtCategory,string>={ones:'1의 합',twos:'2의 합',threes:'3의 합',fours:'4의 합',fives:'5의 합',sixes:'6의 합',choice:'주사위 5개 합','four-kind':'같은 눈 4개 이상 · 5개 합','full-house':'3개+2개 · 5개 합','small-straight':'연속 4개 · 15점','large-straight':'연속 5개 · 30점',yacht:'같은 눈 5개 · 50점'};
export const YACHT_UPPER:readonly YachtCategory[]=YACHT_CATEGORIES.slice(0,6);
export const YACHT_BONUS={threshold:63,points:35} as const;
export type DiceRandom=()=>number;
/** Uniform die face 1~6 from crypto; tests inject their own source. */
export const cryptoDie:DiceRandom=()=>{const buffer=new Uint32Array(1);for(;;){crypto.getRandomValues(buffer);if(buffer[0]<4294967292)return 1+buffer[0]%6;}};

export function newYachtMatch():YachtMatch{return {version:1,dice:[1,1,1,1,1],held:[false,false,false,false,false],rollsLeft:3,turn:0,round:1,sheets:[{},{}],status:'playing'};}
function counts(dice:readonly number[]){const c=[0,0,0,0,0,0,0];for(const d of dice)c[d]++;return c;}
export function yachtScore(category:YachtCategory,dice:readonly number[]):number{
 const c=counts(dice),sum=dice.reduce((a,b)=>a+b,0),upper=YACHT_UPPER.indexOf(category);
 if(upper>=0)return c[upper+1]*(upper+1);
 const has=(run:number[])=>run.every(n=>c[n]>0);
 switch(category){
  case 'choice':return sum;
  case 'four-kind':return c.some(n=>n>=4)?sum:0;
  case 'full-house':return c.includes(3)&&c.includes(2)||c.includes(5)?sum:0;
  case 'small-straight':return has([1,2,3,4])||has([2,3,4,5])||has([3,4,5,6])?15:0;
  case 'large-straight':return has([1,2,3,4,5])||has([2,3,4,5,6])?30:0;
  case 'yacht':return c.includes(5)?50:0;
 }
 return 0;
}
/** The strongest named combo the dice show right now (yacht > large > small > full house > four of a kind), or '' if none. */
export const YACHT_SHAPES:readonly YachtCategory[]=['yacht','large-straight','small-straight','full-house','four-kind'];
export function yachtShape(dice:readonly number[]):YachtCategory|''{return YACHT_SHAPES.find(cat=>yachtScore(cat,dice)>0)||'';}
export function upperSubtotal(sheet:YachtSheet){return YACHT_UPPER.reduce((sum,cat)=>sum+(sheet[cat]||0),0);}
export function yachtBonus(sheet:YachtSheet){return upperSubtotal(sheet)>=YACHT_BONUS.threshold?YACHT_BONUS.points:0;}
export function yachtTotal(sheet:YachtSheet,jokerBonuses=0){return YACHT_CATEGORIES.reduce((sum,cat)=>sum+(sheet[cat]||0),0)+yachtBonus(sheet)+jokerBonuses*YACHT_JOKER_BONUS;}
export function seatTotal(match:YachtMatch,seat:0|1){return yachtTotal(match.sheets[seat],match.yachtBonuses?.[seat]||0);}
export function openCategories(sheet:YachtSheet){return YACHT_CATEGORIES.filter(cat=>sheet[cat]===undefined);}
/** 'win'|'lose'|'draw' from the player's seat, only once the match has ended. */
export function yachtOutcome(match:YachtMatch){if(match.status!=='ended')return undefined;const me=seatTotal(match,0),ai=seatTotal(match,1);return me>ai?'win':me<ai?'lose':'draw';}

/* ---------- Joker rule (Yahtzee-style) ----------
 * A yacht rolled after the yacht box is filled is a joker:
 *  1. +100 bonus if the yacht box holds 50 (none if it holds 0).
 *  2. It must go in the matching 1~6 box if that box is open;
 *  3. otherwise in any open lower box, where full house / straights count in full;
 *  4. otherwise in any open 1~6 box (scoring 0 there). */
export function isYachtRoll(dice:readonly number[]){return dice.length===5&&dice.every(d=>d===dice[0]);}
export function yachtJoker(sheet:YachtSheet,dice:readonly number[]){return isYachtRoll(dice)&&sheet.yacht!==undefined;}
export function yachtJokerBonus(sheet:YachtSheet,dice:readonly number[]){return yachtJoker(sheet,dice)&&sheet.yacht===50?YACHT_JOKER_BONUS:0;}
const LOWER:readonly YachtCategory[]=YACHT_CATEGORIES.slice(6);
export function allowedCategories(sheet:YachtSheet,dice:readonly number[]):YachtCategory[]{
 const open=openCategories(sheet);if(!yachtJoker(sheet,dice))return open;
 const face=YACHT_UPPER[dice[0]-1];if(open.includes(face))return [face];
 const lower=open.filter(cat=>LOWER.includes(cat));return lower.length?lower:open;
}
/** Score a box would receive now (joker scoring included). */
export function boxScore(sheet:YachtSheet,cat:YachtCategory,dice:readonly number[]){
 if(yachtJoker(sheet,dice)){if(cat==='small-straight')return 15;if(cat==='large-straight')return 30;}
 return yachtScore(cat,dice);
}

export function rollYacht(match:YachtMatch,seat:0|1,random:DiceRandom=cryptoDie):YachtMatch{
 if(match.status!=='playing'||match.turn!==seat)throw Error('지금은 주사위를 굴릴 차례가 아니에요.');
 if(match.rollsLeft<=0)throw Error('이번 차례의 굴리기를 모두 사용했어요. 점수 칸을 골라 주세요.');
 const first=match.rollsLeft===3;
 return {...match,dice:match.dice.map((d,i)=>!first&&match.held[i]?d:random()),held:first?[false,false,false,false,false]:[...match.held],rollsLeft:match.rollsLeft-1,last:undefined};
}
export function toggleYachtHold(match:YachtMatch,seat:0|1,index:unknown):YachtMatch{
 if(match.status!=='playing'||match.turn!==seat)throw Error('지금은 주사위를 고를 차례가 아니에요.');
 if(match.rollsLeft===3||match.rollsLeft===0)throw Error(match.rollsLeft===3?'먼저 주사위를 굴려 주세요.':'점수 칸을 골라 주세요.');
 if(!Number.isInteger(index)||(index as number)<0||(index as number)>4)throw Error('주사위를 선택해 주세요.');
 const held=[...match.held];held[index as number]=!held[index as number];return {...match,held};
}
export function scoreYacht(match:YachtMatch,seat:0|1,category:unknown):YachtMatch{
 if(match.status!=='playing'||match.turn!==seat)throw Error('지금은 점수를 적을 차례가 아니에요.');
 if(match.rollsLeft===3)throw Error('먼저 주사위를 굴려 주세요.');
 if(!YACHT_CATEGORIES.includes(category as YachtCategory))throw Error('점수 칸을 선택해 주세요.');
 const cat=category as YachtCategory,own=match.sheets[seat];if(own[cat]!==undefined)throw Error('이미 기록한 점수 칸이에요.');
 if(!allowedCategories(own,match.dice).includes(cat))throw Error('조커 규칙: 같은 눈의 숫자 칸이 비어 있으면 그 칸, 아니면 아래쪽 족보 칸에 적어야 해요.');
 const score=boxScore(own,cat,match.dice),bonus=yachtJokerBonus(own,match.dice),joker=yachtJoker(own,match.dice);
 const sheets:[YachtSheet,YachtSheet]=[{...match.sheets[0]},{...match.sheets[1]}];sheets[seat][cat]=score;
 const bonuses:[number,number]=[...(match.yachtBonuses||[0,0])] as [number,number];if(bonus)bonuses[seat]++;
 const next:YachtMatch={...match,sheets,yachtBonuses:bonuses,held:[false,false,false,false,false],rollsLeft:3,last:{seat,category:cat,score,...(bonus?{bonus}:{}),...(joker?{joker}:{})}};
 if(seat===1){if(match.round>=YACHT_CATEGORIES.length)return {...next,status:'ended'};return {...next,turn:0,round:match.round+1};}
 return {...next,turn:1};
}

/* ---------- AI: one-step expectation over the visible dice only ---------- */
/** Rough average a category is worth in a whole game; a score above it is a good use of the box. */
const BASELINE:Record<YachtCategory,number>={ones:2,twos:5,threes:8,fours:11,fives:14,sixes:17,choice:22,'four-kind':13,'full-house':15,'small-straight':11,'large-straight':12,yacht:10};
function boxValue(sheet:YachtSheet,cat:YachtCategory,dice:readonly number[]){
 const score=boxScore(sheet,cat,dice),upper=YACHT_UPPER.indexOf(cat);let value=score-BASELINE[cat];
 if(upper>=0&&upperSubtotal(sheet)<YACHT_BONUS.threshold){const par=3*(upper+1);value+=score>=par?4:-(par-score)*0.35;}
 return value;
}
export function bestYachtBox(sheet:YachtSheet,dice:readonly number[]){
 const allowed=allowedCategories(sheet,dice),bonus=yachtJokerBonus(sheet,dice);let best=allowed[0],value=-Infinity;
 for(const cat of allowed){const v=boxValue(sheet,cat,dice);if(v>value){value=v;best=cat;}}
 return {category:best,value:value+bonus};
}
/** Best hold mask for the next roll, by exact expectation over the free dice. */
export function bestYachtHold(sheet:YachtSheet,dice:readonly number[]){
 let bestMask=31,bestValue=bestYachtBox(sheet,dice).value;
 for(let mask=0;mask<31;mask++){
  const free=[0,1,2,3,4].filter(i=>!(mask>>i&1)),outcomes=6**free.length;let total=0;const trial=[...dice];
  for(let o=0;o<outcomes;o++){let rest=o;for(const i of free){trial[i]=1+rest%6;rest=Math.floor(rest/6);}total+=bestYachtBox(sheet,trial).value;}
  const avg=total/outcomes;if(avg>bestValue+0.05){bestValue=avg;bestMask=mask;}
 }
 return {held:[0,1,2,3,4].map(i=>!!(bestMask>>i&1)),keepAll:bestMask===31};
}
export type YachtAiPlan={type:'roll',held:boolean[]}|{type:'score',category:YachtCategory};
/** Deterministic from the open table, so the screen can show the keep/shake before the step runs. */
export function yachtAiPlan(match:YachtMatch):YachtAiPlan{
 if(match.rollsLeft===3)return {type:'roll',held:[false,false,false,false,false]};
 const sheet=match.sheets[1];
 if(match.rollsLeft>0){const plan=bestYachtHold(sheet,match.dice);if(!plan.keepAll)return {type:'roll',held:plan.held};}
 return {type:'score',category:bestYachtBox(sheet,match.dice).category};
}
/** One visible AI action: roll, re-hold and roll, or write a score. */
export function yachtAiStep(match:YachtMatch,random:DiceRandom=cryptoDie):YachtMatch{
 if(match.status!=='playing'||match.turn!==1)throw Error('상대의 차례가 아니에요.');
 const plan=yachtAiPlan(match);
 return plan.type==='roll'?rollYacht({...match,held:plan.held},1,random):scoreYacht(match,1,plan.category);
}
export function validYachtMatch(match:unknown):match is YachtMatch{
 const m=match as YachtMatch;if(!m||typeof m!=='object'||m.version!==1)return false;
 const sheetOk=(s:YachtSheet)=>!!s&&typeof s==='object'&&Object.entries(s).every(([k,v])=>YACHT_CATEGORIES.includes(k as YachtCategory)&&Number.isInteger(v)&&(v as number)>=0&&(v as number)<=50);
 return Array.isArray(m.dice)&&m.dice.length===5&&m.dice.every(d=>Number.isInteger(d)&&d>=1&&d<=6)&&Array.isArray(m.held)&&m.held.length===5&&m.held.every(h=>typeof h==='boolean')
  &&Number.isInteger(m.rollsLeft)&&m.rollsLeft>=0&&m.rollsLeft<=3&&(m.turn===0||m.turn===1)&&Number.isInteger(m.round)&&m.round>=1&&m.round<=12
  &&Array.isArray(m.sheets)&&m.sheets.length===2&&m.sheets.every(sheetOk)&&(m.status==='playing'||m.status==='ended')
  &&(m.yachtBonuses===undefined||Array.isArray(m.yachtBonuses)&&m.yachtBonuses.length===2&&m.yachtBonuses.every(n=>Number.isInteger(n)&&n>=0&&n<=12));
}
