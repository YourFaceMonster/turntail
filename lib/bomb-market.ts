/** Bomb Market v0.1. No runtime dependency on the classic/RPG engine. */
import type {Tile} from './game';
export type {Tile};
export const BOMB_REACTION_MS=3000, MARKET_COST=3, BOMB_ROUNDS=5, BOMB_HAND_SIZE=11, BOMB_MARKET_SIZE=16;
// Stable saved IDs: iron gate=0, secret key=1, sacred flame=2, crown=3.
export const BOMB_SUIT_NAMES=['검정 철문','초록 비밀의 열쇠','주황 성화','빨강 왕관'];
export const bombSuitRank=(s:number)=>[0,2,1,3][s];
export const bombRank=(n:number)=>n===2?17:n===1?16:n;
export const bombSorted=(tiles:Tile[])=>[...tiles].sort((a,b)=>bombRank(a.n)-bombRank(b.n)||bombSuitRank(a.s)-bombSuitRank(b.s));
export type BombCombo={kind:'single'|'pair'|'triple'|'stairs'|'straight'|'full-house'|'four'|'straight-bomb';label:string;bomb:boolean;size:number;high:number;suit:number};
export function bombCombo(tiles:Tile[]):BombCombo|null{
 if(!tiles.length||new Set(tiles.map(t=>t.id)).size!==tiles.length||tiles.some(t=>!Number.isInteger(t.n)||t.n<1||t.n>15||!Number.isInteger(t.s)||t.s<0||t.s>3||t.id!==(t.n-1)*4+t.s))return null;
 const groups=new Map<number,Tile[]>();for(const t of tiles)groups.set(t.n,[...(groups.get(t.n)||[]),t]);
 const nums=[...groups.keys()].sort((a,b)=>a-b),counts=[...groups.values()].map(a=>a.length),top=bombSorted(tiles).at(-1)!;
 const make=(kind:BombCombo['kind'],label:string,bomb=false,high=bombRank(top.n),suit=bombSuitRank(top.s)):BombCombo=>({kind,label,bomb,size:tiles.length,high,suit});
 const consecutive=nums[0]>=3&&nums.every((n,i)=>i===0||n===nums[i-1]+1);
 if(groups.size===1){if(tiles.length===1)return make('single','싱글');if(tiles.length===2)return make('pair','페어');if(tiles.length===3)return make('triple','트리플');if(tiles.length===4)return make('four','포카드',true);}
 if(tiles.length===5&&counts.includes(3)&&counts.includes(2)){const triple=[...groups.values()].find(g=>g.length===3)!;return make('full-house','풀하우스',false,bombRank(triple[0].n),Math.max(...triple.map(t=>bombSuitRank(t.s))));}
 if(nums.length>=5&&groups.size===tiles.length&&consecutive)return make(tiles.every(t=>t.s===tiles[0].s)?'straight-bomb':'straight',tiles.every(t=>t.s===tiles[0].s)?'동문양 연속 폭탄':'스트레이트',tiles.every(t=>t.s===tiles[0].s));
 if(nums.length>=2&&counts.every(n=>n===2)&&consecutive)return make('stairs','계단');
 return null;
}
export function bombBeats(tiles:Tile[],old:Tile[]){
 const a=bombCombo(tiles),b=bombCombo(old);if(!a)return false;if(!old.length)return true;if(!b)return false;
 if(a.bomb!==b.bomb)return a.bomb;
 if(a.bomb&&b.bomb){if(a.size!==b.size)return a.size>b.size;}
 else if(a.kind!==b.kind||a.size!==b.size)return false;
 return a.high>b.high||(a.high===b.high&&a.suit>b.suit);
}
/** All meaningful same-rank subsets and consecutive combinations, including variable lengths. */
export function bombOptions(hand:Tile[],target:Tile[]=[],bombsOnly=false):Tile[][]{
 const groups=new Map<number,Tile[]>();for(const t of hand)groups.set(t.n,[...(groups.get(t.n)||[]),t]);
 const options:Tile[][]=[],seen=new Set<string>();
 const add=(a:Tile[])=>{const c=bombCombo(a);if(!c||bombsOnly&&!c.bomb||!bombBeats(a,target))return;const key=a.map(t=>t.id).sort((a,b)=>a-b).join(',');if(!seen.has(key)){seen.add(key);options.push(a);}};
 const subsets=(g:Tile[],n:number)=>{const out:Tile[][]=[];for(let mask=1;mask<1<<g.length;mask++){const a=g.filter((_,i)=>mask&(1<<i));if(a.length===n)out.push(a);}return out;};
 for(const g of groups.values())for(let n=1;n<=g.length;n++)for(const a of subsets(g,n))add(a);
 for(const a of groups.values())if(a.length>=3)for(const b of groups.values())if(a[0].n!==b[0].n&&b.length>=2)for(const x of subsets(a,3))for(const y of subsets(b,2))add([...x,...y]);
 for(let start=3;start<=15;start++){
  const single:Tile[]=[],pairs:Tile[]=[];
  for(let n=start;n<=15;n++){const g=groups.get(n);if(!g)break;single.push(bombSorted(g)[0]);if(single.length>=5){add([...single]);for(const top of g)add([...single.slice(0,-1),top]);}}
  for(let n=start;n<=15;n++){const g=groups.get(n);if(!g||g.length<2)break;pairs.push(...bombSorted(g).slice(0,2));if(pairs.length>=4)for(const top of subsets(g,2))add([...pairs.slice(0,-2),...top]);}
  for(let s=0;s<4;s++){const run:Tile[]=[];for(let n=start;n<=15;n++){const t=groups.get(n)?.find(t=>t.s===s);if(!t)break;run.push(t);if(run.length>=5)add([...run]);}}
 }
 return options;
}
export type BombPlayer={name:string;hand:Tile[];score:number;place:number|null;out:boolean};
export type BombTransfer={from:number;to:number;points:number;reason:'cards'|'market'};
export type BombRoundResult={round:number;places:number[];deltas:number[];scores:number[];counts:number[];transfers:BombTransfer[]};
export type BombState={schema:1;mode:'bomb-market';id:string;revision:number;round:number;phase:'playing'|'round-end'|'complete';players:BombPlayer[];market:(Tile|null)[];pot:number;discard:Tile[];turn:number;trickId:number;trick:Tile[];lastBy:number|null;passed:number[];reaction:null|{id:number;startedAt:number;deadline:number};roundStart:number[];transfers:BombTransfer[];results:BombRoundResult[];log:string[]};
export type BombAction={type:'play';ids:number[]}|{type:'buy';id:number}|{type:'pass'}|{type:'tick'}|{type:'next'};
export function createBombGame(name='플레이어',random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296):BombState{
 const state:BombState={schema:1,mode:'bomb-market',id:crypto.randomUUID(),revision:0,round:0,phase:'playing',players:[name.trim().slice(0,12)||'플레이어','청돌','불찬','별이'].map(name=>({name,hand:[],score:50,place:null,out:false})),market:[],pot:0,discard:[],turn:0,trickId:0,trick:[],lastBy:null,passed:[],reaction:null,roundStart:[50,50,50,50],transfers:[],results:[],log:[]};
 deal(state,random);return state;
}
function deal(g:BombState,random:()=>number){
 const deck:Tile[]=Array.from({length:60},(_,id)=>({id,n:Math.floor(id/4)+1,s:id%4}));
 for(let i=59;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(random()*(i+1))));[deck[i],deck[j]]=[deck[j],deck[i]];}
 const handSize=g.players.length===4?BOMB_HAND_SIZE:15;g.players.forEach(p=>{p.hand=bombSorted(deck.splice(0,handSize));p.place=null;p.out=false;});g.market=bombSorted(deck);g.pot=0;g.discard=[];g.trick=[];g.lastBy=null;g.passed=[];g.reaction=null;g.round++;g.phase='playing';g.trickId++;g.transfers=[];g.roundStart=g.players.map(p=>p.score);
 // Lead: holder of black 3 (the weakest card). If it sits in the market, the holder of the weakest dealt card leads.
 g.turn=g.players.reduce((best,p,i)=>bombBeats([g.players[best].hand[0]],[p.hand[0]])?i:best,0);
 g.log=[`${g.round}/5판 · ${g.players[g.turn].name}의 선`];
}
const eligible=(g:BombState,i:number)=>g.players[i].place===null&&!g.players[i].out;
/** True when any participant still able to act holds a bomb that beats the current trick. */
const bombPossible=(g:BombState)=>g.players.some((p,i)=>eligible(g,i)&&bombOptions(p.hand,g.trick,true).length>0);
function log(g:BombState,message:string){g.log=[message,...g.log].slice(0,24);}
function closeTrick(g:BombState){
 const last=g.lastBy!;g.discard.push(...g.trick);g.trick=[];g.lastBy=null;g.passed=[];g.reaction=null;g.trickId++;g.players.forEach(p=>p.out=false);
 g.turn=last;if(!eligible(g,last))for(let step=1;step<=g.players.length;step++){const i=(last+step)%g.players.length;if(eligible(g,i)){g.turn=i;break;}}
 log(g,`트릭 종료 · ${g.players[g.turn].name}의 선`);
}
function advance(g:BombState,after:number){
 const opponents=g.players.map((_,i)=>i).filter(i=>eligible(g,i)&&i!==g.lastBy);
 if(!opponents.length||opponents.every(i=>g.passed.includes(i))){closeTrick(g);return;}
 for(let step=1;step<=g.players.length;step++){const i=(after+step)%g.players.length;if(eligible(g,i)&&i!==g.lastBy){g.turn=i;return;}}
}
function finishPlayer(g:BombState,who:number){
 const p=g.players[who];p.place=1+g.players.filter(p=>p.place!==null).length;
 for(const [i,other] of g.players.entries())if(i!==who&&other.place===null){const points=other.hand.length;other.score-=points;p.score+=points;g.transfers.push({from:i,to:who,points,reason:'cards'});}
 if(p.place===1){p.score+=g.pot;if(g.pot)g.transfers.push({from:-1,to:who,points:g.pot,reason:'market'});g.pot=0;}
 log(g,`${p.name} ${p.place}등 · 즉시 정산`);
 const remaining=g.players.filter(p=>p.place===null);if(remaining.length===1){remaining[0].place=g.players.length;if(g.pot){const first=g.players.findIndex(p=>p.place===1);g.players[first].score+=g.pot;g.transfers.push({from:-1,to:first,points:g.pot,reason:'market'});g.pot=0;}g.phase=g.round===BOMB_ROUNDS?'complete':'round-end';g.reaction=null;g.results.push({round:g.round,places:g.players.map(p=>p.place!),deltas:g.players.map((p,i)=>p.score-g.roundStart[i]),scores:g.players.map(p=>p.score),counts:g.players.map(p=>p.hand.length),transfers:structuredClone(g.transfers)});}
}
/** Immutable, compare-and-swap transition. A captured revision may be accepted once only. */
export function transitionBomb(state:BombState,who:number,action:BombAction,revision:number,now=Date.now(),random?:()=>number):BombState{
 if(revision!==state.revision)throw Error('이미 처리된 입력이에요. 현재 화면에서 다시 선택해 주세요.');
 if(!Number.isFinite(now))throw Error('잘못된 시각이에요.');
 if(action.type==='next'){if(state.phase!=='round-end')throw Error('판 정산 후에 진행할 수 있어요.');const g=structuredClone(state);deal(g,random??(()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296));g.revision++;return g;}
 if(state.phase!=='playing')throw Error('종료된 판이에요.');
 if(action.type==='tick'){if(!state.reaction||now<state.reaction.deadline)return state;const g=structuredClone(state);g.reaction=null;advance(g,g.lastBy!);g.revision++;return g;}
 const p=state.players[who];if(!p||!eligible(state,who))throw Error('아웃 또는 순위 확정 상태에서는 참여할 수 없어요.');
 if(action.type==='play'){
  if(!action.ids.length||new Set(action.ids).size!==action.ids.length)throw Error('제출할 패를 선택해 주세요.');
  const tiles=action.ids.map(id=>p.hand.find(t=>t.id===id));if(tiles.some(t=>!t))throw Error('보유하지 않은 패예요.');
  const selected=tiles as Tile[],combo=bombCombo(selected);if(!combo||!bombBeats(selected,state.trick))throw Error('현재 족보를 이기는 조합을 선택해 주세요.');
  const interrupt=who!==state.turn;
  if(state.reaction&&now>=state.reaction.deadline)throw Error('폭탄 반응 시간이 끝났어요.');
  if(state.reaction&&!combo.bomb)throw Error('폭탄 반응 중에는 폭탄만 제출할 수 있어요.');
  if(interrupt&&!combo.bomb)throw Error('차례 밖에는 폭탄만 제출할 수 있어요.');
  const g=structuredClone(state);g.discard.push(...g.trick);g.trick=bombSorted(selected);g.lastBy=who;g.passed=[];g.players[who].hand=g.players[who].hand.filter(t=>!action.ids.includes(t.id));if(interrupt)g.turn=who;g.revision++;
  g.reaction={id:g.revision,startedAt:now,deadline:now+BOMB_REACTION_MS};log(g,`${p.name} · ${combo.label} ${selected.length}장`);
  if(!g.players[who].hand.length)finishPlayer(g,who);
  // No one can bomb: skip the 3s window and move on immediately.
  if(g.phase==='playing'&&g.reaction&&!bombPossible(g)){g.reaction=null;advance(g,who);}
  return g;
 }
 if(state.reaction)throw Error('폭탄 반응 중이에요.');if(who!==state.turn)throw Error('지금은 내 차례가 아니에요.');if(!state.trick.length)throw Error('선은 반드시 패를 제출해야 해요.');
 const g=structuredClone(state);
 if(action.type==='buy'){
  if(p.score<MARKET_COST)throw Error('구매할 점수가 부족해요.');const index=g.market.findIndex(t=>t?.id===action.id);if(index<0)throw Error('시장에 없는 패예요.');
  const bought=g.market[index]!;g.market[index]=null;g.players[who].hand=bombSorted([...g.players[who].hand,bought]);g.players[who].score-=MARKET_COST;g.pot+=MARKET_COST;g.players[who].out=true;log(g,`${p.name} · 시장 구매 −3점 / 이번 트릭 아웃`);
 }else {if(!g.passed.includes(who))g.passed.push(who);log(g,`${p.name} · 패스`);}
 advance(g,who);g.revision++;return g;
}
export function bombStandings(g:BombState){return g.players.map((p,seat)=>({seat,name:p.name,score:p.score,place:1+g.players.filter(other=>other.score>p.score).length})).sort((a,b)=>b.score-a.score||a.seat-b.seat);}
/** The AI receives its hand, public market/table, scores and counts only. */
export function bombView(g:BombState,seat:number){return {seat,revision:g.revision,round:g.round,phase:g.phase,turn:g.turn,hand:structuredClone(g.players[seat].hand),players:g.players.map(p=>({name:p.name,count:p.hand.length,score:p.score,place:p.place,out:p.out})),market:structuredClone(g.market),pot:g.pot,trick:structuredClone(g.trick),lastBy:g.lastBy,reaction:g.reaction?{...g.reaction}:null};}
export type BombView=ReturnType<typeof bombView>;
