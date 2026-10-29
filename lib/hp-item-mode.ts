import {NEW_ITEM_MATCH_HP,hpLimit} from './hp-limit';
import {itemBattleVisualStage,newItemBattleVisualStage,validItemBattleStage} from './item-battle-visuals';
import {newProfessionCombat} from './rpg-profession-combat.ts';
import type {RpgProfessionId} from './rpg-professions.ts';
import {hpCharacter,pickHpOpponents,type HpCharacterId} from './hp-item-skills.ts';
import {isBattleItemMode} from './hp-item-battle.ts';
import {finishHpItemRoundReport,HP_ITEM_START_POINTS,type HpItemVariant} from './hp-item-shop.ts';
import {uid,type Game} from './game.ts';
import {createRpgTestGame} from './rpg-game.ts';
import {rpgRanks,RPG_RELICS} from './rpg.ts';
import {refundLegacyEmbers} from './rpg-items.ts';
import {ITEM_BATTLE_RELIC_POOL} from './item-battle-relics.ts';
import {applyPioneerDeal,newItemBattleState} from './item-battle-rules.ts';
import {prepareFloorCoins} from './floor-coins.ts';
import {newProfessionActives,ensureProfessionActives} from './profession-actives.ts';

export const HP_ITEM_STORAGE_KEY='turntale-hp-items-v1';
export const HP_ITEM_SHOP_STORAGE_KEY='turntale-hp-items-2-v1';
const storageKey=(variant:HpItemVariant)=>variant===2?HP_ITEM_SHOP_STORAGE_KEY:HP_ITEM_STORAGE_KEY;
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
export type HpItemRecord={id:string,name:string,rank:number,hp:number[],rounds:number,at:number,status:'complete'|'abandoned',variant?:HpItemVariant,rules?:2|3|4};
export type HpItemArchive={version:1,active:Game|null,records:HpItemRecord[]};
export function emptyHpItemArchive():HpItemArchive{return {version:1,active:null,records:[]};}
export function createHpItemGame(name:string,avatar='',now=Date.now(),variant:HpItemVariant=1,character:HpCharacterId='toto',profession?:RpgProfessionId,maxHp=NEW_ITEM_MATCH_HP):Game{
 const game=createRpgTestGame(name,avatar,now);delete game.rpgTest;game.hpItemMode=true;game.hpItemVariant=variant;game.code='HP-ITEM-'+uid();
 game.hpItemMatch={pendingItemDelta:[0,0,0],pendingItemPoints:[0,0,0],points:[HP_ITEM_START_POINTS,HP_ITEM_START_POINTS,HP_ITEM_START_POINTS],shopRound:0,roundStartHp:[...game.rpgRun!.hp],roundItems:[],roundEarned:[0,0,0]};
 if(variant===2){
  game.hpItemMatch.visualStage=newItemBattleVisualStage();game.hpItemMatch.tileSet=newItemBattleVisualStage();game.hpItemRules=4;pickHpOpponents().forEach((id,index)=>{const person=hpCharacter(id);game.players[index+1].name=person.name;game.players[index+1].avatar=person.avatar;});game.hpItemMatch.battleTiles=game.players.map(()=>0);game.hpItemMatch.battles=[];game.hpItemMatch.roundMoneyBefore=[...game.hpItemMatch.points];
  // Keep RPG point-bonus relics out of this wallet; floor coins have their own ledger.
  const excluded=['gamblers-gloves','stopped-hourglass','mor-quill','twin-needle-compass','split-mirror'],run=game.rpgRun!;
  run.consumables=[];
  run.enemyConsumables={1:[],2:[]};
  const relics=run.equipped.filter(id=>!excluded.includes(id)),pool=RPG_RELICS.filter(relic=>!excluded.includes(relic.id)&&!relics.includes(relic.id)).map(relic=>relic.id);
  while(relics.length<3&&pool.length){const random=new Uint32Array(1);crypto.getRandomValues(random);relics.push(pool.splice(random[0]%pool.length,1)[0]);}
  run.relics=[...relics];run.equipped=[...relics];run.discovered=[...relics];
 }else{
  pickHpOpponents().forEach((id,index)=>{const person=hpCharacter(id);game.players[index+1].name=person.name;game.players[index+1].avatar=person.avatar;});
 }
 if(variant===2&&profession){
  game.rpgRun!.maxHp=hpLimit({maxHp});game.rpgRun!.hp=game.players.map(()=>game.rpgRun!.maxHp!);game.hpItemMatch!.roundStartHp=[...game.rpgRun!.hp];
  const run=game.rpgRun!,combat=newProfessionCombat(profession,game.players.map(player=>player.avatar||''),game.round);combat.itemBattle=newItemBattleState(game.players.length);combat.actives=newProfessionActives(game.players.length);run.combat=combat;
  const pool=ITEM_BATTLE_RELIC_POOL.map(relic=>relic.id as string),relics:string[]=[];
  while(relics.length<3&&pool.length){const random=new Uint32Array(1);crypto.getRandomValues(random);relics.push(pool.splice(random[0]%pool.length,1)[0]);}
  run.relics=[...relics];run.equipped=[...relics];run.discovered=[...relics];applyPioneerDeal(game,now);prepareFloorCoins(game);
 }
 return game;
}
export function hpItemRanks(game:Pick<Game,'players'|'rpgRun'>){return rpgRanks(game.rpgRun!.hp,game.players.map(player=>player.hand.length));}
export function finishHpItemMatch(game:Game){
 const run=game.rpgRun;if(!game.hpItemMode||!run||!run.hp.some(hp=>hp<=0))return;
 if(isBattleItemMode(game)&&game.hpItemMatch&&!game.result){game.hpItemMatch.moneySkipped=true;game.hpItemMatch.endReason??='item';}
 const visualReady=game.turnReadyAt||0;run.hp=run.hp.map(hp=>Math.max(0,hp));run.status='complete';run.reward=null;run.updatedAt=Date.now();game.phase='ended';game.turnDeadline=0;game.turnReadyAt=isBattleItemMode(game)?Math.max(visualReady,Date.now()+1000):0;
 finishHpItemRoundReport(game);game.winner=hpItemRanks(game).findIndex(rank=>rank===1);
}
export function readHpItemArchive(storage:StoragePort,variant:HpItemVariant=1):HpItemArchive{
 const raw=storage.getItem(storageKey(variant));if(!raw)return emptyHpItemArchive();
 let saved:HpItemArchive;try{saved=JSON.parse(raw);}catch{throw Error('아이템전 저장을 읽지 못했어요. 기존 데이터는 보존했어요.');}
 if(saved?.version!==1||!Array.isArray(saved.records)||saved.active&&(!saved.active.hpItemMode||!saved.active.rpgRun||saved.active.players?.length!==3))throw Error('아이템전 저장 형식을 확인해 주세요. 기존 데이터는 보존했어요.');
 if(saved.active){refundLegacyEmbers(saved.active);const game=saved.active;game.completedBattles??=game.log.some(line=>line.includes('선을 잡았습니다'))?1:0;game.hpItemMatch??={points:[100,100,100],shopRound:game.round,roundStartHp:[...game.rpgRun!.hp],roundItems:[],roundEarned:[0,0,0]};if(!validItemBattleStage(game.hpItemMatch.visualStage))game.hpItemMatch.visualStage=itemBattleVisualStage(game.rpgRun!.id);if(!validItemBattleStage(game.hpItemMatch.tileSet))game.hpItemMatch.tileSet=game.hpItemMatch.visualStage;game.hpItemMatch.pendingItemDelta??=[0,0,0];game.hpItemMatch.pendingItemPoints??=[0,0,0];ensureProfessionActives(game);}return saved;
}
function record(game:Game,status:HpItemRecord['status']):HpItemRecord{return {id:game.rpgRun!.id,name:game.players[0].name,rank:hpItemRanks(game)[0],hp:[...game.rpgRun!.hp],rounds:game.round,variant:game.hpItemVariant||1,rules:game.hpItemRules,at:game.rpgRun!.updatedAt,status};}
export function saveHpItemGame(storage:StoragePort,game:Game,replace=false):HpItemArchive{
 if(!game.hpItemMode||!game.rpgRun||!game.practice)throw Error('HP 아이템전 저장 대상이 아니에요.');
 const old=readHpItemArchive(storage,game.hpItemVariant||1),same=old.active?.rpgRun?.id===game.rpgRun.id;
 if(old.active&&!same&&!replace)throw Error('저장된 아이템전이 있어요. 새로 시작할지 먼저 확인해 주세요.');
 const records=old.records.filter(row=>row.id!==game.rpgRun!.id);
 if(old.active&&!same)records.push({...record(old.active,'abandoned'),at:Date.now()});
 if(game.rpgRun.status==='complete')records.push(record(game,'complete'));
 records.sort((a,b)=>b.at-a.at);records.splice(10);
 const saved:HpItemArchive={version:1,active:game.rpgRun.status==='playing'?game:null,records};
 try{storage.setItem(storageKey(game.hpItemVariant||1),JSON.stringify(saved));}catch{throw Error('아이템전을 저장하지 못해 이번 행동을 적용하지 않았어요.');}
 return saved;
}
