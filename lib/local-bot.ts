import {tryRpgBotItem,scoutRpgBotDraw} from './rpg-items.ts';
import {scoutBotDraw} from './items';
import {act,rpgTwinBotView,chooseBotAction,type Game} from './game';
import {tryBotProfessionActive} from './profession-actives.ts';
import {itemTurnReadyAt} from './rpg-item-motion.ts';
import {runItemBattleBotTurn} from './item-battle-bot.ts';
import {chooseStrategicAction} from './bot.ts';
/** One long-lived search worker: avoids re-loading the module graph on every AI turn. */
let shared:Worker|undefined;
const busy=new Set<Worker>();
function botWorker(){
 const create=()=>new Worker(new URL('./local-bot-worker.ts',import.meta.url),{type:'module'});
 shared??=create();const worker=busy.has(shared)?create():shared;busy.add(worker);return worker;
}
function dropWorker(worker?:Worker){if(!worker)return;worker.terminate();busy.delete(worker);if(shared===worker)shared=undefined;}
/** Journey mini-game tables are untouched by a battle turn; keep them out of the clone. */
function workerPayload(game:Game):Game{const run=game.rpgRun,j=run?.journey;if(!run||!j||(!j.mini&&!j.letterMini))return game;return {...game,rpgRun:{...run,journey:{...j,mini:undefined,letterMini:undefined}}};}
function restorePayload(original:Game,result:Game):Game{const j=original.rpgRun?.journey,r=result.rpgRun?.journey;if(j&&r){if(j.mini&&!r.mini)r.mini=j.mini;if(j.letterMini&&!r.letterMini)r.letterMini=j.letterMini;}return result;}
/** Search belongs off the UI thread. Unsupported workers use a bounded simple move. */
export function runLocalBot(game:Game,signal:AbortSignal):Promise<Game>{
 return new Promise((resolve,reject)=>{
  let worker:Worker|undefined,timer:ReturnType<typeof setTimeout>;
  let settled=false;
  const cleanup=(terminate=false)=>{settled=true;clearTimeout(timer);if(worker){worker.onmessage=null;worker.onerror=null;busy.delete(worker);if(terminate||worker!==shared)dropWorker(worker);}signal.removeEventListener('abort',abort);};
  const abort=()=>{if(settled)return;cleanup(true);reject(new DOMException('Paused','AbortError'));};
  // A timed-out search is abandoned for a cheap heuristic so the UI thread never repeats it.
  const fallback=(light=false)=>{if(settled)return;if(signal.aborted){abort();return;}cleanup(light);try{
   if(runItemBattleBotTurn(game)){resolve(game);return;}
   if(tryBotProfessionActive(game)){resolve(game);return;}const lastItem=game.rpgRun?.lastItem?.id;tryRpgBotItem(game);
   if(game.rpgRun?.lastItem&&game.rpgRun.lastItem.id!==lastItem){game.turnReadyAt=Math.max(game.turnReadyAt||0,itemTurnReadyAt(game.rpgRun.lastItem));resolve(game);return;}
   if(game.rpgRun?.status==='complete'){resolve(game);return;}
   const position=rpgTwinBotView(game,game.turn);
   let decision=light&&!position.hpItemMode?chooseStrategicAction(position,3):chooseBotAction(position);
   if(game.rpgRun&&decision.type==='draw')decision={type:'draw',index:scoutRpgBotDraw(game,game.turn,decision.index)};
   if(game.itemRun&&decision.type==='draw')decision={type:'draw',index:scoutBotDraw(game,game.turn,decision.index)};
   act(game,game.turn,decision.type,decision.type==='play'?decision.tiles.map(t=>t.id):[],decision.type==='draw'?decision.index:-1,Date.now(),true);
   resolve(game);
  }catch(e){reject(e);}};
  if(signal.aborted){abort();return;}signal.addEventListener('abort',abort,{once:true});
  try{worker=botWorker();worker.onmessage=({data}:{data:{game?:Game,error?:string}})=>{if(settled)return;if(data.game){cleanup();resolve(restorePayload(game,data.game));}else fallback(true);};worker.onerror=e=>{e.preventDefault();fallback(true);};timer=setTimeout(()=>fallback(true),7000);worker.postMessage(workerPayload(game));}catch{fallback(true);}
 });
}
