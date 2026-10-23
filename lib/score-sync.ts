import type {HighScore} from './challenge';
export async function syncPersonalScores(profileToken:string,name:string,rows:HighScore[],signal?:AbortSignal){
 const scores=rows.filter(r=>r.mode==='single');if(!scores.length)return;
 const response=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},signal:signal?AbortSignal.any([signal,AbortSignal.timeout(8000)]):AbortSignal.timeout(8000),body:JSON.stringify({action:'syncScores',profileToken,name:name||'플레이어',scores})});
 const data:any=await response.json();if(!response.ok)throw Error(data.error||'기록을 동기화하지 못했어요.');
}
