import {act,legalOptions,view,type Game} from './game';
/** Search belongs off the UI thread. Unsupported workers use a bounded simple move. */
export function runLocalBot(game:Game,signal:AbortSignal):Promise<Game>{
 return new Promise((resolve,reject)=>{
  let worker:Worker|undefined,timer:ReturnType<typeof setTimeout>;
  const cleanup=()=>{clearTimeout(timer);worker?.terminate();signal.removeEventListener('abort',abort);};
  const abort=()=>{cleanup();reject(new DOMException('Paused','AbortError'));};
  const fallback=()=>{cleanup();if(signal.aborted){abort();return;}try{
   const p=game.players[game.turn],position=view(game,p.token),options=legalOptions(p.hand,game.trick),finish=options.find(o=>o.tiles.length===p.hand.length),move=finish||options[0];
   if(move)act(game,game.turn,'play',move.tiles.map(t=>t.id),-1,Date.now(),true);
   else{const index=position.stacks.findIndex(s=>s.available);act(game,game.turn,index>=0?'draw':'pass',[],index,Date.now(),true);}
   resolve(game);
  }catch(e){reject(e);}};
  if(signal.aborted){abort();return;}signal.addEventListener('abort',abort,{once:true});
  try{worker=new Worker(new URL('./local-bot-worker.ts',import.meta.url),{type:'module'});worker.onmessage=({data}:{data:{game?:Game,error?:string}})=>{if(data.game){cleanup();resolve(data.game);}else fallback();};worker.onerror=e=>{e.preventDefault();fallback();};timer=setTimeout(fallback,7000);worker.postMessage(game);}catch{fallback();}
 });
}
