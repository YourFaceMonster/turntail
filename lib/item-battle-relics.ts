import {RPG_RELICS} from './rpg.ts';
import {ITEM_BATTLE_RELICS} from './item-battle-relic-catalog.ts';
import type {Tile} from './game.ts';

/** Item-match prototypes. The original RPG catalogue and its rewards are unchanged. */
export {ITEM_BATTLE_RELICS};
export const ITEM_BATTLE_RELIC_POOL=[RPG_RELICS.find(relic=>relic.id==='cracked-heart')!,...ITEM_BATTLE_RELICS];
export const ALL_GAME_RELICS=[...RPG_RELICS,...ITEM_BATTLE_RELICS];
export function gameRelic(id:string){return RPG_RELICS.find(relic=>relic.id===id)||ITEM_BATTLE_RELICS.find(relic=>relic.id===id);}
export function relicImage(id:string){return ITEM_BATTLE_RELICS.some(relic=>relic.id===id)?`/item-battle-v1/relics/${id}.webp`:`/rpg-items-v1/relics/${id}.webp`;}
export function itemBattleRelicWin(equipped:readonly string[],label:string,tiles:readonly Tile[]){
 const effects:{relicId:string,message:string}[]=[];let damage=0,heal=0;
 const add=(id:string,amount:number,healing=false)=>{if(!equipped.includes(id))return;if(healing)heal+=amount;else damage+=amount;effects.push({relicId:id,message:healing?`HP +${amount}`:`추가 피해 +${amount}`});};
 if(label==='페어')add('wind-sigil',1);
 if(label==='트리플'){add('warrior-crest',2);add('life-sigil',2,true);}
 if(label==='플러시')add('sun-sigil',3);
 if(tiles.some(tile=>tile.s===3))add('crimson-fang',1);
 if(tiles.some(tile=>tile.s===0))add('cloud-blessing',1,true);
 return {damage,heal,effects};
}
