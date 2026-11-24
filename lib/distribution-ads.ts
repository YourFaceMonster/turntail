import {distributionTarget} from './distribution';
import {tr} from './i18n/index.ts';
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
/** 2026-11-20 user decision: 오늘의 판 shows its ad before the second (or later) try, not after each finished table. */
const resultOnly=(game:ResultGame|null)=>{const o=resultAdOpportunity(game);return o?.kind==='daily-finished'?null:o;};
/** Builds that carry interstitials: the ONE store web product and the Google Play app (AdMob). */
const adsBuild=distributionTarget==='onestore'||distributionTarget==='play';
export function hasResultAd(game:ResultGame|null){return adsBuild&&provider!==null&&resultOnly(game)!==null;}
export async function showResultAd(game:ResultGame|null){if(adsBuild)await gate(resultOnly(game),provider);}
/** Before a 오늘의 판 try after today's first one (ranked second try or practice). Never blocks the start. */
export async function showDailyAgainAd(){
 if(!adsBuild||!provider)return;
 await gate({key:`daily-again:${Date.now()}`,kind:'daily-finished'},provider);
}
/** ONE store test URL only (?adtest=1): a settings button that asks for an interstitial right away. */
export function adTestEnabled(){
 if(!adsBuild||typeof location==='undefined')return false;
 try{return new URLSearchParams(location.search).get('adtest')==='1';}catch{return false;}
}
export async function showAdTest():Promise<string>{
 if(!provider)return tr('광고 연결 안 됨: 원스토어 앱 밖이거나, SDK 시작·광고 ID·광고 지원 확인 중 하나가 실패했어요.');
 let ready=false;
 try{ready=await provider.ready();}catch{return tr('실패: 광고 준비 확인 중 오류가 났어요.');}
 if(!ready){try{provider.preload();}catch{}return tr('광고 준비 안 됨: 아직 받아 둔 광고가 없어요. 10~20초 뒤 다시 눌러 보세요.');}
 try{const r=await provider.show();return r.status==='completed'?tr('광고 표시 완료'):tr('광고 결과: {0}',{0:r.status});}
 catch{return tr('실패: 광고를 띄우다 오류가 났어요.');}
 finally{try{provider.preload();}catch{}}
}
/** Safe-area numbers for the ?adtest=1 panel, so a device screenshot tells whether the host reports the cutout. */
export function safeAreaReport(){
 const probe=document.createElement('div');
 probe.style.cssText='position:fixed;visibility:hidden;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
 document.documentElement.appendChild(probe);const cs=getComputedStyle(probe);
 const text=tr('안전 영역 위 {0} · 왼 {1} · 오 {2} · 아래 {3} · 화면 {4}×{5} · 창 {6}×{7} · 배율 {8}',{0:cs.paddingTop,1:cs.paddingLeft,2:cs.paddingRight,3:cs.paddingBottom,4:screen.width,5:screen.height,6:innerWidth,7:innerHeight,8:devicePixelRatio});
 probe.remove();return text;
}
