export type Tile = {id:number,n:number,s:number};
export type Player = {id:string,token:string,name:string,hand:Tile[],wins:number,bot?:boolean};
export type Game = {code:string,phase:"lobby"|"playing"|"ended",players:Player[],stacks:(Tile|null)[][],turn:number,lastBy:number|null,trick:Tile[],log:string[],winner:number|null,round:number,practice:boolean};
export const suits = ["구름","별","달","해"];
export const symbols = ["☁","✦","☾","☀"];
export function rank(t:Tile){return t.n===2?16:t.n===1?15:t.n-1;}
export function sorted(ts:Tile[]){return [...ts].sort((a,b)=>rank(a)-rank(b)||a.s-b.s);}
function cmp(a:number[],b:number[]){for(let i=0;i<Math.max(a.length,b.length);i++){let d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;}
export function combo(ts:Tile[]):{label:string,key:number[]}|null {
 if(![1,2,3,5].includes(ts.length)||new Set(ts.map(t=>t.id)).size!==ts.length)return null;
 const ss=sorted(ts),max=ss[ss.length-1];
 if(ts.length===1)return {label:"싱글",key:[0,rank(max),max.s]};
 const groups=new Map<number,Tile[]>();for(const t of ts)groups.set(t.n,[...(groups.get(t.n)||[]),t]);
 if(ts.length<5)return groups.size===1?{label:ts.length===2?"페어":"트리플",key:[0,rank(max),max.s]}:null;
 const nums=[...groups.keys()].sort((a,b)=>a-b),flush=ts.every(t=>t.s===ts[0].s);
 let straight=nums.length===5&&nums.every((n,i)=>i===0||n===nums[i-1]+1);
 if(nums.join(",")==="1,12,13,14,15")straight=true;
 const straightKey=[nums.join(",")==="1,2,3,4,5"?17:rank(max),max.s];
 if(straight&&flush)return {label:"스트레이트 플러시",key:[5,...straightKey]};
 const four=[...groups.values()].find(g=>g.length===4),three=[...groups.values()].find(g=>g.length===3);
 if(four)return {label:"포카드",key:[4,rank(four[0])]};
 if(three&&groups.size===2)return {label:"풀하우스",key:[3,rank(three[0])]};
 if(flush)return {label:"플러시",key:[2,...[...ss].reverse().map(rank),max.s]};
 if(straight)return {label:"스트레이트",key:[1,...straightKey]};
 return null;
}
export function beats(ts:Tile[],old:Tile[]){const a=combo(ts),b=combo(old);return !!a&&(!old.length||(ts.length===old.length&&!!b&&cmp(a.key,b.key)>0));}
export function accessible(g:Game,i:number){const st=g.stacks[i];if(!st||(!st[0]&&!st[1]))return false;const z=st[1]?1:0,r=Math.floor(i/4),c=i%4;return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].some(([y,x])=>y<0||y>=3||x<0||x>=4||!g.stacks[y*4+x][z]);}
export function player(name:string,bot=false):Player{return {id:crypto.randomUUID(),token:crypto.randomUUID(),name:name.trim().slice(0,12)||"플레이어",hand:[],wins:0,bot};}
export function room(code:string,p:Player,practice=false):Game{return {code,phase:"lobby",players:[p],stacks:[],turn:0,lastBy:null,trick:[],log:[],winner:null,round:0,practice};}
export function start(g:Game){if(g.players.length!==3)throw Error("3명이 모이면 시작할 수 있어요.");const deck:Tile[]=[];for(let n=1;n<=15;n++)for(let s=0;s<4;s++)deck.push({id:(n-1)*4+s,n,s});
 for(let i=deck.length-1;i>0;i--){let x=new Uint32Array(1);crypto.getRandomValues(x);const j=x[0]%(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
 for(const p of g.players)p.hand=sorted(deck.splice(0,12));g.stacks=Array.from({length:12},()=>[deck.shift()!,deck.shift()!]);
 const weakest=g.players.map(p=>sorted(p.hand)[0]);g.turn=weakest.reduce((best,t,i)=>rank(t)*4+t.s<rank(weakest[best])*4+weakest[best].s?i:best,0);
 g.phase="playing";g.trick=[];g.lastBy=null;g.winner=null;g.round++;g.log=[`라운드 ${g.round} · ${g.players[g.turn].name}부터 시작합니다.`];}
function note(g:Game,s:string){g.log=[s,...g.log].slice(0,30);}
export function act(g:Game,who:number,action:string,ids:number[]=[],index=-1){if(g.phase!=="playing"||g.turn!==who)throw Error("지금은 내 차례가 아니에요.");const p=g.players[who];
 if(action==="play"){if(!ids.length||new Set(ids).size!==ids.length)throw Error("낼 타일을 선택해 주세요.");const ts=ids.map(id=>p.hand.find(t=>t.id===id));if(ts.some(t=>!t))throw Error("손패를 다시 확인해 주세요.");const tiles=ts as Tile[];if(!beats(tiles,g.trick))throw Error("같은 개수의 더 높은 조합을 내야 해요.");p.hand=p.hand.filter(t=>!ids.includes(t.id));g.trick=tiles;g.lastBy=who;note(g,`${p.name} · ${combo(tiles)!.label} ${tiles.length}개 제출`);if(!p.hand.length){g.phase="ended";g.winner=who;p.wins++;note(g,`${p.name} 승리! 손패를 모두 냈습니다.`);return;}}
 else if(action==="draw"){if(!Number.isInteger(index)||!accessible(g,index))throw Error("밝게 표시된 외곽 타일만 가져올 수 있어요.");const z=g.stacks[index][1]?1:0,t=g.stacks[index][z]!;g.stacks[index][z]=null;p.hand=sorted([...p.hand,t]);note(g,`${p.name} · ${z===1?"위층 비공개":"아래층 공개"} 패 1개 가져오기`);}
 else if(action==="pass"){if(g.stacks.some(s=>s[0]||s[1]))throw Error("바닥 패가 남아 있으면 내거나 가져와야 해요.");if(!g.trick.length)throw Error("새 선에서는 타일을 내야 해요.");note(g,`${p.name} · 패스`);}
 else throw Error("지원하지 않는 동작이에요.");
 g.turn=(who+1)%3;if(g.lastBy===g.turn){g.trick=[];g.lastBy=null;note(g,`${g.players[g.turn].name}이 선을 잡았습니다.`);}
}
export function view(g:Game,token:string){const me=g.players.findIndex(p=>p.token===token);if(me<0)throw Error("입장 정보가 없어요. 방 코드로 다시 입장해 주세요.");return {code:g.code,phase:g.phase,turn:g.turn,lastBy:g.lastBy,trick:g.trick,log:g.log,winner:g.winner,round:g.round,practice:g.practice,me,players:g.players.map((p,i)=>({id:p.id,name:p.name,count:p.hand.length,wins:p.wins,bot:p.bot,hand:i===me||g.phase==="ended"?p.hand:undefined})),stacks:g.stacks.map((s,i)=>({lower:s[0],upper:!!s[1],available:accessible(g,i)}))};}
export function botMove(g:Game){const who=g.turn,p=g.players[who];if(!p.bot||g.phase!=="playing")return;let choice:Tile[]|null=null;const count=g.trick.length||1;
 function search(at:number,ts:Tile[]){if(choice)return;if(ts.length===count){if(beats(ts,g.trick))choice=[...ts];return;}for(let i=at;i<p.hand.length;i++)search(i+1,[...ts,p.hand[i]]);}
 search(0,[]);if(choice)act(g,who,"play",(choice as Tile[]).map(t=>t.id));else {const i=g.stacks.findIndex((_,i)=>accessible(g,i));if(i>=0)act(g,who,"draw",[],i);else act(g,who,"pass");}}
