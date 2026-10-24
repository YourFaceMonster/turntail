import type {HighScore} from './challenge';
type Receipt={ids:string[],name:string};
function readReceipt(key:string):Receipt{try{return JSON.parse(localStorage.getItem(key)||'null')||{ids:[],name:''};}catch{return {ids:[],name:''};}}
function acknowledge(key:string,ids:string[],name:string,retained:Set<string>){try{const prior=readReceipt(key);localStorage.setItem(key,JSON.stringify({ids:[...new Set([...prior.ids,...ids])].filter(id=>retained.has(id)),name}));}catch{/* Retrying an acknowledged event is safe. */}}
export async function syncPersonalScores(profileToken:string,name:string,rows:HighScore[],signal?:AbortSignal){
 const key=`turntale-score-receipts-v038:${profileToken}`,receipt=readReceipt(key),sent=new Set(receipt.ids),cleanName=name||'플레이어';
 const identity=(r:HighScore)=>`${r.size}:${r.id}`,retained=new Set(rows.filter(r=>r.mode==='single').map(identity));
 if(receipt.ids.some(id=>!retained.has(id)))acknowledge(key,[],receipt.name,retained);
 const pending=rows.filter(r=>r.mode==='single'&&!sent.has(identity(r)));
 if(!pending.length&&receipt.name===cleanName)return;
 // Server accepts at most 18 events per request. A failed batch stays pending
 // across reloads; retries never duplicate an already accepted result.
 for(let offset=0;offset<Math.max(1,pending.length);offset+=18){
  const scores=pending.slice(offset,offset+18);
  const response=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},signal:signal?AbortSignal.any([signal,AbortSignal.timeout(8000)]):AbortSignal.timeout(8000),body:JSON.stringify({action:'syncScores',profileToken,name:cleanName,scores})});
  const data:any=await response.json();if(!response.ok)throw Error(data.error||'기록을 동기화하지 못했어요.');
  acknowledge(key,scores.map(identity),cleanName,retained);
 }
}
