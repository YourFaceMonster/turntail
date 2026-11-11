// End-to-end check of online Yacht Dice against a RUNNING dev server and its local D1 (not production).
// Two or three separate clients (each with its own device key) create/join a room, react, and play a whole
// match through /api/game, then check the result and the records table.
//   node scripts/local-db-setup.mjs            (once, so the local DB has its tables)
//   node scripts/e2e-yacht-online.mjs [2|3] [http://127.0.0.1:5173]
const size=Number(process.argv[2]||3),base=process.argv[3]||'http://127.0.0.1:5173';
const CATEGORIES=['ones','twos','threes','fours','fives','sixes','choice','four-kind','full-house','small-straight','large-straight','yacht'];
let failures=0;const check=(ok,label)=>{console.log(`${ok?'✔':'✖'} ${label}`);if(!ok)failures++;};

async function call(body){
 const response=await fetch(`${base}/api/game`,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify(body)});
 const data=await response.json().catch(()=>({}));return {status:response.status,...data};
}
function client(name){
 const device=crypto.randomUUID();let token='',code='',revision=0,room=null;
 const send=async(action,extra={})=>{const r=await call({action,code,token,profileToken:device,revision,playKey:room?.playKey,name,...extra});if(r.room){room=r.room;revision=r.revision;if(r.token)token=r.token;if(r.room.code)code=r.room.code;}return r;};
 return {name,device,send,get room(){return room;},set code(v){code=v;},get code(){return code;}};
}

const players=Array.from({length:size},(_,i)=>client(i?`손님${i}`:'방장'));
const [host,...guests]=players;
let r=await host.send('yachtCreate',{size});check(r.status===200&&r.room?.phase==='lobby',`${size}인 방 만들기 (${r.room?.code||r.error})`);
if(r.status!==200){console.log('\n개발 서버가 켜져 있는지, node scripts/local-db-setup.mjs 를 실행했는지 확인하세요.');process.exit(1);}
for(const guest of guests){guest.code=host.code;r=await guest.send('yachtJoin');check(r.status===200,`${guest.name} 참가`);}
r=await host.send('yachtState');check(r.room.players.length===size,'정원 채움');
await guests[0].send('yachtState');r=await guests[0].send('yachtStart');check(r.status===400,'방장이 아니면 시작 못 함');
r=await host.send('yachtStart');check(r.status===200&&r.room.phase==='playing','방장이 시작');
r=await guests[0].send('yachtReact',{emoji:0});check(r.status===200&&r.room.reactions.length>=1,'반응 보내기');

// Play the whole match: whoever's turn it is rolls once, then writes the first box the server accepts.
let turns=0;
while(turns<size*12+5){
 const view=(await host.send('yachtState')).room;if(view.phase!=='playing')break;
 const who=players[view.match.turn];await who.send('yachtState');
 const rolled=await who.send('yachtRoll');if(rolled.status!==200){check(false,`굴리기 실패: ${rolled.error}`);break;}
 const sheet=rolled.room.match.sheets[rolled.room.me]||{};let scored=false;
 for(const category of CATEGORIES.filter(c=>sheet[c]===undefined)){const s=await who.send('yachtScore',{category});if(s.status===200){scored=true;break;}}
 if(!scored){check(false,'점수 칸을 고르지 못함');break;}
 turns++;
}
r=await host.send('yachtState');
check(r.room.phase==='ended',`판 끝 (차례 ${turns}번)`);
check(r.room.result?.players.length===size&&r.room.result.players.filter(p=>p.winner).length>=1,'등수 계산');
for(const p of players){const h=await call({action:'yachtHistory',profileToken:p.device});check(h.status===200&&h.summary?.games===1,`${p.name} 전적 1판 기록`);}
r=await host.send('yachtRestart');check(r.status===200&&r.room.phase==='playing'&&r.room.matchNo===2,'같은 멤버로 새 판');
console.log(failures?`\n실패 ${failures}개`:'\n모두 통과');process.exit(failures?1:0);
