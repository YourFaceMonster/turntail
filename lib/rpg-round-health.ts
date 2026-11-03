import type {RpgRun} from './rpg';
export type RpgRoundHealth={round:number,before:number[],damage:number[],healing:number[],moneyDamage:number[],coinsBefore:number,coinsDelta?:number,partial?:boolean};
export function beginRpgRoundHealth(run:RpgRun,round:number){
 if(!run.phaseOne)return;
 run.roundHealth={round,before:[...run.hp],damage:run.hp.map(()=>0),healing:run.hp.map(()=>0),moneyDamage:run.hp.map(()=>0),coinsBefore:run.coins};
}
/** Presentation bookkeeping only; always record actual clamped HP changes. */
export function recordRpgRoundHealth(run:RpgRun,before:number[],money=false){
 if(!run.phaseOne)return;
 if(!run.roundHealth||run.roundHealth.round!==run.combat?.round){
  beginRpgRoundHealth(run,run.combat?.round||0);run.roundHealth!.before=[...before];run.roundHealth!.partial=true;
 }
 const report=run.roundHealth!;
 run.hp.forEach((hp,seat)=>{const delta=hp-before[seat];report.damage[seat]+=Math.max(0,-delta);report.healing[seat]+=Math.max(0,delta);if(money)report.moneyDamage[seat]+=Math.max(0,-delta);});
}
