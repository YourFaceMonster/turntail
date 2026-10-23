import {combo,legalOptions,rank,suitRank,type Tile,type LegalOption,type BotPosition,type BotAction} from './game.ts';

type Position=Pick<BotPosition,'me'|'turn'|'lastBy'|'trick'|'cols'|'rows'|'played'> & {
 players:{count:number,known:Tile[],hand?:Tile[]}[];
 stacks:{lower:Tile|null,lowerPresent:boolean,upper:boolean,available:boolean}[];
};
type World={hands:Tile[][],known:Tile[][],stacks:(Tile|null)[][],turn:number,lastBy:number|null,trick:Tile[],played:Tile[],cols:number,rows:number,winner:number|null};
type Candidate={action:BotAction,score:number};
type Model={all:LegalOption[],cost:(tiles:Tile[])=>number};
type Context={models:Map<string,Model>,ranks:Map<string,Candidate[]>};
export type BotAnalysis={action:BotAction,method:'finish'|'exact'|'lookahead'|'heuristic',samples:number,candidates:number,nodes:number};
const deck:Tile[]=Array.from({length:60},(_,id)=>({id,n:Math.floor(id/4)+1,s:id%4}));
const power=(t:Tile)=>rank(t)*4+suitRank(t.s);
const handKey=(ts:Tile[])=>ts.map(t=>t.id).sort((a,b)=>a-b).join('.');
const actionKey=(a:BotAction)=>a.type==='play'?'p'+handKey(a.tiles):a.type==='draw'?'d'+a.index:'s';
const without=(hand:Tile[],tiles:Tile[])=>{const ids=new Set(tiles.map(t=>t.id));return hand.filter(t=>!ids.has(t.id));};
const context=():Context=>({models:new Map(),ranks:new Map()});

/** Copies only what this seat may know. Even a caller supplying extra hidden fields
 * cannot change the random seed, candidate scores or sampled worlds. */
function publicPosition(p:BotPosition):Position{
 return {me:p.me,turn:p.turn,lastBy:p.lastBy,trick:p.trick,cols:p.cols,rows:p.rows,played:p.played,
  players:p.players.map((s,i)=>({count:s.count,known:s.known,hand:i===p.me?s.hand:undefined})),
  stacks:p.stacks.map(s=>({lower:s.upper?null:s.lower,lowerPresent:s.lowerPresent,upper:s.upper,available:s.available}))};
}
function positionKey(p:Position){return JSON.stringify([p.me,p.turn,p.lastBy,handKey(p.trick),p.cols,p.rows,handKey(p.played),p.players.map(s=>[s.count,handKey(s.known),s.hand?handKey(s.hand):null]),p.stacks.map(s=>[s.lower?.id??-1,+s.lowerPresent,+s.upper,+s.available])]);}
function inferForcedCards(p:Position){
 const unknown=p.players.map((s,i)=>({s,i})).filter(({s,i})=>i!==p.me&&s.known.length<s.count);
 // If every unseen card must be in one remaining hand, its identity is public
 // by elimination. Do not apply this while any floor slot is still concealed.
 if(unknown.length!==1||p.stacks.some(s=>s.upper||s.lowerPresent&&!s.lower))return;
 const {s,i}=unknown[0],pool=poolFor(p);if(pool.length===s.count-s.known.length)p.players[i]={...s,known:[...s.known,...pool]};
}
function randomFor(p:Position){let seed=2166136261;for(const c of positionKey(p))seed=Math.imul(seed^c.charCodeAt(0),16777619);return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function poolFor(p:Position){const used=new Set([...p.played,...p.trick,...p.players.flatMap((s,i)=>i===p.me?s.hand||[]:s.known),...p.stacks.flatMap(s=>s.lower?[s.lower]:[])].map(t=>t.id));return deck.filter(t=>!used.has(t.id));}

/** A partition costs one move per group, plus a small cost for weak isolated
 * singles. The same DP memo evaluates every remainder of this hand. */
function model(hand:Tile[],ctx:Context):Model{
 hand=[...hand].sort((a,b)=>a.id-b.id);
 const key=handKey(hand),cached=ctx.models.get(key);if(cached)return cached;
 const all=legalOptions(hand,[]),index=new Map(hand.map((t,i)=>[t.id,i]));
 const groupCost=(o:LegalOption)=>1+(o.tiles.length===1?(67-power(o.tiles[0]))/67*.22:0);
 const packing=[...all].sort((a,b)=>b.tiles.length-a.tiles.length);
 const rough=(ts:Tile[])=>{const remaining=new Set(ts.map(t=>t.id));let value=0;for(const o of packing){
  if(!remaining.size)break;
  if(o.tiles.every(t=>remaining.has(t.id))){o.tiles.forEach(t=>remaining.delete(t.id));value+=groupCost(o);}
 }return value+remaining.size;};
 let cost:(ts:Tile[])=>number=rough;
 if(hand.length<=18){
  const groups=Array.from({length:hand.length},()=>[] as {mask:number,cost:number,size:number}[]),memo=new Map<number,number>([[0,0]]);let budget=4500;
  for(const o of all){const mask=o.tiles.reduce((m,t)=>m|(1<<index.get(t.id)!),0);for(const t of o.tiles)groups[index.get(t.id)!].push({mask,cost:groupCost(o),size:o.tiles.length});}
  groups.forEach(xs=>xs.sort((a,b)=>b.size-a.size||a.cost-b.cost));
  const visit=(mask:number):number=>{const hit=memo.get(mask);if(hit!==undefined)return hit;
   if(--budget<0){const value=rough(hand.filter((_,i)=>mask&(1<<i)));memo.set(mask,value);return value;}
   const first=31-Math.clz32(mask&-mask);let best=Infinity;
   for(const g of groups[first])if((mask&g.mask)===g.mask)best=Math.min(best,g.cost+visit(mask^g.mask));
   memo.set(mask,best);return best;
  };
  cost=ts=>visit(ts.reduce((m,t)=>m|(1<<index.get(t.id)!),0));
 }
 const result={all,cost};ctx.models.set(key,result);return result;
}
function chooseCount(n:number,k:number){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=Math.min(k,n-k);i++)v=v*(n-i+1)/i;return v;}
function atLeast(n:number,good:number,k:number,need:number){if(need<=0)return 1;if(k<need||good<need)return 0;const total=chooseCount(n,k);if(!total)return 0;let value=0;for(let i=need;i<=Math.min(k,good);i++)value+=chooseCount(good,i)*chooseCount(n-good,k-i)/total;return Math.min(1,value);}
function counterChance(tiles:Tile[],p:Position['players'][number],pool:Tile[]){
 const size=tiles.length;if(p.count<size)return 0;
 if(p.known.length>=size&&legalOptions(p.known,tiles).length)return 1;
 if(p.known.length===p.count)return 0;
 const hidden=Math.max(0,p.count-p.known.length),c=combo(tiles)!;
 if(size===1)return atLeast(pool.length,pool.filter(t=>power(t)>power(tiles[0])).length,hidden,1);
 if(size<5){let chance=0;const total=chooseCount(pool.length,hidden);if(!total)return 0;
  for(let n=1;n<=15;n++){const r=rank({id:0,n,s:0});if(r<c.key[1])continue;const known=p.known.filter(t=>t.n===n),unknown=pool.filter(t=>t.n===n);
   for(let mask=0;mask<(1<<unknown.length);mask++){const drawn=unknown.filter((_,i)=>mask&(1<<i));if(known.length+drawn.length<size)continue;
    if(r===c.key[1]&&![...known,...drawn].some(t=>suitRank(t.s)>c.key[2]))continue;
    chance+=chooseCount(pool.length-unknown.length,hidden-drawn.length)/total;
   }
  }return Math.min(.98,chance);
 }
 // Unknown five-card counters remain estimates; rollouts sample their actual families.
 return Math.min(.9,([0,.42,.30,.18,.07,.015][c.key[0]]??.2)*Math.max(.4,(p.count-3)/5));
}
function unanswerable(o:LegalOption,p:Position){
 const c=o.key;if(o.tiles.length<5&&c[1]===16&&c[2]===3)return true;
 if(o.tiles.length===5&&c[0]===5&&c[1]===17&&c[2]===3)return true;
 // On the current trick each opponent gets one chance before the lead returns.
 return p.players.every((s,i)=>i===p.me||s.count<o.tiles.length||(s.known.length===s.count&&!legalOptions(s.known,o.tiles).length));
}
function finish(p:Position,ctx:Context):BotAction|undefined{
 const hand=p.players[p.me].hand||[],options=p.trick.length?legalOptions(hand,p.trick):model(hand,ctx).all;
 const immediate=options.find(o=>o.tiles.length===hand.length);if(immediate)return {type:'play',tiles:immediate.tiles};
 // One truly unanswerable play followed by a whole-hand finish. Do not assume
 // counts or known hands remain unchanged across additional draw cycles.
 const forced=options.find(o=>!!combo(without(hand,o.tiles))&&unanswerable(o,p));
 return forced?{type:'play',tiles:forced.tiles}:undefined;
}
/** Bound candidate evaluation in unusually large/combinatorial hands while
 * retaining low/high and intermediate choices from every combination family. */
function shortlist(options:LegalOption[]){
 if(options.length<=128)return options;
 const families=new Map<string,LegalOption[]>();for(const o of options){const key=o.tiles.length+':'+o.label;let xs=families.get(key);if(!xs){xs=[];families.set(key,xs);}xs.push(o);}
 const out:LegalOption[]=[],each=Math.max(8,Math.floor(128/families.size));
 for(const xs of families.values()){if(xs.length<=each)out.push(...xs);else for(let i=0;i<each;i++)out.push(xs[Math.floor(i*(xs.length-1)/(each-1))]);}
 return out;
}
function rankActions(p:Position,ctx:Context):Candidate[]{
 const key=positionKey(p),cached=ctx.ranks.get(key);if(cached)return cached;
 const hand=p.players[p.me].hand||[],m=model(hand,ctx),before=m.cost(hand),others=p.players.filter((_,i)=>i!==p.me),pool=poolFor(p);
 const minCount=Math.min(...others.map(s=>s.count)),urgent=minCount<=2;
 const options=p.trick.length?legalOptions(hand,p.trick):m.all,out:Candidate[]=[];
 for(const o of shortlist(options)){const left=without(hand,o.tiles),after=m.cost(left),risks=others.map(s=>({s,chance:counterChance(o.tiles,s,pool)}));
  const control=risks.reduce((v,r)=>v*(1-r.chance),1),lose=risks.reduce((v,r)=>v+(r.s.count===o.tiles.length?r.chance:0),0);
  const close=!!combo(left),twos=o.tiles.filter(t=>t.n===2).length;
  const score=o.tiles.length*12+(before-after)*18+control*(urgent?20:10)
   -lose*180-o.tiles.reduce((v,t)=>v+power(t),0)*.025-twos*(close?4:20)
   +(close?control*65:0)+(urgent&&o.tiles.length>minCount?15:0);
  out.push({action:{type:'play',tiles:o.tiles},score});
 }
 if(p.trick.length){
  // A draw yields the turn. Include immediate finishes available to the next
  // opponent (or the old leader if the trick resets), not just our new grouping.
  const next=(p.me+1)%p.players.length,reset=next===p.lastBy;
  const threat=p.players.reduce((sum,s,i)=>{if(i===p.me)return sum;
   if(i===next&&reset){if(s.known.length===s.count)return sum+(combo(s.known)?1:0);return sum+(s.count===1?1:s.count<=3?.3:.08);}
   return sum+(s.count===p.trick.length?counterChance(p.trick,s,pool):0);
  },0);
  for(let index=0;index<p.stacks.length;index++){const s=p.stacks[index];if(!s.available)continue;
   let score=-12-threat*180;const t=s.lower;
   if(t){const augmented=[...hand,t],a=model(augmented,ctx),after=a.cost(augmented),matches=hand.filter(x=>x.n===t.n).length;
    const control=others.reduce((v,s)=>v*(1-counterChance([t],s,pool)),1);
    const setup=a.all.some(o=>o.tiles.some(x=>x.id===t.id)&&unanswerable(o,{...p,players:p.players.map((s,i)=>i===p.me?{...s,hand:augmented,count:augmented.length}:s)})&&!!combo(without(augmented,o.tiles)));
    score=(before-after)*18-9+matches*3+control*(hand.length<=10?28:18)+(setup?65:0)-threat*180;
    // Acquiring a publicly available stopper also denies it to later seats.
    if(t.n===2&&t.s===3)score+=8;
   }
   out.push({action:{type:'draw',index},score});
  }
  if(!p.stacks.some(s=>s.upper||s.lowerPresent))out.push({action:{type:'pass'},score:-12-threat*180});
 }
 out.sort((a,b)=>b.score-a.score||actionKey(a.action).localeCompare(actionKey(b.action)));ctx.ranks.set(key,out);return out;
}
function candidates(p:Position,ranked:Candidate[]){
 const result:Candidate[]=[],seen=new Set<string>();const add=(c:Candidate|undefined)=>{if(c&&!seen.has(actionKey(c.action))){seen.add(actionKey(c.action));result.push(c);}};
 ranked.filter(c=>c.action.type==='play').slice(0,5).forEach(add);
 ranked.filter(c=>c.action.type==='draw').slice(0,3).forEach(add);
 // Always examine the best candidate of every legal size, the strongest single
 // and every exposed red-two draw, even when its immediate score is low.
 for(const size of [1,2,3,5])add(ranked.find(c=>c.action.type==='play'&&c.action.tiles.length===size));
 add(ranked.filter(c=>c.action.type==='play'&&c.action.tiles.length===1).sort((a,b)=>power((b.action as {tiles:Tile[]}).tiles[0])-power((a.action as {tiles:Tile[]}).tiles[0]))[0]);
 add(ranked.find(c=>c.action.type==='draw'&&p.stacks[c.action.index].lower?.n===2&&p.stacks[c.action.index].lower?.s===3));
 add(ranked.find(c=>c.action.type==='pass'));return result;
}
function accessible(w:World,index:number){const stack=w.stacks[index];if(!stack||!stack[0]&&!stack[1])return false;const z=stack[1]?1:0,r=Math.floor(index/w.cols),c=index%w.cols;
 return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].some(([y,x])=>y<0||y>=w.rows||x<0||x>=w.cols||!w.stacks[y*w.cols+x]?.[z]);
}
function perspective(w:World):Position{return {me:w.turn,turn:w.turn,lastBy:w.lastBy,trick:w.trick,played:w.played,cols:w.cols,rows:w.rows,
 players:w.hands.map((h,i)=>({count:h.length,known:w.known[i],hand:i===w.turn?h:undefined})),stacks:w.stacks.map((s,i)=>({lower:s[1]?null:s[0],lowerPresent:!!s[0],upper:!!s[1],available:!!w.trick.length&&accessible(w,i)}))};}
function step(w:World,a:BotAction):World{
 const next={...w,hands:w.hands.slice(),known:w.known.slice(),stacks:w.stacks.slice()},who=w.turn;
 if(a.type==='play'){next.hands[who]=without(w.hands[who],a.tiles);next.known[who]=without(w.known[who],a.tiles);next.played=[...w.played,...a.tiles];next.trick=a.tiles;next.lastBy=who;if(!next.hands[who].length){next.winner=who;return next;}}
 else if(a.type==='draw'){const st=w.stacks[a.index],z=st[1]?1:0,t=st[z]!;next.stacks[a.index]=st.slice();next.stacks[a.index][z]=null;next.hands[who]=[...w.hands[who],t];if(!z)next.known[who]=[...w.known[who],t];}
 next.turn=(who+1)%w.hands.length;if(next.turn===next.lastBy){next.trick=[];next.lastBy=null;}return next;
}
/** Fill only unknown slots, without replacement. A malformed/stale position
 * falls back to the public heuristic instead of inventing duplicate tiles. */
function sample(p:Position,random:()=>number):World|null{
 const visible=[...(p.players[p.me].hand||[]),...p.players.flatMap((s,i)=>i===p.me?[]:s.known),...p.stacks.flatMap(s=>s.lower?[s.lower]:[])];
 if(new Set(visible.map(t=>t.id)).size!==visible.length)return null;
 if(visible.some(t=>p.played.some(x=>x.id===t.id)||p.trick.some(x=>x.id===t.id)))return null;
 const pool=poolFor(p).slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const take=()=>pool.pop()||null,hands:Tile[][]=[];
 for(let i=0;i<p.players.length;i++){const s=p.players[i],h=i===p.me?(s.hand||[]).slice():s.known.slice();if(h.length>s.count)return null;
  while(h.length<s.count){const t=take();if(!t)return null;h.push(t);}hands.push(h);
 }
 const stacks:(Tile|null)[][]=[];for(const s of p.stacks){const lower=s.lower||(s.lowerPresent?take():null),upper=s.upper?take():null;if(s.lowerPresent&&!lower||s.upper&&!upper)return null;stacks.push([lower,upper]);}
 return {hands,known:p.players.map(s=>s.known.slice()),stacks,turn:p.turn,lastBy:p.lastBy,trick:p.trick,played:p.played,cols:p.cols,rows:p.rows,winner:null};
}
function settlement(w:World,me:number){return w.hands.reduce((v,h)=>v+h.length,0)-w.hands[me].length*w.hands.length;}
function terminal(w:World,me:number){return (w.winner===me?400:-350)+settlement(w,me)*2;}
function leaf(w:World,me:number,ctx:Context){
 if(w.winner!==null)return terminal(w,me);
 const values=w.hands.map((h,i)=>{const m=model(h,ctx);let v=-m.cost(h)*22-h.length*3;
  const strongest=h.filter(t=>t.n===2).length;v+=strongest*6;
  if(w.turn===i&&!w.trick.length)v+=12;
  if(w.lastBy===i)v+=6;
  return v;
 });return values[me]-Math.max(...values.filter((_,i)=>i!==me))*.9+settlement(w,me);
}
function allActions(w:World){const out:BotAction[]=legalOptions(w.hands[w.turn],w.trick).map(o=>({type:'play',tiles:o.tiles}));if(w.trick.length){w.stacks.forEach((_,index)=>{if(accessible(w,index))out.push({type:'draw',index});});if(!w.stacks.some(s=>s[0]||s[1]))out.push({type:'pass'});}return out;}
function worldKey(w:World){return [w.turn,w.lastBy,handKey(w.trick),...w.hands.map(handKey),w.stacks.map(s=>s.map(t=>t?.id??-1).join('.')).join('/')].join('|');}
/** Fully public small endgames use exhaustive selfish-opponent (MaxN) search.
 * No partially completed result is represented as a proof. */
function exact(p:Position,w:World,ranked:Candidate[]):{action:BotAction,nodes:number}|null{
 if(p.players.some((s,i)=>i!==p.me&&s.known.length!==s.count)||p.stacks.some(s=>s.upper||s.lowerPresent&&!s.lower))return null;
 const total=w.hands.reduce((n,h)=>n+h.length,0)+w.stacks.filter(s=>s[0]).length;if(total>15||w.stacks.filter(s=>s[0]).length>2)return null;
 const memo=new Map<string,number[]>();let nodes=0;const stopped={};
 // Two-player utility is zero-sum, so alpha-beta can prove substantially more
 // of the endgame within the same bounded budget. Cache bounds, not cutoffs as facts.
 const bounds=new Map<string,{value:number,flag:'exact'|'lower'|'upper'}>();
 const duel=(state:World,alpha:number,beta:number):number=>{
  if(++nodes>30000)throw stopped;
  if(state.winner!==null)return (state.winner===p.me?10000:-10000)+settlement(state,p.me)*10;
  const key=worldKey(state),a0=alpha,b0=beta,hit=bounds.get(key);
  if(hit){if(hit.flag==='exact')return hit.value;if(hit.flag==='lower')alpha=Math.max(alpha,hit.value);else beta=Math.min(beta,hit.value);if(alpha>=beta)return hit.value;}
  const maximizing=state.turn===p.me;let best=maximizing?-Infinity:Infinity;
  const actions=allActions(state).sort((a,b)=>(b.type==='play'?b.tiles.length:0)-(a.type==='play'?a.tiles.length:0));
  for(const a of actions){const value=duel(step(state,a),alpha,beta);best=maximizing?Math.max(best,value):Math.min(best,value);if(maximizing)alpha=Math.max(alpha,best);else beta=Math.min(beta,best);if(alpha>=beta)break;}
  bounds.set(key,{value:best,flag:best<=a0?'upper':best>=b0?'lower':'exact'});return best;
 };
 const visit=(state:World):number[]=>{if(++nodes>18000)throw stopped;
  if(state.winner!==null)return state.hands.map((_,i)=>(state.winner===i?10000:-10000)+settlement(state,i)*10);
  const key=worldKey(state),cached=memo.get(key);if(cached)return cached;
  let best:number[]|undefined;for(const a of allActions(state)){const score=visit(step(state,a));if(!best||score[state.turn]>best[state.turn])best=score;}
  if(!best)throw stopped;memo.set(key,best);return best;
 };
 try{let best:BotAction|undefined,bestScore=-Infinity;
  const ordered=[...ranked.map(c=>c.action)],seen=new Set(ordered.map(actionKey));for(const a of allActions(w))if(!seen.has(actionKey(a)))ordered.push(a);
  for(const action of ordered){const next=step(w,action),value=w.hands.length===2?duel(next,bestScore,Infinity):visit(next)[p.me];if(value>bestScore){best=action;bestScore=value;}}
  return best?{action:best,nodes}:null;
 }catch(e){if(e!==stopped)throw e;return null;}
}

export function stageBotProfile(level:number){
 if(!Number.isInteger(level)||level<1||level>10)throw Error('AI 난이도는 1~10 사이여야 해요.');
 return {level,samples:[0,0,0,2,3,4,5,6,8,10][level-1],plies:[0,0,0,6,10,12,14,16,20,24][level-1],exact:level>=7,scoreRisk:Math.max(0,level-7)};
}
function introductoryDecision(p:Position,ctx:Context,level:number):BotAction{
 const hand=p.players[p.me].hand||[],options=legalOptions(hand,p.trick),immediate=options.find(o=>o.tiles.length===hand.length);
 if(immediate)return {type:'play',tiles:immediate.tiles};
 const m=level===2?model(hand,ctx):null;
 const ranked=options.map(o=>({o,score:o.tiles.length*12-o.tiles.reduce((n,t)=>n+power(t),0)*.08+(m?(m.cost(hand)-m.cost(without(hand,o.tiles)))*18:0)})).sort((a,b)=>b.score-a.score||a.o.id.localeCompare(b.o.id));
 if(ranked.length)return {type:'play',tiles:ranked[0].o.tiles};
 const floor=p.stacks.map((s,index)=>({s,index,value:s.lower?hand.filter(t=>t.n===s.lower!.n).length*5+power(s.lower)*.03:0})).filter(s=>s.s.available).sort((a,b)=>b.value-a.value||a.index-b.index);
 return floor.length?{type:'draw',index:floor[0].index}:{type:'pass'};
}
export function analyzeBotDecision(input:BotPosition,level?:number):BotAnalysis{
 const profile=level===undefined?null:stageBotProfile(level),p=publicPosition(input),ctx=context();
 if(profile&&profile.level<=2)return {action:introductoryDecision(p,ctx,profile.level),method:'heuristic',samples:0,candidates:legalOptions(p.players[p.me].hand||[],p.trick).length,nodes:0};
 if(!profile||profile.level>=7)inferForcedCards(p);
 const forced=finish(p,ctx);
 if(forced)return {action:forced,method:'finish',samples:0,candidates:1,nodes:0};
 const ranked=rankActions(p,ctx);if(!ranked.length)return {action:{type:'pass'},method:'heuristic',samples:0,candidates:0,nodes:0};
 if(profile&&profile.level===3)return {action:ranked[0].action,method:'heuristic',samples:0,candidates:ranked.length,nodes:0};
 const random=randomFor(p),first=sample(p,random);
 if(first&&(!profile||profile.exact)){const solved=exact(p,first,ranked);if(solved)return {...solved,method:'exact',samples:1,candidates:ranked.length};}
 const roots=candidates(p,ranked);
 if(!first||roots.length===1||(p.players[p.me].hand?.length||0)>20)return {action:ranked[0].action,method:'heuristic',samples:0,candidates:ranked.length,nodes:0};
 const worlds=[first];const count=profile?.samples??(p.players.length===2?10:8);
 for(let i=1;i<count;i++){const w=sample(p,random);if(w)worlds.push(w);}
 const depth=profile?.plies??p.players.length*4+4;let nodes=0;
 const evaluated=roots.map(root=>{let sum=0,squares=0;
  for(const w of worlds){let state=step(w,root.action);
   for(let ply=0;ply<depth&&state.winner===null;ply++){
    const pos=perspective(state),a=finish(pos,ctx)||rankActions(pos,ctx)[0]?.action;if(!a)break;
    state=step(state,a);nodes++;
   }
   const risk=profile?.scoreRisk||0,delta=settlement(state,p.me),balance=(input.players[input.me].points||0)+delta;
   const value=leaf(state,p.me,ctx)+risk*delta*.6-(risk&&balance<=0?400+risk*50:risk*Math.max(0,40-balance)*.5);sum+=value;squares+=value*value;
  }
  const mean=sum/worlds.length,deviation=Math.sqrt(Math.max(0,squares/worlds.length-mean*mean));
  return {root,value:mean-deviation*.10+root.score*.10};
 });
 evaluated.sort((a,b)=>b.value-a.value||b.root.score-a.root.score);
 return {action:evaluated[0].root.action,method:'lookahead',samples:worlds.length,candidates:roots.length,nodes};
}
export function chooseStrategicAction(p:BotPosition,level?:number):BotAction{return analyzeBotDecision(p,level).action;}
