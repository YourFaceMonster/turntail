import {tryRpgBotItem,scoutRpgBotDraw} from './rpg-items.ts';
import {scoutBotDraw} from './items';
import {isHiboringji,hiboringjiAction} from './hiboringji';
import {act,legalOptions,view,type Game} from './game';
import {tryBotFloorTrap} from './item-battle-rules.ts';
/** Search belongs off the UI thread. Unsupported workers use a bounded simple move. */
export function runLocalBot(game:Game,signal:AbortSignal):Promise<Game>{
 return new Promise((resolve,reject)=>{
  let worker:Worker|undefined,timer:ReturnType<typeof setTimeout>;
  const cleanup=()=>{clearTimeout(timer);worker?.terminate();signal.removeEventListener('abort',abort);};
  const abort=()=>{cleanup();reject(new DOMException('Paused','AbortError'));};
  const fallback=()=>{cleanup();if(signal.aborted){abort();return;}try{
   tryBotFloorTrap(game);tryRpgBotItem(game);
   if(game.rpgRun?.status==='complete'){resolve(game);return;}
   const p=game.players[game.turn],position=view(game,p.token),options=legalOptions(p.hand,game.trick),finish=options.find(o=>o.tiles.length===p.hand.length),move=finish||options[0];
   const index=position.stacks.findIndex(s=>s.available),simple=move?{type:'play' as const,tiles:move.tiles}:index>=0?{type:'draw' as const,index}:{type:'pass' as const};
   let decision=isHiboringji(p)?hiboringjiAction(position,simple):simple;
   if(game.rpgRun&&decision.type==='draw')decision={type:'draw',index:scoutRpgBotDraw(game,game.turn,decision.index)};
   if(game.itemRun&&decision.type==='draw')decision={type:'draw',index:scoutBotDraw(game,game.turn,decision.index)};
   act(game,game.turn,decision.type,decision.type==='play'?decision.tiles.map(t=>t.id):[],decision.type==='draw'?decision.index:-1,Date.now(),true);
   resolve(game);
  }catch(e){reject(e);}};
  if(signal.aborted){abort();return;}signal.addEventListener('abort',abort,{once:true});
  try{worker=new Worker(new URL('./local-bot-worker.ts',import.meta.url),{type:'module'});worker.onmessage=({data}:{data:{game?:Game,error?:string}})=>{if(data.game){cleanup();resolve(data.game);}else fallback();};worker.onerror=e=>{e.preventDefault();fallback();};timer=setTimeout(fallback,7000);worker.postMessage(game);}catch{fallback();}
 });
}
