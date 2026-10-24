import type {SavedTableItem} from './saved-table';
import type {DealTarget} from './deal-animation';
import {tileBodyDepth,tileBodyHandoff} from './tile-body';
import {GPU_TILE_STRIDE} from './entrance-gpu';
import {entranceDuration,type EntrancePhase} from './atmosphere';
export type ResumeRow={item:SavedTableItem,target:DealTarget,baseTarget?:DealTarget};
/** Match the new game's flat end pose before the live board becomes visible. */
export function resumeHandoffProgress(phase:EntrancePhase,elapsed:number){return tileBodyHandoff(phase,elapsed/Math.max(1,entranceDuration(phase,true)));}

export function resumeRenderPlan(rows:ResumeRow[]){
 let slot=2;return rows.flatMap(({item,target,baseTarget})=>{const depth=tileBodyDepth(target.height),face=item.back?0:item.tile?slot++:1;
  return [...((item.level||1)>1?[{target:baseTarget||target,depth,z:depth,slot:1,coveredBase:true}]:[]),{target,depth,z:depth*(item.level||1),slot:face,coveredBase:false}];
 });
}
export function writeResumeFrame(data:Float32Array,tiles:ReturnType<typeof resumeRenderPlan>,settling=0){
 const f=Math.max(0,Math.min(1,1-settling));tiles.forEach((tile,i)=>{const t=tile.target;data.set([t.x,t.y,tile.z*f,t.angle*Math.PI/180,t.width,t.height,tile.depth*f,tile.slot===0?0:Math.PI,tile.slot,f,tile.coveredBase?f:1,0],i*GPU_TILE_STRIDE);});return data;
}
