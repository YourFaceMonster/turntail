import { env } from "cloudflare:workers";
import {act,assertTurnReady,botMove,player,room,start,view,capacity,advanceRoom,hostSeat,restartMatch,revealHand,resetChallenge,type Game} from "../../../lib/game";
import {avatarImage,updateProfile,sendChat} from "../../../lib/social";
import {scoreEntries,mergeScores,type HighScore} from "../../../lib/challenge";
import {LINEUP_SUMMARY_SQL,LINEUP_PLAYERS_SQL} from "../../../lib/history";
export const dynamic="force-dynamic";
function reply(x:unknown,status=200){return Response.json(x,{status,headers:{"Cache-Control":"no-store"}});}
async function deviceKey(secret:unknown){
 if(typeof secret!=="string"||!/^[a-f0-9-]{36}$/i.test(secret))return null;
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(secret));
 return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,"0")).join("");
}
export async function POST(req:Request){try{
 const origin=req.headers.get("origin");if(origin&&origin!==new URL(req.url).origin)return reply({error:"접속 주소를 확인해 주세요."},403);
 const b=await req.json() as any;const db=env.DB;if(!db)throw Error("게임 저장소에 연결하지 못했어요.");
 const profile=await deviceKey(b.profileToken);
 if(b.action==="highscores"){
  if(!profile)return reply({error:"기기 기록을 확인하지 못했어요."},400);
  let scores:HighScore[]=[];
  const rows=await db.prepare("SELECT id,size,result FROM match_records WHERE device=? AND json_extract(result,'$.challenge') IS NOT NULL ORDER BY at ASC").bind(profile).all();
  for(const row of rows.results as any[]){const result=JSON.parse(row.result),me=result.players.findIndex((p:any)=>row.id===result.id+':'+p.id);if(me>=0)scores=mergeScores(scores,scoreEntries(result,me,'multi',row.size));}
  return reply({scores});
 }
 if(b.action==="history"){
  if(!profile)return reply({error:"기기 기록을 확인하지 못했어요."},400);
  const summary=await db.prepare("SELECT COUNT(*) AS games,COALESCE(SUM(win),0) AS wins,COALESCE(SUM(points),0) AS points FROM match_records WHERE device=?").bind(profile).first();
  const records=await db.prepare("SELECT id,at,win,points,size,result FROM match_records WHERE device=? ORDER BY at DESC LIMIT 40").bind(profile).all();
  const [lineups,participants]=await Promise.all([db.prepare(LINEUP_SUMMARY_SQL).bind(profile).all(),db.prepare(LINEUP_PLAYERS_SQL).bind(profile).all()]);
  const groups=lineups.results.map((g:any)=>({key:g.lineup,names:JSON.parse(g.lineup),size:g.size,games:g.games,wins:g.wins,points:g.points,lastAt:g.lastAt,players:participants.results.filter((p:any)=>p.lineup===g.lineup&&p.size===g.size).map((p:any)=>({name:p.name,occurrence:p.occurrence,games:p.games,wins:p.wins,losses:p.losses,points:p.points}))}));
  return reply({summary,groups,records:records.results.map((r:any)=>({...r,result:JSON.parse(r.result)}))});
 }
 if(b.action==="create"){
  const size=Number(b.size||3);if(![2,3,4].includes(size))throw Error("2·3·4인 중 선택해 주세요.");
  const p=player(String(b.name||"플레이어"));p.avatar=avatarImage(b.avatar);if(profile)p.profile=profile;
  for(let k=0;k<5;k++){
   const code=crypto.randomUUID().replaceAll("-","").slice(0,6).toUpperCase();const g=room(code,p,!!b.practice,size,{matchMode:b.challenge?"unlimited":b.matchMode,targetScore:b.targetScore,challenge:!!b.challenge});
   if(b.practice){for(let i=1;i<size;i++)g.players.push(player(["달빛","해솔","별하"][i-1],true));start(g);}
   const r=await db.prepare("INSERT OR IGNORE INTO rooms (code,revision,state,updated) VALUES (?,0,?,?)").bind(code,JSON.stringify(g),Date.now()).run();
   if(r.meta.changes)return reply({token:p.token,game:view(g,p.token),revision:0});
  }throw Error("방을 다시 만들어 주세요.");
 }
 const code=String(b.code||"").toUpperCase();if(!/^[A-F0-9]{6}$/.test(code))throw Error("6자리 방 코드를 확인해 주세요.");
 for(let retry=0;retry<5;retry++){
  const row=await db.prepare("SELECT state,revision FROM rooms WHERE code=?").bind(code).first<{state:string,revision:number}>();
  if(!row)return reply({error:"방을 찾지 못했어요."},404);
  const g=JSON.parse(row.state) as Game,wasEnded=g.phase==="ended";let token=String(b.token||""),changed=false,skipped=false;
  if(b.action==="join"){
   const existing=g.players.find(p=>p.token===token);
   if(!existing){if(g.phase!=="lobby"||g.players.length>=capacity(g))throw Error("이미 시작했거나 정원이 찬 방이에요.");
    const p=player(String(b.name||"플레이어"));p.avatar=avatarImage(b.avatar);if(profile)p.profile=profile;g.players.push(p);token=p.token;changed=true;}
  }else{
   const me=g.players.findIndex(p=>p.token===token);if(me<0)return reply({error:"입장 정보가 없어요."},403);
   changed=advanceRoom(g,Date.now());
   if(b.action==="state"&&!changed)return reply({game:view(g,token),revision:row.revision});
   skipped=changed&&!["state","chat","profile","reveal","abandon"].includes(b.action);
   if(!changed&&!["state","chat","profile","reveal","abandon"].includes(b.action)&&b.revision!==row.revision&&(!b.eventId||b.eventId!==g.lastEvent?.id))return reply({error:"화면을 최신 상태로 맞췄어요. 다시 선택해 주세요.",game:view(g,token),revision:row.revision},409);
   if(b.action==="state"||skipped){}
   else if(b.action==="chat"){if(g.practice)throw Error("채팅은 친구 대전에서 이용해 주세요.");sendChat(g,me,b.text,Date.now(),typeof b.messageId==="string"&&/^[a-f0-9-]{36}$/i.test(b.messageId)?b.messageId:crypto.randomUUID());}
   else if(b.action==="reveal")revealHand(g,me,!!b.show);
   else if(b.action==="abandon"){if(g.challenge&&!g.challenge.complete)g.challenge.abandoned=true;}
   else if(b.action==="newChallenge"){if(me!==hostSeat(g))throw Error("방장만 시작할 수 있어요.");resetChallenge(g);}
   else if(b.action==="profile")updateProfile(g.players[me],b.name,b.avatar);
   else if(b.action==="start"){if(me!==hostSeat(g))throw Error("방장만 시작할 수 있어요.");if(g.phase==="playing")throw Error("이미 진행 중이에요.");start(g);}
   else if(b.action==="restart"){if(me!==hostSeat(g))throw Error("방장만 새 매치를 시작할 수 있어요.");restartMatch(g);}
   else if(b.action==="bot"){assertTurnReady(g);if(!g.practice)throw Error("AI 차례는 자동으로 진행됩니다.");botMove(g);}
   else {assertTurnReady(g);act(g,me,b.action,Array.isArray(b.ids)?b.ids:[],b.index);}
   changed=true;
  }
  if(!changed)return reply({token,game:view(g,token),revision:row.revision});
  const eventId=g.lastEvent?.id||crypto.randomUUID(),now=Date.now();
  const statements=[db.prepare("UPDATE rooms SET state=?,revision=revision+1,updated=? WHERE code=? AND revision=?").bind(JSON.stringify(g),now,code,row.revision)];
  if(!wasEnded&&g.phase==="ended"&&g.result&&!g.result.voided&&!g.practice){
   for(let i=0;i<g.players.length;i++){
    const p=g.players[i],r=g.result.players[i];if(!p.profile||p.bot)continue;
    statements.push(db.prepare("INSERT OR IGNORE INTO match_records (id,device,name,at,win,points,size,result) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM rooms WHERE code=? AND revision=? AND json_extract(state,'$.lastEvent.id')=?)").bind(`${g.code}:${g.round}:${p.id}`,p.profile,p.name,g.result.at,Number(r.winner),r.delta,capacity(g),JSON.stringify(g.result),code,row.revision+1,eventId));
   }
  }
  const updates=await db.batch(statements);
  if(updates[0].meta.changes)return reply({token,game:view(g,token),revision:row.revision+1,...(skipped&&b.action!=="bot"?{error:"시간 초과 또는 AI 진행으로 차례가 바뀌었어요."}:{})},skipped&&b.action!=="bot"?409:200);
 }
 return reply({error:"잠시 후 다시 시도해 주세요."},409);
 }catch(e){return reply({error:e instanceof Error?e.message:"처리하지 못했어요."},400);}}
