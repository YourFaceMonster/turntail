import {tryRpgBotItem,scoutRpgBotDraw} from './rpg-items.ts';
import {scoutBotDraw} from './items';
import {isHiboringji,hiboringjiAction} from './hiboringji';
import {act,view,chooseBotAction,type Game} from './game';
import {tryBotProfessionActive} from './profession-actives.ts';
import {itemTurnReadyAt} from './rpg-item-motion.ts';
import {runItemBattleBotTurn} from './item-battle-bot.ts';
/** Search belongs off the UI thread. Unsupported workers use a bounded simple move. */
export function runLocalBot(game:Game,signal:AbortSignal):Promise<Game>{
 return new Promise((resolve,reject)=>{
  let worker:Worker|undefined,timer:ReturnType<typeof setTimeout>;
  const cleanup=()=>{clearTimeout(timer);worker?.terminate();signal.removeEventListener('abort',abort);};
  const abort=()=>{cleanup();reject(new DOMException('Paused','AbortError'));};
  const fallback=()=>{cleanup();if(signal.aborted){abort();return;}try{
   if(runItemBattleBotTurn(game)){resolve(game);return;}
   if(tryBotProfessionActive(game)){resolve(game);return;}const lastItem=game.rpgRun?.lastItem?.id;tryRpgBotItem(game);
   if(game.rpgRun?.lastItem&&game.rpgRun.lastItem.id!==lastItem){game.turnReadyAt=Math.max(game.turnReadyAt||0,itemTurnReadyAt(game.rpgRun.lastItem));resolve(game);return;}
   if(game.rpgRun?.status==='complete'){resolve(game);return;}
   const p=game.players[game.turn],position=view(game,p.token);
   let decision=chooseBotAction(position);
   if(game.rpgRun&&decision.type==='draw')decision={type:'draw',index:scoutRpgBotDraw(game,game.turn,decision.index)};
   if(game.itemRun&&decision.type==='draw')decision={type:'draw',index:scoutBotDraw(game,game.turn,decision.index)};
   act(game,game.turn,decision.type,decision.type==='play'?decision.tiles.map(t=>t.id):[],decision.type==='draw'?decision.index:-1,Date.now(),true);
   resolve(game);
  }catch(e){reject(e);}};
  if(signal.aborted){abort();return;}signal.addEventListener('abort',abort,{once:true});
  try{worker=new Worker(new URL('./local-bot-worker.ts',import.meta.url),{type:'module'});worker.onmessage=({data}:{data:{game?:Game,error?:string}})=>{if(data.game){cleanup();resolve(data.game);}else fallback();};worker.onerror=e=>{e.preventDefault();fallback();};timer=setTimeout(fallback,7000);worker.postMessage(game);}catch{fallback();}
 });
}
