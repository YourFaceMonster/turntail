import {RPG_RELICS} from './rpg.ts';
import type {Tile} from './game.ts';

/** Item-match prototypes. The original RPG catalogue and its rewards are unchanged. */
export const ITEM_BATTLE_RELICS=[
 {id:'wind-sigil',name:'바람의 문양',grade:'common',effect:'페어로 싸움 승리 시 상대 각각에게 추가 피해 +1'},
 {id:'warrior-crest',name:'전사의 문장',grade:'common',effect:'트리플로 싸움 승리 시 상대 각각에게 추가 피해 +2'},
 {id:'life-sigil',name:'생명의 문양',grade:'common',effect:'트리플로 싸움 승리 시 자신의 HP +2 · 최대 100'},
 {id:'sun-sigil',name:'태양의 문양',grade:'rare',effect:'플러시로 싸움 승리 시 상대 각각에게 추가 피해 +3'},
 {id:'crimson-fang',name:'붉은 송곳니',grade:'common',effect:'해 문양이 포함된 족보로 싸움 승리 시 상대 각각에게 추가 피해 +1'},
 {id:'cloud-blessing',name:'구름의 축복',grade:'common',effect:'구름 문양이 포함된 족보로 싸움 승리 시 자신의 HP +1 · 최대 100'},
 {id:'pioneers-eye',name:'선구자의 눈',grade:'rare',effect:'새 아이템전 첫 분배에만 구름 3을 시작 손패에 포함 · 손패 수 유지'},
] as const;
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
