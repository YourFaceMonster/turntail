import type {RpgRun} from './rpg.ts';
/** Retired paths are never playable; only normalize decoded legacy saves, preserving resources. */
export function restoreRetiredJourneyNodes(run:RpgRun){
 const j=run.journey;if(!j)return;
 const legacy=j as unknown as Record<string,unknown>,retired=new Set(['ruins','forest','town-event']);
 if(retired.has(String(legacy.currentNode)))j.currentNode=`battle-${run.stage}` as typeof j.currentNode;
 if(Array.isArray(j.completedNodes))j.completedNodes=j.completedNodes.filter(id=>!retired.has(id));
 delete legacy.path;delete legacy.branchOutcome;delete legacy.townEvent;
}
