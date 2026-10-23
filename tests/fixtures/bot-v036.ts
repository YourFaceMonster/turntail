// Frozen 0.3.6 policy for reproducible strategy comparisons; never imported by the app.
import {rank,suitRank,combo,beats,legalOptions,type Tile,type LegalOption,type BotPosition,type BotAction} from '../../lib/game.ts';
function cmp(a:number[],b:number[]){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;}
const strength=(t:Tile)=>rank(t)*4+suitRank(t.s);
/** Only the bot's hand and information already public at the table enter this policy. */
export function chooseLegacyAction(position:BotPosition):BotAction{
 const hand=position.players[position.me]?.hand||[],others=position.players.filter((_,i)=>i!==position.me);
 const options=legalOptions(hand,position.trick),all=position.trick.length?legalOptions(hand,[]):options;
 const winning=options.find(o=>o.tiles.length===hand.length);if(winning)return {type:'play',tiles:winning.tiles};
 // Secure first place when an unanswerable play leaves one complete final combination.
 const forced=secureFinish(position,hand,options);
 if(forced)return {type:'play',tiles:forced.tiles};

 const minCount=Math.min(...others.map(p=>p.count)),urgent=minCount===1||(minCount===2&&position.trick.length!==1);
 const plan=handPlan(hand,all),before=plan(hand),used=new Set([...hand,...position.played,...position.stacks.flatMap(s=>s.lower?[s.lower]:[]),...others.flatMap(p=>p.known)].map(t=>t.id));
 const pool:Tile[]=[];for(let n=1;n<=15;n++)for(let s=0;s<4;s++){const t={id:(n-1)*4+s,n,s};if(!used.has(t.id))pool.push(t);}
 let best:LegalOption|undefined,bestScore=-Infinity,bestAfter=Infinity;
 for(const o of options){
  const ids=new Set(o.tiles.map(t=>t.id)),remaining=hand.filter(t=>!ids.has(t.id)),after=plan(remaining);
  const risks=others.map(p=>({p,beat:counterChance(o.tiles,p.count,p.known,pool)}));
  const control=risks.reduce((v,r)=>v*(1-r.beat),1),otherTotal=others.reduce((v,p)=>v+p.count,0),settlementRisk=risks.reduce((v,r)=>v+(r.p.count===o.tiles.length?r.beat*Math.max(0,remaining.length*others.length-(otherTotal-r.p.count)):0),0);
  const blocksLeader=others.some(p=>p.count===minCount&&p.count<o.tiles.length);
  const consumed=o.tiles.reduce((v,t)=>v+strength(t),0)/4;
  // Settlement is pairwise remaining-count differences: every shed tile saves points.
  // Under threat prefer batches the leader cannot answer, and high singles to hold the lead.
  const twos=o.tiles.filter(t=>t.n===2).length,finishingCombo=!!combo(remaining);
  const twoCost=twos*(finishingCombo?7:o.tiles.length===5?14:30)+(twos&&!finishingCombo&&control>.98?12:0);
  const score=urgent?o.tiles.length*32+(before-after)*9+control*18
   +(blocksLeader?20:0)-settlementRisk*2.5-consumed*.04-after:
   o.tiles.length*32+(before-after)*9-twoCost-consumed*.12-after;

  if(score>bestScore+1e-8){best=o;bestScore=score;bestAfter=after;}
 }
 const available=position.stacks.map((s,index)=>({s,index})).filter(x=>x.s.available);
 let draw=available[0],drawValue=-Infinity,drawPlan=Infinity;
 for(const candidate of available){const t=candidate.s.lower;let value=-5,nextPlan=Infinity;
  if(t){const matches=hand.filter(x=>x.n===t.n).length,augmented=[...hand,t],future=legalOptions(augmented,[]);nextPlan=handPlan(augmented,future)(augmented);
   const linked=future.filter(o=>o.tiles.length>=3&&o.tiles.some(x=>x.id===t.id));
   value=(before-nextPlan)*30+matches*6+(linked.some(o=>o.tiles.length===5)?12:0)+(rank(t)>=15?3:0);
  }
  if(value>drawValue){draw=candidate;drawValue=value;drawPlan=nextPlan;}
 }
 // A known lower tile can complete a five-tile combination and save more turns than
 // the current small play. Hidden upper tiles are never evaluated for their identity.
 if(best&&position.trick.length>0&&!urgent&&minCount>=3&&best.tiles.length<=2&&draw?.s.lower&&drawPlan+1<bestAfter&&drawPlan<before)return {type:'draw',index:draw.index};
 if(best)return {type:'play',tiles:best.tiles};
 return draw?{type:'draw',index:draw.index}:{type:'pass'};
}
function handPlan(hand:Tile[],all:LegalOption[]){
 const index=new Map(hand.map((t,i)=>[t.id,i])),cache=new Map<number,number>([[0,0]]);let budget=6000;
 const rough=(ts:Tile[])=>{const groups=new Map<number,number>();for(const t of ts)groups.set(t.n,(groups.get(t.n)||0)+1);return [...groups.values()].reduce((n,k)=>n+Math.ceil(k/3),0);};
 if(hand.length>16)return rough;
 const groups=Array.from({length:hand.length},()=>[] as {mask:number,count:number}[]);
 for(const o of all){const mask=o.tiles.reduce((m,t)=>m|(1<<index.get(t.id)!),0);for(const t of o.tiles)groups[index.get(t.id)!].push({mask,count:o.tiles.length});}
 groups.forEach(xs=>xs.sort((a,b)=>b.count-a.count));
 const visit=(mask:number):number=>{const cached=cache.get(mask);if(cached!==undefined)return cached;const count=bitCount(mask);if(--budget<0)return Math.ceil(count/3)+.5;const first=31-Math.clz32(mask&-mask);let value=count;
 for(const g of groups[first])if((mask&g.mask)===g.mask){value=Math.min(value,1+visit(mask^g.mask));if(value<=Math.ceil(count/5))break;}
 cache.set(mask,value);return value;};
 return (ts:Tile[])=>visit(ts.reduce((m,t)=>m|(1<<index.get(t.id)!),0));
}
function bitCount(mask:number){let n=0;while(mask){mask&=mask-1;n++;}return n;}
function chooseCount(n:number,k:number){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=Math.min(k,n-k);i++)v=v*(n-i+1)/i;return v;}
function atLeast(n:number,good:number,k:number,needed:number){if(needed<=0)return 1;if(k<needed||good<needed||!n)return 0;const total=chooseCount(n,k);if(!total)return 0;let value=0;for(let i=needed;i<=Math.min(k,good);i++)value+=chooseCount(good,i)*chooseCount(n-good,k-i)/total;return Math.min(1,value);}
function counterChance(tiles:Tile[],count:number,known:Tile[],pool:Tile[]){
 const size=tiles.length;if(count<size)return 0;if(known.length===count)return legalOptions(known,tiles).length?1:0;
 const hidden=Math.max(0,count-known.length),c=combo(tiles)!;
 if(size===1){if(known.some(t=>beats([t],tiles)))return 1;return atLeast(pool.length,pool.filter(t=>beats([t],tiles)).length,hidden,1);}
 if(size===2||size===3){let chance=0;const power=c.key[1],suit=c.key[2],total=chooseCount(pool.length,hidden);for(let n=1;n<=15;n++){const r=rank({id:0,n,s:0});if(r<power)continue;const visible=known.filter(t=>t.n===n),unknown=pool.filter(t=>t.n===n);
 if(visible.length>=size&&(r>power||visible.some(t=>suitRank(t.s)>suit)))return 1;
 if(!total)continue;
 for(let mask=0;mask<(1<<unknown.length);mask++){const subset=unknown.filter((_,i)=>mask&(1<<i));if(visible.length+subset.length<size)continue;if(r===power&&![...visible,...subset].some(t=>suitRank(t.s)>suit))continue;chance+=chooseCount(pool.length-unknown.length,hidden-subset.length)/total;}}
 return Math.min(.98,chance);}

 // Unknown five-tile counters are estimated by family strength; exact known hands use rules above.
 return Math.min(.9,([.45,.34,.22,.10,.025,0][c.key[0]]||.01)*Math.max(.4,(count-3)/5));
}

/** Search two control plays plus the finish; only use public information. */
function secureFinish(position:BotPosition,hand:Tile[],options:LegalOption[]):LegalOption|undefined{
 const others=position.players.filter((_,i)=>i!==position.me),floor=position.stacks.reduce((n,s)=>n+Number(s.upper)+Number(s.lowerPresent),0);
 let budget=350;const guaranteed=(o:LegalOption)=>{const c=combo(o.tiles)!;return (o.tiles.length<5?c.key[1]===16&&c.key[2]===3:c.key[0]===5&&c.key[1]===17&&c.key[2]===3)||others.every(p=>p.count<o.tiles.length||(p.known.length===p.count&&!legalOptions(p.known,o.tiles).length));};
 const search=(ts:Tile[],moves:LegalOption[],depth:number):{move:LegalOption,gain:number}|null=>{let best:{move:LegalOption,gain:number}|null=null;
 for(const o of moves){if(--budget<0)break;if(!guaranteed(o))continue;const ids=new Set(o.tiles.map(t=>t.id)),left=ts.filter(t=>!ids.has(t.id));if(!left.length)continue;
 const drawGain=Math.min(floor,others.length),finishes=!!combo(left);let gain=finishes?drawGain:-Infinity;
 // Additional guaranteed controls are safe only if the hand already has a certain finish.
 if(finishes&&depth>0&&left.length<=8&&floor>drawGain){const follow=search(left,legalOptions(left,[]),depth-1);if(follow)gain=Math.max(gain,drawGain+follow.gain);}
 if(Number.isFinite(gain)&&(!best||gain>best.gain))best={move:o,gain};
 }return best;};return search(hand,options,1)?.move;
}
