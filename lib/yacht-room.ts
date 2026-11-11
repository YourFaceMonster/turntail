/**
 * Online Yacht Dice rooms for 2~3 friends (multiplayer menu). Server-authoritative state stored in the shared
 * `rooms` table with kind:'yacht'. Scoring, joker rule and the AI used for timed-out turns come from yacht-dice.ts.
 * Friends only: no AI seats. A 60-second turn timer lets the AI play that one turn; 3 timeouts in a row hand the
 * seat to the AI for the rest of the match.
 */
import {YACHT_CATEGORIES,allowedCategories,bestYachtBox,bestYachtHold,boxScore,cryptoDie,yachtJoker,yachtJokerBonus,yachtTotal,type DiceRandom,type YachtCategory,type YachtSheet} from './yacht-dice';

export const YACHT_TURN_MS=60000;
export const YACHT_ROOM_SIZES=[2,3] as const;
export type YachtRoomSize=typeof YACHT_ROOM_SIZES[number];
export type YachtRoomPlayer={id:string,token:string,name:string,avatar?:string,profile?:string,timeouts:number,replaced:boolean};
export type YachtRoomMatch={dice:number[],held:boolean[],rollsLeft:number,turn:number,round:number,sheets:YachtSheet[],bonuses:number[],last?:{seat:number,category:YachtCategory,score:number,bonus?:number,joker?:boolean,auto?:boolean}};
export type YachtRoomResult={at:number,matchNo:number,players:{name:string,total:number,place:number,winner:boolean,replaced:boolean}[]};
export type YachtRoom={kind:'yacht',version:1,code:string,size:YachtRoomSize,phase:'lobby'|'playing'|'ended',players:YachtRoomPlayer[],
 match?:YachtRoomMatch,matchNo:number,turnStartedAt:number,turnDeadline:number,result?:YachtRoomResult,notice?:{id:string,text:string},lastEvent?:{id:string},reactions?:YachtReaction[]};
/** Fixed reaction set only: no free text, so there is nothing to moderate. */
export const YACHT_REACTIONS=['👍','👏','😮','😂','😭','🔥'] as const;
export type YachtReaction={id:string,seat:number,emoji:number,at:number};
const REACTION_SHOW_MS=5000,REACTION_GAP_MS=1200;

const id=()=>crypto.randomUUID();
export function isYachtRoom(state:unknown):state is YachtRoom{return !!state&&typeof state==='object'&&(state as YachtRoom).kind==='yacht';}
export function yachtRoomPlayer(name:string,avatar?:string,profile?:string):YachtRoomPlayer{
 const clean=String(name||'플레이어').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,12)||'플레이어';
 return {id:id(),token:id(),name:clean,...(avatar?{avatar}:{}),...(profile?{profile}:{}),timeouts:0,replaced:false};
}
export function createYachtRoom(code:string,host:YachtRoomPlayer,size:unknown):YachtRoom{
 const n=Number(size);if(!YACHT_ROOM_SIZES.includes(n as YachtRoomSize))throw Error('2인·3인 중 선택해 주세요.');
 return {kind:'yacht',version:1,code,size:n as YachtRoomSize,phase:'lobby',players:[host],matchNo:0,turnStartedAt:0,turnDeadline:0};
}
export function joinYachtRoom(room:YachtRoom,player:YachtRoomPlayer){
 if(room.phase!=='lobby'||room.players.length>=room.size)throw Error('이미 시작했거나 정원이 찬 방이에요.');
 room.players.push(player);
}
function freshMatch(size:number):YachtRoomMatch{return {dice:[1,1,1,1,1],held:[false,false,false,false,false],rollsLeft:3,turn:0,round:1,sheets:Array.from({length:size},()=>({})),bonuses:Array(size).fill(0)};}
function event(room:YachtRoom,text?:string){const eid=id();room.lastEvent={id:eid};if(text)room.notice={id:eid,text};}
function beginTurn(room:YachtRoom,now:number){room.turnStartedAt=now;room.turnDeadline=now+YACHT_TURN_MS;}
export function startYachtRoom(room:YachtRoom,seat:number,now:number){
 if(seat!==0)throw Error('방장만 시작할 수 있어요.');
 if(room.phase==='playing')throw Error('이미 진행 중이에요.');
 if(room.players.length!==room.size)throw Error(`${room.size}명이 모두 들어와야 시작할 수 있어요.`);
 room.phase='playing';room.matchNo++;room.match=freshMatch(room.size);room.result=undefined;
 for(const p of room.players){p.timeouts=0;p.replaced=false;}
 beginTurn(room,now);event(room,`${room.players[0].name}부터 굴려요.`);
}
function assertTurn(room:YachtRoom,seat:number){
 if(room.phase!=='playing'||!room.match)throw Error('진행 중인 판이 없어요.');
 if(room.match.turn!==seat)throw Error('지금은 내 차례가 아니에요.');
 if(room.players[seat].replaced)throw Error('시간 초과로 AI가 자리를 이어받았어요.');
}
function roll(match:YachtRoomMatch,held:unknown,random:DiceRandom){
 if(match.rollsLeft<=0)throw Error('이번 차례의 굴리기를 모두 사용했어요. 점수 칸을 골라 주세요.');
 const first=match.rollsLeft===3,keep=first?[false,false,false,false,false]:Array.isArray(held)&&held.length===5?held.map(Boolean):match.held;
 if(!first&&keep.every(Boolean))throw Error('다시 굴릴 주사위를 하나 이상 남겨 주세요.');
 match.dice=match.dice.map((d,i)=>keep[i]?d:random());match.held=keep;match.rollsLeft--;match.last=undefined;
}
function score(room:YachtRoom,seat:number,category:unknown,now:number,auto=false){
 const match=room.match!;
 if(match.rollsLeft===3)throw Error('먼저 주사위를 굴려 주세요.');
 if(!YACHT_CATEGORIES.includes(category as YachtCategory))throw Error('점수 칸을 선택해 주세요.');
 const cat=category as YachtCategory,sheet=match.sheets[seat];
 if(sheet[cat]!==undefined)throw Error('이미 기록한 점수 칸이에요.');
 if(!allowedCategories(sheet,match.dice).includes(cat))throw Error('조커 규칙: 같은 눈의 숫자 칸이 비어 있으면 그 칸, 아니면 아래쪽 족보 칸에 적어야 해요.');
 const value=boxScore(sheet,cat,match.dice),bonus=yachtJokerBonus(sheet,match.dice),joker=yachtJoker(sheet,match.dice);
 match.sheets[seat]={...sheet,[cat]:value};if(bonus)match.bonuses[seat]++;
 match.last={seat,category:cat,score:value,...(bonus?{bonus}:{}),...(joker?{joker}:{}),...(auto?{auto}:{})};
 match.held=[false,false,false,false,false];match.rollsLeft=3;
 const lastSeat=seat===room.size-1;
 if(lastSeat&&match.round>=YACHT_CATEGORIES.length){finish(room,now);return;}
 match.turn=(seat+1)%room.size;if(lastSeat)match.round++;beginTurn(room,now);
}
export function yachtRoomTotal(room:YachtRoom,seat:number){const m=room.match;return m?yachtTotal(m.sheets[seat]||{},m.bonuses[seat]||0):0;}
function finish(room:YachtRoom,now:number){
 const totals=room.players.map((_,i)=>yachtRoomTotal(room,i));
 const players=room.players.map((p,i)=>{const place=1+totals.filter(t=>t>totals[i]).length;return {name:p.name,total:totals[i],place,winner:place===1,replaced:p.replaced};});
 room.phase='ended';room.turnDeadline=0;room.result={at:now,matchNo:room.matchNo,players};
 const top=players.filter(p=>p.winner).map(p=>p.name).join(' · ');
 event(room,`게임 끝 · ${top} ${players.filter(p=>p.winner).length>1?'공동 ':''}1등`);
}
export function rollYachtRoom(room:YachtRoom,seat:number,held:unknown,random:DiceRandom=cryptoDie){assertTurn(room,seat);roll(room.match!,held,random);event(room);}
export function scoreYachtRoom(room:YachtRoom,seat:number,category:unknown,now:number){
 assertTurn(room,seat);room.players[seat].timeouts=0;score(room,seat,category,now);if(room.phase==='playing')event(room);
}
/** The AI plays one whole turn for `seat` from wherever that turn currently stands. */
function aiTurn(room:YachtRoom,seat:number,now:number,random:DiceRandom){
 const match=room.match!,sheet=()=>match.sheets[seat];
 if(match.rollsLeft===3)roll(match,undefined,random);
 while(match.rollsLeft>0){const plan=bestYachtHold(sheet(),match.dice);if(plan.keepAll)break;roll(match,plan.held,random);}
 score(room,seat,bestYachtBox(sheet(),match.dice).category,now,true);
}
/** Applies expired turns and AI-held seats. Returns true when the room changed. Bounded by the 12×3 turns of one match. */
export function advanceYachtRoom(room:YachtRoom,now:number,random:DiceRandom=cryptoDie){
 let changed=false;
 for(let guard=0;guard<YACHT_CATEGORIES.length*3+1&&room.phase==='playing'&&room.match;guard++){
  const seat=room.match.turn,p=room.players[seat];
  if(!p.replaced&&now<room.turnDeadline)break;
  let text:string|undefined;
  if(!p.replaced){p.timeouts++;if(p.timeouts>=3){p.replaced=true;text=`${p.name} · 3회 연속 시간 초과, AI가 자리를 이어받았어요.`;}else text=`${p.name} · 시간 초과 ${p.timeouts}/3, 이번 차례는 AI가 굴렸어요.`;}
  aiTurn(room,seat,now,random);if(room.phase==='playing')event(room,text);changed=true;
 }
 return changed;
}
export function restartYachtRoom(room:YachtRoom,seat:number,now:number){
 if(seat!==0)throw Error('방장만 새 판을 시작할 수 있어요.');
 if(room.phase!=='ended')throw Error('판이 끝난 뒤 다시 시작할 수 있어요.');
 room.phase='lobby';startYachtRoom(room,seat,now);
}
/** Send a quick reaction. Throttled per seat; old ones fall off. Does not touch the game state. */
export function reactYachtRoom(room:YachtRoom,seat:number,emoji:unknown,now:number){
 const n=Number(emoji);if(!Number.isInteger(n)||n<0||n>=YACHT_REACTIONS.length)throw Error('보낼 수 없는 반응이에요.');
 const list=(room.reactions||[]).filter(r=>now-r.at<REACTION_SHOW_MS);
 if(list.some(r=>r.seat===seat&&now-r.at<REACTION_GAP_MS))return false;
 list.push({id:id(),seat,emoji:n,at:now});room.reactions=list.slice(-6);return true;
}
/**
 * Identifies the playable moment (match, round, turn, rolls left). A roll or score sent from an older
 * moment is refused; reactions and polling do not change it, so they never invalidate a player's move.
 */
export function yachtPlayKey(room:YachtRoom){const m=room.match;return `${room.phase}:${room.matchNo}:${room.players.length}:${m?`${m.round}.${m.turn}.${m.rollsLeft}`:'-'}`;}
/** What one player may see: no other tokens or device keys. */
export function viewYachtRoom(room:YachtRoom,token:string,now=Date.now()){
 const me=room.players.findIndex(p=>p.token===token);
 return {kind:'yacht' as const,code:room.code,size:room.size,phase:room.phase,me,host:0,matchNo:room.matchNo,
  players:room.players.map((p,i)=>({id:p.id,name:p.name,avatar:p.avatar,replaced:p.replaced,timeouts:p.timeouts,total:yachtRoomTotal(room,i)})),
  match:room.match,turnMsLeft:room.phase==='playing'?Math.max(0,room.turnDeadline-now):0,result:room.result,notice:room.notice,eventId:room.lastEvent?.id,
  playKey:yachtPlayKey(room),reactions:(room.reactions||[]).filter(r=>now-r.at<REACTION_SHOW_MS).map(({id,seat,emoji})=>({id,seat,emoji}))};
}
export type YachtRoomView=ReturnType<typeof viewYachtRoom>;

/* ---------- Records (separate table, created on first use; tile records and leaderboards are untouched) ---------- */
export const YACHT_RECORDS_TABLE_SQL="CREATE TABLE IF NOT EXISTS yacht_records (id TEXT PRIMARY KEY NOT NULL,device TEXT NOT NULL,name TEXT NOT NULL,at INTEGER NOT NULL,size INTEGER NOT NULL,place INTEGER NOT NULL,score INTEGER NOT NULL,win INTEGER NOT NULL,result TEXT NOT NULL)";
export const YACHT_RECORDS_INDEX_SQL="CREATE INDEX IF NOT EXISTS yacht_records_device_at ON yacht_records (device,at)";
/** One row per human who finished the match in their own seat (a seat the AI took over is not recorded). */
export function yachtRecordRows(room:YachtRoom){
 const result=room.result;if(!result)return [];
 return room.players.flatMap((p,i)=>{const r=result.players[i];if(!p.profile||p.replaced)return [];
  return [{id:`${room.code}:${room.matchNo}:${p.id}`,device:p.profile,name:p.name,at:result.at,size:room.size,place:r.place,score:r.total,win:r.winner?1:0,result:JSON.stringify(result)}];});
}
