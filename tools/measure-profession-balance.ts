import fs from 'node:fs';
import {botMove} from '../lib/game.ts';
import {createRpgGame,startRpgRound} from '../lib/rpg-game.ts';
import {createHpItemGame} from '../lib/hp-item-mode.ts';
import {buyHpItemLoadout,hpItemShopPending} from '../lib/hp-item-shop.ts';
import {lastCombatBattle} from '../lib/rpg-profession-combat.ts';
import {RPG_PROFESSIONS} from '../lib/rpg-professions.ts';
const samples:{mode:string,profession:string,rounds:number,moves:number,fights:number,completed:boolean,passive:number,active:number,bonusDamage:number,healing:number,revealed:number}[]=[];
for(const mode of ['rpg','item'])for(const profession of RPG_PROFESSIONS)for(let trial=0;trial<4;trial++){
 const g=mode==='item'?createHpItemGame('전투 길이 확인','',Date.now(),2,'toto',profession.id):createRpgGame('전투 길이 확인','',Date.now(),profession.id);
 g.players.forEach(player=>{player.bot=true;});g.rpgRun!.equipped=[];
 let moves=0,passive=0,active=0,bonusDamage=0,healing=0,revealed=0;const seen=new Set<string>();
 while(g.rpgRun!.status==='playing'&&moves<1800&&g.round<=16){
  if(hpItemShopPending(g))buyHpItemLoadout(g,[]);
  if(g.phase==='ended'){startRpgRound(g);continue;}
  g.rpgRun!.consumables=[];g.rpgRun!.enemyConsumables={1:[],2:[]};g.turnReadyAt=0;botMove(g);moves++;
  const event=lastCombatBattle(g);if(event&&!seen.has(event.id)){seen.add(event.id);for(const effect of event.professions||[])if(effect.actor===0){if(effect.kind==='passive')passive++;else active++;bonusDamage+=effect.damage;healing+=effect.heal;revealed+=effect.revealed;}}
 }
 const row={mode,profession:profession.name,rounds:g.round,moves,fights:seen.size,completed:g.rpgRun!.status!=='playing',passive,active,bonusDamage,healing,revealed};samples.push(row);console.log(JSON.stringify(row));
}
const groups=[...new Set(samples.map(row=>`${row.mode}:${row.profession}`))].map(key=>{const rows=samples.filter(row=>`${row.mode}:${row.profession}`===key);const average=(field:keyof typeof rows[number])=>rows.reduce((sum,row)=>sum+Number(row[field]),0)/rows.length;return {group:key,runs:rows.length,completed:rows.filter(row=>row.completed).length,averageRounds:average('rounds'),averageFights:average('fights'),averagePassive:average('passive'),averageActive:average('active'),averageBonusDamage:average('bonusDamage'),averageHealing:average('healing'),averageRevealed:average('revealed')};});
const result={at:new Date().toISOString(),initialHp:100,sampleSize:samples.length,note:'Small random AI sample of the first encounter/match, with items and relics disabled to isolate profession effects. Existing character skills remain enabled in item mode. This does not establish final balance.',groups,samples};
fs.writeFileSync('D:/CHATGPT_CODEX/17_Turntail/artifacts/profession-balance-prototype.json',JSON.stringify(result,null,2)+'\n');console.log('SUMMARY '+JSON.stringify(groups));
