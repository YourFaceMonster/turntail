import {hasRoundCombat,roundSkill} from './profession-round-rules';
import {hpLimit} from './hp-limit';
import {combo,legalOptions,rank,sorted,type BotPosition,type BotAction,type Tile} from './game';
import {chooseStrategicAction,publicBotCandidates,publicControlChance} from './bot';
import {rpgProfessionTriggers} from './rpg-professions';
import {PROFESSION_ACTIVES,activeGauge,professionActiveAvailability} from './profession-actives';
import {rpgItemAvailability,exchangeEligible,exchangeTargetAvailable,type RpgTacticalItem} from './rpg-items';
import {HP_ITEM_PRICES} from './hp-item-shop';
import {publicBattleRelicIds} from './item-battle-public-relics';
import {itemBattleRelicWin} from './item-battle-relics';

export type ItemBattleAux={type:'profession',target:number}|{type:'item',id:RpgTacticalItem,target?:number,ids?:number[]};
export type ItemBattleDecision=BotAction|ItemBattleAux;
export type ItemBattlePlan={action:ItemBattleDecision,followUp?:ItemBattleDecision,score:number,reason:string,objective:'first'|'secure-second'|'survive',considered:number};
type State={hp:number[],counts:number[],wallet:number,cost:number,bonus:number,futureGuard:number,steps:ItemBattleAux[],ended:boolean};
const RANK_VALUE=[12000,2500,-10000];
export const isItemBattleAI=(p:Pick<BotPosition,'hpItemMode'|'hpItemRules'|'rpgRun'>)=>!!p.hpItemMode&&p.hpItemRules===4&&!!p.rpgRun?.combat?.itemBattle;

/** Only usable knowledge enters evaluation. Foreign injected hands, covered lower
 * faces, wallets, guards, gauges and inventories never become decision inputs. */
function knowledge(input:BotPosition):BotPosition{
 const p=structuredClone(input),me=p.me,run=p.rpgRun!;
 p.players=p.players.map((player,seat)=>({...player,hand:seat===me?sorted(player.hand||[]):undefined,known:[...player.known]}));
 p.stacks=p.stacks.map(stack=>({...stack,lower:stack.upper?null:stack.lower}));
 run.itemGuards={[me]:!!run.itemGuards?.[me]};run.enemyConsumables={[me]:[...run.consumables]};
 run.tactics={[me]:run.tactics?.[me]||{round:p.round,used:run.tacticalUsed||0}};
 if(me!==0)run.equipped=[];
 if(run.combat?.actives){run.combat.actives.gauge=run.combat.actives.gauge.map((v,i)=>i===me?v:0);run.combat.actives.lastUsedTurn=run.combat.actives.lastUsedTurn.map((v,i)=>i===me?v:null);}
 if(run.combat?.itemBattle){const extra=run.combat.itemBattle;extra.traps=extra.traps.filter(trap=>trap.owner===me);extra.trapIntel={[me]:extra.trapIntel[me]||[]};}
 const peek=run.tactics[me]?.handPeek;
 if(peek?.round===p.round&&!p.played.some(tile=>tile.id===peek.tile.id)&&!p.players[peek.target].known.some(tile=>tile.id===peek.tile.id))p.players[peek.target].known.push({...peek.tile});
 if(p.hpItemMatch)p.hpItemMatch.points=p.hpItemMatch.points.map((v,i)=>i===me?v:0);
 return p;
}
function ranks(hp:number[],counts:number[]){return hp.map((value,i)=>1+hp.filter((other,j)=>other>value||other===value&&counts[j]<counts[i]).length);}
/** Ongoing outlook is a heuristic, not a measured win probability. Terminal
 * values follow the actual HP/hand-count rank rule and distinguish 2nd from 3rd. */
export function itemBattlePositionValue(hp:number[],counts:number[],me:number,terminal=hp.some(value=>value<=0)){
 if(terminal)return RANK_VALUE[Math.min(2,ranks(hp,counts)[me]-1)];
 const strength=hp.map((value,seat)=>Math.exp((value-Math.max(...hp))/24-(counts[seat]-Math.min(...counts))*.065)),total=strength.reduce((a,b)=>a+b,0);
 const first=strength[me]/total,second=strength.reduce((chance,value,seat)=>seat===me?chance:chance+value/total*strength[me]/(total-value),0),last=Math.max(0,1-first-second);
 return first*RANK_VALUE[0]+second*RANK_VALUE[1]+last*RANK_VALUE[2];
}
function value(p:BotPosition,s:State){
 const terminal=s.ended||(!hasRoundCombat(p)&&s.hp.some(hp=>hp<=0));if(terminal)return itemBattlePositionValue(s.hp,s.counts,p.me,true);
 const outlook=[...s.hp],debt=Math.max(0,s.counts[p.me]*s.counts.length-s.counts.reduce((sum,n)=>sum+n,0)-s.wallet);
 // Hoarding floor tiles can preserve today's HP and still bankrupt us at the
 // round settlement. Discount that public own-wallet liability before ranking.
 outlook[p.me]=Math.max(.1,outlook[p.me]-debt*.65)+s.futureGuard;
 return itemBattlePositionValue(outlook,s.counts,p.me,false)+s.wallet*.8;
}
function initial(p:BotPosition):State{return {hp:p.rpgRun!.hp.map((hp,seat)=>hasRoundCombat(p)?hp-(p.rpgRun!.combat?.pendingRound?.damage[seat]||0)+(p.rpgRun!.combat?.pendingRound?.healing[seat]||0):hp),counts:p.players.map(player=>player.count),wallet:p.hpItemMatch?.points[p.me]||0,cost:0,bonus:0,futureGuard:p.rpgRun!.itemGuards?.[p.me]?4.2:0,steps:[],ended:false};}
function copy(s:State):State{return {...s,hp:[...s.hp],counts:[...s.counts],steps:[...s.steps]};}
function totals(p:BotPosition,seat:number){
 const recorded=p.hpItemMatch?.battleTiles?.[seat];if(recorded!==undefined)return recorded;
 let count=0;for(const line of p.log){if(line.includes('선을 잡았습니다')||line.startsWith('라운드 '))break;const match=line.match(/ · .+ (\d+)개 제출$/);if(match&&line.startsWith(p.players[seat].name+' · '))count+=Number(match[1]);}return Math.max(count,p.lastBy===seat?p.trick.length:0);
}
function battleEffect(p:BotPosition,seat:number,tiles:Tile[],submitted:number){
 const combat=p.rpgRun!.combat!,label=combo(tiles)?.label||'싱글',role=combat.professions[seat],trigger=rpgProfessionTriggers(role,label,combat.activeUsed[seat]);
 let damage=submitted+(trigger.passive?.damage||0)+(trigger.active?.damage||0),heal=(trigger.passive?.heal||0)+(trigger.active?.heal||0);
 if(role==='swordsman'&&label==='싱글')damage++;
 if(role==='mage'&&tiles.length===5)damage+=4;
 if(role==='cleric'&&label==='페어'&&combat.itemBattle?.pairWins[seat]===1)heal+=2;
 const relicIds=seat===0&&p.me===0?p.rpgRun!.equipped:publicBattleRelicIds(p.hpItemMatch,seat);
 const relic=itemBattleRelicWin(relicIds,label,tiles);damage+=relic.damage;heal+=relic.heal;
 return {damage,heal};
}
function resolveBattle(p:BotPosition,s:State,seat:number,tiles:Tile[],submitted:number){
 if(hasRoundCombat(p)){
  const result=copy(s),label=combo(tiles)?.label||'싱글',role=p.rpgRun!.combat!.professions[seat],skill=roundSkill(role,label),targets=p.players.flatMap((_,i)=>i!==seat&&p.rpgRun!.hp[i]>0?[i]:[]);
  const relicIds=seat===0&&p.me===0?p.rpgRun!.equipped:publicBattleRelicIds(p.hpItemMatch,seat),relic=itemBattleRelicWin(relicIds,label,tiles);
  const hit=label==='싱글'||role==='mage'?skill.damage:role==='swordsman'?skill.damage/Math.max(1,targets.length):role==='rogue'&&skill.trap?(skill.trap*.45+.55)/Math.max(1,targets.length):0;
  result.hp=result.hp.map((hp,i)=>i===seat?hp+skill.heal+relic.heal:targets.includes(i)?hp-hit-relic.damage:hp);
  if(result.counts.some(n=>n===0)){result.hp=result.hp.map(hp=>Math.max(0,Math.min(hpLimit(p.rpgRun),hp)));result.ended=result.hp.some(hp=>hp<=0);}
  return result;
 }
 const result=copy(s),effect=battleEffect(p,seat,tiles,submitted);
 result.hp=result.hp.map((hp,index)=>index===seat?Math.min(hpLimit(p.rpgRun),hp+effect.heal):Math.max(0,hp-effect.damage));result.ended=result.hp.some(hp=>hp<=0);return result;
}
function roundMoney(p:BotPosition,s:State){
 if(s.ended)return s;const result=copy(s),delta=s.counts.reduce((sum,n)=>sum+n,0)-s.counts[p.me]*s.counts.length;
 result.hp[p.me]=Math.max(0,result.hp[p.me]-Math.max(0,-delta-result.wallet));result.wallet=Math.max(0,result.wallet+delta);result.ended=result.hp.some(hp=>hp<=0);return result;
}
function terminalThreat(p:BotPosition,s:State){
 let expected=0;
 for(let seat=0;seat<p.players.length;seat++){
  if(seat===p.me||s.counts[seat]>5)continue;
  const player=p.players[seat],knownFinish=player.known.length===player.count&&!!combo(player.known),chance=knownFinish ? .8 : s.counts[seat]===1 ? .55 : s.counts[seat]===2 ? .16 : .06;
  const hit=hasRoundCombat(p)?(s.counts[seat]===1?1:s.counts[seat]===2?2:s.counts[seat]===3?3:5):Math.max(1,totals(p,seat)+s.counts[seat]+(p.rpgRun!.combat!.professions[seat]==='mage'&&s.counts[seat]===5?4:0));
  if(s.hp[p.me]<=hit)expected+=chance;
 }
 return Math.min(.8,expected);
}
function knownFloor(p:BotPosition,index:number){
 const stack=p.stacks[index];if(!stack.upper)return stack.lower;
 return p.rpgRun?.tacticalPeeks?.find(peek=>peek.round===p.round&&peek.index===index)?.tile||null;
}
function draw(p:BotPosition,start:State,index:number){
 const s=copy(start);s.counts[p.me]++;
 const stack=p.stacks[index],extra=p.rpgRun!.combat!.itemBattle!,peek=p.rpgRun!.tactics?.[p.me]?.peeks?.find(peek=>peek.index===index&&peek.round===p.round);
 s.wallet+=stack.coinAmount||0;
 if(!hasRoundCombat(p)&&p.rpgRun!.combat!.professions[p.me]==='rogue'&&peek?.source==='profession')s.hp=s.hp.map((hp,seat)=>seat===p.me?hp:Math.max(0,hp-1));
 const hostile=extra.trapIntel[p.me]?.some(intel=>intel.index===index&&intel.trapped);if(hostile)s.hp[p.me]=Math.max(0,s.hp[p.me]-4);
 s.ended=(!hasRoundCombat(p)||s.counts.some(n=>n===0))&&s.hp.some(hp=>hp<=0);if(s.ended||p.lastBy===null)return {score:value(p,s),state:s};
 const next=(p.me+1)%p.players.length,probability=next===p.lastBy?1:publicControlChance(p,p.trick,p.lastBy,[p.me]),won=resolveBattle(p,s,p.lastBy,p.trick,Math.max(p.trick.length,totals(p,p.lastBy)));
 let score=probability*value(p,won)+(1-probability)*value(p,s);
 const opponent=p.players[next],finishes=next!==p.me&&opponent.known.length===opponent.count?legalOptions(opponent.known,p.trick).filter(option=>option.tiles.length===opponent.count):[];
 if(finishes.length){const lost=copy(s);lost.counts[next]=0;const outcome=roundMoney(p,resolveBattle(p,lost,next,finishes[0].tiles,totals(p,next)+finishes[0].tiles.length));score=Math.min(score,value(p,outcome));}
 return {score,state:s};
}
function cardScore(p:BotPosition,start:State,candidate:ReturnType<typeof publicBotCandidates>[number]){
 const action=candidate.action,baseline=value(p,start);let score=baseline,roundFinish=false,terminalFinish=false;
 if(action.type==='play'){
  const after=copy(start);after.counts[p.me]-=action.tiles.length;
  const finish=after.counts[p.me]===0,hit=resolveBattle(p,after,p.me,action.tiles,totals(p,p.me)+action.tiles.length),winning=finish?roundMoney(p,hit):hit;
  roundFinish=finish;terminalFinish=finish&&winning.ended;
  const chance=finish?1:candidate.counters.reduce((v,risk)=>v*(1-risk.chance),1);
  let failed=value(p,after),weight=0,sum=0;
  for(const counter of candidate.counters){if(!counter.chance)continue;const other=copy(after);other.counts[counter.seat]=Math.max(0,other.counts[counter.seat]-action.tiles.length);const hit=resolveBattle(p,other,counter.seat,action.tiles,totals(p,counter.seat)+action.tiles.length),result=other.counts[counter.seat]===0?roundMoney(p,hit):hit;sum+=value(p,result)*counter.chance;weight+=counter.chance;}
  if(weight)failed=sum/weight;
  score=chance*value(p,winning)+(1-chance)*failed;
  if(!finish&&!winning.ended)score-=terminalThreat(p,after)*350;
 }else if(action.type==='draw')score=draw(p,start,action.index).score;
 else if(p.lastBy!==null){const next=(p.me+1)%p.players.length,won=resolveBattle(p,start,p.lastBy,p.trick,Math.max(p.trick.length,totals(p,p.lastBy)));score=next===p.lastBy?value(p,won):.65*value(p,won)+.35*baseline;}
 const debt=Math.max(0,start.counts[p.me]*start.counts.length-start.counts.reduce((sum,n)=>sum+n,0)-start.wallet),danger=Math.min(...start.hp)<=Math.max(18,...p.players.map((_,seat)=>totals(p,seat)+8))||debt>=start.hp[p.me]*.5;
 // Before an HP/solvency endgame, preserve the proven hand-shedding policy.
 // A speculative single counter must not outweigh an entire future round.
 score=baseline+(score-baseline)*(danger||roundFinish?1:0);
 let bonus=candidate.score*8+(roundFinish&&!terminalFinish?2000:0);
 if(action.type==='draw'){
  const face=knownFloor(p,action.index),hand=p.players[p.me].hand||[],matches=face?hand.filter(tile=>tile.n===face.n).length:0;
  bonus+=(p.stacks[action.index].coinAmount||0)*20+matches*20+(face?.n===2?30:0);
  const peek=p.rpgRun!.tactics?.[p.me]?.peeks?.find(peek=>peek.index===action.index&&peek.round===p.round);if(!hasRoundCombat(p)&&peek?.source==='profession'&&p.rpgRun!.combat!.professions[p.me]==='rogue')bonus+=25;
 }
 return score+bonus-start.cost+start.bonus;
}
function shortlist(p:BotPosition){
 const hand=p.players[p.me].hand||[],groups=new Map<string,ReturnType<typeof publicBotCandidates>>();
 // Large racks must not enumerate C(40,5) on a phone. Three overlapping
 // own-hand windows retain low/high/middle groups with a fixed search ceiling.
 const pools=hand.length<=18?[hand]:[hand.slice(0,18),hand.slice(-18),hand.slice(Math.floor((hand.length-18)/2),Math.floor((hand.length-18)/2)+18)],merged=new Map<string,ReturnType<typeof publicBotCandidates>[number]>();
 for(const pool of pools){
  const ownIds=new Set(pool.map(tile=>tile.id)),small=pool===hand?p:{...p,played:[...p.played,...hand.filter(tile=>!ownIds.has(tile.id))],players:p.players.map((player,seat)=>seat===p.me?{...player,hand:pool}:player)};
  for(const candidate of publicBotCandidates(small)){const a=candidate.action,key=a.type==='play'?'play:'+a.tiles.map(tile=>tile.id).sort((x,y)=>x-y).join(','):a.type==='draw'?'draw:'+a.index:'pass';if(!merged.has(key)||candidate.score>merged.get(key)!.score)merged.set(key,candidate);}
 }
 const ranked=[...merged.values()];
 if(!p.trick.length){
  const options=(hand.length<=18?legalOptions(hand,[]):ranked.flatMap(candidate=>candidate.action.type==='play'?[{tiles:candidate.action.tiles}]:[])).sort((a,b)=>b.tiles.length-a.tiles.length),cache=new Map<string,number>();
  const moves=(tiles:Tile[])=>{const key=tiles.map(tile=>tile.id).join(',');if(cache.has(key))return cache.get(key)!;const remaining=new Set(tiles.map(tile=>tile.id));let count=0;for(const option of options)if(option.tiles.every(tile=>remaining.has(tile.id))){option.tiles.forEach(tile=>remaining.delete(tile.id));count++;}const n=count+remaining.size;cache.set(key,n);return n;},before=moves(hand);
  for(const candidate of ranked)if(candidate.action.type==='play'){
   const tiles=candidate.action.tiles,ids=new Set(tiles.map(tile=>tile.id)),effect=battleEffect(p,p.me,tiles,tiles.length),extra=effect.damage-tiles.length,known=p.players.filter((player,seat)=>seat!==p.me&&legalOptions(player.known,tiles).length).length;
   candidate.score=tiles.length*12+(before-moves(hand.filter(tile=>!ids.has(tile.id))))*18+extra*7+Math.min(effect.heal,hpLimit(p.rpgRun)-p.rpgRun!.hp[p.me])*3-known*25-tiles.reduce((sum,tile)=>sum+rank(tile),0)*.12-tiles.filter(tile=>tile.n===2).length*12;
  }
  ranked.sort((a,b)=>b.score-a.score);
 }
 for(const candidate of ranked){const action=candidate.action,key=action.type==='play'?combo(action.tiles)!.label:action.type;const group=groups.get(key)||[];group.push(candidate);groups.set(key,group);}
 return [...groups.values()].flatMap(group=>group[0].action.type==='play'?group.length<=10?group:[...group.slice(0,7),...group.slice(-3)]:group);
}
function auxiliaries(p:BotPosition,now:number):ItemBattleAux[]{
 const actions:ItemBattleAux[]=[],run=p.rpgRun!,combat=run.combat!,role=combat.professions[p.me],opponents=p.players.flatMap((_,seat)=>seat===p.me||run.hp[seat]<=0?[]:[seat]);
 if(professionActiveAvailability(p,p.me,true,now).usable){
  if(role==='swordsman')opponents.forEach(target=>actions.push({type:'profession',target}));
  else if(role==='rogue'){
   const traps=combat.itemBattle!.traps,choices=p.stacks.flatMap((stack,index)=>(stack.upper||stack.lowerPresent)&&!traps.some(trap=>trap.index===index)?[{index,bait:(stack.available?2:.3)+(stack.coinAmount||0)*2+(knownFloor(p,index)?.n===2?2:0)}]:[]).sort((a,b)=>b.bait-a.bait||a.index-b.index).slice(0,3);
   choices.forEach(choice=>actions.push({type:'profession',target:choice.index}));
  }else actions.push({type:'profession',target:role==='cleric'?p.me:-1});
 }
 for(const id of [...new Set(run.consumables)] as RpgTacticalItem[]){
  if(!rpgItemAvailability(p,id,true).usable)continue;
  if(id==='emergency-herb'||id==='ward-seal')actions.push({type:'item',id,target:p.me});
  else if(id==='ember-bomb'||id==='whisper-eye')opponents.forEach(target=>actions.push({type:'item',id,target}));
  else if(id==='scout-lens')p.stacks.flatMap((stack,index)=>stack.available&&stack.upper&&!knownFloor(p,index)?[index]:[]).slice(0,3).forEach(target=>actions.push({type:'item',id,target}));
  else if(id==='swapped-fate'||id==='fates-scales'){
   const count=id==='fates-scales'?2:1,hand=p.players[p.me].hand||[],eligible=hand.filter(exchangeEligible).sort((a,b)=>hand.filter(tile=>tile.n===a.n).length-hand.filter(tile=>tile.n===b.n).length||rank(a)-rank(b));
   opponents.filter(seat=>exchangeTargetAvailable(p,id,seat)).forEach(target=>{if(eligible.length>=count)actions.push({type:'item',id,target,ids:eligible.slice(0,count).map(tile=>tile.id)});});
  }
 }
 return actions;
}
function applyAux(p:BotPosition,before:State,action:ItemBattleAux,hasPlay:boolean){
 const s=copy(before),role=p.rpgRun!.combat!.professions[p.me],gauge=activeGauge(p,p.me),config=PROFESSION_ACTIVES[role];s.steps.push(action);
 if(action.type==='profession'){
  if(role==='rogue'){
   const stack=p.stacks[action.target],chance=stack.available ? .55 : .16,next=(p.me+1)%p.players.length,damage=copy(s);damage.hp[next]=Math.max(0,damage.hp[next]-4);damage.ended=damage.hp.some(hp=>hp<=0);
   s.bonus+=chance*(value(p,damage)-value(p,s))+(stack.coinAmount||0)*4;s.cost+=70;return s;
  }
  const amount=config.values[gauge];s.hp=s.hp.map((hp,seat)=>role==='cleric'&&seat===p.me?Math.min(hpLimit(p.rpgRun),hp+amount):seat!==p.me&&(role==='mage'||role==='swordsman'&&seat===action.target)?Math.max(0,hp-amount):hp);
  const unit=copy(before);
  unit.hp=unit.hp.map((hp,seat)=>role==='cleric'&&seat===p.me?Math.min(hpLimit(p.rpgRun),hp+1):seat!==p.me&&(role==='mage'||seat===action.target)?Math.max(.1,hp-1):hp);
  const marginal=Math.max(15,itemBattlePositionValue(unit.hp,unit.counts,p.me,false)-itemBattlePositionValue(before.hp,before.counts,p.me,false));
  const reserve=before.hp[p.me]<=15 ? .15 : gauge===config.maxGauge ? .30 : .95;
  s.cost+=marginal*(Math.max(...config.values)/config.maxGauge)*gauge*reserve;
 }else{
  if(action.id==='emergency-herb')s.hp[p.me]=hasRoundCombat(p)?s.hp[p.me]+10:Math.min(hpLimit(p.rpgRun),s.hp[p.me]+10);
  if(action.id==='ember-bomb'&&action.target!==undefined)s.hp[action.target]=Math.max(0,s.hp[action.target]-8);
  s.cost+=(HP_ITEM_PRICES[action.id]||6)*16;
  if(action.id==='ward-seal')s.futureGuard=4.2;
  if(action.id==='whisper-eye')s.bonus+=p.players[action.target!].count<=3?95:40;
  if(action.id==='scout-lens')s.bonus+=95+(p.stacks[action.target!].coinAmount||0)*8;
  if(action.id==='swapped-fate'||action.id==='fates-scales')s.bonus+=hasPlay?15:160;
 }
 s.ended=(!hasRoundCombat(p)||s.counts.some(n=>n===0))&&s.hp.some(hp=>hp<=0);if(s.ended){s.cost=0;s.bonus=0;}return s;
}
/** Compare cards, skills, items and both skill/item orders under one objective.
 * Execute only the first step, then replan after the actual observation/animation. */
export function analyzeItemBattleTurn(input:BotPosition,{auxiliary=true,now=Date.now()}={}):ItemBattlePlan{
 if(!isItemBattleAI(input)){const action=chooseStrategicAction(input,3);return {action,score:0,reason:'일반 패 전략',objective:'survive',considered:1};}
 const p=knowledge(input),start=initial(p),cards=shortlist(p),aux=auxiliary?auxiliaries(p,now):[],prefixes=[start];
 const hasPlay=cards.some(candidate=>candidate.action.type==='play');
 for(const action of aux){const first=applyAux(p,start,action,hasPlay);prefixes.push(first);if(first.ended)continue;for(const other of aux){if(other.type===action.type)continue;prefixes.push(applyAux(p,first,other,hasPlay));}}
 let best:ItemBattlePlan|undefined,considered=0;
 for(const prefix of prefixes){
  if(prefix.ended){const score=value(p,prefix),place=ranks(prefix.hp,prefix.counts)[p.me];considered++;if(!best||score>best.score)best={action:prefix.steps[0],followUp:prefix.steps[1],score,reason:place===1?'즉시 1등 확정':place===2?'즉시 2등 확보':'생존 실패 최소화',objective:place===1?'first':place===2?'secure-second':'survive',considered:0};continue;}
  for(const candidate of cards){
   const action=candidate.action;
   if(prefix.steps.some(step=>step.type==='item'&&(step.id==='swapped-fate'||step.id==='fates-scales')&&action.type==='play'&&action.tiles.some(tile=>step.ids?.includes(tile.id))))continue;
   let score=cardScore(p,prefix,candidate);considered++;
   if(action.type==='draw'&&prefix.steps.some(step=>step.type==='profession'&&p.rpgRun!.combat!.professions[p.me]==='rogue'&&step.target===action.index))score-=250;
   if(!best||score>best.score)best={action:prefix.steps[0]||action,followUp:prefix.steps[1]|| (prefix.steps.length?action:undefined),score,reason:prefix.steps.length?'스킬·아이템 이후 패 행동 비교':action.type==='play'?'직업·승리 가능성·최종 순위 비교':'생존·주화·다음 결투 비교',objective:start.hp[p.me]<=20?'survive':'first',considered:0};
  }
 }
 return {...(best||{action:chooseStrategicAction(p,3),score:value(p,start),reason:'합법 행동',objective:'survive' as const}),considered};
}
