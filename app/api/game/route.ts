import { env } from "cloudflare:workers";
import {act,botMove,player,room,start,view,type Game} from "../../../lib/game";
export const dynamic="force-dynamic";
function reply(x:unknown,status=200){return Response.json(x,{status,headers:{"Cache-Control":"no-store"}});}
export async function POST(req:Request){try{
 const origin=req.headers.get("origin");if(origin&&origin!==new URL(req.url).origin)return reply({error:"접속 주소를 확인해 주세요."},403);
 const b=await req.json() as any;const db=env.DB;if(!db)throw Error("게임 저장소에 연결하지 못했어요.");
 if(b.action==="create"){const p=player(String(b.name||"플레이어"));for(let k=0;k<5;k++){const code=crypto.randomUUID().replaceAll("-","").slice(0,6).toUpperCase();const g=room(code,p,!!b.practice);if(b.practice){g.players.push(player("달빛",true),player("해솔",true));start(g);}const r=await db.prepare("INSERT OR IGNORE INTO rooms (code,revision,state,updated) VALUES (?,0,?,?)").bind(code,JSON.stringify(g),Date.now()).run();if(r.meta.changes)return reply({token:p.token,game:view(g,p.token),revision:0});}throw Error("방을 다시 만들어 주세요.");}
 const code=String(b.code||"").toUpperCase();if(!/^[A-F0-9]{6}$/.test(code))throw Error("6자리 방 코드를 확인해 주세요.");
 for(let retry=0;retry<5;retry++){
 const row=await db.prepare("SELECT state,revision FROM rooms WHERE code=?").bind(code).first<{state:string,revision:number}>();if(!row)return reply({error:"방을 찾지 못했어요."},404);const g=JSON.parse(row.state) as Game;let token=String(b.token||""),changed=false;
 if(b.action==="join"){const existing=g.players.find(p=>p.token===token);if(!existing){if(g.phase!=="lobby"||g.players.length>=3)throw Error("이미 시작했거나 정원이 찬 방이에요.");const p=player(String(b.name||"플레이어"));g.players.push(p);token=p.token;changed=true;}}
 else {const me=g.players.findIndex(p=>p.token===token);if(me<0)return reply({error:"입장 정보가 없어요."},403);
 if(b.action==="state"){return reply({game:view(g,token),revision:row.revision});}
 if(b.revision!==row.revision)return reply({error:"다른 동작이 먼저 반영됐어요. 화면을 갱신했습니다.",game:view(g,token),revision:row.revision},409);
 if(b.action==="start"){if(me!==0)throw Error("방장만 시작할 수 있어요.");if(g.phase==="playing")throw Error("이미 진행 중이에요.");start(g);}
 else if(b.action==="bot"){if(!g.practice)throw Error("친구 대전에서는 사용할 수 없어요.");botMove(g);}
 else act(g,me,b.action,Array.isArray(b.ids)?b.ids:[],b.index);changed=true;}
 if(!changed)return reply({token,game:view(g,token),revision:row.revision});
 const update=await db.prepare("UPDATE rooms SET state=?,revision=revision+1,updated=? WHERE code=? AND revision=?").bind(JSON.stringify(g),Date.now(),code,row.revision).run();if(update.meta.changes)return reply({token,game:view(g,token),revision:row.revision+1});
 }return reply({error:"잠시 후 다시 시도해 주세요."},409);
 }catch(e){return reply({error:e instanceof Error?e.message:"처리하지 못했어요."},400);}}
