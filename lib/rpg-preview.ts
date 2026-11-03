import type {Game} from './game.ts';
import {enterJourneyNode} from './rpg-game.ts';
import {settleRpgPhaseOne,chooseRpgStageReward,reconcileRpgEliminations} from './rpg-phase-one.ts';

export type RpgPreviewMode='screens'|'one-round';
export type RpgPreviewScreen='prologue'|'map'|'tavern'|'battle-1'|'battle-2'|'battle-3';
/** Runtime-only owner. Never attach preview rules to a Game or serialize them. */
export class RpgPreviewSession{
 readonly runId:string;
 private handled=new Set<string>();
 private gear:{relics:string[],equipped:string[],consumables:string[]};
 private initial:Game;
 constructor(game:Game,readonly mode:RpgPreviewMode){
  if(!game.rpgRun?.journey||!game.rpgRun.phaseOne||game.rpgTest||game.hpItemMode)throw Error('화면 테스트용 새 RPG가 필요해요.');
  game.rpgRun.coins=1000;this.runId=game.rpgRun.id;this.gear=this.equipment(game);this.initial=structuredClone(game);
 }
 owns(game:Game){return game.rpgRun?.id===this.runId&&!game.hpItemMode&&!game.rpgTest;}
 private equipment(game:Game){const run=game.rpgRun!;return {relics:[...run.relics],equipped:[...run.equipped],consumables:[...run.consumables]};}
 screen(game:Game,target:RpgPreviewScreen):Game{
  if(this.mode!=='screens'||!this.owns(game))throw Error('프롤로그·화면 테스트에서만 바로 이동할 수 있어요.');
  if(!['prologue','map','tavern','battle-1','battle-2','battle-3'].includes(target))throw Error('확인할 화면을 선택해 주세요.');
  const next=structuredClone(this.initial),stage=target.startsWith('battle-')?Number(target.slice(7)):2;
  // Disposable scene fixtures use the existing stage gates. No hand is played,
  // and no fabricated clear is written to the user's RPG archive.
  for(let prior=1;prior<stage;prior++){
   enterJourneyNode(next,`battle-${prior}` as 'battle-1'|'battle-2');
   next.rpgRun!.hp=[100,0,0];reconcileRpgEliminations(next);
   next.rpgRun=chooseRpgStageReward(next.rpgRun!,'coins');
  }
  if(target==='tavern')enterJourneyNode(next,'tavern');
  else if(target.startsWith('battle-'))enterJourneyNode(next,target as 'battle-1'|'battle-2'|'battle-3');
  next.rpgRun!.coins=1000;
  return next;
 }
 update(game:Game){
  if(!this.owns(game))return false;
  const run=game.rpgRun!;
  if(game.phase==='playing'){this.gear=this.equipment(game);return false;}
  if(this.mode!=='one-round'||run.journey?.location!=='battle'||!game.result||this.handled.has(game.result.id)||run.status==='complete')return false;
  this.handled.add(game.result.id);
  if(run.status!=='allocation'){
   // Settlement may already have recorded a losing round and removed its gear.
   // Reuse the real clear/reward routines exactly once in this disposable run.
   const counted=run.roundIds.includes(game.result.id);
   game.rpgRun=settleRpgPhaseOne({...run,...(run.status==='game-over'?this.gear:{}),hp:[100,0,0],status:'playing',
    roundIds:run.roundIds.filter(id=>id!==game.result!.id),rounds:Math.max(0,run.rounds-(counted?1:0)),
    phaseOne:{...run.phaseOne!,eliminated:[1,2]}},counted?{...game.result,players:game.result.players.map(player=>({...player,delta:0}))}:game.result);
  }
  game.rpgRun=chooseRpgStageReward(game.rpgRun!,'coins');
  game.log=['TEST · 한 판 완료 · 승패와 관계없이 다음 여정으로',...game.log].slice(0,40);
  return true;
 }
}
