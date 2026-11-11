/**
 * Lifetime "how many times did this relic fire" counts for the journey codex. Display only: the counts
 * never change rewards or stats. Each activation is counted once per run (by its sequence number), so
 * remounting the relic tray or reloading the page does not double-count.
 */
export const RELIC_TALLY_KEY='turntale-relic-tally';
export type RelicTally={counts:Record<string,number>,runs:Record<string,number>};
const EMPTY:RelicTally={counts:{},runs:{}};
const MAX_RUNS=8;

export function addRelicActivations(store:RelicTally,runId:string,activations:readonly {seq:number,relicId:string}[]):RelicTally{
 const last=store.runs[runId]||0,fresh=activations.filter(event=>event.seq>last);
 if(!fresh.length)return store;
 const counts={...store.counts};for(const event of fresh)counts[event.relicId]=(counts[event.relicId]||0)+1;
 const runs={...store.runs,[runId]:Math.max(last,...fresh.map(event=>event.seq))};
 // Keep only the most recent runs' cursors; older runs are finished and will not report again.
 const ids=Object.keys(runs);if(ids.length>MAX_RUNS)for(const id of ids.slice(0,ids.length-MAX_RUNS))if(id!==runId)delete runs[id];
 return {counts,runs};
}
export function readRelicTally():RelicTally{
 try{const raw=JSON.parse(localStorage.getItem(RELIC_TALLY_KEY)||'null');if(raw&&typeof raw.counts==='object'&&typeof raw.runs==='object')return raw;}catch{}
 return EMPTY;
}
export function recordRelicActivations(runId:string,activations:readonly {seq:number,relicId:string}[]){
 try{const next=addRelicActivations(readRelicTally(),runId,activations);localStorage.setItem(RELIC_TALLY_KEY,JSON.stringify(next));}catch{}
}
