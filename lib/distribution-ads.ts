import {distributionTarget} from './distribution';
export type AdOpportunity={key:string,kind:'stage-clear'|'challenge-failed'|'daily-finished'};
type ResultGame={code:string,phase:string,result?:{id:string,voided?:boolean}|null,rpgTest?:boolean,rpgMini?:unknown,
 daily?:unknown,rpgRun?:{status:string,rework?:{retried?:unknown}}|null,stageRun?:{status:string}|null};
/** Intermediate rounds, test scenes and tavern minigames never request an ad. */
export function resultAdOpportunity(game:ResultGame|null):AdOpportunity|null {
 if(!game||game.phase!=='ended'||!game.result||game.result.voided||game.rpgTest||game.rpgMini)return null;
 const key=`${game.code}:${game.result.id}`;
 if(game.daily)return {key,kind:'daily-finished'};
 const run=game.rpgRun;
 if(run?.status==='game-over'||run?.rework?.retried||game.stageRun?.status==='game-over')return {key,kind:'challenge-failed'};
 if(run&&['allocation','ready','complete'].includes(run.status)||game.stageRun&&['stage-clear','complete'].includes(game.stageRun.status))return {key,kind:'stage-clear'};
 return null;
}
export type InterstitialProvider={ready:()=>Promise<boolean>,show:()=>Promise<{status:string}>,preload:()=>void};
/** One request per result, shared across every exit button; failed/no-fill ads never block progress. */
export function createAdGate(now:()=>number=Date.now,interval=180_000,readyTimeout=1500){
 const handled=new Set<string>();let lastShown=-Infinity,inFlight=false;
 return async(opportunity:AdOpportunity|null,provider:InterstitialProvider|null)=>{
  if(!opportunity||!provider||handled.has(opportunity.key)||inFlight)return;
  handled.add(opportunity.key);if(handled.size>500)handled.delete(handled.values().next().value!);
  if(now()-lastShown<interval)return;
  inFlight=true;
  try{
   const ready=await new Promise<boolean>(resolve=>{const timer=setTimeout(()=>resolve(false),readyTimeout);provider.ready().then(value=>{clearTimeout(timer);resolve(value);},()=>{clearTimeout(timer);resolve(false);});});
   // Count the attempt as well: a timed-out native ad can still arrive late.
   if(ready){lastShown=now();await provider.show();}
  }
  catch{/* Missing inventory or an SDK error must leave the game playable. */}
  finally{inFlight=false;try{provider.preload();}catch{}}
 };
}
let provider:InterstitialProvider|null=null;
export function setInterstitialProvider(next:InterstitialProvider|null){provider=next;}
const gate=createAdGate();
export function hasResultAd(game:ResultGame|null){return distributionTarget==='onestore'&&provider!==null&&resultAdOpportunity(game)!==null;}
export async function showResultAd(game:ResultGame|null){if(distributionTarget==='onestore')await gate(resultAdOpportunity(game),provider);}
