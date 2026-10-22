export type Tile = {id:number,n:number,s:number};
export type Player = {id:string,token:string,name:string,hand:Tile[],wins:number,bot?:boolean,points?:number,losses?:number,games?:number,profile?:string,avatar?:string};
export type RoundResult = {id:string,at:number,round:number,players:{id:string,name:string,count:number,place:number,delta:number,total:number,winner:boolean}[],transfers:{from:number,to:number,points:number}[]};
export type GameEvent = {id:string,type:string,who:number,index?:number,tiles?:Tile[],label?:string};
export type ChatMessage={id:string,who:number,name:string,text:string,at:number};
export type Game = {code:string,phase:"lobby"|"playing"|"ended",players:Player[],stacks:(Tile|null)[][],turn:number,lastBy:number|null,trick:Tile[],log:string[],winner:number|null,round:number,practice:boolean,capacity?:number,cols?:number,rows?:number,result?:RoundResult|null,lastEvent?:GameEvent,chat?:ChatMessage[],opening?:{who:number,tile:Tile}};
export function uid(){if(typeof crypto.randomUUID==="function")return crypto.randomUUID();const a=new Uint8Array(16);crypto.getRandomValues(a);a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;const h=Array.from(a,n=>n.toString(16).padStart(2,"0")).join("");return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
export const suits = ["구름","별","달","해"];
export const symbols = ["☁","✦","☾","☀"];
export function suitRank(s:number){return [0,2,1,3][s];}
export function rank(t:Tile){return t.n===2?16:t.n===1?15:t.n-1;}
export function sorted(ts:Tile[]){return [...ts].sort((a,b)=>rank(a)-rank(b)||suitRank(a.s)-suitRank(b.s));}
function cmp(a:number[],b:number[]){for(let i=0;i<Math.max(a.length,b.length);i++){let d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;}
export function combo(ts:Tile[]):{label:string,key:number[]}|null {
 if(![1,2,3,5].includes(ts.length)||new Set(ts.map(t=>t.id)).size!==ts.length)return null;
 const ss=sorted(ts),max=ss[ss.length-1];
 if(ts.length===1)return {label:"싱글",key:[0,rank(max),suitRank(max.s)]};
 const groups=new Map<number,Tile[]>();for(const t of ts)groups.set(t.n,[...(groups.get(t.n)||[]),t]);
 if(ts.length<5)return groups.size===1?{label:ts.length===2?"페어":"트리플",key:[0,rank(max),suitRank(max.s)]}:null;
 const nums=[...groups.keys()].sort((a,b)=>a-b),flush=ts.every(t=>t.s===ts[0].s);
 let straight=nums.length===5&&nums.every((n,i)=>i===0||n===nums[i-1]+1);
 if(nums.join(",")==="1,12,13,14,15")straight=true;
 const straightKey=[nums.join(",")==="1,2,3,4,5"?17:rank(max),suitRank(max.s)];
 if(straight&&flush)return {label:"스트레이트 플러시",key:[5,...straightKey]};
 const four=[...groups.values()].find(g=>g.length===4),three=[...groups.values()].find(g=>g.length===3);
 if(four)return {label:"포카드",key:[4,rank(four[0])]};
 if(three&&groups.size===2)return {label:"풀하우스",key:[3,rank(three[0])]};
 if(flush)return {label:"플러시",key:[2,...[...ss].reverse().map(rank),suitRank(max.s)]};
 if(straight)return {label:"스트레이트",key:[1,...straightKey]};
 return null;
}
export function beats(ts:Tile[],old:Tile[]){const a=combo(ts),b=combo(old);return !!a&&(!old.length||(ts.length===old.length&&!!b&&cmp(a.key,b.key)>0));}
export function capacity(g:Game){return g.capacity||3;}
export function dimensions(g:Game){const cols=g.cols||(capacity(g)===2?6:capacity(g)===4?3:g.stacks.length===15?5:4);return {cols,rows:g.rows||Math.ceil(g.stacks.length/cols)};}
export function accessible(g:Game,i:number){
 const st=g.stacks[i];if(!st||(!st[0]&&!st[1]))return false;
 const {cols,rows}=dimensions(g),z=st[1]?1:0,r=Math.floor(i/cols),c=i%cols;
 return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].some(([y,x])=>y<0||y>=rows||x<0||x>=cols||!g.stacks[y*cols+x]?.[z]);
}
export function player(name:string,bot=false):Player{return {id:uid(),token:uid(),name:name.trim().slice(0,12)||"플레이어",hand:[],wins:0,losses:0,games:0,points:0,bot};}
export function room(code:string,p:Player,practice=false,size=3):Game{
 if(![2,3,4].includes(size))throw Error("2·3·4인 중 선택해 주세요.");
 return {code,phase:"lobby",players:[p],stacks:[],turn:0,lastBy:null,trick:[],log:[],winner:null,round:0,practice,capacity:size,result:null};
}
export function lowestHandLead(players:Player[]){
 const candidates=players.flatMap((p,who)=>p.hand.map(tile=>({who,tile})));
 if(!candidates.length)throw Error("선 결정에 필요한 손패가 없어요.");
 return candidates.reduce((best,t)=>rank(t.tile)*4+suitRank(t.tile.s)<rank(best.tile)*4+suitRank(best.tile.s)?t:best);
}
export function startingHandSize(size:number){return size===3?10:12;}
export function start(g:Game){
 if(g.players.length!==capacity(g))throw Error(`${capacity(g)}명이 모이면 시작할 수 있어요.`);
 const deck:Tile[]=[];for(let n=1;n<=15;n++)for(let s=0;s<4;s++)deck.push({id:(n-1)*4+s,n,s});
 for(let i=deck.length-1;i>0;i--){let x=new Uint32Array(1);crypto.getRandomValues(x);const j=x[0]%(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
 for(const p of g.players)p.hand=sorted(deck.splice(0,startingHandSize(capacity(g))));
 const stacks=deck.length/2;g.stacks=Array.from({length:stacks},()=>[deck.shift()!,deck.shift()!]);
 g.cols=capacity(g)===2?6:capacity(g)===4?3:5;g.rows=Math.ceil(stacks/g.cols);
 g.opening=lowestHandLead(g.players);g.turn=g.opening.who;
 g.phase="playing";g.trick=[];g.lastBy=null;g.winner=null;g.result=null;g.round++;g.log=[`라운드 ${g.round} · 첫 선 ${g.players[g.turn].name} (${suits[g.opening.tile.s]} ${g.opening.tile.n})`];
 g.lastEvent={id:uid(),type:"deal",who:g.turn};
}
function note(g:Game,s:string){g.log=[s,...g.log].slice(0,40);}
export function settle(g:Game):RoundResult{
 if(g.result)return g.result;
 if(g.phase!=="ended"||g.winner===null)throw Error("라운드가 끝난 뒤 정산합니다.");
 const counts=g.players.map(p=>p.hand.length),delta=counts.map(()=>0),transfers:RoundResult["transfers"]=[];
 for(let i=0;i<counts.length;i++)for(let j=i+1;j<counts.length;j++){
  const diff=counts[j]-counts[i];delta[i]+=diff;delta[j]-=diff;
  if(diff)transfers.push({from:diff>0?j:i,to:diff>0?i:j,points:Math.abs(diff)});
 }
 const players=g.players.map((p,i)=>{p.points=(p.points||0)+delta[i];p.games=(p.games||0)+1;if(i===g.winner)p.wins++;else p.losses=(p.losses||0)+1;
 return {id:p.id,name:p.name,count:counts[i],place:1+counts.filter(c=>c<counts[i]).length,delta:delta[i],total:p.points,winner:i===g.winner};});
 g.result={id:`${g.code}:${g.round}`,at:Date.now(),round:g.round,players,transfers};return g.result;
}
export function act(g:Game,who:number,action:string,ids:number[]=[],index=-1){
 if(g.phase!=="playing"||g.turn!==who)throw Error("지금은 내 차례가 아니에요.");const p=g.players[who];
 if(action==="play"){
  if(!ids.length||new Set(ids).size!==ids.length)throw Error("낼 타일을 선택해 주세요.");
  const ts=ids.map(id=>p.hand.find(t=>t.id===id));if(ts.some(t=>!t))throw Error("손패를 다시 확인해 주세요.");
  const tiles=ts as Tile[];if(!beats(tiles,g.trick))throw Error("같은 개수의 더 높은 조합을 내야 해요.");
  p.hand=p.hand.filter(t=>!ids.includes(t.id));g.trick=tiles;g.lastBy=who;
  g.lastEvent={id:uid(),type:"play",who,tiles,label:combo(tiles)!.label};
  note(g,`${p.name} · ${combo(tiles)!.label} ${tiles.length}개 제출`);
  if(!p.hand.length){g.phase="ended";g.winner=who;settle(g);note(g,`${p.name} 승리! 손패를 모두 냈습니다.`);return;}
 }else if(action==="draw"){
  if(!Number.isInteger(index)||!accessible(g,index))throw Error("밝게 표시된 외곽 타일만 가져올 수 있어요.");
  const z=g.stacks[index][1]?1:0,t=g.stacks[index][z]!;g.stacks[index][z]=null;p.hand=sorted([...p.hand,t]);
  g.lastEvent={id:uid(),type:"draw",who,index};note(g,`${p.name} · ${z===1?"위층 비공개":"아래층 공개"} 패 1개 가져오기`);
 }else if(action==="pass"){
  if(g.stacks.some(s=>s[0]||s[1]))throw Error("바닥 패가 남아 있으면 내거나 가져와야 해요.");
  if(!g.trick.length)throw Error("새 선에서는 타일을 내야 해요.");g.lastEvent={id:uid(),type:"pass",who};note(g,`${p.name} · 패스`);
 }else throw Error("지원하지 않는 동작이에요.");
 g.turn=(who+1)%g.players.length;
 if(g.lastBy===g.turn){g.trick=[];g.lastBy=null;note(g,`${g.players[g.turn].name}이 선을 잡았습니다.`);}
}
export function view(g:Game,token:string){
 const me=g.players.findIndex(p=>p.token===token);if(me<0)throw Error("입장 정보가 없어요. 방 코드로 다시 입장해 주세요.");
 return {code:g.code,phase:g.phase,capacity:capacity(g),...dimensions(g),turn:g.turn,lastBy:g.lastBy,trick:g.trick,log:g.log,winner:g.winner,round:g.round,practice:g.practice,chat:g.chat||[],opening:g.opening||null,result:g.result||null,lastEvent:g.lastEvent,me,
 players:g.players.map((p,i)=>({id:p.id,name:p.name,avatar:p.avatar||"",count:p.hand.length,wins:p.wins,losses:p.losses||0,games:p.games||0,points:p.points||0,bot:p.bot,hand:i===me||g.phase==="ended"?p.hand:undefined})),
 stacks:g.stacks.map((s,i)=>({lower:s[1]?null:s[0],lowerPresent:!!s[0],upper:!!s[1],available:accessible(g,i)}))};
}
export function findMove(hand:Tile[],trick:Tile[]):Tile[]|null{
 const h=sorted(hand),counts=trick.length?[trick.length]:[5,3,2,1];
 for(const size of counts){if(h.length<size)continue;let chosen:Tile[]|null=null,budget=18000;
 function search(at:number,ts:Tile[]){if(chosen||--budget<0)return;if(ts.length===size){if(beats(ts,trick))chosen=[...ts];return;}
 for(let i=at;i<=h.length-(size-ts.length);i++){search(i+1,[...ts,h[i]]);if(chosen||budget<0)return;}}
 search(0,[]);if(chosen)return chosen;
 }return null;
}
export function botMove(g:Game){
 const who=g.turn,p=g.players[who];if(!p.bot||g.phase!=="playing")return;
 const choice=findMove(p.hand,g.trick);if(choice)act(g,who,"play",choice.map(t=>t.id));
 else {const visible=view(g,p.token),available=visible.stacks.map((_,i)=>i).filter(i=>visible.stacks[i].available);
 // Draw choices use the same revealed floor information that human players receive.
 let best=available[0];for(const i of available){const lower=visible.stacks[i].lower;if(lower&&p.hand.some(t=>t.n===lower.n)){best=i;break;}}
 if(best!==undefined)act(g,who,"draw",[],best);else act(g,who,"pass");}
}

export type LegalOption={id:string,label:string,tiles:Tile[],key:number[]};
/** Enumerate valid patterns directly so large hands do not scan every invalid five-tile set. */
export function legalOptions(hand:Tile[],trick:Tile[]):LegalOption[]{
 const h=sorted(hand),wanted=trick.length,byNum=new Map<number,Tile[]>(),bySuit=new Map<number,Tile[]>(),out:LegalOption[]=[],seen=new Set<string>();
 for(const t of h){byNum.set(t.n,[...(byNum.get(t.n)||[]),t]);bySuit.set(t.s,[...(bySuit.get(t.s)||[]),t]);}
 const add=(tiles:Tile[])=>{const id=tiles.map(t=>t.id).sort((a,b)=>a-b).join(',');if(seen.has(id))return;seen.add(id);const c=combo(tiles);if(c&&beats(tiles,trick))out.push({id,label:c.label,tiles:sorted(tiles),key:c.key});};
 const choose=(xs:Tile[],n:number,fn:(ts:Tile[])=>void)=>{function visit(at:number,ts:Tile[]){if(ts.length===n){fn(ts);return;}for(let i=at;i<=xs.length-(n-ts.length);i++)visit(i+1,[...ts,xs[i]]);}if(xs.length>=n)visit(0,[]);};
 if(!wanted||wanted===1)h.forEach(t=>add([t]));
 for(const n of [2,3])if(!wanted||wanted===n)for(const xs of byNum.values())choose(xs,n,add);
 if(!wanted||wanted===5){
  for(const xs of bySuit.values())choose(xs,5,add);
  for(let first=1;first<=12;first++){
   const ns=first===12?[12,13,14,15,1]:Array.from({length:5},(_,i)=>first+i);
   if(!ns.every(n=>byNum.has(n)))continue;
   function product(at:number,ts:Tile[]){if(at===5){add(ts);return;}for(const t of byNum.get(ns[at])!)product(at+1,[...ts,t]);}product(0,[]);
  }
  for(const [n,xs] of byNum){
   if(xs.length===4)for(const other of h)if(other.n!==n)add([...xs,other]);
   choose(xs,3,three=>{for(const [m,ys] of byNum)if(m!==n)choose(ys,2,two=>add([...three,...two]));});
  }
 }
 return out.sort((a,b)=>a.tiles.length-b.tiles.length||cmp(a.key,b.key)||a.id.localeCompare(b.id));
}
